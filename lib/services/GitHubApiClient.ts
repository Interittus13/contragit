import { 
  GitHubUser, 
  GitHubRepository, 
  RepositoryValidationResult, 
  GitBlob, 
  GitTree, 
  GitCommit, 
  GitTreeItem 
} from '../types/github';

export class GitHubApiError extends Error {
  public status: number;
  public detail: string;

  constructor(message: string, status: number, detail: string = '') {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.detail = detail;
  }
}

export class GitHubApiClient {
  private readonly baseUrl: string = 'https://api.github.com';
  private readonly userAgent: string = 'ContraGit';

  private async request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': this.userAgent,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, { ...options, headers });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : await response.text().catch(() => '');

    if (!response.ok) {
      const detail = typeof payload === 'string' ? payload : (payload.message || JSON.stringify(payload));
      const urlPath = new URL(url).pathname;
      const statusText = response.status === 404
        ? `Not found: ${urlPath}`
        : response.status === 422
          ? `Validation failed for ${urlPath}: ${detail}`
          : response.status === 409
            ? `Conflict on ${urlPath}: ${detail}`
            : `GitHub API error (${response.status}) on ${urlPath}: ${detail}`;

      throw new GitHubApiError(statusText, response.status, detail);
    }

    return payload as T;
  }

  public async getAuthenticatedUser(accessToken: string): Promise<GitHubUser> {
    const user = await this.request<{ id: number; login: string; email?: string | null }>('/user', {}, accessToken);
    let email = user.email || null;

    if (!email) {
      try {
        const emails = await this.request<Array<{ email: string; primary: boolean; verified: boolean }>>('/user/emails', {}, accessToken);
        if (Array.isArray(emails)) {
          const primary = emails.find(e => e.primary && e.verified) || emails.find(e => e.verified);
          if (primary) email = primary.email;
        }
      } catch {
        email = null;
      }
    }

    if (!email) {
      email = `${user.id}+${user.login}@users.noreply.github.com`;
    }

    return {
      login: user.login,
      id: user.id,
      email,
      accessToken,
    };
  }

  public async listUserRepositories(accessToken: string): Promise<GitHubRepository[]> {
    const repos = await this.request<Array<any>>('/user/repos?per_page=100&sort=updated', {}, accessToken);
    if (!Array.isArray(repos)) return [];

    return repos.map(repo => ({
      name: repo.name,
      owner: repo.owner?.login || '',
      fullName: repo.full_name,
      defaultBranch: repo.default_branch || 'main',
      private: Boolean(repo.private),
      fork: Boolean(repo.fork),
      permissions: repo.permissions || {},
    }));
  }

  public async validateRepository(owner: string, repo: string, accessToken: string): Promise<RepositoryValidationResult> {
    try {
      const data = await this.request<any>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {}, accessToken);
      const canPush = Boolean(data.permissions && data.permissions.push === true);

      return {
        exists: true,
        valid: true,
        canPush,
        fullName: data.full_name,
        defaultBranch: data.default_branch || 'main',
        private: data.private,
        message: canPush ? 'Repository access verified.' : 'Repository found, but write access is unavailable.',
      };
    } catch (error) {
      if (error instanceof GitHubApiError) {
        if (error.status === 404) {
          return {
            exists: false,
            valid: false,
            message: `Repository "${owner}/${repo}" was not found. Check the owner/name or verify your token has access.`,
          };
        }
        if (error.status === 403) {
          return {
            exists: false,
            valid: false,
            message: `Access denied to "${owner}/${repo}". Check your GitHub token permissions.`,
          };
        }
      }
      throw error;
    }
  }

  public async getBranchRef(owner: string, repo: string, branch: string, accessToken: string): Promise<{ sha: string }> {
    const res = await this.request<{ object: { sha: string } }>(
      `/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {},
      accessToken
    );
    return { sha: res.object.sha };
  }

  public async getCommit(owner: string, repo: string, commitSha: string, accessToken: string): Promise<{ sha: string; treeSha: string }> {
    const res = await this.request<{ sha: string; tree: { sha: string } }>(
      `/repos/${owner}/${repo}/git/commits/${commitSha}`,
      {},
      accessToken
    );
    return { sha: res.sha, treeSha: res.tree.sha };
  }

  public async createBlob(owner: string, repo: string, content: string, accessToken: string): Promise<GitBlob> {
    return this.request<GitBlob>(
      `/repos/${owner}/${repo}/git/blobs`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, encoding: 'utf-8' }),
      },
      accessToken
    );
  }

  public async createTree(
    owner: string, 
    repo: string, 
    baseTreeSha: string | null, 
    items: GitTreeItem[], 
    accessToken: string
  ): Promise<GitTree> {
    const body: Record<string, any> = { tree: items };
    if (baseTreeSha) body.base_tree = baseTreeSha;

    return this.request<GitTree>(
      `/repos/${owner}/${repo}/git/trees`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      accessToken
    );
  }

  public async createCommit(
    owner: string,
    repo: string,
    message: string,
    treeSha: string,
    parentShas: string[],
    author: { name: string; email: string; date: string },
    accessToken: string
  ): Promise<GitCommit> {
    return this.request<GitCommit>(
      `/repos/${owner}/${repo}/git/commits`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          tree: treeSha,
          parents: parentShas,
          author,
          committer: author,
        }),
      },
      accessToken
    );
  }

  public async updateBranchRef(
    owner: string,
    repo: string,
    branch: string,
    commitSha: string,
    force: boolean = true,
    accessToken: string
  ): Promise<void> {
    await this.request(
      `/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha: commitSha, force }),
      },
      accessToken
    );
  }

  public async starRepository(owner: string, repo: string, accessToken: string): Promise<void> {
    await this.request(
      `/user/starred/${owner}/${repo}`,
      { method: 'PUT', headers: { 'Content-Length': '0' } },
      accessToken
    );
  }

  public async followUser(username: string, accessToken: string): Promise<void> {
    await this.request(
      `/user/following/${username}`,
      { method: 'PUT', headers: { 'Content-Length': '0' } },
      accessToken
    );
  }
}

export const gitHubApiClient = new GitHubApiClient();
