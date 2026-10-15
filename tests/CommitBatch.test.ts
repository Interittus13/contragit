import { describe, it, expect, vi } from 'vitest';
import { CommitJobManager } from '../lib/services/CommitJobManager';
import { GitHubApiClient } from '../lib/services/GitHubApiClient';
import { GitHubUser } from '../lib/types/github';
import { CommitBatchRequest } from '../lib/types/scheduler';

describe('CommitJobManager - executeCommitBatch', () => {
  const manager = new CommitJobManager();

  const mockUser: GitHubUser = {
    login: 'testuser',
    id: 12345,
    email: 'test@example.com',
    accessToken: 'gho_mock_token',
  };

  it('processes a batch of commits sequentially and returns updated SHAs', async () => {
    // Mock GitHubApiClient methods
    const mockClient = {
      createBlob: vi.fn().mockResolvedValue({ sha: 'mock_blob_sha' }),
      createTree: vi.fn().mockResolvedValue({ sha: 'mock_tree_sha' }),
      createCommit: vi.fn().mockImplementation((owner, repo, msg, treeSha, parents) => {
        return Promise.resolve({ sha: `mock_commit_${parents[0] || 'root'}` });
      }),
      updateBranchRef: vi.fn().mockResolvedValue(undefined),
    } as unknown as GitHubApiClient;

    const request: CommitBatchRequest = {
      repoOwner: 'testuser',
      repoName: 'testrepo',
      branch: 'main',
      pushToRemote: true,
      parentCommitSha: 'parent_sha_123',
      baseTreeSha: 'base_tree_sha_123',
      batchIndex: 0,
      totalCommits: 2,
      commits: [
        { timestamp: '2024-01-01T10:00:00.000Z', message: 'test commit 1', fileIndex: 1 },
        { timestamp: '2024-01-01T11:00:00.000Z', message: 'test commit 2', fileIndex: 2 },
      ],
    };

    const result = await manager.executeCommitBatch(mockUser, request, mockClient);

    expect(result.success).toBe(true);
    expect(result.completedBatchSize).toBe(2);
    expect(result.lastCommitSha).toBe('mock_commit_mock_commit_parent_sha_123');
    expect(result.lastTreeSha).toBe('mock_tree_sha');
    expect(result.branch).toBe('main');
    expect(mockClient.updateBranchRef).toHaveBeenCalledWith(
      'testuser',
      'testrepo',
      'main',
      result.lastCommitSha,
      true,
      'gho_mock_token'
    );
  });
});
