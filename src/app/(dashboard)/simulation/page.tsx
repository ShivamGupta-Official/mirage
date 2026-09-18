'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Play,
  Square,
  Activity,
  Shield,
  Zap,
  Server,
  Radio,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { useMirage } from '@/components/providers/mirage-provider';

interface ScenarioDef {
  id: string;
  name: string;
  category: 'Benign' | 'Flood' | 'Starvation' | 'C2 & Stealth' | 'Coordinated';
  generator: string;
  description: string;
  expectedRisk: string;
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: 'NORMAL',
    name: 'TRex / iperf3 Enterprise Baseline',
    category: 'Benign',
    generator: 'TRex & iperf3 Emulators',
    description: 'Generates high-throughput legitimate web browsing, API queries, and bulk file transfers. Confirms zero false positives on benign traffic.',
    expectedRisk: '5.0 - 15.0 (NORMAL)',
  },
  {
    id: 'SYN_FLOOD',
    name: 'hping3 SYN Flood Bursts',
    category: 'Flood',
    generator: 'hping3 Raw Socket Emulator',
    description: 'Transmits high-rate TCP SYN packets without ACK responses, targeting the authentication service. Triggers the packet-level detection engine.',
    expectedRisk: '80.0 - 95.0 (CRITICAL)',
  },
  {
    id: 'UDP_FLOOD',
    name: 'hping3 UDP Datagram Flood',
    category: 'Flood',
    generator: 'hping3 UDP Saturation Generator',
    description: 'High-frequency random UDP packet floods aimed at port exhaustion and link saturation across the optical tap.',
    expectedRisk: '80.0 - 92.0 (CRITICAL)',
  },
  {
    id: 'SLOWLORIS',
    name: 'Slowloris Connection Starvation',
    category: 'Starvation',
    generator: 'Slowloris HTTP Socket Engine',
    description: 'Opens 50+ concurrent HTTP connections and sends headers at slow 10-second intervals to tie up server threads without volume spikes.',
    expectedRisk: '70.0 - 85.0 (HIGH)',
  },
  {
    id: 'DNS_TUNNEL',
    name: 'dnscat2 / iodine DNS Tunneling',
    category: 'C2 & Stealth',
    generator: 'dnscat2 Base32 Encoded Generator',
    description: 'Encodes exfiltrated files into high-entropy DNS TXT queries with unique subdomains, evading standard stateful inspection.',
    expectedRisk: '75.0 - 88.0 (HIGH)',
  },
  {
    id: 'DGA',
    name: 'Algorithmic Domain Generation (DGA)',
    category: 'C2 & Stealth',
    generator: 'DGA Pseudo-Random Query Synthesizer',
    description: 'Simulates malware querying high-entropy algorithmic domain names to locate dynamic command-and-control rendezvous points.',
    expectedRisk: '65.0 - 80.0 (HIGH)',
  },
  {
    id: 'C2_BEACON',
    name: 'Sandboxed C2 Emulator (Beaconing)',
    category: 'C2 & Stealth',
    generator: 'C2 Periodic Beacon Synthesizer',
    description: 'Generates persistent heartbeats with realistic jitter (CV < 0.15). Evaluates FFT autocorrelation and session inter-arrival variance.',
    expectedRisk: '85.0 - 95.0 (CRITICAL)',
  },
  {
    id: 'MULTI_HOST_CAMPAIGN',
    name: 'Multi-Host APT Coordinated Campaign',
    category: 'Coordinated',
    generator: 'Distributed Multi-Agent Simulator',
    description: 'Coordinates a 3-host synchronized attack: External SYN flood distraction while compromised internal engineering host beacons to C2 and finance host tunnels data.',
    expectedRisk: '90.0 - 98.0 (CRITICAL)',
  },
];

export default function SimulationLabPage() {
  const { simulation, startSimulation, stopSimulation, isSimulating, activeScenario } = useMirage();
  const [selectedScenario, setSelectedScenario] = useState<string>('SYN_FLOOD');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [duration, setDuration] = useState<number>(60);
  const [logs, setLogs] = useState<string[]>([
    '[INIT] MIRAGE Cyber Range ready.',
    '[INFO] Hardware data diode tap connected (write-only channel to sensor enclave).',
  ]);

  const isRunning = isSimulating || Boolean(simulation?.isRunning);
  const stage = simulation?.stage || (isSimulating ? `RUNNING_${activeScenario}` : 'IDLE');

  const filteredScenarios = SCENARIOS.filter((sc) => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'FLOOD') return sc.category === 'Flood' || sc.category === 'Starvation';
    if (categoryFilter === 'STEALTH') return sc.category === 'C2 & Stealth';
    if (categoryFilter === 'COORDINATED') return sc.category === 'Coordinated';
    return true;
  });

  // Append logs when simulation changes or generates packets
  useEffect(() => {
    if (simulation?.packetsGenerated && simulation.packetsGenerated > 0) {
      const timeStr = new Date().toLocaleTimeString();
      setLogs((prev) => [
        `[${timeStr}] [TELEMETRY] Frames pushed: ${simulation.packetsGenerated.toLocaleString()} | Flows: ${simulation.flowsGenerated.toLocaleString()} | Stage: ${simulation.stage}`,
        ...prev.slice(0, 100),
      ]);
    }
  }, [simulation?.packetsGenerated, simulation?.flowsGenerated, simulation?.stage]);

  const handleStart = async () => {
    const sc = SCENARIOS.find((s) => s.id === selectedScenario);
    const timeStr = new Date().toLocaleTimeString();
    setLogs((prev) => [
      `[${timeStr}] [LAUNCH] Initiating ${sc?.name} (${sc?.generator})...`,
      `[${timeStr}] [INJECT] Emulating raw frame sequence through unidirectional diode...`,
      ...prev,
    ]);
    await startSimulation(selectedScenario as any, duration);
  };

  const handleStop = async () => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timeStr}] [ABORT] Cyber Range scenario stopped by operator.`, ...prev]);
    await stopSimulation();
  };

  return (
    <div className="space-y-6">
      {/* ── Top Studio Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl">
        <div>
          <div className="eyebrow-label mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span>CYBER RANGE & BENCHMARK SYNTHESIS</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-[#f5efff] tracking-tight">
            Simulation Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-[#f5efff]/50 max-w-2xl font-light leading-relaxed mt-1">
            Generates the exact benchmark traffic classes specified in the NTRO Problem Statement (TRex, iperf3, hping3, Slowloris, dnscat2, C2).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-medium bg-[#f5efff]/[0.06] hover:bg-[#f5efff]/[0.12] text-[#f5efff] border border-[#f5efff]/[0.15] transition-all shadow-md"
          >
            <Globe size={13} /> View on 3D Globe →
          </Link>
          <div className="p-1 rounded-full bg-white/[0.04] border border-[#f5efff]/[0.08] flex items-center gap-2 px-3 py-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-white/40'
              }`}
            />
            <span className="text-xs font-mono text-[#f5efff]">
              {isRunning ? stage : 'SYSTEM IDLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Cyber Range Philosophy Box */}
      <div className="p-5 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl text-xs text-[#f5efff]/70 leading-relaxed flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-[#f5efff]/[0.05] border border-[#f5efff]/[0.08] flex items-center justify-center text-[#f5efff] flex-shrink-0 mt-0.5">
          <Shield size={16} />
        </div>
        <div>
          <span className="font-medium text-[#f5efff] block mb-1">Defensible Architecture: Why Live Simulation?</span>
          The problem statement specifies the exact tools (iperf3, Ostinato, TRex, hping3, Slowloris, dnscat2, DGA, C2) rather than providing a static downloaded database. MIRAGE implements native emulators that generate these live frames, pushes them through the unidirectional optical diode, and extracts features into PostgreSQL/SQLite in real-time.
        </div>
      </div>

      {/* ── Scenario Selection & Category Filter Tabs ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="text-[#f5efff]" size={15} />
            <h3 className="text-sm font-medium text-[#f5efff] tracking-wide">
              Select Attack Campaign Scenario
            </h3>
          </div>

          {/* Category Tabs */}
          <div className="p-1 rounded-full bg-white/[0.04] border border-[#f5efff]/[0.08] inline-flex items-center gap-1">
            {[
              { id: 'ALL', label: 'All Scenarios' },
              { id: 'FLOOD', label: 'Volumetric Floods' },
              { id: 'STEALTH', label: 'Stealth & C2' },
              { id: 'COORDINATED', label: 'Coordinated APT' },
            ].map((tab) => {
              const isSelected = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                    isSelected
                      ? 'bg-[#f5efff] text-black shadow-md'
                      : 'text-[#f5efff]/60 hover:text-[#f5efff] hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenario Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScenarios.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => !isRunning && setSelectedScenario(sc.id)}
                className={`p-5 rounded-2xl transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#f5efff]/[0.08] border-[#f5efff]/30 ring-1 ring-[#f5efff]/20 shadow-lg shadow-black/40'
                    : 'bg-[#0f0e17]/80 border-[#f5efff]/[0.08] hover:bg-[#f5efff]/[0.03] hover:border-[#f5efff]/20'
                } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-[#f5efff]/[0.05] text-[#f5efff]/70 border border-[#f5efff]/[0.08]">
                    {sc.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#a29bfe]">
                    Risk: {sc.expectedRisk}
                  </span>
                </div>

                <div className="font-editorial text-xl font-light text-[#f5efff]">{sc.name}</div>
                <div className="text-xs text-[#a29bfe] font-mono mt-1">{sc.generator}</div>
                <div className="text-xs text-[#f5efff]/60 mt-2.5 leading-relaxed font-light">{sc.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Console & Execution Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Run Controls */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-medium text-[#f5efff] tracking-wide">Execution Parameters</h2>

          <div className="space-y-2">
            <label className="text-xs text-[#f5efff]/60 font-mono">Duration Window</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={isRunning}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#f5efff]/[0.08] text-xs font-mono text-[#f5efff] focus:outline-none focus:border-[#f5efff]/30"
            >
              <option value={30} className="bg-slate-900">30 seconds (Quick test)</option>
              <option value={60} className="bg-slate-900">60 seconds (Standard benchmark)</option>
              <option value={120} className="bg-slate-900">120 seconds (Full baseline drift)</option>
              <option value={300} className="bg-slate-900">300 seconds (5 min campaign)</option>
            </select>
          </div>

          <div className="pt-2">
            {isRunning ? (
              <button
                onClick={handleStop}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-medium transition-colors shadow-lg shadow-red-600/20"
              >
                <Square size={14} /> Stop Scenario
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#f5efff] hover:bg-white text-black text-xs font-mono font-medium transition-all shadow-lg shadow-black/40"
              >
                <Play size={14} /> Launch Selected Scenario
              </button>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-[#f5efff]/[0.06] text-[11px] text-[#f5efff]/40 space-y-1 font-mono">
            <div>TARGET DIODE: UNIDIRECTIONAL_TAP_01</div>
            <div>INGRESS ISOLATION: ENFORCED</div>
            <div>RECORD PROVENANCE: SIMULATION</div>
          </div>
        </div>

        {/* Live Terminal Log */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-[#f5efff]/50 pb-3 border-b border-[#f5efff]/[0.08]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="text-[#f5efff] font-medium">CYBER_RANGE_CONSOLE.STDOUT</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#f5efff]/40">{logs.length} events logged</span>
          </div>

          <div className="h-64 overflow-y-auto space-y-1.5 text-xs text-[#f5efff]/80 pr-2 bg-black/40 p-4 rounded-xl border border-[#f5efff]/[0.04]">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed font-mono">
                <span className="text-[#f5efff]/30 mr-2">{String(logs.length - idx).padStart(3, '0')}</span>
                <span
                  className={
                    log.includes('[LAUNCH]')
                      ? 'text-emerald-300 font-semibold'
                      : log.includes('[ABORT]')
                      ? 'text-red-400 font-semibold'
                      : 'text-[#f5efff]/70'
                  }
                >
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
