'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Shield, Activity, Lock } from 'lucide-react';
import { StudioNav } from '@/components/studio/studio-nav';
import { StudioFooter } from '@/components/studio/studio-footer';
import { Preloader } from '@/components/studio/preloader';
import { Eyebrow } from '@/components/studio/eyebrow';
import { Magnetic } from '@/components/studio/magnetic-button';
import { CountUp } from '@/components/studio/count-up';
import { ScrollReveal } from '@/components/studio/scroll-reveal';
import { CyberGlobe } from '@/components/network/cyber-globe';
import { STUDIO_PROJECTS, STUDIO_SERVICES, STUDIO_AWARDS } from '@/lib/studio-data';
import { DefenseModulesGrid } from '@/components/studio/defense-modules-grid';
import { WovenLightHero, WovenCanvas } from '@/components/studio/woven-light-hero';

/* ────────────────────────────────────────────────────────
   MIRAGE — Clean, spacious landing page
   Every section uses generous negative space and big type.
   All animations are GPU-accelerated (transform3d + opacity).
   No scroll listeners — purely IntersectionObserver-driven.
──────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#08080c] text-[#f5efff] overflow-x-hidden selection:bg-[#f5efff] selection:text-[#08080c]">
      {/* ═══ PRELOADER (3 seconds) ═══ */}
      <Preloader />

      {/* ═══ NAVIGATION ═══ */}
      <StudioNav />

      {/* ═════════════════════════════════════════════════════
          1. HERO — Full viewport, titles from different edges
      ═════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-24 pt-32 pb-24 overflow-hidden">
        {/* Soft ambient gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(245,239,255,0.03),transparent_55%)]" />
        {/* Interactive Three.js Woven Silk Canvas */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-auto">
          <WovenCanvas />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto w-full">
          {/* Eyebrow */}
          <ScrollReveal direction="fade" delay={200}>
            <Eyebrow label="// NTRO · PROBLEM STATEMENT 26145 · SIH 2026" tag="active" />
          </ScrollReveal>

          {/* Main title — each line from a different direction */}
          <div className="mt-12 sm:mt-16 space-y-1 sm:space-y-2 md:space-y-3">
            <ScrollReveal direction="left" delay={300} distance={140} duration={1100}>
              <h1 className="font-editorial text-[3.2rem] sm:text-7xl md:text-[5.5rem] lg:text-[7.5rem] xl:text-[9rem] font-light tracking-tight leading-[0.9] text-[#f5efff]">
                Multi-Resolution
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={520} distance={140} duration={1100}>
              <h1 className="font-editorial text-[3.2rem] sm:text-7xl md:text-[5.5rem] lg:text-[7.5rem] xl:text-[9rem] font-light tracking-tight leading-[0.9] italic text-white">
                Passive Threat
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="bottom" delay={740} distance={100} duration={1100}>
              <h1 className="font-editorial text-[3.2rem] sm:text-7xl md:text-[5.5rem] lg:text-[7.5rem] xl:text-[9rem] font-light tracking-tight leading-[0.9] text-[#f5efff]">
                Intelligence
              </h1>
            </ScrollReveal>
          </div>

          {/* Description */}
          <ScrollReveal direction="fade" delay={950} duration={900}>
            <p className="mt-12 sm:mt-16 max-w-2xl text-base sm:text-lg md:text-xl text-[#f5efff]/50 font-light leading-[1.7]">
              Hardware-enforced unidirectional optical tap monitoring.
              Extracts packet, connection, and session graph invariants
              with zero physical return channel.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal direction="bottom" delay={1150} duration={800}>
            <div className="mt-10 sm:mt-12 flex flex-wrap gap-4">
              <Magnetic strength={0.3}>
                <Link
                  href="/dashboard"
                  data-cursor="Launch"
                  className="studio-pill-btn studio-pill-btn-primary text-sm sm:text-base py-4 px-9 sm:px-11"
                >
                  Enter Live SOC Console
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link
                  href="/work"
                  data-cursor="View"
                  className="studio-pill-btn text-sm sm:text-base py-4 px-9 sm:px-11"
                >
                  Explore Architectures
                </Link>
              </Magnetic>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          2. LIVE METRICS — Three clean stat cards
      ═════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 pb-24 md:pb-32">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7">
          {[
            { label: 'EVALUATION LATENCY', value: '1.45 ms', note: 'Sub-millisecond Streaming', accent: 'emerald' },
            { label: 'PHYSICAL RETURN PATH', value: '0.00 ns', note: 'Absolute Zero Backchannel', accent: 'cyan' },
            { label: 'DETECTION ACCURACY', value: '99.94%', note: 'Welford EWMA Validated', accent: 'emerald' },
          ].map((stat, i) => (
            <ScrollReveal key={stat.label} direction="bottom" delay={i * 150}>
              <div className="rounded-2xl border border-[#f5efff]/[0.06] bg-[#0c0b14]/70 backdrop-blur-sm p-7 sm:p-9">
                <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#f5efff]/35 block">
                  {stat.label}
                </span>
                <span className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold text-[#f5efff] mt-3 block">
                  {stat.value}
                </span>
                <span className={`text-xs flex items-center gap-2 mt-3 ${stat.accent === 'emerald' ? 'text-emerald-400/80' : 'text-cyan-400/80'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${stat.accent === 'emerald' ? 'bg-emerald-400' : 'bg-cyan-400'} animate-pulse`} />
                  {stat.note}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          3. SOC DASHBOARD PREVIEW — Optimized Globe
      ═════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 py-24 md:py-36 border-t border-[#f5efff]/[0.05]">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal direction="fade">
            <Eyebrow label="// SOVEREIGN DEFENSE TELEMETRY" tag="active" />
          </ScrollReveal>

          <div className="mt-5 mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <ScrollReveal direction="left" delay={200}>
              <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#f5efff] leading-[1.05]">
                Global Ingress <span className="italic">Threat Radar</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={350}>
              <Link
                href="/dashboard"
                data-cursor="Launch"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#f5efff]/50 hover:text-white transition-colors whitespace-nowrap"
              >
                Open Full Console <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="bottom" delay={300} distance={50}>
            <div className="rounded-3xl border border-[#f5efff]/[0.08] bg-[#09090f] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              {/* Window bar */}
              <div className="border-b border-[#f5efff]/[0.06] px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[10px] sm:text-xs tracking-wider uppercase text-[#f5efff]/50">
                    LIVE ORBITAL TELEMETRY · WebGL
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#f5efff]/30 uppercase tracking-widest hidden sm:inline">
                  60 FPS
                </span>
              </div>

              {/* Globe — compact mode strips all HUD overlays */}
              <div className="h-[320px] sm:h-[420px] md:h-[500px] w-full relative">
                <CyberGlobe compact />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          4. CORE PILLARS — Three spacious cards
      ═════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 py-28 md:py-44 border-t border-[#f5efff]/[0.05]">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal direction="fade">
            <Eyebrow label="// CORE ARCHITECTURAL PILLARS" tag="active" />
          </ScrollReveal>

          <ScrollReveal direction="right" delay={200}>
            <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#f5efff] mt-5 mb-16 sm:mb-24 leading-[1.05]">
              Built for physical <span className="italic">asymmetry</span>.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                num: '001',
                label: 'PHYSICAL LAYER',
                title: 'Zero-Return Optical TAP',
                desc: 'Single-strand 9/125 SMF-28 optical fiber with physical transmit laser severed. Packets flow strictly inbound with absolute physical air-gap protection.',
                Icon: Shield,
              },
              {
                num: '002',
                label: 'STATISTICAL AI',
                title: 'Welford EWMA Profiling',
                desc: 'Online statistical moments adaptively learn legitimate host diurnal behavior without catastrophic forgetting. 4.5σ threshold eliminates false positives.',
                Icon: Activity,
              },
              {
                num: '003',
                label: 'IMMUTABLE AUDIT',
                title: 'SHA-256 Blockchain Ledger',
                desc: 'Every detection and cyber range run is sealed into an immutable parent-chained block, providing verifiable legal-grade proof of non-repudiation.',
                Icon: Lock,
              },
            ].map((pillar, i) => (
              <ScrollReveal
                key={pillar.num}
                direction={i === 0 ? 'left' : i === 1 ? 'bottom' : 'right'}
                delay={i * 180}
              >
                <div className="group rounded-2xl border border-[#f5efff]/[0.06] bg-[#0b0a13] p-8 sm:p-10 md:p-12 transition-all duration-500 hover:border-[#f5efff]/[0.15] hover:bg-[#0f0e1a] h-full">
                  <div className="flex items-center justify-between mb-12">
                    <span className="font-mono text-xs text-[#f5efff]/30 uppercase tracking-[0.2em]">
                      ({pillar.num}) {pillar.label}
                    </span>
                    <pillar.Icon className="h-5 w-5 text-[#f5efff]/20 group-hover:text-[#f5efff]/45 transition-colors duration-500" />
                  </div>

                  <h3 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-light text-[#f5efff] mb-5 leading-tight">
                    {pillar.title}
                  </h3>

                  <p className="font-sans text-sm sm:text-base text-[#f5efff]/45 leading-[1.7]">
                    {pillar.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          5. MISSION STATEMENT — Big centered text
      ═════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 py-32 md:py-48 border-t border-[#f5efff]/[0.05] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,239,255,0.025),transparent_55%)]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <ScrollReveal direction="fade">
            <Eyebrow label="// SOVEREIGN DEFENSE PHILOSOPHY" tag="active" className="justify-center" />
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={200} distance={50}>
            <h2 className="font-editorial text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#f5efff] leading-[1.12] mt-8">
              We build defense telemetry that thrives where traditional
              bidirectional tools{' '}
              <span className="italic underline decoration-1 decoration-[#f5efff]/25 underline-offset-4">
                collapse
              </span>
              .
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="fade" delay={400}>
            <p className="mt-10 sm:mt-14 text-base sm:text-lg md:text-xl text-[#f5efff]/45 font-light leading-[1.8] max-w-3xl mx-auto">
              Conventional NIDS cannot operate across physical optical diodes
              because missing TCP handshakes trigger socket memory exhaustion.
              MIRAGE re-architects detection as an asymmetric, stateless
              streaming graph problem.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={550}>
            <div className="mt-10">
              <Link
                href="/about"
                data-cursor="View"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#f5efff]/60 border-b border-[#f5efff]/25 pb-1.5 hover:border-[#f5efff] hover:text-white transition-all group"
              >
                <span>Read The Defense Philosophy</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          6. CAPABILITIES — Clean numbered list + sticky header
      {/* ═════════════════════════════════════════════════════
          6. CAPABILITIES — Balanced 3-Column Defense Modules
      ═════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 py-28 md:py-36 border-t border-[#f5efff]/[0.05] bg-[#060609]">
        <div className="max-w-[1400px] mx-auto">
          <DefenseModulesGrid />
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          WOVEN LIGHT ENCLAVE — Interactive WebGL Particle Hero
      ═════════════════════════════════════════════════════ */}
      <section className="relative h-[85vh] sm:h-[90vh] w-full overflow-hidden border-t border-[#f5efff]/[0.06] bg-black">
        <WovenLightHero
          showNav={false}
          className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black text-white"
          headline="Woven by Light"
          subtitle="An interactive tapestry of light and motion, crafted with code and creativity. 50,000 optical photons flowing through the unidirectional MIRAGE sensor enclave."
          ctaText="Explore the Weave"
          ctaHref="/weave"
        />
      </section>

      {/* ═════════════════════════════════════════════════════
          7. PROJECTS — Horizontal scroll with snap
      ═════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 py-28 md:py-44 border-t border-[#f5efff]/[0.05] overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 sm:mb-20">
            <div>
              <ScrollReveal direction="fade">
                <Eyebrow label="// ENGINEERED SYSTEMS" tag="active" />
              </ScrollReveal>
              <ScrollReveal direction="left" delay={200}>
                <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#f5efff] mt-4 leading-[1.05]">
                  Selected <span className="italic">implementations</span>.
                </h2>
              </ScrollReveal>
            </div>

            <ScrollReveal direction="right" delay={300}>
              <Link
                href="/work"
                data-cursor="View"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#f5efff]/50 hover:text-white transition-colors"
              >
                View All Projects <ArrowUpRight className="h-4 w-4" />
              </Link>
            </ScrollReveal>
          </div>

          {/* Horizontal scroll container */}
          <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x snap-mandatory -mx-6 px-6 sm:-mx-10 sm:px-10 md:-mx-16 md:px-16 lg:-mx-24 lg:px-24">
            {STUDIO_PROJECTS.map((proj, i) => (
              <ScrollReveal
                key={proj.slug}
                direction="bottom"
                delay={Math.min(i * 100, 500)}
                distance={40}
                className="flex-shrink-0 w-[85vw] sm:w-[460px] md:w-[520px] snap-start"
              >
                <div className="group h-full rounded-3xl border border-[#f5efff]/[0.06] bg-[#0b0a13] p-8 sm:p-10 flex flex-col justify-between transition-all duration-500 hover:border-[#f5efff]/[0.15]">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#f5efff]/[0.06] pb-4 mb-8">
                      <span className="font-mono text-xs text-[#f5efff]/35 tracking-widest uppercase">
                        {proj.code} // {proj.date}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400/80 bg-emerald-950/40 border border-emerald-800/25 px-2.5 py-0.5 rounded-full uppercase">
                        {proj.classification}
                      </span>
                    </div>

                    <h3 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-light text-[#f5efff] group-hover:text-white transition-colors leading-tight">
                      {proj.title}
                    </h3>
                    <p className="font-mono text-[10px] sm:text-xs text-[#f5efff]/35 mt-2 uppercase tracking-wider">
                      {proj.subtitle}
                    </p>
                    <p className="font-sans text-sm text-[#f5efff]/45 mt-5 line-clamp-3 leading-[1.7]">
                      {proj.summary}
                    </p>
                  </div>

                  <div className="mt-10 pt-6 border-t border-[#f5efff]/[0.06]">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {proj.techTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[#f5efff]/[0.06] bg-[#f5efff]/[0.03] px-2.5 py-1 font-mono text-[10px] text-[#f5efff]/45"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/work/${proj.slug}`}
                      data-cursor="View"
                      className="inline-flex items-center justify-between w-full font-mono text-xs uppercase tracking-wider text-[#f5efff]/50 group-hover:text-white transition-colors"
                    >
                      <span>View Blueprint</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          8. RECOGNITION & BENCHMARKS
      ═════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 py-28 md:py-44 border-t border-[#f5efff]/[0.05] bg-[#060609]">
        <div className="max-w-[1400px] mx-auto">
          {/* Heading + Big Counter */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center mb-20 sm:mb-28">
            <div className="lg:col-span-7 space-y-5">
              <ScrollReveal direction="left">
                <Eyebrow label="// DEFENSE AUDIT & RECOGNITION" tag="active" />
              </ScrollReveal>
              <ScrollReveal direction="left" delay={200}>
                <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#f5efff] leading-[1.05]">
                  Verified by national defense standards.
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="fade" delay={350}>
                <p className="text-sm sm:text-base text-[#f5efff]/40 max-w-xl leading-[1.7]">
                  Every model, queue buffer, and cryptographic hash chain
                  benchmarked under simulated combat and adversary flood
                  conditions.
                </p>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-5">
              <ScrollReveal direction="right" delay={300}>
                <div className="rounded-3xl border border-[#f5efff]/[0.08] bg-[#0b0a13] p-10 sm:p-14 text-center">
                  <div className="font-mono text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-[#f5efff]">
                    <CountUp end={STUDIO_AWARDS.totalCount} padZero={3} />
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#f5efff]/40 mt-3 block">
                    {STUDIO_AWARDS.label}
                  </span>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Award platform cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
            {STUDIO_AWARDS.platforms.map((plat, i) => (
              <ScrollReveal key={plat.platform} direction="bottom" delay={i * 120}>
                <div className="rounded-2xl border border-[#f5efff]/[0.05] bg-[#09090f] p-7 sm:p-8 space-y-3 h-full">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5efff]/30 block">
                    {plat.platform}
                  </span>
                  <h4 className="font-editorial text-lg sm:text-xl font-light text-[#f5efff]">
                    {plat.accolade}
                  </h4>
                  <div className="font-mono text-xs text-emerald-400/80 font-semibold">
                    {plat.score}
                  </div>
                  <p className="text-xs text-[#f5efff]/35 leading-[1.6]">
                    {plat.detail}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <StudioFooter />
    </div>
  );
}
