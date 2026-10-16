'use client';

import React, { useState, useMemo } from 'react';
import { GitBranch, RefreshCw, Lock, FolderGit2, Search, PlusCircle, Check } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Filter repositories based on search term
  const filteredRepos = useMemo(() => {
    if (!searchTerm.trim()) return repositories;
    const term = searchTerm.toLowerCase();
    return repositories.filter(
      (r) => r.name.toLowerCase().includes(term) || (r.owner && r.owner.toLowerCase().includes(term))
    );
  }, [repositories, searchTerm]);

  const handleSelectRepo = (repoName: string) => {
    onSelectedRepoChange(repoName);
    const found = repositories.find((r) => r.name === repoName);
    if (found) {
      if (found.defaultBranch) onBranchChange(found.defaultBranch);
      if (found.owner && found.owner !== repoOwner) onRepoOwnerChange(found.owner);
    }
  };

  return (
    <Card
      title="Target Repository Context"
      subtitle="Select the destination repository and branch where commits will be authored"
      badge={
        <div className="cluster" style={{ gap: '0.4rem' }}>
          <Badge variant="cyan" icon={<GitBranch size={12} />}>
            {branch || 'main'}
          </Badge>
          {repositories.length > 0 && (
            <Badge variant="muted">
              {repositories.length} {repositories.length === 1 ? 'repo' : 'repos'}
            </Badge>
          )}
        </div>
      }
      headerAction={
        <button
          type="button"
          onClick={onRefreshRepos}
          disabled={loadingRepos}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.65rem', minHeight: '34px' }}
          title="Refresh repository list from GitHub"
          aria-label="Refresh repository list from GitHub"
        >
          <RefreshCw size={13} className={loadingRepos ? 'animate-spin' : ''} />
          <span style={{ fontSize: '0.75rem' }}>{loadingRepos ? 'Syncing...' : 'Sync'}</span>
        </button>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.25rem',
        }}
      >
        {/* Repo Owner / Organization */}
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
            placeholder="e.g. username or organization"
          />
        </div>

        {/* Repository Select & Custom Toggle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label className="form-label" htmlFor="repo-select-input" style={{ marginBottom: 0 }}>
              Repository Name
            </label>
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.725rem', padding: '0.15rem 0.45rem', minHeight: '22px', height: '22px', color: 'var(--emerald-400)' }}
            >
              {isCustomMode ? '← Pick from list' : '+ Enter custom repo'}
            </button>
          </div>

          {isCustomMode ? (
            <input
              id="custom-repo-input"
              type="text"
              value={selectedRepo}
              onChange={(e) => onSelectedRepoChange(e.target.value)}
              className="form-control mono"
              placeholder="e.g. my-awesome-repo"
              autoFocus
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <select
                id="repo-select-input"
                value={selectedRepo}
                onChange={(e) => handleSelectRepo(e.target.value)}
                className="form-control mono"
                disabled={loadingRepos}
                style={{ cursor: 'pointer' }}
              >
                {loadingRepos ? (
                  <option value="">Fetching repositories from GitHub...</option>
                ) : repositories.length === 0 ? (
                  <option value="gitcontra">gitcontra (Default)</option>
                ) : (
                  <>
                    {!repositories.some((r) => r.name === selectedRepo) && selectedRepo && (
                      <option value={selectedRepo}>{selectedRepo} (Current)</option>
                    )}
                    {filteredRepos.map((r) => (
                      <option key={r.fullName || r.name} value={r.name}>
                        {r.name} {r.private ? '🔒 (Private)' : ''} {r.fork ? '⑂ (Fork)' : ''}
                      </option>
                    ))}
                  </>
                )}
              </select>

              {/* Quick Search Filter for large lists */}
              {repositories.length > 6 && (
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Filter ${repositories.length} repositories...`}
                    className="form-control"
                    style={{ fontSize: '0.75rem', height: '28px', minHeight: '28px', paddingLeft: '1.75rem' }}
                  />
                  <Search size={12} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Target Branch */}
        <div>
          <label className="form-label" htmlFor="target-branch-input">
            Target Branch
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="target-branch-input"
              type="text"
              value={branch}
              onChange={(e) => onBranchChange(e.target.value)}
              className="form-control mono"
              placeholder="main"
              style={{ paddingLeft: '2rem' }}
            />
            <GitBranch
              size={14}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--cyan-400)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Push to GitHub Remote Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          background: pushToRemote ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          border: pushToRemote ? '1px solid rgba(16, 185, 129, 0.28)' : '1px solid var(--border-subtle)',
          transition: 'all 0.2s var(--spring-ease)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: pushToRemote ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: pushToRemote ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: pushToRemote ? 'var(--emerald-400)' : 'var(--text-muted)',
            }}
          >
            <FolderGit2 size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Push Directly to GitHub Remote
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Directly updates <code className="mono" style={{ color: pushToRemote ? 'var(--emerald-400)' : 'inherit' }}>{repoOwner}/{selectedRepo}:{branch}</code> via Git Data API.
            </span>
          </div>
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
