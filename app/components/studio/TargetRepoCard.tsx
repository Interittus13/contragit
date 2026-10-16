'use client';

import React from 'react';
import { GitBranch, RefreshCw } from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { GitHubRepository } from '@/lib/types/github';

export interface TargetRepoCardProps {
  repoOwner: string;
  onRepoOwnerChange: (val: string) => void;
  selectedRepo: string;
  onSelectedRepoChange: (val: string) => void;
  branch: string;
  onBranchChange: (val: string) => void;
  pushToRemote: boolean;
  onPushToRemoteChange: (val: boolean) => void;
  repositories: GitHubRepository[];
  loadingRepos: boolean;
  onRefreshRepos: () => void;
}

export function TargetRepoCard({
  repoOwner,
  onRepoOwnerChange,
  selectedRepo,
  onSelectedRepoChange,
  branch,
  onBranchChange,
  pushToRemote,
  onPushToRemoteChange,
  repositories,
  loadingRepos,
  onRefreshRepos,
}: TargetRepoCardProps) {
  return (
    <Card
      title="Target Repository"
      subtitle="Select where commits will be authored and pushed"
      badge={<Badge variant="cyan" icon={<GitBranch size={12} />}>{branch}</Badge>}
      headerAction={
        <button
          type="button"
          onClick={onRefreshRepos}
          disabled={loadingRepos}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.6rem', minHeight: '34px' }}
          title="Refresh repository list"
          aria-label="Refresh repository list"
        >
          <RefreshCw size={13} className={loadingRepos ? 'animate-spin' : ''} />
        </button>
      }
    >
      <div className="grid-auto-fit" style={{ marginBottom: '1.25rem' }}>
        {/* Repo Owner */}
        <div>
          <label className="form-label" htmlFor="repo-owner-input">
            Repository Owner / Organization
          </label>
          <input
            id="repo-owner-input"
            type="text"
            value={repoOwner}
            onChange={(e) => onRepoOwnerChange(e.target.value)}
            className="form-control mono"
            placeholder="e.g. username"
          />
        </div>

        {/* Repo Select */}
        <div>
          <label className="form-label" htmlFor="repo-select-input">
            Repository Name
          </label>
          <select
            id="repo-select-input"
            value={selectedRepo}
            onChange={(e) => onSelectedRepoChange(e.target.value)}
            className="form-control"
            disabled={loadingRepos}
          >
            {loadingRepos ? (
              <option value="">Fetching repositories...</option>
            ) : repositories.length === 0 ? (
              <option value="gitcontra">gitcontra (Default)</option>
            ) : (
              repositories.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} {r.private ? '🔒 (Private)' : ''}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Target Branch */}
        <div>
          <label className="form-label" htmlFor="target-branch-input">
            Target Branch
          </label>
          <input
            id="target-branch-input"
            type="text"
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="form-control mono"
            placeholder="main"
          />
        </div>
      </div>

      {/* Push to Remote Apple Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.9rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: pushToRemote ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
          border: pushToRemote ? '1px solid rgba(16, 185, 129, 0.28)' : '1px solid var(--border-subtle)',
          transition: 'all 0.2s var(--spring-ease)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Push to GitHub Remote
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Updates remote branch immediately for profile graph display.
          </span>
        </div>
        <label className="ios-switch" aria-label="Toggle direct push to GitHub">
          <input
            type="checkbox"
            checked={pushToRemote}
            onChange={(e) => onPushToRemoteChange(e.target.checked)}
          />
          <span className="ios-switch-slider" />
        </label>
      </div>
    </Card>
  );
}
