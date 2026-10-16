'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/Button';

export interface MobileBottomBarProps {
  totalCommits: number;
  activeDays: number;
  onDeploy: () => void;
  disabled?: boolean;
}

export function MobileBottomBar({
  totalCommits,
  activeDays,
  onDeploy,
  disabled = false,
}: MobileBottomBarProps) {
  const isDeployable = !disabled && totalCommits > 0;

  return (
    <nav
      className="mobile-sticky-bar"
      aria-label="Mobile deployment actions"
    >
      <div className="mobile-sticky-bar__metrics">
        <div className="mobile-sticky-bar__commits">
          <span className="mobile-sticky-bar__count">
            {totalCommits}
          </span>
          <span className="mobile-sticky-bar__label">
            {totalCommits === 1 ? 'commit' : 'commits'}
          </span>
          {isDeployable && (
            <span
              className="status-dot-active"
              title="Ready to deploy"
              style={{ width: '7px', height: '7px' }}
            />
          )}
        </div>
        <span className="mobile-sticky-bar__subtitle">
          {activeDays} {activeDays === 1 ? 'active day' : 'active days'} queued
        </span>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={onDeploy}
        disabled={!isDeployable}
        iconRight={<ArrowRight size={15} />}
        className="interactive"
        style={{ padding: '0.65rem 1.35rem' }}
        aria-label={`Deploy ${totalCommits} commits across ${activeDays} active days`}
      >
        Deploy
      </Button>
    </nav>
  );
}
