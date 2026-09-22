'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Shield, Activity, Lock } from 'lucide-react';
import { StudioNav } from '@/components/studio/studio-nav';
import { StudioFooter } from '@/components/studio/studio-footer';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Eyebrow } from '@/components/studio/eyebrow';
import { Magnetic } from '@/components/studio/magnetic-button';
import { CountUp } from '@/components/studio/count-up';
import { ScrollReveal } from '@/components/studio/scroll-reveal';
import { ScrollGlobeHero } from '@/components/ui/scroll-globe-hero';
import { STUDIO_PROJECTS, STUDIO_SERVICES, STUDIO_AWARDS } from '@/lib/studio-data';
import { DefenseModulesGrid } from '@/components/studio/defense-modules-grid';
import { AmbientParticlesCanvas } from '@/components/studio/ambient-particles';
import { TextParticle } from '@/components/ui/text-particle';
import { ThreeDCardDeck, ThreeDCardItem } from '@/components/studio/three-d-cards';

export default function HomePage() {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#08080c] text-[#f5efff] selection:bg-[#f5efff] selection:text-[#08080c]">
      {/* ═══ INTERACTIVE INTRO LOADING SCREEN ═══ */}
      {!hasEntered && (
        <LoadingScreen
          projectName="MIRAGE"
          durationMs={5000}
          onEnter={() => setHasEntered(true)}
        />
      )}

      {/* ═══ PERSISTENT AMBIENT PARTICLES CANVAS ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-45">
        <AmbientParticlesCanvas scale={2.4} />
      </div>

      {/* ═══ NAVIGATION ═══ */}
      <StudioNav />

      {/* ═════════════════════════════════════════════════════
          1. FIRST PAGE: PROJECT HERO (MIRAGE / NTRO)
      ═════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center px-4 sm:px-10 md:px-16 lg:px-24 pt-20 sm:pt-28 pb-12 sm:pb-16 overflow-hidden z-10">
        {/* Soft ambient gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(245,239,255,0.03),transparent_55%)]" />

        <div className="relative z-10 max-w-[1400px] mx-auto w-full">
          {/* Eyebrow */}
          <ScrollReveal direction="fade" delay={200}>
            <Eyebrow label="// NTRO · PROBLEM STATEMENT 26145 · SIH 2026" tag="active" />
          </ScrollReveal>

          {/* Main title — interactive physics particle text */}
          <div className="mt-4 sm:mt-5 w-full max-w-[1280px] h-[190px] sm:h-[300px] md:h-[370px] lg:h-[420px] relative pointer-events-auto">
            <h1 className="sr-only">Multi-Resolution Passive Threat Intelligence</h1>
            <TextParticle
              lines={[
                { text: 'Multi-Resolution' },
                { text: 'Passive Threat', italic: true },
                { text: 'Intelligence' },
              ]}
              textAlign="left"
              fontSize={140}
              fontFamily='"Cormorant Garamond", Georgia, serif'
              particleSize={2.4}
              particleColor="#f5efff"
              particleDensity={3}
              lineHeightMultiplier={1.04}
              className="w-full h-full"
            />
          </div>

          {/* Description — pushed a bit more up */}
          <ScrollReveal direction="fade" delay={850} duration={800}>
            <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl text-[#f5efff]/65 font-light leading-relaxed">
              Hardware-enforced unidirectional optical tap monitoring. Extracts packet, connection, and session graph invariants with zero physical return channel.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal direction="bottom" delay={1050} duration={800}>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Magnetic strength={0.3} className="w-full sm:w-auto">
                <Link
                  href="/dashboard"
                  data-cursor="Launch"
                  className="studio-pill-btn studio-pill-btn-primary text-sm sm:text-base py-3.5 px-7 sm:px-10 w-full sm:w-auto text-center justify-center font-medium shadow-[0_4px_20px_rgba(245,239,255,0.15)] active:scale-[0.98] transition-transform"
                >
                  Enter Live SOC Console
                </Link>
              </Magnetic>
              <Magnetic strength={0.3} className="w-full sm:w-auto">
                <Link
                  href="/work"
                  data-cursor="View"
                  className="studio-pill-btn text-sm sm:text-base py-3.5 px-7 sm:px-10 w-full sm:w-auto text-center justify-center active:scale-[0.98] transition-transform"
                >
                  Explore Architectures
                </Link>
              </Magnetic>
            </div>
          </ScrollReveal>
        </div>
      </section>



      {/* ═════════════════════════════════════════════════════
          3. SECOND PAGE ONWARD: 5-SCREEN 3D EARTH SCROLL ANIMATION
      ═════════════════════════════════════════════════════ */}
      <ScrollGlobeHero
        pages={5}
        headline="Global Ingress Threat Radar"
        subhead="Real-time AI intrusion detection on physical one-way optical data diodes for national security networks."
        sections={[
          {
            eyebrow: '// MVP INSIGHT 01 · PHYSICAL DIODE ISOLATION',
            title: 'One-Way Optical Diode',
            body: 'Hardware-enforced single-strand fiber physically severs the return laser. Critical network traffic flows in for monitoring, but zero packets can ever travel back, making reverse cyberattacks physically impossible.',
          },
          {
            eyebrow: '// MVP INSIGHT 02 · REAL-TIME AI ENGINE',
            title: 'Zero-Return AI Anomaly Engine',
            body: 'Legacy firewalls crash when return packets are missing. MIRAGE’s AI analyzes unidirectional packet flows across four temporal scales to detect stealth intrusions and zero-days in milliseconds with zero false alarms.',
          },
          {
            eyebrow: '// MVP INSIGHT 03 · TAMPER-PROOF FORENSICS',
            title: 'Immutable Blockchain Ledger',
            body: 'Hackers and rogue insiders routinely wipe system logs to cover their tracks. MIRAGE seals every alert and packet artifact into a SHA-256 blockchain ledger, producing permanent, court-admissible legal evidence.',
          },
        ]}
        outroTitle="MIRAGE"
        outroDescription="Multi-resolution Intelligent Risk & Adaptive Graph Engine"
        className="z-10"
      />

      {/* ═════════════════════════════════════════════════════
          4. CORE PILLARS — Three spacious cards
      ═════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-10 md:px-16 lg:px-24 pt-12 sm:pt-20 md:pt-28 pb-8 sm:pb-12 md:pb-14">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal direction="fade">
            <Eyebrow label="// CORE ARCHITECTURAL PILLARS" tag="active" />
          </ScrollReveal>

          <ScrollReveal direction="right" delay={200}>
            <h2 className="font-editorial text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#f5efff] mt-4 sm:mt-5 mb-10 sm:mb-16 leading-[1.05]">
              Built for physical <span className="italic">asymmetry</span>.
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={300}>
            <ThreeDCardDeck>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 pt-4 pb-6">
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
                  <ThreeDCardItem
                    key={pillar.num}
                    index={i}
                    initialRotateX={-12}
                    initialRotateY={-20}
                    hoverScale={1.06}
                    className="h-full"
                  >
                    <div className="group rounded-2xl border border-[#f5efff]/[0.08] bg-[#0b0a13] p-7 sm:p-10 md:p-12 transition-all duration-500 hover:border-[#f5efff]/[0.25] hover:bg-[#0f0e1a] h-full min-h-[500px] sm:min-h-[530px] shadow-[0_12px_35px_rgba(0,0,0,0.6)] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-8 sm:mb-12">
                          <span className="font-mono text-[11px] sm:text-xs text-[#f5efff]/35 uppercase tracking-[0.2em]">
                            ({pillar.num}) {pillar.label}
                          </span>
                          <pillar.Icon className="h-5 w-5 text-[#f5efff]/30 group-hover:text-[#f5efff]/75 transition-colors duration-500" />
                        </div>

                        <h3 className="font-editorial text-xl sm:text-3xl md:text-4xl font-light text-[#f5efff] mb-3 sm:mb-5 leading-tight">
                          {pillar.title}
                        </h3>

                        <p className="font-sans text-xs sm:text-base text-[#f5efff]/50 leading-[1.65]">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  </ThreeDCardItem>
                ))}
              </div>
            </ThreeDCardDeck>
          </ScrollReveal>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          5. MISSION STATEMENT — Big centered text
      ═════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-10 md:px-16 lg:px-24 pt-8 sm:pt-12 md:pt-14 pb-16 sm:pb-24 md:pb-32 border-t border-[#f5efff]/[0.05] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,239,255,0.025),transparent_55%)]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <ScrollReveal direction="fade">
            <Eyebrow label="// SOVEREIGN DEFENSE PHILOSOPHY" tag="active" className="justify-center" />
          </ScrollReveal>

          <ScrollReveal direction="bottom" delay={200} distance={50}>
            <h2 className="font-editorial text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[#f5efff] leading-[1.15] mt-6 sm:mt-8">
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
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 py-28 md:py-36 border-t border-[#f5efff]/[0.05] bg-[#060609]/70 backdrop-blur-[2px] relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <DefenseModulesGrid />
        </div>
      </section>



      {/* ═════════════════════════════════════════════════════
          7. PROJECTS — Horizontal scroll with snap
      ═════════════════════════════════════════════════════ */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-16 py-24 md:py-36 border-t border-[#f5efff]/[0.05] overflow-hidden">
        <div className="max-w-[1560px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
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

          {/* Compressed 6-Card 3D Deck — Strictly ONE SINGLE ROW */}
          <ThreeDCardDeck perspective={1500}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 lg:gap-3 xl:gap-3.5 pt-4 pb-8 w-full">
              {STUDIO_PROJECTS.map((proj, i) => (
                <ThreeDCardItem
                  key={proj.slug}
                  index={i}
                  initialRotateX={-12}
                  initialRotateY={-18}
                  hoverScale={1.10}
                  className="w-full h-full"
                >
                  <div className="group h-full min-h-[480px] sm:min-h-[500px] md:min-h-[520px] rounded-2xl border border-[#f5efff]/[0.08] bg-[#0b0a13] p-4 sm:p-5 flex flex-col justify-between transition-all duration-500 hover:border-[#f5efff]/[0.28] hover:bg-[#0f0e1a] shadow-[0_12px_35px_rgba(0,0,0,0.6)]">
                    <div>
                      {/* Top metadata header */}
                      <div className="flex items-center justify-between border-b border-[#f5efff]/[0.07] pb-2.5 mb-3.5">
                        <span className="font-mono text-[10px] text-[#f5efff]/40 tracking-wider uppercase">
                          {proj.code}
                        </span>
                        <span className="font-mono text-[8px] uppercase tracking-widest text-[#f5efff]/50 px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.02] truncate max-w-[95px]">
                          {proj.classification.split('//')[0].trim()}
                        </span>
                      </div>

                      {/* Project title */}
                      <h3 className="font-editorial text-base sm:text-[18px] md:text-[19px] font-light text-[#f5efff] group-hover:text-white transition-colors leading-[1.25] line-clamp-2">
                        {proj.title}
                      </h3>

                      {/* Subtitle */}
                      <p className="font-mono text-[9px] text-[#f5efff]/35 mt-1 uppercase tracking-wider line-clamp-1">
                        {proj.subtitle}
                      </p>

                      {/* Compressed summary */}
                      <p className="font-sans text-[11.5px] text-[#f5efff]/45 mt-3 line-clamp-4 leading-[1.6]">
                        {proj.summary}
                      </p>
                    </div>

                    {/* Bottom section */}
                    <div className="mt-4 pt-3 border-t border-[#f5efff]/[0.07] space-y-2.5">
                      {/* 1 clean tech tag */}
                      <div className="flex items-center">
                        <span className="rounded border border-[#f5efff]/[0.08] bg-[#f5efff]/[0.02] px-2 py-0.5 font-mono text-[9px] text-[#f5efff]/45 truncate max-w-full">
                          {proj.techTags[0]}
                        </span>
                      </div>

                      {/* View Blueprint link */}
                      <Link
                        href={`/work/${proj.slug}`}
                        data-cursor="View"
                        className="inline-flex items-center justify-between w-full font-mono text-[10px] uppercase tracking-wider text-[#f5efff]/50 group-hover:text-white transition-colors pt-0.5"
                      >
                        <span>View Blueprint</span>
                        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </ThreeDCardItem>
              ))}
            </div>
          </ThreeDCardDeck>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════
          8. RECOGNITION & BENCHMARKS
      ═════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 py-28 md:py-44 border-t border-[#f5efff]/[0.05] bg-[#060609]/70 backdrop-blur-[2px] relative z-10">
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
