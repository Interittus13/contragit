'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, KeyRound, Shield, Loader2, Lock } from 'lucide-react';
import { GitHubIcon } from '@/app/components/GitHubIcon';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [loading, setLoading] = useState<boolean>(true);
  const [configured, setConfigured] = useState<boolean>(true);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          router.replace('/dashboard');
        } else {
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
    <div
      className="glass-panel"
      style={{
        maxWidth: '460px',
        width: '100%',
        textAlign: 'center',
        padding: '2.5rem 2rem',
        margin: 'auto',
      }}
    >
      {/* Icon Chip */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)',
          color: 'var(--emerald-400)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 24px var(--emerald-glow)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <KeyRound size={26} />
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
        Authenticate Session
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        Connect your GitHub account to authorize precision Git Data commits and profile graph scheduling.
      </p>

      {/* Error Banner */}
      {errorParam && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            color: '#fca5a5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'left',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>GitHub authentication failed. Please try again.</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', color: 'var(--text-muted)' }}>
          <Loader2 className="animate-spin" size={20} color="var(--emerald-400)" />
          <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>Verifying OAuth credentials...</span>
        </div>
      ) : !configured ? (
        <div
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left',
            marginBottom: '1.5rem',
          }}
        >
          <h4 style={{ color: '#fcd34d', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> Environment Keys Missing
          </h4>
          <p style={{ fontSize: '0.825rem', color: '#fef08a', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            To enable OAuth on your deployment, configure these environment variables:
          </p>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#fef08a', fontFamily: 'var(--font-mono)' }}>
            {missingKeys.map(k => <li key={k}>{k}</li>)}
          </ul>
        </div>
      ) : (
        <a
          href="/api/auth/login"
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            marginBottom: '1.5rem',
            gap: '0.65rem',
          }}
        >
          <GitHubIcon size={18} /> Continue with GitHub
        </a>
      )}

      {/* Trust Badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Lock size={12} color="var(--emerald-400)" /> Stateless Cookie
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Shield size={12} color="var(--cyan-400)" /> Direct Git API
        </span>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Link href="/" className="btn btn-ghost btn-sm" style={{ gap: '0.35rem' }}>
          <ArrowLeft size={14} /> Back to Homepage
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
          <Loader2 className="animate-spin" size={20} color="var(--emerald-400)" />
          <span>Loading authentication...</span>
        </div>
      }>
        <AuthContent />
      </Suspense>
    </div>
  );
}
