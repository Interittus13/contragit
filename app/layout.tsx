import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ContraGit — Architect Your GitHub Activity',
  description: 'Precision GitHub contribution scheduling, organic activity simulation, and commit automation engine.',
  keywords: ['github', 'contribution-graph', 'automation', 'developer-tools', 'git', 'streak', 'contragit'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="ambient-glow" />
        <div className="ambient-grid" />
        {children}
      </body>
    </html>
  );
}
