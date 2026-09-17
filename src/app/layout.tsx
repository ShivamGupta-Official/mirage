import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mirage-sooty.vercel.app'),
  title: 'MIRAGE — Multi-resolution Intelligent Risk & Adaptive Graph Engine',
  description:
    'Award-winning AI defense studio and intelligence engineering engine for unidirectional network traffic. ' +
    'SIH 2026 — Problem ID 26145 — NTRO.',
  keywords: ['cybersecurity', 'NTRO', 'threat detection', 'passive monitoring', 'optical diode', 'blockchain audit'],
  authors: [{ name: 'VOID MINDS' }],
  robots: { index: false, follow: false },
};

import { MirageProvider } from '@/components/providers/mirage-provider';
import { CustomCursor } from '@/components/studio/custom-cursor';
import { ScrollProgress } from '@/components/studio/scroll-progress';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#08080c" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="bg-[#08080c] text-[#f5efff]">
        <MirageProvider>
          <CustomCursor />
          <ScrollProgress />
          {children}
        </MirageProvider>
      </body>
    </html>
  );
}
