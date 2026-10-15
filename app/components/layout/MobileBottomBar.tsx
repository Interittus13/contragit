'use client';

import React from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
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
  return (
    <div className="mobile-sticky-bar">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--emerald-400)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {totalCommits}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>commits</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>
          {activeDays} active days
        </span>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={onDeploy}
        disabled={disabled || totalCommits === 0}
        iconRight={<ArrowRight size={15} />}
        style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
      >
        Deploy
      </Button>
    </div>
  );
}
