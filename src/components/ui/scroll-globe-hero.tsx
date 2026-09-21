'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { PHASES } from '@/lib/globe-phases';
import { TextParticle } from './text-particle';

const GlobeScene = dynamic(() => import('./globe-scene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />,
});

export interface ScrollGlobeHeroSection {
  eyebrow?: string;
  title: string;
  body: string;
}

export interface ScrollGlobeHeroProps {
  pages?: number;
  headline?: string;
  subhead?: string;
  sections?: ScrollGlobeHeroSection[];
  outroEyebrow?: string;
  outroTitle?: string;
  outroDescription?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

const DEFAULT_SECTIONS: ScrollGlobeHeroSection[] = [
  {
    eyebrow: '// STEP 01 · PHYSICAL AIR-GAP PROTECTION',
    title: 'One-Way Optical Diode',
    body: 'Network data enters strictly through a physical one-way fiber cable. With the return laser physically severed, hackers can never inject malicious packets back into the network.',
  },
  {
    eyebrow: '// STEP 02 · REAL-TIME AI DETECTION',
    title: 'Live AI Anomaly Engine',
    body: 'Our machine learning engine monitors live network traffic continuously to catch cyber intrusions, data leaks, and zero-day attacks in milliseconds with zero false alarms.',
  },
  {
    eyebrow: '// STEP 03 · TAMPER-PROOF FORENSICS',
    title: 'Immutable Blockchain Audit',
    body: 'Every detected attack and forensic record is locked into a tamper-proof blockchain ledger, ensuring court-admissible legal proof that no hacker or insider can alter or delete.',
  },
];

export function ScrollGlobeHero({
  pages = 5,
  headline = 'Global Ingress Threat Radar',
  subhead = 'Real-time AI intrusion detection on physical one-way optical data diodes for national security networks.',
  sections = DEFAULT_SECTIONS,
  outroEyebrow,
  outroTitle,
  outroDescription,
  ctaLabel,
  ctaHref = '/monitor',
  className = '',
}: ScrollGlobeHeroProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const debugRef = useRef<HTMLDivElement>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outroRef = useRef<HTMLDivElement>(null);

  const [isDebug, setIsDebug] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Check URL query for ?debug=1 or toggle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('debug') === '1') {
        setIsDebug(true);
      }
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // IntersectionObserver to pause R3F frameloop when stage is off-screen
  useEffect(() => {
    if (!stageRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  // Lenis + GSAP ScrollTrigger orchestration
  useEffect(() => {
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    // Exact Lenis sync from spec
    const lenis = new Lenis();
    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', handleScroll);

    const rafTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafTicker);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      if (!wrapperRef.current) return;

      const hero = heroRef.current;
      const beats = beatRefs.current.filter(Boolean) as HTMLDivElement[];
      const outro = outroRef.current;

      // Initial state of beats and outro: opacity 0
      gsap.set(beats, { opacity: 0, scale: 1.1, y: 40 });
      if (outro) gsap.set(outro, { opacity: 0, y: 35, scale: 0.95 });

      // ONE GSAP timeline with total duration exactly 1, scrubbed by wrapper trigger
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            progress.current = self.progress;
            if (debugRef.current) {
              debugRef.current.textContent = `p: ${self.progress.toFixed(3)}`;
            }
          },
        },
      });

      // Hero: shrink, lift, fade
      if (hero) {
        tl.to(
          hero,
          {
            scale: 0.6,
            y: -80,
            opacity: 0,
            duration: PHASES.heroShrink[1] - PHASES.heroShrink[0],
          },
          PHASES.heroShrink[0]
        );
      }

      // 3 beats: in (0.05) -> hold (0.05) -> out (0.05), shrinking on exit
      beats.forEach((el, i) => {
        const t = PHASES.beatStart + i * PHASES.beatStep;
        tl.fromTo(el, { opacity: 0, scale: 1.1, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.05 }, t).to(
          el,
          { opacity: 0, scale: 0.6, y: -40, duration: 0.05 },
          t + 0.1
        );
      });

      // Outro CTA (settling text below the 1x Earth)
      if (outro) {
        tl.fromTo(
          outro,
          { opacity: 0, y: 35, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: PHASES.outroIn[1] - PHASES.outroIn[0] },
          PHASES.outroIn[0]
        );
      }

      // Ensure timeline has duration of 1 so time equals p
      tl.to({}, { duration: 0 }, 1);
    }, wrapperRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(rafTicker);
      lenis.destroy();
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div className={`relative bg-black text-white ${className}`}>
        <div className="h-screen w-full relative flex items-center justify-center p-8 text-center">
          <div className="absolute inset-0 opacity-40">
            <GlobeScene progress={progress} reducedMotion={true} visible={true} />
          </div>
          <div className="relative z-10 max-w-3xl space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">{headline}</h1>
            <p className="text-lg md:text-xl text-neutral-400">{subhead}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-24 space-y-24">
          {sections.slice(0, 3).map((item, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4">
              <h2 className="text-3xl font-semibold text-neutral-100">{item.title}</h2>
              <p className="text-lg text-neutral-400 leading-relaxed">{item.body}</p>
            </div>
          ))}

          <div className="text-center py-16 space-y-6">
            <h2 className="text-4xl font-bold">{outroTitle}</h2>
            <button className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-neutral-200 transition">
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      ref={wrapperRef}
      style={{ height: `${pages * 100}vh` }}
      className={`relative ${className}`}
    >
      {/* Debug Readout */}
      {isDebug && (
        <div
          ref={debugRef}
          className="fixed top-4 left-4 z-50 px-3 py-1.5 bg-black/90 text-cyan-400 font-mono text-xs rounded border border-cyan-500/40 shadow-lg pointer-events-none backdrop-blur-md"
        >
          p: 0.000
        </div>
      )}

      {/* Sticky Stage Div */}
      <div
        ref={stageRef}
        className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-transparent"
        aria-label="Interactive 3D Earth visualization and planetary intelligence features"
      >
        {/* Canvas Layer */}
        <div className="absolute inset-0">
          <GlobeScene progress={progress} reducedMotion={false} visible={isVisible} />
        </div>

        {/* Text Layers (centered, semantic HTML, transform + opacity only, zero blur boxes) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Hero Layer (Screen 1) */}
          <div
            ref={heroRef}
            className="absolute inset-0 grid place-items-center will-change-transform will-change-opacity p-4 sm:p-6"
          >
            <div className="text-center max-w-5xl mx-auto space-y-3 sm:space-y-4 pt-6 md:pt-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f5efff]/10 bg-[#f5efff]/5 mb-2 sm:mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#f5efff]/70">
                  // SOVEREIGN DEFENSE TELEMETRY · GLOBAL RADAR
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-6xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[1.05] sm:leading-[0.95] text-[#f5efff]">
                Global Ingress <span className="italic text-white">Threat Radar</span>
              </h2>
              <p className="mt-3 sm:mt-4 text-xs sm:text-base md:text-xl text-[#f5efff]/55 max-w-2xl mx-auto font-light leading-relaxed">
                {subhead}
              </p>
              <div className="pt-4 sm:pt-6 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-mono text-[#f5efff]/40 uppercase tracking-widest">
                <span>Scroll to explore orbit</span>
                <span className="animate-bounce">↓</span>
              </div>
            </div>
          </div>

          {/* 3 Feature Beats (No blur container - completely clean floating text) */}
          {sections.slice(0, 3).map((beat, idx) => (
            <div
              key={idx}
              ref={(el) => {
                beatRefs.current[idx] = el;
              }}
              className="absolute inset-0 grid place-items-center will-change-transform will-change-opacity p-4 sm:p-6"
            >
              <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3 px-4 sm:px-6">
                <div className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-cyan-400/90 font-medium">
                  {beat.eyebrow || `// CORE MVP CAPABILITY 0${idx + 1}`}
                </div>
                <h3 className="font-editorial text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#f5efff] leading-tight">
                  {beat.title}
                </h3>
                <p className="font-sans text-xs sm:text-base md:text-lg text-[#f5efff]/60 font-light leading-relaxed max-w-xl mx-auto">
                  {beat.body}
                </p>
              </div>
            </div>
          ))}

          {/* Outro Layer (Final phase positioned accordingly below the 1x Earth) */}
          {outroTitle && (
            <div
              ref={outroRef}
              className="absolute inset-x-0 bottom-2 sm:bottom-6 top-[48%] sm:top-[53%] flex flex-col items-center justify-center will-change-transform will-change-opacity px-4 sm:px-6 pointer-events-none z-10"
            >
              <div className="text-center max-w-4xl mx-auto space-y-2 sm:space-y-3">
                {outroEyebrow && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-950/30 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em] text-emerald-400/90 font-medium">
                      {outroEyebrow}
                    </span>
                  </div>
                )}
                <div className="w-full h-20 sm:h-32 md:h-40 max-w-4xl mx-auto pointer-events-auto relative">
                  <TextParticle
                    text={outroTitle}
                    fontSize={110}
                    fontFamily='"Cormorant Garamond", Georgia, serif'
                    particleSize={2.0}
                    particleColor="#f5efff"
                    particleDensity={3}
                    className="w-full h-full"
                  />
                </div>
                {outroDescription && (
                  <p className="font-sans text-xs sm:text-base md:text-lg text-[#f5efff]/70 font-light tracking-wide leading-relaxed max-w-2xl mx-auto mt-2 sm:mt-3">
                    {outroDescription}
                  </p>
                )}
                {ctaLabel && (
                  <div className="pt-1.5 sm:pt-2.5 pointer-events-auto">
                    <Link
                      href={ctaHref || '/monitor'}
                      data-cursor="Uplink"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#f5efff]/20 bg-[#f5efff]/10 backdrop-blur-md text-white font-mono text-[11px] sm:text-xs uppercase tracking-[0.15em] hover:bg-[#f5efff]/20 hover:border-[#f5efff]/40 transition-all duration-300 shadow-xl"
                    >
                      <span>{ctaLabel}</span>
                      <span className="text-emerald-400">→</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ScrollGlobeHero;
