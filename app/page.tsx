'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, GitCommit, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userLogin, setUserLogin] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setIsAuthenticated(true);
          setUserLogin(data.user.login);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="page-container">
      {/* Top Navigation */}
      <header className="header-nav">
        <Link href="/" className="brand-badge">
          <div className="brand-icon">⚡</div>
          <span className="brand-title">Contra<span className="accent">Git</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Dashboard ({userLogin}) <ArrowRight size={15} />
            </Link>
          ) : (
            <Link href="/auth" className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem 0' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '0.4rem 0.9rem',
          borderRadius: '999px',
          color: 'var(--emerald-400)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-mono)'
        }}>
          <Sparkles size={15} /> v1.0 • ARCHITECT YOUR GITHUB ACTIVITY
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, maxWidth: '850px', marginBottom: '1.5rem' }}>
          Take Complete Control of Your <span style={{ background: 'linear-gradient(135deg, #10b981, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GitHub Story</span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-muted)', maxWidth: '620px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Lost your streak due to private repositories, client firewalls, or offline coding? 
          <strong> ContraGit</strong> provides precision scheduling and natural distribution directly via GitHub’s native Git Data API.
        </p>

        {/* CTA Group */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <Link href={isAuthenticated ? "/dashboard" : "/auth"} className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2rem' }}>
            {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'} <ArrowRight size={18} />
          </Link>
          <Link href="/instructions" className="btn-ghost" style={{ fontSize: '1.05rem', padding: '0.9rem 1.8rem' }}>
            System Setup Guide
          </Link>
        </div>

        {/* Visual Contribution Simulation Bar */}
        <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', padding: '1.5rem', marginBottom: '4rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Organic Density Preview (Simulated)
            </span>
            <div className="status-pill">
              <span className="status-dot"></span> Live Engine
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: '4px' }}>
            {Array.from({ length: 140 }).map((_, i) => {
              const densities = [
                'rgba(255, 255, 255, 0.05)',
                'rgba(16, 185, 129, 0.25)',
                'rgba(16, 185, 129, 0.5)',
                'rgba(16, 185, 129, 0.75)',
                '#10b981',
              ];
              const level = (i * 7 + 13) % 5;
              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '3px',
                    backgroundColor: densities[level],
                    border: level > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'transform 0.15s',
                  }}
                  title={`Level ${level}`}
                />
              );
            })}
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
          <div className="glass-panel" style={{ textAlign: 'left', padding: '1.5rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Calendar size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Precision Scheduling</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Choose your target date range, specific weekdays, and commit volume per day with granular steppers.
            </p>
          </div>

          <div className="glass-panel" style={{ textAlign: 'left', padding: '1.5rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <GitCommit size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>100% Native Commits</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Direct Git Data API calls create real blobs, trees, and commit objects that automatically register on your profile.
            </p>
          </div>

          <div className="glass-panel" style={{ textAlign: 'left', padding: '1.5rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Zero Local Rebase</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              No messy terminal scripts, no git rebase headaches. Secure OAuth token handles transactions in the cloud.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 0 1rem', marginTop: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        <div>ContraGit • Open Source Developer Productivity</div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <Link href="/instructions" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Setup Guide</Link>
          <a href="https://github.com/Interittus13/gitcontra" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>GitHub Repo</a>
        </div>
      </footer>
    </div>
  );
}
