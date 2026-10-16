'use client';

import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { CommitMessageStyle } from '@/lib/types/scheduler';
import { Badge } from '@/app/components/ui/Badge';

export interface CommitStyleCardProps {
  messageStyle: CommitMessageStyle;
  onMessageStyleChange: (val: CommitMessageStyle) => void;
  customPrefix: string;
  onCustomPrefixChange: (val: string) => void;
}

export function CommitStyleCard({
  messageStyle,
  onMessageStyleChange,
  customPrefix,
  onCustomPrefixChange,
}: CommitStyleCardProps) {
  const getSampleMessage = () => {
    const today = new Date().toISOString().split('T')[0];
    if (messageStyle === 'minimal') {
      return `Commit #1 — ${today}`;
    }
    if (messageStyle === 'custom') {
      return `${customPrefix || 'update'} #1 — ${today}`;
    }
    return `feat: implement core workflow updates [contra-#1]`;
  };

  return (
    <Card
      title="Commit Message Styling"
      subtitle="Configure how generated commit titles appear in git history"
      badge={<Badge variant="muted">Git History</Badge>}
    >
      <div
        role="radiogroup"
        aria-label="Commit message style preset"
        className="grid-auto-fit"
        style={{ marginBottom: '1rem' }}
      >
        {[
          { id: 'conventional' as const, label: 'Conventional Commits', desc: 'feat:, fix:, docs:, refactor:' },
          { id: 'minimal' as const, label: 'Minimal & Clean', desc: 'Commit #1 — 2024-01-01' },
          { id: 'custom' as const, label: 'Custom Prefix', desc: 'User specified prefix with counter' },
        ].map(style => {
          const isSelected = messageStyle === style.id;
          return (
            <button
              key={style.id}
              role="radio"
              aria-checked={isSelected}
              type="button"
              onClick={() => onMessageStyleChange(style.id)}
              className="interactive"
              style={{
                padding: '0.9rem',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid var(--border-default)',
                borderTop: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.025)',
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 4px 16px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)' : 'none',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isSelected ? 'var(--emerald-400)' : 'var(--text-primary)', marginBottom: '0.2rem' }}>
                {style.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {style.desc}
              </div>
            </button>
          );
        })}
      </div>

      {messageStyle === 'custom' && (
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label" htmlFor="custom-prefix-input">
            Custom Message Prefix
          </label>
          <input
            id="custom-prefix-input"
            type="text"
            value={customPrefix}
            onChange={(e) => onCustomPrefixChange(e.target.value)}
            className="form-control"
            placeholder="e.g. chore(metrics): sync"
          />
        </div>
      )}

      {/* Live Preview */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>Preview:</span>
        <code className="mono" style={{ color: 'var(--emerald-400)', fontSize: '0.775rem' }}>
          {getSampleMessage()}
        </code>
      </div>
    </Card>
  );
}
