'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  BookOpen, 
  Compass, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { GitHubUser } from '@/lib/types/github';
import { GitHubIcon } from '@/app/components/GitHubIcon';
import { Badge } from '@/app/components/ui/Badge';

export interface AppHeaderProps {
  user?: GitHubUser | null;
  activeNav?: 'dashboard' | 'instructions' | 'home';
}

export function AppHeader({ user, activeNav = 'dashboard' }: AppHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth');
    } catch {
      router.push('/auth');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="app-header">
      {/* Brand Logo (Left) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <Link
          href="/"
          className="interactive"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: 'var(--text-primary)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--emerald-glow)',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: '#03140c',
            }}
          >
            ⚡
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1 }}>
              Contra<span style={{ color: 'var(--emerald-400)' }}>Git</span>
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              PRECISION GIT STUDIO
            </span>
          </div>
        </Link>
      </div>

      {/* Center Navigation Links (Desktop) */}
      <nav className="desktop-nav" style={{ alignItems: 'center', gap: '0.35rem' }}>
        <Link
          href="/dashboard"
          className={`nav-link ${activeNav === 'dashboard' ? 'is-active' : ''}`}
        >
          <Compass size={15} /> Studio
        </Link>
        <Link
          href="/instructions"
          className={`nav-link ${activeNav === 'instructions' ? 'is-active' : ''}`}
        >
          <BookOpen size={15} /> Guide
        </Link>
        <a
          href="https://github.com/Interittus13/gitcontra"
          target="_blank"
          rel="noreferrer"
          className="nav-link"
        >
          <GitHubIcon size={15} /> GitHub
        </a>
      </nav>

      {/* Right User Actions (Desktop) */}
      <div className="desktop-nav" style={{ alignItems: 'center', gap: '0.75rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Badge variant="emerald" icon={<span className="status-dot" />}>
              {user.login}
            </Badge>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn btn-ghost btn-sm"
              title="Sign Out"
              aria-label="Sign Out"
              style={{ padding: '0.4rem 0.65rem', minHeight: '36px' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <Link href="/auth" className="btn btn-primary btn-sm" style={{ padding: '0.45rem 1rem' }}>
            Sign In with GitHub <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Mobile Hamburger Toggle (Mobile only) */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="btn btn-ghost btn-sm mobile-menu-toggle"
        style={{ padding: '0.5rem', minHeight: '44px', minWidth: '44px' }}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sheet Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-sheet">
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-dot" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>
                  {user.login}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn btn-danger btn-sm"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          )}

          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`nav-link ${activeNav === 'dashboard' ? 'is-active' : ''}`}
            style={{ width: '100%', padding: '0.75rem 1rem' }}
          >
            <Compass size={18} /> Studio Dashboard
          </Link>

          <Link
            href="/instructions"
            onClick={() => setMobileMenuOpen(false)}
            className={`nav-link ${activeNav === 'instructions' ? 'is-active' : ''}`}
            style={{ width: '100%', padding: '0.75rem 1rem' }}
          >
            <BookOpen size={18} /> System Setup Guide
          </Link>

          <a
            href="https://github.com/Interittus13/gitcontra"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
            style={{ width: '100%', padding: '0.75rem 1rem', justifyContent: 'space-between' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitHubIcon size={16} /> GitHub Source
            </span>
            <ExternalLink size={14} />
          </a>

          {!user && (
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary btn-md"
                style={{ width: '100%' }}
              >
                Sign In with GitHub <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
