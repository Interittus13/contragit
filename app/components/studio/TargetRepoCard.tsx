'use client';

import React from 'react';
import { GitBranch, GitFork, Lock, RefreshCw } from 'lucide-react';
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
          style={{ padding: '0.35rem 0.6rem' }}
          title="Refresh repository list"
        >
          <RefreshCw size={13} className={loadingRepos ? 'animate-spin' : ''} />
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Repo Owner */}
        <div>
          <label className="form-label">
            Repository Owner / Organization
          </label>
          <input
            type="text"
            value={repoOwner}
            onChange={(e) => onRepoOwnerChange(e.target.value)}
            className="form-control mono"
            placeholder="e.g. username"
          />
        </div>

        {/* Repo Select */}
        <div>
          <label className="form-label">
            Repository Name
          </label>
          <select
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
          <label className="form-label">
            Target Branch
          </label>
          <input
            type="text"
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="form-control mono"
            placeholder="main"
          />
        </div>
      </div>

      {/* Push to Remote Toggle */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: pushToRemote ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
          border: pushToRemote ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          type="checkbox"
          checked={pushToRemote}
          onChange={(e) => onPushToRemoteChange(e.target.checked)}
          style={{ width: '18px', height: '18px', accentColor: 'var(--emerald-500)', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Push Directly to GitHub Remote
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Updates the branch head on GitHub so commits show immediately on your profile graph.
          </span>
        </div>
      </label>
    </Card>
  );
}
