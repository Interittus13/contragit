'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, KeyRound, Shield, Loader2 } from 'lucide-react';
import { GitHubIcon } from '@/app/components/GitHubIcon';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [loading, setLoading] = useState<boolean>(true);
  const [configured, setConfigured] = useState<boolean>(true);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  useEffect(() => {
    // Check if already authenticated
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          router.replace('/dashboard');
        } else {
          // Check if oauth is configured
          return fetch('/api/auth/configured')
            .then((res) => res.json())
            .then((cfg) => {
              setConfigured(cfg.configured);
              setMissingKeys(cfg.missing || []);
              setLoading(false);
            });
        }
      })
      .catch(() => setLoading(false));
  }, [router]);

  return (
    <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
      <div style={{
        width: '54px',
        height: '54px',
        borderRadius: '14px',
        background: 'rgba(16, 185, 129, 0.1)',
        color: 'var(--emerald-400)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
        boxShadow: '0 0 20px var(--emerald-glow)'
      }}>
        <KeyRound size={26} />
      </div>

      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Authenticate</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem' }}>
        Connect your GitHub account to access commit scheduling, repository validation, and live execution.
      </p>

      {errorParam && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.6rem',
          fontSize: '0.85rem',
          color: '#fca5a5'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Sign-in Error:</strong> {decodeURIComponent(errorParam)}
          </div>
        </div>
      )}

      {!configured && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'left',
          fontSize: '0.85rem',
          color: '#fcd34d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <AlertCircle size={16} /> Configuration Required
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Missing GitHub OAuth credentials in environment:
          </p>
          <code style={{ display: 'block', background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
            {missingKeys.join(', ')}
          </code>
        </div>
      )}

      <a
        href="/api/auth/login"
        className="btn-primary"
        style={{ width: '100%', fontSize: '1rem', padding: '0.85rem', marginBottom: '1.5rem' }}
      >
        <GitHubIcon size={18} /> Continue with GitHub
      </a>

      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <Shield size={14} color="var(--emerald-400)" /> Minimal required permissions (`repo`, `read:user`)
        </div>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Loader2 className="animate-spin" size={24} color="var(--emerald-400)" /> Loading sign in...
        </div>
      }>
        <AuthContent />
      </Suspense>
    </div>
  );
}
