import { GitHubUser } from '../types/github';

export class SessionManager {
  private readonly sessionCookieName: string = 'gh_session';
  private readonly stateCookieName: string = 'gh_oauth_state';
  private readonly maxAge: number = 86400 * 7; // 7 days

  public serializeUser(user: GitHubUser): string {
    const sessionData = {
      login: user.login,
      id: user.id,
      email: user.email,
      accessToken: user.accessToken,
      repoOwner: user.repoOwner || null,
      repoName: user.repoName || null,
      issuedAt: Date.now(),
    };

    return Buffer.from(JSON.stringify(sessionData))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  public parseUser(cookieValue?: string | null): GitHubUser | null {
    if (!cookieValue) return null;

    try {
      const base64 = cookieValue.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const json = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));

      if (!json || typeof json !== 'object' || !json.login || !json.accessToken) {
        return null;
      }

      return {
        login: json.login,
        id: json.id || null,
        email: json.email || null,
        accessToken: json.accessToken,
        repoOwner: json.repoOwner || null,
        repoName: json.repoName || null,
      };
    } catch {
      return null;
    }
  }

  public getSessionCookieName(): string {
    return this.sessionCookieName;
  }

  public getStateCookieName(): string {
    return this.stateCookieName;
  }

  public getMaxAge(): number {
    return this.maxAge;
  }
}

export const sessionManager = new SessionManager();
