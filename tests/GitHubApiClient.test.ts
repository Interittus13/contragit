import { describe, it, expect, vi } from 'vitest';
import { GitHubApiClient, GitHubApiError } from '../lib/services/GitHubApiClient';

describe('GitHubApiClient', () => {
  it('instantiates properly and defines expected API methods', () => {
    const client = new GitHubApiClient();
    expect(client).toBeDefined();
    expect(typeof client.getAuthenticatedUser).toBe('function');
    expect(typeof client.listUserRepositories).toBe('function');
    expect(typeof client.validateRepository).toBe('function');
    expect(typeof client.createBlob).toBe('function');
    expect(typeof client.createTree).toBe('function');
    expect(typeof client.createCommit).toBe('function');
    expect(typeof client.updateBranchRef).toBe('function');
  });

  it('formats GitHubApiError with status and detail message', () => {
    const err = new GitHubApiError('Resource not found', 404, 'Commit sha does not exist');
    expect(err.name).toBe('GitHubApiError');
    expect(err.status).toBe(404);
    expect(err.detail).toBe('Commit sha does not exist');
    expect(err.message).toBe('Resource not found');
  });
});
