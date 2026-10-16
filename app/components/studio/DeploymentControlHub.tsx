'use client';

import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  Sparkles, 
  GitCommit, 
  Rocket, 
  AlertTriangle,
  Layers,
  Calendar,
  Lock,
  Code
} from 'lucide-react';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { CommitJob, ScheduleCalculation } from '@/lib/types/scheduler';
import { TargetLanguageConfig } from '@/lib/types/language';

export type DeploymentStage = 
  | 'idle' 
  | 'review' 
  | 'deploying' 
  | 'paused' 
  | 'completed' 
  | 'failed';

export interface DeploymentControlHubProps {
  stage: DeploymentStage;
  repoOwner: string;
  selectedRepo: string;
  branch: string;
  effectiveTotal: number;
  effectiveDays: number;
  originalPreservedDays: number;
  activeMode: 'canvas' | 'standard';
  languageConfig?: TargetLanguageConfig;
  calculation: ScheduleCalculation | null;
  calculating: boolean;
  job: CommitJob | null;
  hasBatchState: boolean;
  onReviewPlan: () => void;
  onCancelReview: () => void;
  onConfirmAndDeploy: () => void;
  onPause: () => void;
  onResume: () => void;
  onStopAndKeep: () => void;
  onReset: () => void;
}

export function DeploymentControlHub({
  stage,
  repoOwner,
  selectedRepo,
  branch,
  effectiveTotal,
  effectiveDays,
  originalPreservedDays,
  activeMode,
  languageConfig,
  calculation,
  calculating,
  job,
  hasBatchState,
  onReviewPlan,
  onCancelReview,
  onConfirmAndDeploy,
  onPause,
  onResume,
  onStopAndKeep,
  onReset,
}: DeploymentControlHubProps) {
  const currentTotal = job ? job.total : (calculation?.totalCommits ?? effectiveTotal);
  const currentCompleted = job ? job.completed : 0;
  const progressPercent = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;

  // -------------------------------------------------------------
  // STAGE 4: COMPLETED
  // -------------------------------------------------------------
  if (stage === 'completed') {
    return (
      <div
        id="deployment-hub"
        className="glass-panel"
        style={{
          padding: '1.5rem',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(6, 182, 212, 0.06) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '320px',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.15)',
          animation: 'fadeIn 0.25s var(--spring-ease)',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={24} color="var(--emerald-400)" />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Schedule Completed!
                </h3>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  100% of commits generated and verified
                </span>
              </div>
            </div>
            <Badge variant="emerald">Pushed to Remote</Badge>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.15rem',
              marginBottom: '1.25rem',
              fontSize: '0.825rem',
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Destination:</span>
              <code className="mono" style={{ color: 'var(--emerald-400)' }}>
                {repoOwner}/{selectedRepo}:{branch}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Authored Volume:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{job?.total || effectiveTotal} commits</strong>
            </div>
            {job?.result?.pushResult?.message && (
              <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                {job.result.pushResult.message}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button variant="ghost" size="md" onClick={onReset}>
            New Schedule
          </Button>
          <a
            href={`https://github.com/${repoOwner}/${selectedRepo}/commits/${branch}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-md"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            View on GitHub <ExternalLink size={15} />
          </a>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 3: DEPLOYING / PAUSED / FAILED (LIVE EXECUTION)
  // -------------------------------------------------------------
  if (stage === 'deploying' || stage === 'paused' || stage === 'failed') {
    const isPaused = stage === 'paused';
    const isFailed = stage === 'failed';

    return (
      <div
        id="deployment-hub"
        className="glass-panel"
        style={{
          padding: '1.5rem',
          border: isFailed 
            ? '1px solid rgba(239, 68, 68, 0.4)' 
            : isPaused 
              ? '1px solid rgba(245, 158, 11, 0.4)' 
              : '1px solid var(--border-active)',
          background: isFailed
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(10, 14, 23, 0.8) 100%)'
            : isPaused
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(10, 14, 23, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '320px',
          animation: 'fadeIn 0.25s var(--spring-ease)',
        }}
      >
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {isFailed ? (
                <AlertTriangle size={22} color="var(--danger)" />
              ) : isPaused ? (
                <Pause size={22} color="#f59e0b" />
              ) : (
                <Loader2 className="animate-spin" size={22} color="var(--emerald-400)" />
              )}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  {isFailed ? 'Generation Halted' : isPaused ? 'Generation Paused' : 'Deploying Micro-Batches...'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Target: <code className="mono" style={{ color: 'var(--emerald-400)' }}>{repoOwner}/{selectedRepo}:{branch}</code>
                </span>
              </div>
            </div>
            <Badge variant={isFailed ? 'danger' : isPaused ? 'warning' : 'emerald'}>
              {isFailed ? 'Failed' : isPaused ? 'Paused' : `${progressPercent}%`}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div style={{ margin: '1rem 0 0.5rem 0' }}>
            <div className="progress-container" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${progressPercent}%`,
                  background: isFailed ? 'var(--danger)' : isPaused ? '#f59e0b' : undefined,
                  transition: 'width 0.25s ease-out'
                }} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.35rem' }}>
              <span>Progress: <strong style={{ color: 'var(--text-primary)' }}>{currentCompleted}</strong> / {currentTotal} commits</span>
              <span>Batch {Math.ceil(currentCompleted / 5)} / {Math.ceil(currentTotal / 5)}</span>
            </div>
          </div>

          {/* Status Details / Errors */}
          {isPaused && (
            <div className="info-banner info-banner-warning" style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontSize: '0.785rem' }}>
              <div>
                <strong>Paused:</strong> Commits up to #{currentCompleted} are safely recorded on GitHub.
              </div>
            </div>
          )}

          {isFailed && (
            <div className="info-banner info-banner-danger" style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontSize: '0.785rem' }}>
              <div>
                <strong>Error:</strong> {job?.error || 'Batch generation encountered an error.'}
              </div>
            </div>
          )}

          {!isPaused && !isFailed && (
            <div 
              style={{ 
                marginTop: '0.75rem', 
                background: 'rgba(0, 0, 0, 0.3)', 
                borderRadius: 'var(--radius-sm)', 
                padding: '0.65rem 0.85rem',
                fontSize: '0.785rem',
                color: 'var(--text-muted)'
              }}
            >
              <span className="mono" style={{ color: 'var(--cyan-400)' }}>⚡ Stateless Git Data API pipeline active</span>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-disabled)', marginTop: '0.2rem' }}>
                Safe to close tab or switch apps. Checkpoints sync every 5 commits.
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1rem' }}>
          {isPaused ? (
            <>
              <Button variant="ghost" size="sm" onClick={onStopAndKeep}>
                Done (Keep Commits)
              </Button>
              <Button variant="primary" size="sm" onClick={onResume} icon={<Play size={14} />}>
                Resume Batch
              </Button>
            </>
          ) : isFailed ? (
            <>
              <Button variant="ghost" size="sm" onClick={onReset}>
                Dismiss
              </Button>
              {hasBatchState && (
                <Button variant="primary" size="sm" onClick={onResume} icon={<RotateCcw size={14} />}>
                  Retry Remaining
                </Button>
              )}
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={onPause} icon={<Pause size={14} />}>
              Pause Generation
            </Button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 2: INLINE PRE-FLIGHT REVIEW
  // -------------------------------------------------------------
  if (stage === 'review' && calculation) {
    return (
      <div
        id="deployment-hub"
        className="glass-panel"
        style={{
          padding: '1.5rem',
          border: '1.5px solid var(--emerald-400)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '320px',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.12)',
          animation: 'fadeIn 0.2s var(--spring-ease)',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitCommit size={20} color="var(--emerald-400)" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Pre-Flight Verification
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Confirm commit parameters before pushing
                </span>
              </div>
            </div>
            <Badge variant="cyan">Ready to Author</Badge>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.825rem',
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Mode:</span>
              <span className="mono" style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>
                {activeMode === 'canvas' ? '🎨 Visual Canvas' : '⚡ Quick Rules'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target:</span>
              <code className="mono" style={{ color: 'var(--cyan-400)' }}>
                {calculation.repository} ({branch})
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date Coverage:</span>
              <span className="mono" style={{ fontSize: '0.785rem' }}>{calculation.dateRange}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Active Days:</span>
              <span style={{ fontWeight: 600 }}>{calculation.eligibleDays} days</span>
            </div>
            {(calculation.protectedDays || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Original Protected:</span>
                <span className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>
                  🔒 {calculation.protectedDays} days preserved
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Commits to Author:</span>
              <strong style={{ color: 'var(--emerald-400)', fontSize: '0.95rem' }}>
                {calculation.totalCommits} commits
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Execution Pipeline:</span>
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {Math.ceil(calculation.totalCommits / 5)} micro-batches (~{calculation.estimatedSeconds}s)
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button variant="ghost" size="md" onClick={onCancelReview}>
            Back / Edit
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onConfirmAndDeploy}
            icon={<Rocket size={15} />}
          >
            Confirm & Deploy
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 1: IDLE / READY (RESTING DASHBOARD STATE)
  // -------------------------------------------------------------
  return (
    <div
      id="deployment-hub"
      className="glass-panel"
      style={{
        padding: '1.5rem',
        border: '1px solid var(--border-active)',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.04) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '320px',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Authoring Queue
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.1, marginTop: '0.2rem' }}>
              {effectiveTotal} <span style={{ fontSize: '1rem', color: 'var(--emerald-400)', fontWeight: 600 }}>commits</span>
            </div>
          </div>
          <Badge variant="emerald" icon={<Sparkles size={12} />}>
            Ready to Push
          </Badge>
        </div>

        <div
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.825rem',
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Target Repository:</span>
            <code className="mono" style={{ color: 'var(--emerald-400)' }}>{repoOwner}/{selectedRepo || 'repo'}</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Target Branch:</span>
            <code className="mono" style={{ color: 'var(--cyan-400)' }}>{branch}</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Active Days:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{effectiveDays} days</span>
          </div>
          {originalPreservedDays > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Original Preserved:</span>
              <span className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>🔒 {originalPreservedDays} days</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Safety:</span>
            <span style={{ color: 'var(--emerald-400)', fontWeight: 500 }}>Stateless 5-commit chunks</span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={onReviewPlan}
        disabled={calculating || (activeMode === 'canvas' && effectiveTotal === 0)}
        loading={calculating}
        iconRight={<Play size={16} fill="currentColor" />}
        style={{ width: '100%', minHeight: '50px', fontSize: '1.05rem' }}
      >
        Review & Deploy Schedule
      </Button>
    </div>
  );
}
