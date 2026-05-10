import type { Metadata } from 'next';
import '../styles/globals.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import AudioManager from '@/components/game/AudioManager';

export const metadata: Metadata = {
  title: 'Shaikh Race — Neon Street Racing',
  description: 'A high-octane browser racing game. Dodge traffic, collect coins, nitro boost to glory.',
  keywords: ['racing game', 'browser game', 'three.js', 'neon racing'],
  authors: [{ name: 'Shaikh Race' }],
  openGraph: {
    title: 'Shaikh Race',
    description: 'Neon street racing — browser based.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body id="game-root">
        {children}
        <AudioManager />
      </body>
    </html>
  );
}
