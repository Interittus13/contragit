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
  Sparkles, 
  X 
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
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.75rem',
        background: 'rgba(12, 16, 24, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link
          href="/"
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
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--emerald-glow)',
              fontWeight: 800,
              fontSize: '1.05rem',
              color: '#03140c',
            }}
          >
            ⚡
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Contra<span style={{ color: 'var(--emerald-400)' }}>Git</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              PRECISION GIT STUDIO
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.35rem',
          }}
          className="desktop-nav"
        >
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: activeNav === 'dashboard' ? 700 : 500,
              color: activeNav === 'dashboard' ? 'var(--emerald-400)' : 'var(--text-secondary)',
              textDecoration: 'none',
              background: activeNav === 'dashboard' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            <Compass size={15} /> Studio
          </Link>
          <Link
            href="/instructions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: activeNav === 'instructions' ? 700 : 500,
              color: activeNav === 'instructions' ? 'var(--emerald-400)' : 'var(--text-secondary)',
              textDecoration: 'none',
              background: activeNav === 'instructions' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            <BookOpen size={15} /> Guide
          </Link>
        </nav>
      </div>

      {/* Desktop User Section */}
      <div style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Badge variant="emerald" icon={<span className="status-dot" />}>
              {user.login}
            </Badge>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn btn-ghost btn-sm"
              title="Sign Out"
              style={{ padding: '0.4rem 0.65rem' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <Link href="/auth" className="btn btn-primary btn-sm">
            Sign In with GitHub <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Mobile Hamburger Toggle */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="btn btn-ghost btn-sm mobile-menu-toggle"
        style={{ padding: '0.5rem' }}
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            zIndex: 100,
          }}
        >
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: activeNav === 'dashboard' ? 'var(--emerald-400)' : 'var(--text-primary)',
              background: activeNav === 'dashboard' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <Compass size={18} /> Studio Dashboard
          </Link>

          <Link
            href="/instructions"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: activeNav === 'instructions' ? 'var(--emerald-400)' : 'var(--text-primary)',
              background: activeNav === 'instructions' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <BookOpen size={18} /> System Setup Guide
          </Link>

          <a
            href="https://github.com/Interittus13/gitcontra"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              background: 'rgba(255, 255, 255, 0.03)',
              fontWeight: 500,
              fontSize: '0.85rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitHubIcon size={16} /> GitHub Source
            </span>
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Embedded CSS for media queries */}
      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
