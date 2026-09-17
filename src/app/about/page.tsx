'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Shield, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import { StudioNav } from '@/components/studio/studio-nav';
import { StudioFooter } from '@/components/studio/studio-footer';
import { Eyebrow } from '@/components/studio/eyebrow';
import { CountUp } from '@/components/studio/count-up';
import { STUDIO_VALUES, STUDIO_TEAM, STUDIO_PROCESS, STUDIO_AWARDS } from '@/lib/studio-data';

export default function AboutPage() {
  const [activeProcessIdx, setActiveProcessIdx] = useState<number>(0);

  return (
    <div className="relative min-h-screen bg-[#08080c] text-[#f5efff] overflow-x-hidden selection:bg-[#f5efff] selection:text-[#08080c]">
      <StudioNav />

      {/* 1. Intro Header */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 md:px-12 border-b border-[#f5efff]/10">
        <div className="mx-auto max-w-7xl">
          <Eyebrow label="// 02 ABOUT // SOVEREIGN CYBER ARCHITECTURE" tag="active" />
          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-light tracking-tight leading-[0.98] text-[#f5efff] mt-6 max-w-6xl">
            Engineering intelligence for environments where <span className="italic underline decoration-1 decoration-[#f5efff]/40">reflection</span> is impossible.
          </h1>
          <p className="font-sans text-base sm:text-xl text-[#f5efff]/65 font-light leading-relaxed max-w-3xl mt-8">
            MIRAGE was developed for Smart India Hackathon 2026 under Problem Statement ID 26145 for the National Technical Research Organisation (NTRO). We exist to solve the fundamental physics limitation of physical optical data diodes: defending air-gapped networks when return packet transmission is zero.
          </p>
        </div>
      </section>

      {/* 2. Studio Story & Timeline with Counting Numbers */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#060609]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <Eyebrow label="// THE FOUNDATIONAL DILEMMA" tag="active" />
              <h2 className="font-editorial text-3xl sm:text-5xl font-light text-[#f5efff] leading-tight">
                When the laser is cut, the rulebook <span className="italic">burns</span>.
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#f5efff]/70 font-light leading-relaxed">
                In critical infrastructure—from defense satellite ground terminals to nuclear reactor scada systems—optical data diodes sever the transmit laser to physically prevent cyber sabotage. But legacy NIDS (Snort, Zeek, Suricata) were built for two-way handshakes.
              </p>
              <p className="font-sans text-sm sm:text-base text-[#f5efff]/70 font-light leading-relaxed">
                Across a one-way tap, return packets never come back. Sockets remain half-open indefinitely, leaking memory and crashing sensors. MIRAGE replaces stateful socket tracking with stateless statistical moments and continuous risk graphs.
              </p>
            </div>

            {/* Timeline & Stats Card */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-[#f5efff]/15 bg-[#0e0d18] p-8">
                <span className="font-mono text-xs text-[#f5efff]/40 uppercase tracking-widest block">
                  LATENCY SLA
                </span>
                <div className="font-mono text-4xl sm:text-5xl font-bold text-[#f5efff] mt-3">
                  <CountUp end={1.45} decimals={2} suffix=" ms" />
                </div>
                <p className="font-sans text-xs text-[#f5efff]/60 mt-3 leading-relaxed">
                  Sub-millisecond alert publication across optical fiber taps with zero queue build-up.
                </p>
              </div>

              <div className="rounded-3xl border border-[#f5efff]/15 bg-[#0e0d18] p-8">
                <span className="font-mono text-xs text-[#f5efff]/40 uppercase tracking-widest block">
                  ATTACK SCENARIOS
                </span>
                <div className="font-mono text-4xl sm:text-5xl font-bold text-[#f5efff] mt-3">
                  <CountUp end={74} padZero={2} suffix="+" />
                </div>
                <p className="font-sans text-xs text-[#f5efff]/60 mt-3 leading-relaxed">
                  Verified combat traffic scenarios including volumetric floods, C2 beacons, and DNS tunnels.
                </p>
              </div>

              <div className="rounded-3xl border border-[#f5efff]/15 bg-[#0e0d18] p-8">
                <span className="font-mono text-xs text-[#f5efff]/40 uppercase tracking-widest block">
                  DETECTION ACCURACY
                </span>
                <div className="font-mono text-4xl sm:text-5xl font-bold text-[#f5efff] mt-3">
                  <CountUp end={99.94} decimals={2} suffix="%" />
                </div>
                <p className="font-sans text-xs text-[#f5efff]/60 mt-3 leading-relaxed">
                  High-confidence arbitration fusing 4 multi-resolution detection lenses and EWMA baselines.
                </p>
              </div>

              <div className="rounded-3xl border border-[#f5efff]/15 bg-[#0e0d18] p-8">
                <span className="font-mono text-xs text-[#f5efff]/40 uppercase tracking-widest block">
                  PHYSICAL ENCLAVE
                </span>
                <div className="font-mono text-4xl sm:text-5xl font-bold text-emerald-400 mt-3">
                  100%
                </div>
                <p className="font-sans text-xs text-[#f5efff]/60 mt-3 leading-relaxed">
                  Sovereign air-gapped deployment with zero external internet telemetry requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Values / Principles (Three-Column Pattern) */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#08080c]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <Eyebrow label="// SOVEREIGN PRINCIPLES" tag="active" />
            <h2 className="font-editorial text-3xl sm:text-5xl font-light text-[#f5efff] mt-3">
              Guiding <span className="italic">doctrines</span> of MIRAGE.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STUDIO_VALUES.map((val) => (
              <div
                key={val.code}
                className="group rounded-2xl border border-[#f5efff]/10 bg-[#0d0c14] p-8 transition-all duration-300 hover:border-[#f5efff]/35 hover:bg-[#12111d]"
              >
                <span className="font-mono text-xs text-[#f5efff]/40 uppercase tracking-widest block mb-6">
                  PRINCIPLE // {val.code}
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-light text-[#f5efff] mb-3">
                  {val.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#f5efff]/65 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Team Grid with Hover Bio & Cursor Behavior */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#060609]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <Eyebrow label="// TEAM VOID MINDS" tag="active" />
            <h2 className="font-editorial text-3xl sm:text-5xl font-light text-[#f5efff] mt-3">
              Specialist engineering <span className="italic">cadre</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STUDIO_TEAM.map((member) => (
              <div
                key={member.role}
                data-cursor="View"
                className="group rounded-2xl border border-[#f5efff]/10 bg-[#0c0b14] p-6 sm:p-8 transition-all duration-300 hover:border-[#f5efff]/40 hover:bg-[#131221]"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-[10px] text-[#f5efff]/45 uppercase tracking-wider">
                    {member.tag}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#f5efff]/40 group-hover:bg-[#f5efff] group-hover:shadow-[0_0_8px_#f5efff] transition-all" />
                </div>
                <h3 className="font-editorial text-xl sm:text-2xl font-light text-[#f5efff] leading-snug">
                  {member.role}
                </h3>
                <p className="font-mono text-xs text-[#f5efff]/50 mt-1 uppercase">
                  {member.name}
                </p>
                <div className="mt-6 pt-4 border-t border-[#f5efff]/10">
                  <p className="font-sans text-xs text-[#f5efff]/60 leading-relaxed">
                    {member.specialization}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Process / Approach (01 Discover, 02 Profile, 03 Detect, 04 Seal) Pinned Step List */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#08080c]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <div className="sticky top-32 space-y-4">
                <Eyebrow label="// FOUR-PHASE DEFENSE LIFECYCLE" tag="active" />
                <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-light text-[#f5efff] leading-tight">
                  The engineering <span className="italic">process</span>.
                </h2>
                <p className="font-sans text-sm text-[#f5efff]/60 max-w-md pt-2">
                  From single-strand optical tap physical calibration to real-time ML arbitration and cryptographic blockchain sealing.
                </p>
                <div className="pt-4">
                  <span className="font-mono text-xs text-[#f5efff]/50 uppercase tracking-widest">
                    ACTIVE STEP: {STUDIO_PROCESS[activeProcessIdx].step} // {STUDIO_PROCESS[activeProcessIdx].phase}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {STUDIO_PROCESS.map((proc, idx) => (
                <div
                  key={proc.step}
                  onMouseEnter={() => setActiveProcessIdx(idx)}
                  className="rounded-3xl border border-[#f5efff]/10 bg-[#0c0b13] p-8 sm:p-10 transition-all duration-300 hover:border-[#f5efff]/35 hover:bg-[#12111d]"
                >
                  <div className="flex items-center justify-between border-b border-[#f5efff]/10 pb-4 mb-6">
                    <span className="font-mono text-sm font-bold text-[#f5efff]/50">
                      STEP {proc.step}
                    </span>
                    <span className="font-mono text-xs text-emerald-400 tracking-wider">
                      PHASE // {proc.phase}
                    </span>
                  </div>
                  <h3 className="font-editorial text-2xl sm:text-4xl font-light text-[#f5efff]">
                    {proc.title}
                  </h3>
                  <p className="font-sans text-sm text-[#f5efff]/65 mt-3 leading-relaxed">
                    {proc.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Recognition Section (Condensed from Home) */}
      <section className="py-20 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#060609]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#f5efff]/45 block">
              BENCHMARKED AT NATIONAL LEVEL
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-light text-[#f5efff] mt-1">
              Smart India Hackathon 2026 · NTRO Defense Mandate
            </h3>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/work"
              data-cursor="View"
              className="studio-pill-btn text-xs py-3 px-6"
            >
              Explore Project Deployments
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Closing CTA + Shared Footer */}
      <StudioFooter />
    </div>
  );
}
