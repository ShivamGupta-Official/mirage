'use client';

import { useEffect, useRef, useState } from 'react';
import { CyberGlobe } from '@/components/network/cyber-globe';

/* ────────────────────────────────────────────────────────
   GLOBAL INGRESS THREAT RADAR — Pure 3D Earth Scroll
   • Earth expands in dead center across 4-5 pages of free space
   • Heading stays in the 2nd page only (shrinks bigger -> smaller)
   • All rest of the pages are completely empty of text
   • Continuous dynamic spherical axis rotation
──────────────────────────────────────────────────────── */

export function ScrollGlobeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let animFrame: number;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setScrollProgress(progress);
    };

    const onScroll = () => {
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Heading Animation: Stays in the 2nd page only
  // Starts BIGGER (1.35) and scales down to SMALLER (0.75), fading out smoothly
  const headingProgress = Math.min(1, scrollProgress / 0.22);
  const headingScale = 1.35 - headingProgress * 0.60;
  const headingOpacity =
    scrollProgress <= 0.16
      ? 1
      : Math.max(0, 1 - (scrollProgress - 0.16) / 0.08);
  const headingY = -headingProgress * 40;

  // Globe Opacity: pure unconstrained presence in dead center, dissolving at absolute max plunge
  const globeOpacity =
    scrollProgress < 0.90
      ? 1
      : Math.max(0, 1 - (scrollProgress - 0.90) / 0.10);

  return (
    <section
      ref={sectionRef}
      className="relative h-[320vh] w-full bg-transparent"
    >
      {/* Sticky Full-Viewport Stage — Earth in Dead Center, Free Cosmic Space */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-transparent z-10 pointer-events-none">
        
        {/* Full-Bleed 3D WebGL Canvas Layer — Dead center, zero boundaries */}
        <div
          style={{ opacity: globeOpacity }}
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto z-0 transition-opacity duration-150"
        >
          <CyberGlobe
            compact
            scrollProgress={scrollProgress}
            className="!h-full !w-full !bg-transparent"
          />
        </div>

        {/* Heading: Stays in the 2nd page ONLY (shrinks from bigger to smaller), rest of pages are completely empty */}
        <div
          style={{
            opacity: headingOpacity,
            transform: `translate3d(0, ${headingY}px, 0) scale(${headingScale})`,
          }}
          className="relative z-10 flex flex-col items-center justify-center text-center max-w-5xl px-6 pointer-events-none select-none will-change-transform transition-opacity duration-150"
        >
          <div className="inline-flex items-center gap-2 mb-4 text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-[10px] sm:text-xs font-medium tracking-[0.35em] uppercase text-cyan-300/90">
              // SOVEREIGN DEFENSE TELEMETRY
            </span>
          </div>

          <h2 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-[#f5efff] leading-[0.98] drop-shadow-[0_12px_48px_rgba(0,0,0,0.95)]">
            Global Ingress <span className="italic font-light text-cyan-200">Threat Radar</span>
          </h2>
        </div>

      </div>
    </section>
  );
}
