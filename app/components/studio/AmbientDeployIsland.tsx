'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Pause, 
  Play, 
  CheckCircle2, 
  ExternalLink,
  ChevronUp
} from 'lucide-react';
import { DeploymentStage } from './DeploymentControlHub';
import { CommitJob } from '@/lib/types/scheduler';

export interface AmbientDeployIslandProps {
  stage: DeploymentStage;
  job: CommitJob | null;
  repoOwner: string;
  selectedRepo: string;
  branch: string;
  onPause: () => void;
  onResume: () => void;
}

export function AmbientDeployIsland({
  stage,
  job,
  repoOwner,
  selectedRepo,
  branch,
  onPause,
  onResume,
}: AmbientDeployIslandProps) {
  const [isScrolledAway, setIsScrolledAway] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hubEl = document.getElementById('deployment-hub');
      if (!hubEl) {
        setIsScrolledAway(true);
        return;
      }
      const rect = hubEl.getBoundingClientRect();
      // If the deployment hub is out of the primary viewport (scrolled above or below)
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setIsScrolledAway(!isVisible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only display when a job is active or completed AND user is looking elsewhere
  const shouldShow = (stage === 'deploying' || stage === 'paused' || stage === 'completed') && isScrolledAway && job;
  if (!shouldShow || !job) return null;

  const progressPercent = job.total > 0 ? Math.round((job.completed / job.total) * 100) : 0;
  const isPaused = stage === 'paused';
  const isCompleted = stage === 'completed';

  const scrollToHub = () => {
    const hubEl = document.getElementById('deployment-hub');
    if (hubEl) {
      hubEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      role="region"
      aria-label="Active Deployment Island"
      style={{
        position: 'fixed',
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        right: '1.5rem',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.65rem 1rem',
        background: 'rgba(10, 14, 23, 0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: 'var(--radius-full)',
        border: isCompleted 
          ? '1px solid rgba(16, 185, 129, 0.5)' 
          : isPaused 
            ? '1px solid rgba(245, 158, 11, 0.5)' 
            : '1px solid var(--border-active)',
        boxShadow: isCompleted
          ? '0 8px 30px rgba(16, 185, 129, 0.25)'
          : '0 8px 30px rgba(0, 0, 0, 0.65)',
        cursor: 'pointer',
        transition: 'all 0.2s var(--spring-ease)',
        maxWidth: 'calc(100vw - 3rem)',
      }}
      onClick={scrollToHub}
    >
      {/* Icon Indicator */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isCompleted ? (
          <CheckCircle2 size={18} color="var(--emerald-400)" />
        ) : isPaused ? (
          <Pause size={18} color="#f59e0b" />
        ) : (
          <Loader2 className="animate-spin" size={18} color="var(--emerald-400)" />
        )}
      </div>

      {/* Main Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {isCompleted ? 'Deployment Complete' : `${job.completed} / ${job.total} commits`}
          </span>
          <span className="mono" style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>
            ({progressPercent}%)
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <code className="mono" style={{ color: 'var(--text-secondary)' }}>{selectedRepo}:{branch}</code>
        </div>
      </div>

      {/* Controls or Deep Link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
        {isCompleted ? (
          <a
            href={`https://github.com/${repoOwner}/${selectedRepo}/commits/${branch}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: '28px' }}
          >
            GitHub <ExternalLink size={12} />
          </a>
        ) : isPaused ? (
          <button
            type="button"
            onClick={onResume}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: '28px' }}
            title="Resume generation"
          >
            <Play size={12} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onPause}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: '28px' }}
            title="Pause generation"
          >
            <Pause size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={scrollToHub}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.25rem', height: '28px', width: '28px' }}
          title="Scroll to Deployment Hub"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    </div>
  );
}
