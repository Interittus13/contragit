'use client';

import React from 'react';
import { 
  CheckCircle, 
  ExternalLink, 
  Loader2, 
  Pause, 
  Play, 
  RotateCcw, 
  X 
} from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { CommitJob } from '@/lib/types/scheduler';

export interface BatchProgressModalProps {
  job: CommitJob | null;
  repoOwner: string;
  selectedRepo: string;
  branch: string;
  hasBatchState: boolean;
  onPause: () => void;
  onResume: () => void;
  onStopAndKeep: () => void;
  onClose: () => void;
}

export function BatchProgressModal({
  job,
  repoOwner,
  selectedRepo,
  branch,
  hasBatchState,
  onPause,
  onResume,
  onStopAndKeep,
  onClose,
}: BatchProgressModalProps) {
  if (!job) return null;

  const progressPercent = job.total > 0 ? Math.round((job.completed / job.total) * 100) : 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
          {job.status === 'completed' ? (
            <>
              <CheckCircle size={22} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Schedule Completed!</h3>
            </>
          ) : job.status === 'paused' ? (
            <>
              <Pause size={22} color="#f59e0b" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Generation Paused</h3>
            </>
          ) : job.status === 'failed' ? (
            <>
              <X size={22} color="var(--danger)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Generation Failed</h3>
            </>
          ) : (
            <>
              <Loader2 className="animate-spin" size={22} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Deploying Batched Commits...</h3>
            </>
          )}
        </div>

        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Target: <code className="mono" style={{ color: 'var(--emerald-400)' }}>{repoOwner}/{selectedRepo}:{branch}</code>
        </p>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>Progress: <strong style={{ color: 'var(--text-primary)' }}>{job.completed}</strong> / {job.total}</span>
          <span style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>{progressPercent}%</span>
        </div>

        {/* Paused Banner */}
        {job.status === 'paused' && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid #f59e0b',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              color: '#fbbf24',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            <strong>Status:</strong> {job.error || `Paused at ${job.completed} / ${job.total} commits. Commits up to this checkpoint are permanently saved to GitHub.`}
          </div>
        )}

        {/* Error Banner */}
        {job.status === 'failed' && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            <strong>Error:</strong> {job.error}
          </div>
        )}

        {/* Success Banner */}
        {job.status === 'completed' && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--border-active)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--emerald-400)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            {job.result?.message}
            {job.result?.pushResult?.message && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {job.result.pushResult.message}
              </div>
            )}
          </div>
        )}

        {/* Controls Footer */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          {job.status === 'paused' ? (
            <>
              <Button
                variant="ghost"
                size="md"
                onClick={onStopAndKeep}
              >
                Done (Keep Commits)
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onResume}
                icon={<Play size={15} />}
              >
                Resume Generation
              </Button>
            </>
          ) : job.status === 'completed' ? (
            <>
              <Button
                variant="ghost"
                size="md"
                onClick={onClose}
              >
                Close
              </Button>
              <a
                href={`https://github.com/${repoOwner}/${selectedRepo}/commits/${branch}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-md"
              >
                View on GitHub <ExternalLink size={15} />
              </a>
            </>
          ) : job.status === 'failed' ? (
            <>
              <Button
                variant="ghost"
                size="md"
                onClick={onClose}
              >
                Close
              </Button>
              {hasBatchState && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={onResume}
                  icon={<RotateCcw size={15} />}
                >
                  Retry Remaining
                </Button>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Deploying in micro-batches...
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPause}
                icon={<Pause size={14} />}
              >
                Pause
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
