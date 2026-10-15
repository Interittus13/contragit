import { GitHubUser, GitTreeItem } from '../types/github';
import { ScheduleConfig, CommitJob } from '../types/scheduler';
import { GitHubApiClient } from './GitHubApiClient';
import { ScheduleEngine } from './ScheduleEngine';

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

    try {
      // 1. Validate repo exists
      const repoCheck = await gitClient.validateRepository(owner, repo, user.accessToken);
      if (!repoCheck.exists) {
        job.status = 'failed';
        job.error = repoCheck.message || 'Repository not found or access denied.';
        return;
      }

      const branchName = targetBranch || repoCheck.defaultBranch || 'main';

      // 2. Fetch latest commit & base tree
      let currentCommitSha: string;
      let baseTreeSha: string;

      try {
        const refData = await gitClient.getBranchRef(owner, repo, branchName, user.accessToken);
        currentCommitSha = refData.sha;
        const commitData = await gitClient.getCommit(owner, repo, currentCommitSha, user.accessToken);
        baseTreeSha = commitData.treeSha;
      } catch (err: any) {
        if (err.status === 404 || err.status === 409) {
          // Fallback to default branch
          const defRef = await gitClient.getBranchRef(owner, repo, repoCheck.defaultBranch || 'main', user.accessToken);
          currentCommitSha = defRef.sha;
          const defCommit = await gitClient.getCommit(owner, repo, currentCommitSha, user.accessToken);
          baseTreeSha = defCommit.treeSha;
        } else {
          throw err;
        }
      }

      const initialSha = currentCommitSha;

      // 3. Sequential Commit Generation with Organic Backdating
      for (let i = 0; i < timestamps.length; i++) {
        if (job.status !== 'running') break;

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

        // Create blob
        const blob = await gitClient.createBlob(
          owner,
          repo,
          `ContraGit automation checkpoint: ${commitNum} on ${isoString}\n`,
          user.accessToken
        );

        // Create tree
        const treeItems: GitTreeItem[] = [
          {
            path: `contra_log_${commitNum}.txt`,
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
          [currentCommitSha],
          author,
          user.accessToken
        );

        currentCommitSha = newCommit.sha;
        baseTreeSha = tree.sha;
        job.completed = commitNum;
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
      job.error = error.message || 'An error occurred during commit generation.';
    }
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
