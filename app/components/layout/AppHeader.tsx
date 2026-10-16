'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  BookOpen, 
  Compass, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { GitHubUser } from '@/lib/types/github';
import { GitHubIcon } from '@/app/components/GitHubIcon';

export interface AppHeaderProps {
  user?: GitHubUser | null;
  activeNav?: 'dashboard' | 'instructions' | 'home';
  defaultMobileOpen?: boolean;
}

export function AppHeader({ user, activeNav = 'dashboard', defaultMobileOpen = false }: AppHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(defaultMobileOpen);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close mobile drawer on Escape key and lock body scroll while open
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

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

  const avatarSrc = user?.avatarUrl || (user?.login ? `https://github.com/${user.login}.png?size=80` : null);

  return (
    <>
      {/* Full-screen backdrop overlay for mobile sheet */}
      {mobileMenuOpen && (
        <div
          className="mobile-sheet-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="app-header" role="banner">
        {/* Brand Logo (Left) */}
        <Link
          href="/"
          className="app-header__brand interactive"
          aria-label="ContraGit Home"
        >
          <div className="app-header__logo" aria-hidden="true">
            <Image
              src="/contragit.png"
              alt="ContraGit Logo"
              width={36}
              height={36}
              priority
              className="app-header__logo-img"
            />
          </div>
          <div className="app-header__title-group">
            <span className="app-header__title">
              Contra<span style={{ color: 'var(--emerald-400)' }}>Git</span>
            </span>
            <span className="app-header__subtitle">
              PRECISION GIT STUDIO
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="app-header__nav" aria-label="Main Navigation">
          <Link
            href="/dashboard"
            className={`nav-link ${activeNav === 'dashboard' ? 'is-active' : ''}`}
            aria-current={activeNav === 'dashboard' ? 'page' : undefined}
          >
            <Compass size={15} /> Studio
          </Link>
          <Link
            href="/instructions"
            className={`nav-link ${activeNav === 'instructions' ? 'is-active' : ''}`}
            aria-current={activeNav === 'instructions' ? 'page' : undefined}
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
        <div className="app-header__actions">
          {user ? (
            <div className="cluster" style={{ gap: '0.65rem' }}>
              <div className="user-profile-badge" title={`Signed in as ${user.login}`}>
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={user.login}
                    className="user-avatar"
                    width={24}
                    height={24}
                  />
                ) : (
                  <span className="status-dot" />
                )}
                <span className="user-profile-name">{user.login}</span>
              </div>
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

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-ghost btn-sm mobile-menu-toggle"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Sheet Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-sheet" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            {user && (
              <div className="mobile-sheet__user">
                <div className="mobile-sheet__user-info">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={user.login}
                      className="user-avatar-lg"
                      width={42}
                      height={42}
                    />
                  ) : (
                    <div className="status-dot" style={{ width: '12px', height: '12px' }} />
                  )}
                  <div className="mobile-sheet__user-meta">
                    <span className="mobile-sheet__username">{user.login}</span>
                    <span className="mobile-sheet__status">
                      <span className="status-dot" /> Active Session
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="btn btn-danger btn-sm"
                  aria-label="Sign Out"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`nav-link ${activeNav === 'dashboard' ? 'is-active' : ''}`}
              style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '0.95rem' }}
            >
              <Compass size={18} /> Studio Dashboard
            </Link>

            <Link
              href="/instructions"
              onClick={() => setMobileMenuOpen(false)}
              className={`nav-link ${activeNav === 'instructions' ? 'is-active' : ''}`}
              style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '0.95rem' }}
            >
              <BookOpen size={18} /> System Setup Guide
            </Link>

            <a
              href="https://github.com/Interittus13/gitcontra"
              target="_blank"
              rel="noreferrer"
              className="nav-link"
              style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '0.95rem', justifyContent: 'space-between' }}
            >
              <span className="cluster" style={{ gap: '0.55rem' }}>
                <GitHubIcon size={18} /> GitHub Source
              </span>
              <ExternalLink size={15} style={{ color: 'var(--text-disabled)' }} />
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
    </>
  );
}
