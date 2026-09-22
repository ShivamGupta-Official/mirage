'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cubicBezier, motion } from 'motion/react';
import { ArrowRight, Terminal } from 'lucide-react';
import { STUDIO_SERVICES } from '@/lib/studio-data';
import { ScrollReveal } from '@/components/studio/scroll-reveal';
import { cn } from '@/lib/utils';

// Soft, gentle cinematic easing curve for a smooth, floating flip animation
const softSmoothEase = cubicBezier(0.22, 1, 0.36, 1);

// Minimalist metadata for each defense tier (100% monochrome, zero neon)
const TIER_METADATA: Record<string, { status: string; metric: string }> = {
  '(001)': { status: 'ENFORCED', metric: '0.00 ns Return' },
  '(002)': { status: 'VERIFIED', metric: 'Tamper Clean' },
  '(003)': { status: 'ACTIVE', metric: '78 Indicators' },
  '(004)': { status: 'LEARNING', metric: '±4.5σ Adaptive' },
  '(005)': { status: 'DEPLOYED', metric: '100 iTrees' },
  '(006)': { status: 'EVALUATING', metric: '0–100 Scale' },
  '(007)': { status: 'STREAMING', metric: '2,500 Nodes' },
  '(008)': { status: 'SEALED', metric: 'SHA-256 Chain' },
  '(009)': { status: 'SCANNING', metric: '99.8% Leak Catch' },
  '(010)': { status: 'PROTECTED', metric: '1M pps Stateless' },
  '(011)': { status: 'STREAMING', metric: '1.45 ms Dispatch' },
  '(012)': { status: 'READY', metric: 'Isolated Lab' },
};

interface DefenseModuleDetail {
  shortTitle: string;
  subheading: string;
  simpleDesc: string;
  previewVisual: string;
  specA: { label: string; value: string };
  specB: { label: string; value: string };
  previewSummary: string;
  link: string;
  linkLabel: string;
}

// Simple, clear, human-understandable information for every module
const MODULE_DETAILS: Record<string, DefenseModuleDetail> = {
  '(001)': {
    shortTitle: 'Optical Data Diode',
    subheading: 'One-Way Hardware Tap',
    simpleDesc:
      'Physically severs the transmit laser so network data can only flow in. Reverse cyberattacks and data leaks are physically impossible.',
    previewVisual: 'TX [SEVERED ✕] ──► RX [10G INGRESS]',
    specA: { label: 'Direction', value: '100% Inbound' },
    specB: { label: 'Return Leak', value: '0.00 ns (Zero)' },
    previewSummary:
      'Hardware-enforced physics air gap: photons travel in one direction only across glass fiber.',
    link: '/dashboard',
    linkLabel: 'Inspect Optical Tap',
  },
  '(002)': {
    shortTitle: 'Transceiver Sensor Audit',
    subheading: 'Anti-Tamper Verification',
    simpleDesc:
      'Continuously monitors the physical fiber strand for reverse light reflections or physical wiretapping attempts.',
    previewVisual: 'Sensor [1000 Hz] ── Refl: 0.00 µW ── PASS',
    specA: { label: 'Poll Cycle', value: '1.0 ms Fast' },
    specB: { label: 'Physical Tamper', value: 'Zero Reflection' },
    previewSummary:
      'Calibrated photodiode array certifies no backchannel photon reflection exists.',
    link: '/dashboard',
    linkLabel: 'View Hardware Audit',
  },
  '(003)': {
    shortTitle: 'Streaming Telemetry',
    subheading: 'Live Traffic Feature Engine',
    simpleDesc:
      'Extracts 78 deep network indicators from live packet streams in real time without storing payloads or slowing the network.',
    previewVisual: 'Packets ➔ Flows ➔ Sessions (78f)',
    specA: { label: 'Rolling Window', value: '2.0s Live' },
    specB: { label: 'Compute Speed', value: '< 0.38 ms Budget' },
    previewSummary:
      'Real-time statistical feature extraction without saving sensitive user packet contents.',
    link: '/dashboard',
    linkLabel: 'Inspect 78 Features',
  },
  '(004)': {
    shortTitle: 'Behavioral Profiler',
    subheading: 'Self-Learning Host Baseline',
    simpleDesc:
      'Learns normal day-and-night workstation patterns and flags sudden abnormal surges using dynamic statistical thresholds.',
    previewVisual: 'Mean μ & Variance σ² ── Bound ±4.5σ',
    specA: { label: 'Learning Time', value: '30 Samples' },
    specB: { label: 'False Positives', value: '< 0.01% Rate' },
    previewSummary:
      'Single-pass statistical algorithm adapts naturally to normal day/night traffic curves.',
    link: '/dashboard',
    linkLabel: 'View Host Baselines',
  },
  '(005)': {
    shortTitle: 'Zero-Day AI Detector',
    subheading: 'Isolation Forest Classifier',
    simpleDesc:
      'Uses an ensemble of 100 decision trees to catch unknown, novel zero-day exploits without needing prior signature updates.',
    previewVisual: 'iForest [100 Trees] ➔ Score: 0.14 [NOMINAL]',
    specA: { label: 'Zero-Day Catch', value: '96.2% Precision' },
    specB: { label: 'AI Inference', value: '2.8 ms Speed' },
    previewSummary:
      'Structural outlier detection isolates malicious anomalies across 24 feature dimensions.',
    link: '/models',
    linkLabel: 'Open ML Classifier',
  },
  '(006)': {
    shortTitle: 'Dynamic Risk Engine',
    subheading: 'Live 0–100 Threat Index',
    simpleDesc:
      'Combines multiple threat signals into an easy 0–100 threat score that cools down automatically as attacks subside.',
    previewVisual: 'R(t) = S · e^(-0.96·t) ➔ Score: 88 [ALERT]',
    specA: { label: 'Risk Scale', value: '0 to 100 Score' },
    specB: { label: 'Alarm Line', value: 'Score ≥ 75' },
    previewSummary:
      'Instant situational awareness for operators with automated exponential cooldown decay.',
    link: '/dashboard',
    linkLabel: 'Inspect Risk Engine',
  },
  '(007)': {
    shortTitle: 'Attack Graph Visualizer',
    subheading: 'Interactive Attack Mapping',
    simpleDesc:
      'Connects compromised hosts, rogue external domains, and command servers into a live visual blast-radius map.',
    previewVisual: '[Host Node] ─── Edge ─── [C2 Server]',
    specA: { label: 'Graph Scale', value: '2,500 Nodes' },
    specB: { label: 'Physics Engine', value: 'Force-Directed' },
    previewSummary:
      'Visualizes multi-stage cyber campaigns to instantly identify root-cause entry points.',
    link: '/traffic',
    linkLabel: 'Launch Attack Graph',
  },
  '(008)': {
    shortTitle: 'Blockchain Evidence Vault',
    subheading: 'Tamper-Proof Audit Ledger',
    simpleDesc:
      'Seals every alert, packet summary, and operator action into an immutable SHA-256 chain that cannot be altered or wiped.',
    previewVisual: 'Block #8421 ➔ Merkle ➔ Block #8422',
    specA: { label: 'Seal Latency', value: '< 0.85 µs Fast' },
    specB: { label: 'Cryptographic Proof', value: 'SHA-256 Hash' },
    previewSummary:
      'Cryptographically seals forensic logs so rogue insiders or hackers cannot erase their tracks.',
    link: '/forensics',
    linkLabel: 'Verify Audit Vault',
  },
  '(009)': {
    shortTitle: 'DNS Covert Leak Shield',
    subheading: 'Shannon Entropy Scanner',
    simpleDesc:
      'Detects stolen confidential files hidden inside disguised DNS queries and random characters without breaking encryption.',
    previewVisual: 'Entropy H(X) ≥ 3.85 ➔ [DATA LEAK DETECTED]',
    specA: { label: 'Leak Catch', value: '99.8% Accuracy' },
    specB: { label: 'Decryption', value: 'None (Zero Overhead)' },
    previewSummary:
      'Shannon entropy analysis detects encoded base32/64 data hidden in outbound DNS queries.',
    link: '/threats',
    linkLabel: 'Inspect Covert Channels',
  },
  '(010)': {
    shortTitle: 'Stateless Flood Defense',
    subheading: 'SYN & Slowloris Blocker',
    simpleDesc:
      'Stops SYN flood and Slowloris starvation attacks without wasting memory or crashing kernel socket buffers.',
    previewVisual: 'SYN Cookie Active ── Memory: 0 Bytes',
    specA: { label: 'Flood Capacity', value: '1,000,000 pps' },
    specB: { label: 'Memory Buffer', value: '0 KB Overhead' },
    previewSummary:
      'Handles incomplete handshakes statelessly, preventing memory exhaustion under DDoS.',
    link: '/dashboard',
    linkLabel: 'View Stateless Defense',
  },
  '(011)': {
    shortTitle: 'Sub-Millisecond Hub',
    subheading: 'Real-Time Console Stream',
    simpleDesc:
      'Streams live threat alerts and attack coordinates to security analyst consoles in under 1.5 milliseconds.',
    previewVisual: 'Ring Buffer ➔ Async Pipe ➔ SOC (1.45 ms)',
    specA: { label: 'Alert Delay', value: '1.45 ms Speed' },
    specB: { label: 'Active Desks', value: '50+ Consoles' },
    previewSummary:
      'Ultra-low latency event pipeline keeping response teams synchronized in real time.',
    link: '/dashboard',
    linkLabel: 'Connect Live SOC Feed',
  },
  '(012)': {
    shortTitle: 'Air-Gapped Cyber Range',
    subheading: 'Adversary Simulation Lab',
    simpleDesc:
      'Simulates realistic live DDoS, Slowloris, and DNS exfiltration attacks inside an isolated lab for jury evaluation.',
    previewVisual: 'hping3 + Slowloris + dnscat2 [LAB RUN]',
    specA: { label: 'Attack Matrix', value: 'SYN, Slow, DNS' },
    specB: { label: 'External Risk', value: '0.00% Isolated' },
    previewSummary:
      'Fully contained adversarial traffic simulator demonstrating defense strength on command.',
    link: '/simulation',
    linkLabel: 'Launch Cyber Range',
  },
};

const CATEGORIES = [
  'ALL',
  'PHYSICAL & HARDWARE',
  'STREAMING & ML',
  'GRAPH & RISK',
  'AUDIT & COVERT DEFENSE',
];

interface DefenseModuleCardProps {
  service: typeof STUDIO_SERVICES[0];
  index: number;
}

function DefenseModuleFlipCard({ service: srv }: DefenseModuleCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const meta = TIER_METADATA[srv.num] || {
    status: 'ACTIVE',
    metric: 'Enforced',
  };

  const detail = MODULE_DETAILS[srv.num] || {
    shortTitle: srv.title,
    subheading: 'Defense Enclave Spec',
    simpleDesc: srv.desc,
    previewVisual: `${srv.num} [INGRESS] ── STATUS: NOMINAL`,
    specA: { label: 'Status', value: 'Active Enclave' },
    specB: { label: 'Protection', value: 'Enforced' },
    previewSummary: srv.desc,
    link: '/dashboard',
    linkLabel: 'View Enclave Telemetry',
  };

  // Gentle hover intent buffer (180ms) so fast mouse travel across cards won't trigger frantic flips
  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsFlipped(true);
    }, 180);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsFlipped(false);
  };

  // Soft, smooth, cinematic 1.15s transition
  const cardVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 1.15, ease: softSmoothEase },
    },
    back: {
      rotateY: 180,
      transition: { duration: 1.15, ease: softSmoothEase },
    },
  };

  return (
    <div
      className="relative w-full max-w-[360px] mx-auto sm:max-w-none h-[530px] sm:h-[550px] md:h-[570px] cursor-pointer select-none group"
      style={{ perspective: '1600px' }}
      onClick={() => setIsFlipped((prev) => !prev)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="w-full h-full relative"
        animate={isFlipped ? 'back' : 'front'}
        variants={cardVariants}
        whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {/* ── FRONT FACE: Taller Portrait Rectangle, Minimalist, Simple & Understandable ── */}
        <div
          className="absolute inset-0 rounded-2xl border border-white/[0.08] bg-[#0c0b12] p-7 sm:p-8 flex flex-col justify-between transition-colors duration-700 group-hover:border-white/[0.24] shadow-xl shadow-black/70"
          style={{
            transform: 'rotateY(0deg) translateZ(1px)',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Top meta & title block */}
          <div className="space-y-4">
            {/* Top metadata row: number & clean monochrome status pill */}
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3.5">
              <span className="font-mono text-[10.5px] text-white/40 tracking-[0.18em] uppercase">
                {srv.num} // {srv.category.split(' ')[0]}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/45 px-2.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.02]">
                {meta.status}
              </span>
            </div>

            {/* Clear, intuitive title */}
            <div>
              <h3 className="font-editorial text-2xl sm:text-[25px] font-light text-zinc-100 group-hover:text-white transition-colors leading-[1.25]">
                {detail.shortTitle}
              </h3>
              {/* Plain-English Purpose Subheading */}
              <div className="text-[11px] font-mono tracking-wider text-white/45 uppercase mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/35 shrink-0" />
                <span className="truncate">{detail.subheading}</span>
              </div>
            </div>

            {/* Simple, intuitive explanation that anyone can immediately understand */}
            <p className="font-sans text-[13px] text-zinc-400 leading-[1.75]">
              {detail.simpleDesc}
            </p>
          </div>

          {/* Bottom section: Highlight spec chip & flip prompt */}
          <div className="space-y-3.5 pt-4 border-t border-white/[0.06]">
            {/* Minimalist Spec Chip */}
            <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between font-mono text-[11px]">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px]">
                Specification
              </span>
              <span className="text-zinc-200 font-medium">{meta.metric}</span>
            </div>

            {/* Card footer: Tier index & Preview callout */}
            <div className="pt-2 flex items-center justify-between font-mono text-[11px]">
              <span className="text-zinc-500 text-[10.5px] tracking-wider uppercase">
                Defense Tier
              </span>
              <span className="text-white/40 group-hover:text-white/80 transition-colors flex items-center gap-1.5 text-xs">
                <span>quick preview</span>
                <span className="text-[13px]">↗</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── BACK FACE: Taller Portrait Quick Preview ── */}
        <div
          className="absolute inset-0 rounded-2xl border border-white/[0.14] bg-[#0e0d16] p-7 sm:p-8 flex flex-col justify-between shadow-2xl shadow-black/80"
          style={{
            transform: 'rotateY(180deg) translateZ(1px)',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="space-y-4">
            {/* Top header bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                {srv.num} // ARCHITECTURE PREVIEW
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="font-mono text-[10px] text-zinc-400 hover:text-white px-2.5 py-0.5 rounded border border-white/10 hover:border-white/25 bg-white/[0.02] transition-colors"
              >
                return ↺
              </button>
            </div>

            {/* Title & Subheading */}
            <div>
              <h4 className="font-editorial text-xl text-zinc-100 font-light leading-tight">
                {detail.shortTitle}
              </h4>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/45 block mt-1">
                {detail.subheading}
              </span>
            </div>

            {/* Telemetry Visual Box */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-[11.5px] text-zinc-300 tracking-tight flex items-center justify-between">
              <span className="truncate">{detail.previewVisual}</span>
              <Terminal size={13} className="text-zinc-500 shrink-0 ml-2" />
            </div>

            {/* Quick Operational Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">
                  {detail.specA.label}
                </span>
                <span className="font-mono text-xs text-zinc-200 font-medium block mt-1 truncate">
                  {detail.specA.value}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">
                  {detail.specB.label}
                </span>
                <span className="font-mono text-xs text-zinc-200 font-medium block mt-1 truncate">
                  {detail.specB.value}
                </span>
              </div>
            </div>

            {/* Concise Architectural Summary */}
            <p className="font-sans text-[12.5px] text-zinc-400 leading-relaxed">
              {detail.previewSummary}
            </p>
          </div>

          {/* Deep link button */}
          <div className="pt-2 border-t border-white/[0.08]">
            <Link
              href={detail.link}
              onClick={(e) => e.stopPropagation()}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/12 bg-white/[0.03] hover:bg-white hover:text-black transition-all duration-300 font-mono text-xs text-zinc-200 hover:text-zinc-950 font-medium group/btn"
            >
              <span>{detail.linkLabel}</span>
              <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function DefenseModulesGrid() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredServices = STUDIO_SERVICES.filter((srv) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'PHYSICAL & HARDWARE') {
      return srv.category.includes('PHYSICAL') || srv.category.includes('HARDWARE');
    }
    if (activeCategory === 'STREAMING & ML') {
      return (
        srv.category.includes('STREAMING') ||
        srv.category.includes('STATISTICAL') ||
        srv.category.includes('MACHINE LEARNING')
      );
    }
    if (activeCategory === 'GRAPH & RISK') {
      return srv.category.includes('GRAPH') || srv.category.includes('RISK');
    }
    if (activeCategory === 'AUDIT & COVERT DEFENSE') {
      return (
        srv.category.includes('IMMUTABLE') ||
        srv.category.includes('COVERT') ||
        srv.category.includes('STATELESS') ||
        srv.category.includes('REAL-TIME') ||
        srv.category.includes('SIMULATION')
      );
    }
    return true;
  });

  return (
    <div className="space-y-10">
      {/* ── Section Telemetry Header & Filters ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 block mb-2">
            // FULL-SPECTRUM DEFENSE ARCHITECTURE
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#f5efff] leading-[1.05]">
            Full-spectrum <span className="italic">defense</span> modules.
          </h2>
          <p className="text-sm sm:text-base text-white/50 max-w-2xl leading-[1.7] mt-3">
            Twelve specialized engineering tiers for monitoring, analyzing, and sealing high-rate optical network streams with zero physical return channel.
          </p>
        </div>

        {/* Real-time Enclave Status Pill (Clean minimalist monochrome border, zero neon) */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10 font-mono text-xs text-white/70 whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
          <span>12 / 12 TIERS DEPLOYED</span>
          <span className="text-white/20">|</span>
          <span className="text-white font-medium">0.00 ns RETURN PATH</span>
        </div>
      </div>

      {/* ── Category Filter Pills (Minimalist Black/White) ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap border',
                isActive
                  ? 'bg-white text-zinc-950 border-white shadow-sm'
                  : 'bg-transparent border-white/[0.08] text-white/50 hover:text-white hover:border-white/20'
              )}
            >
              {cat}
            </button>
          );
        })}
        <span className="text-xs font-mono text-white/30 ml-auto pl-4 hidden lg:inline">
          Showing {filteredServices.length} of {STUDIO_SERVICES.length} Tiers
        </span>
      </div>

      {/* ── Sleek 4-Column Vertical Rectangular Card Grid with Generous Spacing ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 xl:gap-14 pt-4">
        {filteredServices.map((srv, idx) => (
          <ScrollReveal
            key={srv.num}
            direction="bottom"
            delay={Math.min(idx * 25, 200)}
            distance={15}
          >
            <DefenseModuleFlipCard service={srv} index={idx} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

export default DefenseModulesGrid;

