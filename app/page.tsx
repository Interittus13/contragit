'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Code2, 
  GitBranch, 
  GitCommit, 
  Layers, 
  Palette, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  Terminal, 
  Zap 
} from 'lucide-react';
import { AppHeader } from '@/app/components/layout/AppHeader';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { Card } from '@/app/components/ui/Card';
import { GitHubUser } from '@/lib/types/github';

export default function HomePage() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [previewCells, setPreviewCells] = useState<number[]>(() => {
    // Generate an organic pattern for preview
    return Array.from({ length: 7 * 24 }, (_, i) => {
      const row = i % 7;
      const isWeekend = row === 0 || row === 6;
      if (Math.random() < (isWeekend ? 0.2 : 0.65)) {
        return Math.floor(Math.random() * 4) + 1;
      }
      return 0;
    });
  });

  const LEVEL_COLORS: Record<number, string> = {
    0: 'rgba(255, 255, 255, 0.04)',
    1: '#0e4429',
    2: '#006d32',
    3: '#26a641',
    4: '#39d353',
  };

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handlePreviewCellClick = (idx: number) => {
    setPreviewCells(prev => {
      const next = [...prev];
      next[idx] = (next[idx] + 1) % 5;
      return next;
    });
  };

  return (
    <div className="page-container">
      {/* Responsive Navigation */}
      <AppHeader user={user} activeNav="home" />

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 0 4rem' }}>
        {/* Release Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            color: 'var(--emerald-400)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1.75rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Sparkles size={14} /> v2.0 • MODERN GITHUB ACTIVITY STUDIO
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)',
            lineHeight: 1.08,
            maxWidth: '920px',
            marginBottom: '1.5rem',
            letterSpacing: '-0.035em',
          }}
        >
          Architect Your <span className="text-gradient-emerald">GitHub Contributions</span> with Precision
        </h1>

        {/* Hero Description */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
          }}
        >
          Lost your contribution streak due to offline code, company firewalls, or private orgs? 
          <strong> ContraGit</strong> provides interactive 52-week visual canvas drawing, pixel font stamping, and automated Git Data API scheduling.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <Link
            href={user ? '/dashboard' : '/auth'}
            className="btn btn-primary btn-lg"
          >
            {user ? 'Open Studio Dashboard' : 'Get Started with GitHub'} <ArrowRight size={18} />
          </Link>
          <Link
            href="/instructions"
            className="btn btn-secondary btn-lg"
          >
            Read System Guide
          </Link>
        </div>

        {/* Interactive Mini-Studio Preview */}
        <div
          className="glass-panel"
          style={{
            width: '100%',
            maxWidth: '820px',
            padding: '1.75rem',
            marginBottom: '5rem',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Palette size={16} color="var(--emerald-400)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Interactive Canvas Engine
              </span>
            </div>
            <div className="status-pill">
              <span className="status-dot" /> Click any tile to paint
            </div>
          </div>

          {/* Mini Canvas Grid (24 weeks x 7 days) */}
          <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateRows: 'repeat(7, 12px)',
                gridAutoFlow: 'column',
                gap: '3px',
                width: 'fit-content',
              }}
            >
              {previewCells.map((level, i) => (
                <div
                  key={i}
                  onClick={() => handlePreviewCellClick(i)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    backgroundColor: LEVEL_COLORS[level],
                    border: level > 0 ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  }}
                  title={`Level ${level} (${level * 3} commits)`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section style={{ width: '100%', maxWidth: '1040px', textAlign: 'left', marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Engineered for Modern Developers
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Built with Next.js 16, TypeScript, OOP services, and resilient serverless micro-batching.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <Card
              title="52-Week Visual Canvas"
              subtitle="Full calendar grid matrix (364 days)"
              badge={<Badge variant="emerald"><Palette size={12} /> Studio</Badge>}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Click, drag, and draw your contribution art with intensity levels 0 through 4. Stamp text phrases or shapes (heart, space invader, zigzag) directly onto your schedule.
              </p>
            </Card>

            <Card
              title="Resilient Micro-Batching"
              subtitle="Sleep & timeout immune"
              badge={<Badge variant="cyan"><Zap size={12} /> Serverless</Badge>}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Stateless execution in micro-batches of 5 commits. Never hits Vercel timeouts. If your machine sleeps or connection drops, progress is safely saved on GitHub and auto-resumes.
              </p>
            </Card>

            <Card
              title="Mobile-First Architecture"
              subtitle="Touch gestures & thumb controls"
              badge={<Badge variant="muted"><Smartphone size={12} /> Responsive</Badge>}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Designed ground-up for phones and tablets. Features touch pan vs. draw toggles, grid scaling (1x to 1.5x), and a docked mobile bottom bar with quick deploy triggers.
              </p>
            </Card>
          </div>
        </section>

        {/* Clean Footer */}
        <footer
          style={{
            width: '100%',
            maxWidth: '1040px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            ContraGit • Released under the MIT License • Built with Next.js & TypeScript
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link href="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Studio</Link>
            <Link href="/instructions" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Documentation</Link>
            <a href="https://github.com/Interittus13/gitcontra" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>GitHub</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
