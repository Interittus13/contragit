export interface GitHubUser {
  login: string;
  id: number | null;
  email: string | null;
  accessToken: string;
  avatarUrl?: string | null;
  repoOwner?: string | null;
  repoName?: string | null;
}

export interface GitHubRepository {
  name: string;
  owner: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  fork?: boolean;
  permissions?: {
    admin?: boolean;
    push?: boolean;
    pull?: boolean;
  };
}

export interface RepositoryValidationResult {
  exists: boolean;
  valid?: boolean;
  canPush?: boolean;
  fullName?: string;
  defaultBranch?: string;
  private?: boolean;
  message?: string;
}

export interface GitBlob {
  sha: string;
  url: string;
}

export interface GitTreeItem {
  path: string;
  mode: '100644' | '100755' | '040000' | '160000' | '120000';
  type: 'blob' | 'tree' | 'commit';
  sha: string;
}

export interface GitTree {
  sha: string;
  url: string;
}

export interface GitCommit {
  sha: string;
  tree: { sha: string };
  parents: string[];
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
}
