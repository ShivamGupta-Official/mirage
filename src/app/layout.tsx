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
        <meta name="referrer" content="no-referrer" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel+Decorative:wght@700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600;1,700&family=Great+Vibes&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600;1,700;1,800;1,900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
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
