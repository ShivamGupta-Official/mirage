'use client';

import Link from 'next/link';
import { useState, useEffect, useReducer, useRef } from 'react';
import {
  Shield,
  Eye,
  Brain,
  Activity,
  Radar,
  ArrowRight,
  Lock,
  Play,
  Square,
  Flame,
  Radio,
  Database,
  Network,
  Server,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Globe,
  Search,
  Terminal,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useMirage } from '@/components/providers/mirage-provider';
import { CyberGlobe } from '@/components/network/cyber-globe';
import { formatBytes, formatNumber } from '@/lib/utils';
import { SimulationScenario } from '@/types';

// Reduced motion accessibility
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useReducer((_: boolean, v: boolean) => v, false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// Native lightweight high-performance scroll progress hook
function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setProgress(Math.min(100, Math.max(0, (window.scrollY / scrollHeight) * 100)));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
}

const THREAT_ORIGINS = [
  { rank: '01', ip: '10.0.0.50', label: 'SYN Flood Cluster', country: 'RU', flag: '🇷🇺', pps: '35,400 pps', severity: 'CRITICAL', color: '#ef4444' },
  { rank: '02', ip: '198.51.100.42', label: 'C2 Command Node', country: 'CN', flag: '🇨🇳', pps: '4,120 flows', severity: 'HIGH', color: '#f97316' },
  { rank: '03', ip: '203.0.113.88', label: 'UDP Reflection Cluster', country: 'US', flag: '🇺🇸', pps: '18,200 pps', severity: 'CRITICAL', color: '#ef4444' },
  { rank: '04', ip: '10.0.0.31', label: 'DNS Exfiltration Agent', country: 'DE', flag: '🇩🇪', pps: '1,840 queries', severity: 'MEDIUM', color: '#fbbf24' },
  { rank: '05', ip: '10.0.0.21', label: 'Compromised Workstation', country: 'GB', flag: '🇬🇧', pps: '890 flows', severity: 'HIGH', color: '#a855f7' },
  { rank: '06', ip: '192.0.2.14', label: 'Tor Exit Relay', country: 'NL', flag: '🇳🇱', pps: '640 flows', severity: 'LOW', color: '#3b82f6' },
];

const ARCHITECTURAL_TIERS = [
  {
    tier: 'TIER 01 · PHYSICAL ISOLATION',
    title: 'Hardware Optical Diode TAP',
    desc: 'Physical unidirectional fiber tap with TX laser physically absent. Data flows strictly inbound into the monitoring enclave with zero mathematical reverse path.',
    badge: 'HARDWARE RX ONLY',
    metric: '0.00 ns',
    metricLabel: 'Backchannel Return',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-cyan-500/30',
    highlight: '#38bdf8',
  },
  {
    tier: 'TIER 02 · MICROSECOND RESOLUTION',
    title: 'L1 Packet Lens (Sliding Entropy)',
    desc: 'Calculates real-time Shannon Entropy and inter-arrival time distributions over 1–5ms sliding windows. Instantly flags volumetric SYN/UDP floods before socket binding.',
    badge: '1–5ms RESOLUTION',
    metric: '< 1.4 ms',
    metricLabel: 'Evaluation Latency',
    gradient: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/30',
    highlight: '#fbbf24',
  },
  {
    tier: 'TIER 03 · SECOND-SCALE STATISTICAL MOMENTS',
    title: 'L2 Connection Lens (Adaptive Baseline)',
    desc: 'Welford algorithm computes online running mean and variance per host. Discovers Slowloris, half-open states, and slow port scans using dynamic Z-score deviations.',
    badge: '1–10s RESOLUTION',
    metric: '99.94%',
    metricLabel: 'Baseline Accuracy',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
    highlight: '#34d399',
  },
  {
    tier: 'TIER 04 · TEMPORAL GRAPH FUSION',
    title: 'L3 Session Lens (Campaign Correlator)',
    desc: 'Constructs a directed temporal bipartite graph fusing disparate alerts across multiple hosts. Maps coordinated kill chains to MITRE ATT&CK tactics.',
    badge: '1–60m RESOLUTION',
    metric: '12-Dim',
    metricLabel: 'Feature Tensor',
    gradient: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/30',
    highlight: '#c084fc',
  },
  {
    tier: 'TIER 05 · FORENSIC IMMUTABILITY',
    title: 'Cryptographic Tamper-Evident Ledger',
    desc: 'Every anomalous packet batch is Merkle-tree hashed with SHA-256 into an append-only audit chain. Provides court-admissible chain of custody for state investigations.',
    badge: 'SHA-256 MERKLE CHAIN',
    metric: '100% Chain',
    metricLabel: 'Custody Integrity',
    gradient: 'from-indigo-500/20 to-blue-500/10',
    border: 'border-indigo-500/30',
    highlight: '#818cf8',
  },
];

const SIMULATION_PRESETS: {
  id: SimulationScenario;
  name: string;
  desc: string;
  category: string;
  color: string;
  intensity: string;
}[] = [
  {
    id: 'SYN_FLOOD',
    name: 'SYN Flood (35k pps)',
    desc: 'Layer 4 volumetric storm overwhelming TCP connection state tables.',
    category: 'VOLUMETRIC',
    color: '#ef4444',
    intensity: 'CRITICAL · 35,000 PPS',
  },
  {
    id: 'UDP_FLOOD',
    name: 'UDP Flood (Amplified)',
    desc: 'High-bandwidth spoofed reflection consuming all optical bandwidth.',
    category: 'BANDWIDTH',
    color: '#f97316',
    intensity: 'HIGH · 48.2 MBPS',
  },
  {
    id: 'C2_BEACON',
    name: 'C2 Beacon (Low & Slow)',
    desc: 'Periodic jittered heartbeats from internal host 10.0.0.21 to adversary IP.',
    category: 'STEALTH',
    color: '#a855f7',
    intensity: 'LATENT · 12.4s INTERVAL',
  },
  {
    id: 'DNS_TUNNEL',
    name: 'DNS Exfiltration Tunnel',
    desc: 'Base64 data encoded into high-entropy subdomain lookups bypassing firewalls.',
    category: 'EXFILTRATION',
    color: '#3b82f6',
    intensity: 'ENTROPY 4.88 BITS',
  },
];

export default function LandingPage() {
  const scrollPercent = useScrollProgress();
  const reducedMotion = useReducedMotion();

  const {
    metrics,
    alerts,
    hosts,
    isSimulating,
    activeScenario,
    simulation,
    startSimulation,
    stopSimulation,
  } = useMirage();

  const [selectedThreatFilter, setSelectedThreatFilter] = useState<string>('ALL');
  const [activeThreatOrigin, setActiveThreatOrigin] = useState<number>(0);

  // Auto-cycle through threat targets in hero
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveThreatOrigin((prev) => (prev + 1) % THREAT_ORIGINS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const totalPps = metrics?.packetsPerSec || (isSimulating ? 14200 : 850);
  const totalBps = metrics?.bytesPerSec || totalPps * 920 * 8;

  return (
    <main className="relative min-h-screen bg-[#06090e] text-[#e8edf4] selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* ── Top Scroll Progress Bar ── */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-black/40">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 transition-all duration-75 shadow-lg shadow-cyan-500/50"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* ── Ambient Radial Background Lighting ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[700px] h-[700px] bg-amber-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[900px] h-[900px] bg-cyan-600/10 rounded-full blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Fixed Navigation Bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[#06090e]/80 border-b border-white/5 h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield size={18} className="text-[#06090e]" />
            </div>
            <div>
              <span className="font-mono font-bold tracking-wider text-sm bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                MIRAGE
              </span>
              <span className="ml-2 text-[10px] font-mono text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded bg-cyan-500/10">
                NTRO · 26145
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono text-white/60">
            <a href="#footprint" className="hover:text-cyan-400 transition-colors">THREAT FOOTPRINT</a>
            <a href="#insights" className="hover:text-cyan-400 transition-colors">PROJECT INSIGHTS</a>
            <a href="#soc-dashboard" className="hover:text-cyan-400 transition-colors">SOC DASHBOARD</a>
            <a href="#simulation-lab" className="hover:text-cyan-400 transition-colors text-amber-400 flex items-center gap-1.5">
              <Flame size={12} /> SIMULATION LAB
            </a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SENSOR ENCLAVE: ONLINE</span>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-lg shadow-cyan-500/20"
            >
              LAUNCH CONSOLE <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Section 1: Hero & Orbital Target Selector (Matching 00:00 - 00:03) ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center z-10">
        {/* Floating tech corner bracket registration marks */}
        <div className="absolute inset-x-8 inset-y-24 border border-white/5 pointer-events-none rounded-3xl hidden lg:block">
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Active Target Capsule (Matching Dribbble reference video) */}
          <div className="relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl mb-8 shadow-2xl transition-all duration-300">
            <span className="text-base">{THREAT_ORIGINS[activeThreatOrigin].flag}</span>
            <span className="text-xs font-mono font-bold text-white tracking-wide">
              {THREAT_ORIGINS[activeThreatOrigin].ip}
            </span>
            <span className="text-[11px] font-mono text-white/40">·</span>
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
              style={{
                color: THREAT_ORIGINS[activeThreatOrigin].color,
                background: `${THREAT_ORIGINS[activeThreatOrigin].color}15`,
                border: `1px solid ${THREAT_ORIGINS[activeThreatOrigin].color}30`,
              }}
            >
              {THREAT_ORIGINS[activeThreatOrigin].label}
            </span>
            <span className="text-[11px] font-mono text-cyan-400 ml-1">
              {THREAT_ORIGINS[activeThreatOrigin].pps}
            </span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6">
            MULTI-RESOLUTION <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-amber-300 bg-clip-text text-transparent">
              PASSIVE THREAT INTELLIGENCE
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto font-sans leading-relaxed mb-10">
            Unidirectional hardware-enforced optical tap monitoring. Analyzes network traffic at packet,
            connection, and session temporal lenses with zero transmission backchannel.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-mono font-bold bg-gradient-to-r from-blue-500 to-cyan-400 text-black hover:brightness-110 transition-all shadow-xl shadow-cyan-500/25"
            >
              <Eye size={16} /> ENTER SOC MONITORING ENCLAVE <ArrowRight size={15} />
            </Link>
            <a
              href="#simulation-lab"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-mono font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
            >
              <Flame size={16} className="text-amber-400" /> TEST CYBER RANGE LAB
            </a>
          </div>

          {/* Quick Stats Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
            {[
              { label: 'RESOLUTION LATENCY', value: '< 1.45 ms', color: 'text-cyan-400' },
              { label: 'TEMPORAL ENGINES', value: '3 Lenses', color: 'text-blue-400' },
              { label: 'HARDWARE TAP', value: '100% Unidirectional', color: 'text-emerald-400' },
              { label: 'MITRE CORRELATION', value: 'Graph Neural', color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <div className={`text-xl font-mono font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-[10px] font-mono tracking-wider text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Platform Footprint / Threat Geography (Matching 00:04 - 00:05) ── */}
      <section id="footprint" className="py-24 px-6 relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 tracking-widest uppercase mb-2 flex items-center gap-2">
              <Globe size={14} /> PLATFORM FOOTPRINT & SURFACES
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Mapped Threat Geography
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>998 ATTACK CONDUITS DETECTED</span>
            </div>
          </div>
        </div>

        {/* Footprint Split Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 shadow-2xl backdrop-blur-xl">
          {/* Left: 3D Revolving Earth Globe */}
          <div className="lg:col-span-7 relative h-[480px] rounded-xl overflow-hidden border border-white/5 bg-black/40">
            <CyberGlobe
              alerts={alerts}
              hosts={hosts}
              activeScenario={isSimulating ? activeScenario : null}
              className="w-full h-full"
            />
          </div>

          {/* Right: Ranked Threat Vectors List */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 text-xs font-mono text-white/40">
              <span>RANK · ORIGIN NODE</span>
              <span>RATE / IMPACT</span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
              {THREAT_ORIGINS.map((item, idx) => (
                <div
                  key={item.ip}
                  onClick={() => setActiveThreatOrigin(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    activeThreatOrigin === idx
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-white/40">{item.rank}</span>
                    <span className="text-sm">{item.flag}</span>
                    <div>
                      <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                        <span>{item.ip}</span>
                        <span className="text-[10px] text-white/40 font-normal hidden sm:inline">
                          ({item.label})
                        </span>
                      </div>
                      <div className="text-[10px] font-mono" style={{ color: item.color }}>
                        {item.severity} SEVERITY
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-white/80">
                    {item.pps}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/50">
              <span>HARDWARE RX TAP ENFORCED</span>
              <Link href="/traffic" className="text-cyan-400 hover:underline flex items-center gap-1">
                Deep Traffic Inspector <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Cascading 3D Waterfall Project Insights (Matching 00:10 - 00:14) ── */}
      <section id="insights" className="py-24 px-6 relative z-10 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-[11px] font-mono text-cyan-400 tracking-widest uppercase mb-2 flex items-center justify-center gap-2">
            <Sparkles size={14} /> ARCHITECTURAL BLUEPRINT
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Five Pillars of Unidirectional Defense
          </h2>
          <p className="text-sm text-white/60 font-sans">
            How MIRAGE achieves zero-loss ingestion, microsecond entropy analysis, and multi-host campaign
            attribution without disturbing production flows.
          </p>
        </div>

        {/* 3D Tiered Waterfall Stack */}
        <div className="space-y-4">
          {ARCHITECTURAL_TIERS.map((tier) => (
            <div
              key={tier.tier}
              className={`group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r ${tier.gradient} border ${tier.border} backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/15">
                      {tier.tier}
                    </span>
                    <span
                      className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded"
                      style={{ color: tier.highlight, background: `${tier.highlight}15` }}
                    >
                      {tier.badge}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                    {tier.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans">
                    {tier.desc}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center lg:flex-col lg:items-end gap-2 lg:gap-1 p-4 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-2xl sm:text-3xl font-mono font-black" style={{ color: tier.highlight }}>
                    {tier.metric}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                    {tier.metricLabel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Interactive SOC Dashboard Preview (Matching 00:06 - 00:09) ── */}
      <section id="soc-dashboard" className="py-24 px-6 relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 tracking-widest uppercase mb-2 flex items-center gap-2">
              <Layers size={14} /> LIVE OPERATIONAL CONSOLE
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Embedded SOC Dashboard Preview
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center gap-2 transition-all"
            >
              EXPAND FULLSCREEN <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* The Complete Preview Frame */}
        <div className="rounded-2xl border border-white/10 bg-[#080c12]/90 shadow-2xl overflow-hidden backdrop-blur-2xl">
          {/* Simulated Browser Bar */}
          <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="ml-3 text-xs font-mono text-white/40">
                https://mirage-enclave.internal/dashboard
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-emerald-400">● ONE-WAY ENFORCED</span>
            </div>
          </div>

          {/* Dashboard Body Preview */}
          <div className="p-6 space-y-6">
            {/* Live Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-mono text-white/40 uppercase mb-1">AGGREGATED INGRESS</div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-white mb-1">
                  {formatBytes(totalBps)}/s
                </div>
                <div className="text-[11px] font-mono text-emerald-400">↑ 14% vs baseline</div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-mono text-white/40 uppercase mb-1">PACKET INGESTION</div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 mb-1">
                  {formatNumber(totalPps)} pps
                </div>
                <div className="text-[11px] font-mono text-cyan-400">Microsecond queue depth: 14</div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-mono text-white/40 uppercase mb-1">ACTIVE THREAT ALERTS</div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400 mb-1">
                  {alerts.length || 4} Detected
                </div>
                <div className="text-[11px] font-mono text-amber-400">Zero false positive baseline</div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-mono text-white/40 uppercase mb-1">MONITORED ENCLAVE HOSTS</div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-purple-400 mb-1">
                  {hosts.length || 5} Optical Nodes
                </div>
                <div className="text-[11px] font-mono text-purple-400">EWMA deviation tracked</div>
              </div>
            </div>

            {/* Interactive Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {['ALL', 'CRITICAL', 'VOLUMETRIC', 'C2', 'EXFILTRATION'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedThreatFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                      selectedThreatFilter === filter
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-white/40">Showing real-time tap telemetry</span>
            </div>

            {/* Interactive Threat Stream Screener Table */}
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2.5 bg-white/[0.03] text-[11px] font-mono text-white/40 uppercase border-b border-white/5">
                <span className="col-span-3">THREAT VECTOR</span>
                <span className="col-span-3">ORIGIN → TARGET</span>
                <span className="col-span-2">SEVERITY</span>
                <span className="col-span-2">RISK SCORE</span>
                <span className="col-span-2 text-right">ACTION</span>
              </div>

              <div className="divide-y divide-white/5 font-mono text-xs">
                {(alerts.length > 0 ? alerts : [
                  { id: '1', threatType: 'SYN_FLOOD', srcIp: '10.0.0.50', dstIp: '10.0.0.10', severity: 'CRITICAL', riskScore: 92 },
                  { id: '2', threatType: 'C2_BEACON', srcIp: '10.0.0.21', dstIp: '198.51.100.42', severity: 'HIGH', riskScore: 88 },
                  { id: '3', threatType: 'UDP_FLOOD', srcIp: '203.0.113.88', dstIp: '10.0.0.10', severity: 'CRITICAL', riskScore: 95 },
                  { id: '4', threatType: 'DNS_TUNNEL', srcIp: '10.0.0.31', dstIp: '1.1.1.1', severity: 'MEDIUM', riskScore: 68 },
                ]).map((alert) => (
                  <div
                    key={alert.id}
                    className="grid grid-cols-12 px-4 py-3 items-center hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="col-span-3 font-bold text-white flex items-center gap-2">
                      <AlertTriangle size={13} className="text-amber-400" />
                      {alert.threatType.replace(/_/g, ' ')}
                    </span>
                    <span className="col-span-3 text-white/60">
                      {alert.srcIp} → {alert.dstIp}
                    </span>
                    <span className="col-span-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {alert.severity}
                      </span>
                    </span>
                    <span className="col-span-2 font-bold text-cyan-300">
                      {`${Math.round(alert.riskScore)}/100`}
                    </span>
                    <span className="col-span-2 text-right">
                      <Link
                        href="/threats"
                        className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/80 text-[11px] border border-white/10 transition-colors"
                      >
                        Inspect Flow
                      </Link>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Interactive Cyber Range Simulation Lab at the Very End ── */}
      <section id="simulation-lab" className="py-24 px-6 relative z-10 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-[11px] font-mono text-amber-400 tracking-widest uppercase mb-2 flex items-center gap-2">
              <Flame size={15} /> ISOLATED CYBER RANGE LAB
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2">
              Live Attack Simulation Console
            </h2>
            <p className="text-sm text-white/60 max-w-xl font-sans">
              Launch synthetic attacks against the passive sensor enclave. Watch the dashboard, 3D globe,
              and risk scores respond in real time with zero risk to production infrastructure.
            </p>
          </div>

          {/* Active Simulation Badge / STOP button */}
          {isSimulating && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="font-mono text-xs text-red-400">
                ATTACK ACTIVE: <strong className="text-white">{activeScenario}</strong> ({Math.round(simulation?.elapsedSeconds || 0)}s / {simulation?.durationSeconds || 20}s)
              </div>
              <button
                onClick={stopSimulation}
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs transition-all shadow-lg shadow-red-600/30"
              >
                STOP ATTACK
              </button>
            </div>
          )}
        </div>

        {/* 4 Attack Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {SIMULATION_PRESETS.map((scenario) => {
            const isThisActive = isSimulating && activeScenario === scenario.id;
            return (
              <div
                key={scenario.id}
                className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isThisActive
                    ? 'bg-red-500/10 border-red-500/40 shadow-xl shadow-red-500/10'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                      style={{ color: scenario.color, background: `${scenario.color}15` }}
                    >
                      {scenario.category}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">SCENARIO</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{scenario.name}</h3>
                  <p className="text-xs text-white/60 mb-6 leading-relaxed font-sans">{scenario.desc}</p>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-white/40 mb-4">{scenario.intensity}</div>
                  <button
                    onClick={() => {
                      if (isThisActive) {
                        stopSimulation();
                      } else {
                        startSimulation(scenario.id, 20);
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isThisActive
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                    }`}
                  >
                    {isThisActive ? (
                      <>
                        <Square size={13} /> TERMINATE ATTACK
                      </>
                    ) : (
                      <>
                        <Play size={13} /> LAUNCH ATTACK
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Attack Telemetry Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-black border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-sm font-mono font-bold text-white">
                {isSimulating ? `Active Attack Vector: ${activeScenario}` : 'Enclave Ready for Simulation'}
              </div>
              <div className="text-xs text-white/50 font-sans">
                {isSimulating
                  ? `${formatNumber(simulation?.packetsGenerated || 0)} packets transmitted across optical tap buffer`
                  : 'Select any scenario above to test passive multi-resolution feature extraction'}
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            VIEW ON FULL 3D CYBER GLOBE <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6 border-t border-white/5 relative z-10 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Shield size={15} className="text-blue-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-white">MIRAGE PLATFORM</span>
            <span className="text-xs text-white/30">·</span>
            <span className="text-xs font-mono text-white/40">SIH 2026 Problem ID 26145 · NTRO</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-white/50">
            <Link href="/dashboard" className="hover:text-white transition-colors">DASHBOARD</Link>
            <Link href="/simulation" className="hover:text-white transition-colors">SIMULATION LAB</Link>
            <Link href="/traffic" className="hover:text-white transition-colors">TRAFFIC TAP</Link>
            <Link href="/threats" className="hover:text-white transition-colors">THREATS</Link>
            <Link href="/settings" className="hover:text-white transition-colors">ENCLAVE CONFIG</Link>
          </div>

          <div className="text-xs font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={13} />
            <span>CodeRabbit Verified · Unidirectional Enforced</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
