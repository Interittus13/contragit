import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ContraGit — Architect Your GitHub Activity',
  description: 'Precision GitHub contribution scheduling, organic activity simulation, and commit automation engine.',
  keywords: ['github', 'contribution-graph', 'automation', 'developer-tools', 'git', 'streak', 'contragit'],
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
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
