'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Cpu, 
  GitCommit, 
  Lock, 
  Palette, 
  Smartphone, 
  Sparkles, 
  Type, 
  Zap 
} from 'lucide-react';
import { AppHeader } from '@/app/components/layout/AppHeader';
import { Badge } from '@/app/components/ui/Badge';
import { Card } from '@/app/components/ui/Card';
import { GitHubUser } from '@/lib/types/github';
import { renderTextToPixelMatrix, STENCILS } from '@/lib/utils/pixelFont';

const LEVEL_COLORS: Record<number, string> = {
  0: 'rgba(255, 255, 255, 0.04)',
  1: '#0e4429',
  2: '#006d32',
  3: '#26a641',
  4: '#39d353',
};

export default function HomePage() {
  const [user, setUser] = useState<GitHubUser | null>(null);

  // Hero interactive typing studio
  const [stampInput, setStampInput] = useState<string>('HIRE ME');
  const selectedBrush = 3;
  const [activePreset, setActivePreset] = useState<'HIRE ME' | 'SHIP IT' | 'CONTRA' | 'HEART' | 'INVADER' | 'ORGANIC' | 'CUSTOM'>('HIRE ME');
  const [customTiles, setCustomTiles] = useState<Record<number, number>>({});

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

  // Dynamically compute stencil column width
  const textCols = useMemo(() => {
    if (activePreset === 'HEART') return 7;
    if (activePreset === 'INVADER') return 11;
    if (activePreset === 'ORGANIC') return 36;
    const clean = stampInput.toUpperCase().replace(/[^A-Z0-9 !+\-]/g, '');
    if (!clean) return 36;
    const m = renderTextToPixelMatrix(clean);
    return m[0]?.length || 36;
  }, [stampInput, activePreset]);

  const totalCols = useMemo(() => {
    return Math.max(38, textCols + 4);
  }, [textCols]);

  // Compute base 7-row matrix for hero canvas
  const heroGrid = useMemo(() => {
    const cols = totalCols;
    const rows = 7;
    const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    if (activePreset === 'HEART' && STENCILS.heart) {
      const heart = STENCILS.heart;
      const startCol = Math.max(0, Math.floor((cols - 7) / 2));
      heart.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val && r < rows && startCol + c < cols) {
            grid[r][startCol + c] = selectedBrush;
          }
        });
      });
    } else if (activePreset === 'INVADER' && STENCILS.invader) {
      const invader = STENCILS.invader;
      const startCol = Math.max(0, Math.floor((cols - 11) / 2));
      invader.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val && r < rows && startCol + c < cols) {
            grid[r][startCol + c] = selectedBrush;
          }
        });
      });
    } else if (activePreset === 'ORGANIC') {
      // Deterministic pseudo-random generation to prevent hydration divergence
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isWeekend = r === 0 || r === 6;
          const pseudoHash = Math.abs(Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
          const chance = isWeekend ? 0.22 : 0.72;
          if (pseudoHash < chance) {
            grid[r][c] = ((Math.floor(pseudoHash * 100) % 4) + 1);
          }
        }
      }
    } else {
      const clean = stampInput.toUpperCase().replace(/[^A-Z0-9 !+\-]/g, '');
      if (clean) {
        const matrix = renderTextToPixelMatrix(clean);
        const textWidth = matrix[0]?.length || 0;
        const startCol = Math.max(0, Math.floor((cols - textWidth) / 2));

        matrix.forEach((row, r) => {
          row.forEach((isFilled, c) => {
            if (isFilled && r < rows && startCol + c < cols) {
              grid[r][startCol + c] = selectedBrush;
            }
          });
        });
      }
    }

    return grid;
  }, [stampInput, selectedBrush, activePreset, totalCols]);

  // Merge base grid with manual user tile overrides
  const effectiveGrid = useMemo(() => {
    return heroGrid.map((row, r) =>
      row.map((baseVal, c) => {
        const key = r * 1000 + c;
        return customTiles[key] !== undefined ? customTiles[key] : baseVal;
      })
    );
  }, [heroGrid, customTiles]);

  // Real-time telemetry calculations from effective grid
  const heroCommitStats = useMemo(() => {
    let commits = 0;
    let days = 0;
    effectiveGrid.forEach(row => {
      row.forEach(val => {
        if (val > 0) {
          days++;
          commits += val === 4 ? 10 : val === 3 ? 6 : val === 2 ? 3 : 1;
        }
      });
    });
    return { commits, days };
  }, [effectiveGrid]);

  const handleTileClick = (r: number, c: number) => {
    const key = r * 1000 + c;
    const cur = customTiles[key] !== undefined ? customTiles[key] : (heroGrid[r]?.[c] || 0);
    setCustomTiles(prev => ({ ...prev, [key]: (cur + 1) % 5 }));
  };

  const handlePresetSelect = (preset: 'HIRE ME' | 'SHIP IT' | 'CONTRA' | 'HEART' | 'INVADER' | 'ORGANIC') => {
    setActivePreset(preset);
    setCustomTiles({});
    if (preset !== 'HEART' && preset !== 'INVADER' && preset !== 'ORGANIC') {
      setStampInput(preset);
    }
  };

  const handleInputChange = (val: string) => {
    const upper = val.toUpperCase();
    setStampInput(upper);
    setActivePreset('CUSTOM');
    setCustomTiles({});
  };

  return (
    <div className="page-container" style={{ maxWidth: '1240px' }}>
      {/* Universal Navigation Header */}
      <AppHeader user={user} activeNav="home" />

      {/* Hero Showcase */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem 0 4rem' }}>
        {/* Release Pill */}
        <div
          className="interactive"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.28)',
            padding: '0.4rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            color: 'var(--emerald-400)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1.75rem',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.18)',
          }}
        >
          <Sparkles size={14} /> v2.0 • ARCHITECT YOUR GITHUB IDENTITY
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6.5vw, 4.85rem)',
            lineHeight: 1.05,
            maxWidth: '1000px',
            marginBottom: '1.5rem',
            letterSpacing: '-0.04em',
            fontWeight: 800,
          }}
        >
          Turn Your Contribution Graph into a <span className="text-gradient-emerald">Masterpiece</span>
        </h1>

        {/* Hero Subtitle */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
          }}
        >
          Never let private orgs, enterprise firewalls, or offline coding wipe out your public activity.
          Paint text, symbols, and organic streaks directly to GitHub via atomic Git Data APIs.
        </p>

        {/* Direct Action Calls */}
        <div className="cluster" style={{ justifyContent: 'center', marginBottom: '3.5rem' }}>
          <Link
            href={user ? '/dashboard' : '/auth'}
            className="btn btn-primary btn-lg"
            style={{ fontSize: '1.05rem', padding: '0.85rem 1.85rem' }}
          >
            {user ? 'Open Studio Dashboard' : 'Launch Studio with GitHub'} <ArrowRight size={18} />
          </Link>
          <Link
            href="/instructions"
            className="btn btn-secondary btn-lg"
            style={{ fontSize: '1.05rem', padding: '0.85rem 1.85rem' }}
          >
            Architecture Guide
          </Link>
        </div>

        {/* =========================================================================
            INTERACTIVE HERO STUDIO PLAYGROUND
            ========================================================================= */}
        <section
          className="drafting-board"
          style={{
            width: '100%',
            maxWidth: '940px',
            marginBottom: '5rem',
            textAlign: 'left',
          }}
        >
          {/* Studio Canvas Control Bar */}
          <div className="cluster-between" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--emerald-400)',
                }}
              >
                <Palette size={15} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                  Live Canvas Interactive Simulator
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Type text below to test real-time pixel stencil rendering
                </div>
              </div>
            </div>

            {/* Live Telemetry Pill */}
            <div className="cluster" style={{ gap: '0.5rem' }}>
              <div className="stat-pill">
                <span className="stat-pill-label">Density</span>
                <span className="stat-pill-val" style={{ color: 'var(--emerald-400)' }}>
                  {heroCommitStats.commits} commits
                </span>
              </div>
              <div className="stat-pill">
                <span className="stat-pill-label">Days</span>
                <span className="stat-pill-val" style={{ color: 'var(--cyan-400)' }}>
                  {heroCommitStats.days} active
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Stencil Toolbar */}
          <div
            className="cluster-between"
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(8, 12, 18, 0.6)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.25rem',
            }}
          >
            {/* Stamp Text Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '200px' }}>
              <Type size={15} color="var(--emerald-400)" />
              <input
                id="hero-stencil-input"
                name="hero-stencil-input"
                type="text"
                maxLength={9}
                value={stampInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="TYPE WORD..."
                autoComplete="off"
                spellCheck={false}
                className="form-control mono"
                style={{
                  height: '36px',
                  minHeight: '36px',
                  fontSize: '0.85rem',
                  maxWidth: '180px',
                  padding: '0.4rem 0.75rem',
                }}
              />
            </div>

            {/* Quick Presets */}
            <div className="cluster" style={{ gap: '0.35rem' }}>
              {(['HIRE ME', 'SHIP IT', 'CONTRA', 'HEART', 'ORGANIC'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  aria-pressed={activePreset === preset}
                  className={`btn btn-sm ${activePreset === preset ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    fontSize: '0.725rem',
                    padding: '0.3rem 0.65rem',
                    minHeight: '32px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: activePreset === preset ? 700 : 500,
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Heatmap Grid Canvas — Column-by-Column Flexbox Layout */}
          <div
            style={{
              overflowX: 'auto',
              padding: '0.75rem 0',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '4px',
                justifyContent: 'center',
                width: 'fit-content',
                margin: '0 auto',
                minWidth: 'fit-content',
              }}
            >
              {Array.from({ length: totalCols }).map((_, c) => (
                <div
                  key={c}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {Array.from({ length: 7 }).map((_, r) => {
                    const level = effectiveGrid[r]?.[c] ?? 0;
                    return (
                      <button
                        key={r}
                        type="button"
                        aria-label={`Row ${r + 1}, Column ${c + 1}: Level ${level}`}
                        onClick={() => handleTileClick(r, c)}
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '2.5px',
                          backgroundColor: LEVEL_COLORS[level],
                          border: level > 0 ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(255, 255, 255, 0.04)',
                          cursor: 'pointer',
                          padding: 0,
                          margin: 0,
                          outline: 'none',
                          transition: 'transform 0.1s var(--spring-ease), background-color 0.15s ease',
                          touchAction: 'manipulation',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = 'scale(1.35)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                        }}
                        title={`Col ${c + 1}, Row ${r + 1} (Level ${level})`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.775rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>Click any tile to toggle intensity • Real-time font stencils</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(lv => (
                <span
                  key={lv}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: LEVEL_COLORS[lv],
                    display: 'inline-block',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            THE VISUAL CONTRAST: BEFORE VS AFTER CONTRA-GIT
            ========================================================================= */}
        <section style={{ width: '100%', maxWidth: '940px', marginBottom: '5.5rem', textAlign: 'left' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.65rem' }}>
              The Impact on Your Engineering Profile
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              Recruiters, engineering leads, and open-source contributors inspect your graph. Here is what they see.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Before Card */}
            <div
              className="glass-panel"
              style={{
                padding: '1.75rem',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                background: 'rgba(15, 10, 15, 0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  Without ContraGit
                </span>
                <Badge variant="danger">Gaps &amp; Lost Streaks</Badge>
              </div>

              {/* Simulated Broken Graph */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: 'repeat(5, 10px)',
                  gridAutoFlow: 'column',
                  gap: '3px',
                  width: 'fit-content',
                  margin: '1.25rem 0',
                  opacity: 0.6,
                }}
              >
                {Array.from({ length: 5 * 20 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '2px',
                      backgroundColor: i % 11 === 0 ? '#26a641' : 'rgba(255, 255, 255, 0.04)',
                    }}
                  />
                ))}
              </div>

              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <li>Hard work trapped inside private enterprise repositories</li>
                <li>Streak broken during vacations, flights, or local sprints</li>
                <li>Looks inactive even when writing code every day</li>
              </ul>
            </div>

            {/* After Card */}
            <div
              className="glass-panel"
              style={{
                padding: '1.75rem',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  With ContraGit
                </span>
                <Badge variant="emerald">Steady 364-Day Rhythm</Badge>
              </div>

              {/* Simulated Vibrant Graph */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: 'repeat(5, 10px)',
                  gridAutoFlow: 'column',
                  gap: '3px',
                  width: 'fit-content',
                  margin: '1.25rem 0',
                }}
              >
                {Array.from({ length: 5 * 20 }, (_, i) => {
                  const colors = ['#0e4429', '#006d32', '#26a641', '#39d353'];
                  return (
                    <div
                      key={i}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        backgroundColor: i % 14 === 0 ? 'rgba(255, 255, 255, 0.04)' : colors[i % colors.length],
                      }}
                    />
                  );
                })}
              </div>

              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <li>Lush, steady graph that signals active software engineering</li>
                <li>Custom pixel typography messages stamped onto your history</li>
                <li>Stateless micro-batching that never times out or drops data</li>
              </ul>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BENTO GRID ARCHITECTURE (WWDC KEYNOTE STYLE)
            ========================================================================= */}
        <section style={{ width: '100%', maxWidth: '1060px', textAlign: 'left', marginBottom: '5.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.65rem' }}>
              Engineered for the Modern Git Stack
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
              ContraGit is not a bash script. It is a full-featured Next.js 16 web application with stateless architecture.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <Card
              title="Stateless Micro-Batching"
              subtitle="Sleep & laptop close immune"
              badge={<Badge variant="cyan"><Zap size={12} /> Resilient</Badge>}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Authors commits in stateless 5-commit chunks. If your internet disconnects, machine goes to sleep, or browser restarts, progress is permanently preserved on GitHub and auto-resumes.
              </p>
            </Card>

            <Card
              title="Direct Git Data API"
              subtitle="Zero local git clones required"
              badge={<Badge variant="emerald"><Cpu size={12} /> Direct API</Badge>}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                No disk writes. ContraGit communicates directly with GitHub&apos;s low-level Git Data API, creating git blobs, trees, commit objects, and reference updates directly in memory.
              </p>
            </Card>

            <Card
              title="Mobile Studio Experience"
              subtitle="Touch drawing & safe area docking"
              badge={<Badge variant="muted"><Smartphone size={12} /> Mobile-First</Badge>}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Draw from your phone or tablet on the go. Features touch Pan vs. Draw toggles, 1.5x zoom mode for thumb accuracy, and a docked bottom deployment bar.
              </p>
            </Card>

            <Card
              title="Zero Database Footprint"
              subtitle="Stateless encrypted session cookie"
              badge={<Badge variant="emerald"><Lock size={12} /> 100% Private</Badge>}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                ContraGit stores zero personal code or access tokens on any server. OAuth tokens exist strictly inside encrypted, HTTP-only, stateless session cookies on your device.
              </p>
            </Card>

            <Card
              title="Conventional Commit Logs"
              subtitle="feat:, fix:, docs:, refactor:"
              badge={<Badge variant="cyan"><GitCommit size={12} /> Clean Git</Badge>}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Customize how your git commit logs appear. Pick from Conventional Commits, minimal numbered timestamps, or specify your own custom engineering prefix.
              </p>
            </Card>

            <Card
              title="Pixel Typography Library"
              subtitle="Built-in 5x7 matrix alphabet"
              badge={<Badge variant="warning"><Type size={12} /> Font Engine</Badge>}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Stamp any English word, symbol, or retro pixel stencil (heart, space invader, zigzag) directly onto your 52-week calendar with customizable week column offsets.
              </p>
            </Card>
          </div>
        </section>

        {/* =========================================================================
            LIVE TERMINAL LOG SIMULATOR
            ========================================================================= */}
        <section
          style={{
            width: '100%',
            maxWidth: '840px',
            marginBottom: '5.5rem',
            textAlign: 'left',
          }}
        >
          <div
            className="glass-panel"
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: '#04060a',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Terminal Top Window Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                git log --oneline --graph
              </span>
              <div style={{ width: '38px' }} />
            </div>

            {/* Terminal Body */}
            <div style={{ padding: '1.25rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: 1.8 }}>
              <div style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--emerald-400)' }}>$</span> git log -n 4 --pretty=format:&quot;%h %ad | %s&quot;
              </div>
              <div style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--emerald-400)' }}>* a89fc12</span> <span style={{ color: 'var(--text-muted)' }}>2024-06-12 |</span> feat: implement core workflow updates [contra-#104]
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--emerald-400)' }}>* c410a88</span> <span style={{ color: 'var(--text-muted)' }}>2024-06-12 |</span> fix: resolve connection timeout [contra-#103]
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--cyan-400)' }}>* 7e9902b</span> <span style={{ color: 'var(--text-muted)' }}>2024-06-11 |</span> docs: update README specifications [contra-#102]
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--violet-400)' }}>* 5d218fa</span> <span style={{ color: 'var(--text-muted)' }}>2024-06-11 |</span> chore: optimize cache boundaries [contra-#101]
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BOTTOM CALL TO ACTION
            ========================================================================= */}
        <section
          className="glass-panel"
          style={{
            width: '100%',
            maxWidth: '840px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            marginBottom: '4rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.06) 100%)',
            border: '1px solid var(--border-active)',
          }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
            Ready to Paint Your Graph?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
            Connect with GitHub in 3 seconds. No credit card, no database, no local cloning.
          </p>
          <Link
            href={user ? '/dashboard' : '/auth'}
            className="btn btn-primary btn-lg"
            style={{ fontSize: '1.05rem', padding: '0.85rem 2rem' }}
          >
            {user ? 'Enter Studio Dashboard' : 'Get Started with GitHub'} <ArrowRight size={18} />
          </Link>
        </section>

        {/* Clean Footer */}
        <footer
          style={{
            width: '100%',
            maxWidth: '1060px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            ContraGit • Precision Git Studio • MIT License
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Studio</Link>
            <Link href="/instructions" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Guide</Link>
            <a href="https://github.com/Interittus13/gitcontra" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>GitHub</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
