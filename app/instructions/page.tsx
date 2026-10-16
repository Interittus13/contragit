import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, GitBranch, Shield, Sparkles } from 'lucide-react';
import { AppHeader } from '@/app/components/layout/AppHeader';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';

export default function InstructionsPage() {
  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="ambient-glow" />
      <div className="ambient-grid" />

      <AppHeader activeNav="instructions" />

      <main className="stack-lg">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Badge variant="emerald"><Sparkles size={12} /> System Documentation</Badge>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', letterSpacing: '-0.035em', marginBottom: '0.75rem' }}>
            System Setup &amp; Architecture Guide
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Follow these two essential steps to ensure all generated commits accurately render on your public GitHub contribution graph.
          </p>
        </div>

        <div className="stack">
          {/* Step 1 */}
          <Card
            title="1. Create a Dedicated Target Repository"
            subtitle="Recommended: 'gitcontra' or 'activity-history'"
            badge={<Badge variant="cyan"><GitBranch size={12} /> Step 1</Badge>}
          >
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Create a new repository on your GitHub account (public or private). We recommend keeping it isolated in a dedicated repository rather than polluting production codebases.
            </p>
            <div className="info-banner info-banner-emerald">
              <CheckCircle2 size={18} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
              <span>
                <strong>Crucial Requirement:</strong> Check the box that says <em>&quot;Add a README file&quot;</em> so GitHub initializes the default branch tree.
              </span>
            </div>
          </Card>

          {/* Step 2 */}
          <Card
            title="2. Enable Private Contributions in Profile Settings"
            subtitle="Required if your target repository is Private"
            badge={<Badge variant="emerald"><Shield size={12} /> Step 2</Badge>}
          >
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem', fontSize: '0.9rem' }}>
              If your chosen target repository is <strong>private</strong>, GitHub hides private activity from public profile visitors by default. To make these squares visible:
            </p>
            <ol
              style={{
                paddingLeft: '1.5rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                fontSize: '0.9rem',
                marginBottom: '1.25rem',
              }}
            >
              <li>Open your <strong>GitHub Profile</strong> &rarr; click <strong>Settings</strong>.</li>
              <li>Scroll down to the <strong>Contribution &amp; Activity</strong> section.</li>
              <li>Check the option: <strong>&quot;Include private contributions on my profile&quot;</strong>.</li>
              <li>Click <strong>Update Preferences</strong>.</li>
            </ol>
            <div className="info-banner info-banner-warning">
              <div>
                <strong>Cache Indexing Note:</strong> GitHub&apos;s background contribution cache can take anywhere from a few minutes to up to 24 hours to re-index historical backdated commits on your profile graph.
              </div>
            </div>
          </Card>
        </div>

        <div className="cluster-between" style={{ paddingTop: '1rem' }}>
          <Link href="/" className="btn btn-ghost btn-md">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <Link href="/dashboard" className="btn btn-primary btn-md">
            Open Studio Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
