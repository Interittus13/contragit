import { GitHubUser, GitTreeItem } from '../types/github';
import { 
  ScheduleConfig, 
  CommitJob, 
  CommitBatchRequest, 
  CommitBatchResponse 
} from '../types/scheduler';
import { GitHubApiClient } from './GitHubApiClient';
import { ScheduleEngine } from './ScheduleEngine';
import { languageMasqueradeEngine } from './LanguageMasqueradeEngine';

export class CommitJobManager {
  private jobs: Map<string, CommitJob> = new Map();
  private readonly scheduleEngine: ScheduleEngine;

  private static readonly SAMPLE_MESSAGES = [
    'feat: implement core workflow updates',
    'refactor: streamline data pipeline',
    'fix: resolve edge condition in event loop',
    'docs: update usage notes and api references',
    'perf: improve rendering efficiency',
    'chore: update workspace dependencies',
    'style: format code according to styleguide',
    'test: add regression test cases',
    'ci: optimize deployment workflow pipeline',
  ];

  constructor(scheduleEngine: ScheduleEngine = new ScheduleEngine()) {
    this.scheduleEngine = scheduleEngine;
  }

  public createJob(user: GitHubUser, config: ScheduleConfig, totalCommits: number): CommitJob {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const job: CommitJob = {
      id: jobId,
      userLogin: user.login,
      repository: `${config.repoOwner || user.login}/${config.repoName || 'gitcontra'}`,
      dateRange: `${new Date(config.startDate).toDateString()} to ${new Date(config.endDate).toDateString()}`,
      total: totalCommits,
      completed: 0,
      failed: 0,
      status: 'pending',
      startTime: Date.now(),
    };

    this.jobs.set(jobId, job);
    return job;
  }

  public getJob(jobId: string): CommitJob | undefined {
    return this.jobs.get(jobId);
  }

  public async executeJob(
    jobId: string,
    user: GitHubUser,
    config: ScheduleConfig,
    timestamps: Date[],
    gitClient: GitHubApiClient
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'running';

    const owner = (config.repoOwner || user.login).trim();
    const repo = (config.repoName || 'gitcontra').trim();
    const targetBranch = (config.branch || 'main').trim();
    const pushToRemote = Boolean(config.pushToRemote);

    let branchName = targetBranch;
    let currentCommitSha: string | null = null;
    let initialSha: string | null = null;

    try {
      // 1. Validate repo exists
      const repoCheck = await gitClient.validateRepository(owner, repo, user.accessToken);
      if (!repoCheck.exists) {
        job.status = 'failed';
        job.error = repoCheck.message || 'Repository not found or access denied.';
        return;
      }

      branchName = targetBranch || repoCheck.defaultBranch || 'main';

      // 2. Fetch latest commit & base tree
      let baseTreeSha: string;

      try {
        const refData = await gitClient.getBranchRef(owner, repo, branchName, user.accessToken);
        currentCommitSha = refData.sha;
        const commitData = await gitClient.getCommit(owner, repo, currentCommitSha, user.accessToken);
        baseTreeSha = commitData.treeSha;
      } catch (err: any) {
        if (err.status === 404 || err.status === 409) {
          // Fallback to default branch
          branchName = repoCheck.defaultBranch || 'main';
          const defRef = await gitClient.getBranchRef(owner, repo, branchName, user.accessToken);
          currentCommitSha = defRef.sha;
          const defCommit = await gitClient.getCommit(owner, repo, currentCommitSha, user.accessToken);
          baseTreeSha = defCommit.treeSha;
        } else {
          throw err;
        }
      }

      initialSha = currentCommitSha;

      // 3. Sequential Commit Generation with Organic Backdating & Pacing
      for (let i = 0; i < timestamps.length; i++) {
        if (job.status !== 'running') break;

        // Pacing delay (180ms) between commits to prevent GitHub secondary rate limit spikes
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 180));
        }

        const date = timestamps[i];
        const isoString = date.toISOString();
        const commitNum = i + 1;
        let commitMsg = '';
        if (config.messageStyle === 'minimal') {
          commitMsg = `Commit #${commitNum} — ${isoString.split('T')[0]}`;
        } else if (config.messageStyle === 'custom') {
          const prefix = config.customMessagePrefix?.trim() || 'update';
          commitMsg = `${prefix} #${commitNum} — ${isoString.split('T')[0]}`;
        } else {
          const randomMsg = CommitJobManager.SAMPLE_MESSAGES[Math.floor(Math.random() * CommitJobManager.SAMPLE_MESSAGES.length)];
          commitMsg = `${randomMsg} [contra-#${commitNum}]`;
        }

        // Generate language-specific code file via Linguist Masquerade Engine
        const generatedFile = languageMasqueradeEngine.generateFileForCommit(
          commitNum,
          isoString,
          config.languageConfig
        );

        // Create blob
        const blob = await gitClient.createBlob(
          owner,
          repo,
          generatedFile.content,
          user.accessToken
        );

        // Create tree
        const treeItems: GitTreeItem[] = [
          {
            path: generatedFile.path,
            mode: '100644',
            type: 'blob',
            sha: blob.sha,
          },
        ];

        const tree = await gitClient.createTree(owner, repo, baseTreeSha, treeItems, user.accessToken);

        // Create commit
        const author = {
          name: user.login,
          email: user.email || `${user.login}@users.noreply.github.com`,
          date: isoString,
        };

        const newCommit = await gitClient.createCommit(
          owner,
          repo,
          commitMsg,
          tree.sha,
          currentCommitSha ? [currentCommitSha] : [],
          author,
          user.accessToken
        );

        currentCommitSha = newCommit.sha;
        baseTreeSha = tree.sha;
        job.completed = commitNum;

        // Periodic checkpoint every 25 commits to continuously secure progress to remote
        if (pushToRemote && commitNum % 25 === 0 && currentCommitSha !== initialSha) {
          try {
            await gitClient.updateBranchRef(owner, repo, branchName, currentCommitSha, true, user.accessToken);
          } catch (refErr) {
            console.warn('[CommitJobManager] Periodic ref checkpoint warning:', refErr);
          }
        }
      }

      // 4. Update Branch Reference if pushToRemote is enabled
      if (job.status === 'running') {
        if (pushToRemote && currentCommitSha !== initialSha) {
          await gitClient.updateBranchRef(owner, repo, branchName, currentCommitSha, true, user.accessToken);
        }

        job.status = 'completed';
        job.result = {
          message: `Successfully generated ${job.completed} commits.`,
          pushResult: {
            message: pushToRemote
              ? `Pushed ${job.completed} commits to ${owner}/${repo}:${branchName}`
              : `Generated ${job.completed} commits locally in repository tree (push was disabled).`,
          },
        };
      }
    } catch (error: any) {
      job.status = 'failed';
      let errorMsg = error.message || 'An error occurred during commit generation.';

      // Critical Recovery: If commits were created prior to failure, push what we have so progress is never lost
      if (pushToRemote && currentCommitSha && currentCommitSha !== initialSha) {
        try {
          await gitClient.updateBranchRef(owner, repo, branchName, currentCommitSha, true, user.accessToken);
          errorMsg += ` (Saved ${job.completed} commits created prior to failure to ${branchName})`;
        } catch (saveErr) {
          console.error('[CommitJobManager] Failed to update branch ref on failure:', saveErr);
        }
      }

      job.error = errorMsg;
    }
  }

  /**
   * Executes a stateless batch of commits.
   * Ideal for serverless platforms (Vercel) as each batch runs in ~1.5s,
   * avoiding function timeouts and eliminating in-memory state dependencies.
   */
  public async executeCommitBatch(
    user: GitHubUser,
    request: CommitBatchRequest,
    gitClient: GitHubApiClient
  ): Promise<CommitBatchResponse> {
    const owner = request.repoOwner.trim();
    const repo = request.repoName.trim();
    const targetBranch = request.branch.trim() || 'main';
    const pushToRemote = Boolean(request.pushToRemote);

    // 1. Resolve starting commit and tree SHA if not provided (first batch)
    let currentCommitSha = request.parentCommitSha || null;
    let baseTreeSha = request.baseTreeSha || null;
    let branchName = targetBranch;

    if (!currentCommitSha || !baseTreeSha) {
      const repoCheck = await gitClient.validateRepository(owner, repo, user.accessToken);
      if (!repoCheck.exists) {
        throw new Error(repoCheck.message || 'Repository not found or access denied.');
      }
      branchName = targetBranch || repoCheck.defaultBranch || 'main';

      try {
        const refData = await gitClient.getBranchRef(owner, repo, branchName, user.accessToken);
        currentCommitSha = refData.sha;
        const commitData = await gitClient.getCommit(owner, repo, currentCommitSha, user.accessToken);
        baseTreeSha = commitData.treeSha;
      } catch (err: any) {
        if (err.status === 404 || err.status === 409) {
          branchName = repoCheck.defaultBranch || 'main';
          const defRef = await gitClient.getBranchRef(owner, repo, branchName, user.accessToken);
          currentCommitSha = defRef.sha;
          const defCommit = await gitClient.getCommit(owner, repo, currentCommitSha, user.accessToken);
          baseTreeSha = defCommit.treeSha;
        } else {
          throw err;
        }
      }
    }

    // 2. Process this small batch of commits sequentially
    for (let i = 0; i < request.commits.length; i++) {
      const item = request.commits[i];
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      // Generate language-specific code file via Linguist Masquerade Engine
      const generatedFile = languageMasqueradeEngine.generateFileForCommit(
        item.fileIndex,
        item.timestamp,
        request.languageConfig
      );

      // Create blob
      const blob = await gitClient.createBlob(
        owner,
        repo,
        generatedFile.content,
        user.accessToken
      );

      // Create tree
      const treeItems: GitTreeItem[] = [
        {
          path: generatedFile.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        },
      ];

      const tree = await gitClient.createTree(owner, repo, baseTreeSha, treeItems, user.accessToken);

      const author = {
        name: user.login,
        email: user.email || `${user.login}@users.noreply.github.com`,
        date: item.timestamp,
      };

      const newCommit = await gitClient.createCommit(
        owner,
        repo,
        item.message,
        tree.sha,
        currentCommitSha ? [currentCommitSha] : [],
        author,
        user.accessToken
      );

      currentCommitSha = newCommit.sha;
      baseTreeSha = tree.sha;
    }

    // 3. Update branch ref for this batch if pushing
    if (pushToRemote && currentCommitSha) {
      await gitClient.updateBranchRef(owner, repo, branchName, currentCommitSha, true, user.accessToken);
    }

    return {
      success: true,
      message: `Completed batch of ${request.commits.length} commits.`,
      completedBatchSize: request.commits.length,
      lastCommitSha: currentCommitSha || '',
      lastTreeSha: baseTreeSha || '',
      branch: branchName,
    };
  }
}

// Global singleton for Next.js server runtime
declare global {
  var __commitJobManager: CommitJobManager | undefined;
}

export const commitJobManager = global.__commitJobManager || new CommitJobManager();
if (process.env.NODE_ENV !== 'production') {
  global.__commitJobManager = commitJobManager;
}
