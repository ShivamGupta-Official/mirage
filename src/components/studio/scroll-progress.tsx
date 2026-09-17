'use client';

import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [scrollPercent, setScrollPercent] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const p = Math.min(100, Math.max(0, (window.scrollY / scrollHeight) * 100));
        setScrollPercent(p);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top thin progress line */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#f5efff]/40 via-[#f5efff] to-[#f5efff]/90 transition-all duration-75 ease-out shadow-[0_0_12px_#f5efff]"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Floating micro progress badge */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-[#f5efff]/10 bg-[#08080c]/80 backdrop-blur-md pointer-events-none select-none">
        <span className="font-mono text-[10px] text-[#f5efff]/40 tracking-wider">NAV //</span>
        <span className="font-mono text-[11px] font-medium text-[#f5efff]">
          {Math.round(scrollPercent).toString().padStart(3, '0')}%
        </span>
      </div>
    </>
  );
}
