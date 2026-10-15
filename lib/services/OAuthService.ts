export class OAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly defaultScope: string = 'read:user user:email repo user:follow';

  constructor(
    clientId: string = process.env.GITHUB_CLIENT_ID || '',
    clientSecret: string = process.env.GITHUB_CLIENT_SECRET || ''
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  public getMissingConfig(): string[] {
    const missing: string[] = [];
    if (!this.clientId) missing.push('GITHUB_CLIENT_ID');
    if (!this.clientSecret) missing.push('GITHUB_CLIENT_SECRET');
    return missing;
  }

  public generateState(): string {
    return `cg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  public getAuthorizationUrl(redirectUri: string, state: string): string {
    if (!this.isConfigured()) {
      throw new Error('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: this.defaultScope,
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  public async exchangeCodeForToken(code: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
    });

    const response = await fetch(`https://github.com/login/oauth/access_token?${params.toString()}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ContraGit',
      },
    });

    const data = await response.json();
    if (!data.access_token) {
      throw new Error(data.error_description || 'GitHub OAuth token exchange failed.');
    }

    return data.access_token;
  }
}

export const oAuthService = new OAuthService();
