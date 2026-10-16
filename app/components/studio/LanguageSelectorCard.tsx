'use client';

import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { 
  TargetLanguageConfig, 
  TargetLanguageId, 
  TargetPresetId 
} from '@/lib/types/language';
import { 
  LanguageMasqueradeEngine, 
  languageMasqueradeEngine 
} from '@/lib/services/LanguageMasqueradeEngine';
import { Code2, Layers, Terminal, Sparkles, Check } from 'lucide-react';

export interface LanguageSelectorCardProps {
  config: TargetLanguageConfig;
  onChange: (config: TargetLanguageConfig) => void;
}

export function LanguageSelectorCard({ config, onChange }: LanguageSelectorCardProps) {
  const isPresetMode = config.mode === 'preset';
  const activePreset = config.preset || 'fullstack';
  const activeLang = config.language || 'typescript';

  // Sample file preview based on current configuration
  const sampleFile = languageMasqueradeEngine.generateFileForCommit(1, new Date().toISOString(), config);

  return (
    <Card
      title="Target Language & Linguist Engine"
      subtitle="Configure which programming languages GitHub Linguist registers on your profile & repo stats"
      badge={<Badge variant="emerald"><Code2 size={13} /> Linguist Masquerade</Badge>}
    >
      {/* Mode Switcher: Presets vs Single Language */}
      <div className="segmented-control" style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => onChange({ mode: 'preset', preset: activePreset })}
          className={`segmented-control__item ${isPresetMode ? 'is-active' : ''}`}
        >
          <Layers size={14} /> Full-Stack &amp; DevOps Presets
        </button>
        <button
          type="button"
          onClick={() => onChange({ mode: 'single', language: activeLang })}
          className={`segmented-control__item ${!isPresetMode ? 'is-active' : ''}`}
        >
          <Terminal size={14} /> Individual Language
        </button>
      </div>

      {/* Preset Mode Selection */}
      {isPresetMode ? (
        <div
          role="radiogroup"
          aria-label="Multi-language presets"
          className="grid-auto-fit"
          style={{ gap: '0.75rem', marginBottom: '1.25rem' }}
        >
          {LanguageMasqueradeEngine.PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange({ mode: 'preset', preset: preset.id })}
                className="interactive"
                style={{
                  padding: '0.95rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-default)',
                  borderTop: isSelected ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.025)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  boxShadow: isSelected ? '0 6px 20px rgba(0, 0, 0, 0.35)' : 'none',
                  minHeight: '100px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? 'var(--emerald-400)' : 'var(--text-primary)' }}>
                    {preset.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: preset.color,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {preset.badge}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                  {preset.description}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)', marginTop: 'auto' }}>
                  {preset.breakdown}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Single Language Selection */
        <div
          role="radiogroup"
          aria-label="Individual languages"
          className="grid-auto-fit"
          style={{ gap: '0.65rem', marginBottom: '1.25rem' }}
        >
          {LanguageMasqueradeEngine.LANGUAGES.map((lang) => {
            const isSelected = activeLang === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange({ mode: 'single', language: lang.id })}
                className="interactive"
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-default)',
                  borderTop: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.025)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  minHeight: '48px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: lang.color,
                      boxShadow: `0 0 8px ${lang.color}66`,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? 'var(--emerald-400)' : 'var(--text-primary)' }}>
                      {lang.label}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {lang.extension}
                    </div>
                  </div>
                </div>
                {isSelected && <Check size={15} style={{ color: 'var(--emerald-400)' }} />}
              </button>
            );
          })}
        </div>
      )}

      {/* GitHub Linguist Live Simulator Box */}
      <div
        style={{
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--border-subtle)',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Target File Pattern:
            </span>
            <code className="mono" style={{ color: 'var(--emerald-400)', fontSize: '0.775rem' }}>
              {sampleFile.path}
            </code>
          </div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--emerald-400)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            Linguist: {sampleFile.language} ({sampleFile.bytes} bytes)
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          💡 <strong style={{ color: 'var(--text-secondary)' }}>GitHub Linguist Integration</strong>: Commits will generate syntactically-valid code in organic folder trees, immediately populating GitHub’s language bar and profile widgets like <code style={{ color: 'var(--emerald-400)' }}>github-readme-stats</code>.
        </p>
      </div>
    </Card>
  );
}
