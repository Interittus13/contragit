import Link from 'next/link';
import { ArrowLeft, CheckCircle2, GitBranch, Shield, Sparkles } from 'lucide-react';

export default function InstructionsPage() {
  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <header className="header-nav">
        <Link href="/" className="brand-badge">
          <div className="brand-icon">⚡</div>
          <span className="brand-title">Contra<span className="accent">Git</span></span>
        </Link>
        <Link href="/dashboard" className="btn-ghost" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
          Go to Dashboard
        </Link>
      </header>

      <main>
        <div style={{ marginBottom: '2rem' }}>
          <div className="status-pill" style={{ marginBottom: '0.75rem' }}>
            <Sparkles size={14} /> Documentation
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>System Setup Guide</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            Follow these two quick steps to ensure all generated commits accurately render on your public GitHub graph.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Step 1 */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                1
              </div>
              <h2 style={{ fontSize: '1.25rem' }}>Create a Target Repository</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Create a new repository on your GitHub account (public or private). We recommend naming it something dedicated like <code>gitcontra</code> or <code>activity-history</code>.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="var(--emerald-400)" />
              <span><strong>Crucial:</strong> Check the box that says <em>"Add a README file"</em> so GitHub initializes the default branch tree.</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                2
              </div>
              <h2 style={{ fontSize: '1.25rem' }}>Enable Private Contributions in Settings</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
              If your chosen target repository is <strong>private</strong>, GitHub hides private activity by default. To make these squares visible on your profile:
            </p>
            <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '1rem' }}>
              <li>Open your <strong>GitHub Profile</strong> &rarr; click <strong>Settings</strong>.</li>
              <li>Scroll down to the <strong>Contribution & Activity</strong> section.</li>
              <li>Check the option: <strong>"Include private contributions on my profile"</strong>.</li>
              <li>Click <strong>Update Preferences</strong>.</li>
            </ol>
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.85rem', color: '#fcd34d' }}>
              <strong>Note on Cache:</strong> GitHub's background contribution cache can take anywhere from a few minutes to up to 24 hours to re-index historical backdated commits on your profile graph.
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="btn-ghost" style={{ gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Back
          </Link>
          <Link href="/dashboard" className="btn-primary">
            Proceed to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
