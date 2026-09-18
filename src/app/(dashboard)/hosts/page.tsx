'use client';

import { useState, useEffect } from 'react';
import {
  Server,
  Shield,
  Activity,
  AlertTriangle,
  TrendingUp,
  Cpu,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useMirage } from '@/components/providers/mirage-provider';

interface HostData {
  id: string;
  ip: string;
  hostname: string;
  host_type: string;
  is_internal: boolean;
  risk_score: number;
  risk_level: 'NORMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  components: {
    packet?: number;
    connection?: number;
    session?: number;
    ml?: number;
    baseline?: number;
    correlation?: number;
  };
  baseline: Record<string, { mean: number; stddev: number; samples: number }>;
}

const INITIAL_HOSTS: HostData[] = [
  {
    id: '10.0.0.50',
    ip: '10.0.0.50',
    hostname: 'unknown-threat-node',
    host_type: 'attacker',
    is_internal: false,
    risk_score: 91.5,
    risk_level: 'CRITICAL',
    components: { packet: 84.0, connection: 45.0, session: 10.0, ml: 30.0, baseline: 25.0, correlation: 25.0 },
    baseline: {
      packets_per_sec: { mean: 6.2, stddev: 1.8, samples: 140 },
      syn_rate: { mean: 1.2, stddev: 0.5, samples: 140 },
    },
  },
  {
    id: '10.0.0.21',
    ip: '10.0.0.21',
    hostname: 'ws-engineering-04.corp.internal',
    host_type: 'user',
    is_internal: true,
    risk_score: 88.0,
    risk_level: 'CRITICAL',
    components: { packet: 10.0, connection: 20.0, session: 85.0, ml: 25.0, baseline: 15.0, correlation: 25.0 },
    baseline: {
      packets_per_sec: { mean: 14.5, stddev: 3.2, samples: 8940 },
      inter_arrival_mean: { mean: 2.1, stddev: 1.4, samples: 8940 },
    },
  },
  {
    id: '10.0.0.31',
    ip: '10.0.0.31',
    hostname: 'ws-finance-12.corp.internal',
    host_type: 'user',
    is_internal: true,
    risk_score: 72.0,
    risk_level: 'HIGH',
    components: { packet: 15.0, connection: 10.0, session: 68.0, ml: 20.0, baseline: 18.0, correlation: 15.0 },
    baseline: {
      packets_per_sec: { mean: 8.4, stddev: 2.1, samples: 6200 },
      dns_entropy: { mean: 2.1, stddev: 0.3, samples: 6200 },
    },
  },
  {
    id: '10.0.0.10',
    ip: '10.0.0.10',
    hostname: 'auth-dc01.corp.internal',
    host_type: 'server',
    is_internal: true,
    risk_score: 18.5,
    risk_level: 'NORMAL',
    components: { packet: 12.0, connection: 8.0, session: 0.0, ml: 5.0, baseline: 4.0, correlation: 0.0 },
    baseline: {
      packets_per_sec: { mean: 82.0, stddev: 14.5, samples: 25800 },
      concurrent_connections: { mean: 45.0, stddev: 8.2, samples: 25800 },
    },
  },
  {
    id: '10.0.0.1',
    ip: '10.0.0.1',
    hostname: 'border-gateway.corp.internal',
    host_type: 'gateway',
    is_internal: true,
    risk_score: 8.0,
    risk_level: 'NORMAL',
    components: { packet: 5.0, connection: 2.0, session: 0.0, ml: 2.0, baseline: 1.0, correlation: 0.0 },
    baseline: {
      packets_per_sec: { mean: 120.0, stddev: 25.0, samples: 14200 },
    },
  },
];

export default function HostsPage() {
  const { wsState } = useMirage();
  const [hosts, setHosts] = useState<HostData[]>(INITIAL_HOSTS);
  const [selectedHost, setSelectedHost] = useState<HostData | null>(INITIAL_HOSTS[0]);
  const [search, setSearch] = useState<string>('');

  // Merge live host updates from WebSocket
  useEffect(() => {
    if (wsState.hosts && wsState.hosts.length > 0) {
      setHosts((prev) => {
        const next = [...prev];
        for (const liveHost of wsState.hosts) {
          const idx = next.findIndex((h) => h.ip === liveHost.ip);
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              risk_score: (liveHost as any).riskScore ?? (liveHost as any).risk_score ?? next[idx].risk_score,
              risk_level: (liveHost as any).riskLevel ?? (liveHost as any).risk_level ?? next[idx].risk_level,
            };
          }
        }
        return next.sort((a, b) => b.risk_score - a.risk_score);
      });
    }
  }, [wsState.hosts]);

  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredHosts = hosts.filter((h) => {
    if (filterType === 'CRITICAL' && h.risk_level !== 'CRITICAL') return false;
    if (filterType === 'INTERNAL' && !h.is_internal) return false;
    if (filterType === 'EXTERNAL' && h.is_internal) return false;

    if (!search) return true;
    const q = search.toLowerCase();
    return h.ip.toLowerCase().includes(q) || h.hostname.toLowerCase().includes(q) || h.host_type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* ── Top Studio Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl">
        <div>
          <div className="eyebrow-label mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <span>CONTINUOUS RISK PROFILING & BEHAVIORAL EWMA</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-[#f5efff] tracking-tight">
            Host Risk Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#f5efff]/50 max-w-2xl font-light leading-relaxed mt-1">
            Continuous 0-100 risk scoring with EWMA behavioral baselines. Evaluates multi-layer deviations per endpoint.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-3 text-[#f5efff]/40" />
            <input
              type="text"
              placeholder="Search IP, hostname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full bg-white/[0.03] border border-[#f5efff]/[0.08] text-xs text-[#f5efff] placeholder-[#f5efff]/30 focus:outline-none focus:border-[#f5efff]/30 transition-colors w-48 sm:w-56"
            />
          </div>

          <div className="p-1 rounded-full bg-white/[0.04] border border-[#f5efff]/[0.08] inline-flex items-center gap-1">
            {['ALL', 'CRITICAL', 'INTERNAL', 'EXTERNAL'].map((tab) => {
              const isSelected = filterType === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                    isSelected
                      ? 'bg-[#f5efff] text-black shadow-md'
                      : 'text-[#f5efff]/60 hover:text-[#f5efff] hover:bg-white/[0.04]'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Host Table + Host Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Host Table */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#f5efff] tracking-wide">
              Monitored Network Endpoints ({filteredHosts.length})
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#f5efff]/40">
              Sorted by risk descending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5efff]/70">
              <thead className="text-[10px] uppercase font-mono tracking-widest text-[#f5efff]/40 border-b border-[#f5efff]/[0.08] bg-[#f5efff]/[0.02]">
                <tr>
                  <th className="py-3 px-4 font-medium">Host IP / Name</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Risk Score</th>
                  <th className="py-3 px-4 font-medium">Risk Level</th>
                  <th className="py-3 px-4 text-right font-medium">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5efff]/[0.04] font-mono">
                {filteredHosts.map((h) => {
                  const isSelected = selectedHost?.id === h.id;
                  const levelColors = {
                    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
                    HIGH: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
                    MEDIUM: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
                    LOW: 'bg-[#f5efff]/10 text-[#f5efff]/70 border-[#f5efff]/20',
                    NORMAL: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
                  }[h.risk_level] || 'bg-white/5 text-white/50 border-white/10';

                  return (
                    <tr
                      key={h.id}
                      onClick={() => setSelectedHost(h)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#f5efff]/[0.08]' : 'hover:bg-[#f5efff]/[0.03]'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#f5efff]">{h.ip}</div>
                        <div className="text-[11px] text-[#f5efff]/40 font-light truncate max-w-[180px]">
                          {h.hostname}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-medium bg-[#f5efff]/[0.05] text-[#f5efff]/60 border border-[#f5efff]/[0.08]">
                          {h.host_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${h.risk_score}%`,
                                backgroundColor:
                                  h.risk_score >= 85
                                    ? '#f43f5e'
                                    : h.risk_score >= 70
                                    ? '#fb923c'
                                    : h.risk_score >= 40
                                    ? '#facc15'
                                    : '#34d399',
                              }}
                            />
                          </div>
                          <span className="font-medium text-[#f5efff]">
                            {h.risk_score.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${levelColors}`}>
                          {h.risk_level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="p-1 rounded-full text-[#f5efff]/40 hover:text-[#f5efff] transition-colors">
                          <ChevronRight size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Host Detail & Risk Breakdown */}
        <div className="lg:col-span-5">
          {selectedHost ? (
            <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-[#f5efff]/[0.08]">
                <div>
                  <div className="eyebrow-label text-[10px] text-[#f5efff]/40 uppercase tracking-wider">ENDPOINT PROFILE</div>
                  <h3 className="font-editorial text-2xl font-light text-[#f5efff] mt-1">{selectedHost.ip}</h3>
                  <div className="text-xs text-[#f5efff]/60 font-light mt-0.5">{selectedHost.hostname}</div>
                </div>

                <div className="text-right">
                  <div className="font-editorial text-4xl font-light text-[#f5efff]">
                    {selectedHost.risk_score.toFixed(1)}
                  </div>
                  <span className="text-[10px] font-mono text-[#f5efff]/40 uppercase tracking-wider">COMPOSITE RISK</span>
                </div>
              </div>

              {/* Risk Components Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-medium text-[#f5efff]/60 uppercase tracking-wider">
                  Risk Component Decomposition
                </div>

                <div className="space-y-2 text-xs">
                  {Object.entries(selectedHost.components).map(([key, val]) => {
                    const score = Number(val || 0);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-[#f5efff]/60 uppercase">{key} Component</span>
                          <span className="text-[#f5efff] font-medium">{score.toFixed(1)}</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#a29bfe] transition-all duration-300"
                            style={{ width: `${Math.min(100, score)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Adaptive EWMA Baseline Snapshot */}
              <div className="space-y-3 pt-4 border-t border-[#f5efff]/[0.08]">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-medium text-[#f5efff] uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={14} className="text-emerald-400" />
                    Adaptive EWMA Baseline
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    ESTABLISHED
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {Object.entries(selectedHost.baseline).map(([metric, stats]) => (
                    <div key={metric} className="p-3 rounded-xl bg-[#0f0e17] border border-[#f5efff]/[0.06] font-mono text-[11px] space-y-1">
                      <div className="flex justify-between text-[#f5efff]/80">
                        <span>{metric}</span>
                        <span className="text-[#f5efff]/40">{stats.samples} samples</span>
                      </div>
                      <div className="flex justify-between text-[#f5efff]/50 text-[10px]">
                        <span>Mean: {stats.mean}</span>
                        <span>Stddev: ±{stats.stddev}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passive Isolation Notice */}
              <div className="p-3.5 rounded-xl bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.06] text-xs text-[#f5efff]/50 leading-relaxed font-light">
                Adaptive EWMA automatically factors in time of day and natural drift. Anomaly flags occur when an endpoint deviates by more than 4 standard deviations from its established historical mean.
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-[#f5efff]/40 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] font-mono text-xs">
              Select an endpoint to inspect its risk breakdown and EWMA baseline profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
