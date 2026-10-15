import { describe, it, expect } from 'vitest';
import { SessionManager } from '../lib/services/SessionManager';
import { GitHubUser } from '../lib/types/github';

describe('SessionManager', () => {
  const manager = new SessionManager();

  const mockUser: GitHubUser = {
    login: 'octocat',
    id: 123456,
    email: 'octo@github.com',
    accessToken: 'gho_secret_access_token_12345',
    repoOwner: 'octocat',
    repoName: 'my-activity-repo',
  };

  it('serializes and deserializes user session roundtrip', () => {
    const token = manager.serializeUser(mockUser);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    const restored = manager.parseUser(token);
    expect(restored).not.toBeNull();
    expect(restored?.login).toBe(mockUser.login);
    expect(restored?.id).toBe(mockUser.id);
    expect(restored?.email).toBe(mockUser.email);
    expect(restored?.accessToken).toBe(mockUser.accessToken);
    expect(restored?.repoOwner).toBe(mockUser.repoOwner);
    expect(restored?.repoName).toBe(mockUser.repoName);
  });

  it('returns null for invalid or corrupted session tokens', () => {
    expect(manager.parseUser(null)).toBeNull();
    expect(manager.parseUser(undefined)).toBeNull();
    expect(manager.parseUser('')).toBeNull();
    expect(manager.parseUser('not-a-valid-token')).toBeNull();
    expect(manager.parseUser(Buffer.from('{"invalid":"json"}').toString('base64'))).toBeNull();
  });
});
