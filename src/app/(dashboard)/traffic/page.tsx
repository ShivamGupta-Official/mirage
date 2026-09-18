'use client';

import { useState } from 'react';
import {
  Zap,
  Activity,
  Layers,
  Server,
  Filter,
  BarChart2,
  PieChart,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useMirage } from '@/components/providers/mirage-provider';

export default function TrafficPage() {
  const { metrics, isSimulating, activeScenario, hosts } = useMirage();
  const [resolution, setResolution] = useState<string>('5s');

  const totalPps = metrics?.packetsPerSec || (isSimulating ? 12400 : 850);

  const PROTOCOL_STATS = isSimulating && activeScenario === 'UDP_FLOOD'
    ? [
        { name: 'UDP (High Throughput Floods)', pct: 86, pps: Math.round(totalPps * 0.86), color: '#ef4444' },
        { name: 'TCP (HTTP / HTTPS / Raw)', pct: 10, pps: Math.round(totalPps * 0.10), color: '#3b82f6' },
        { name: 'DNS (Port 53 / Tunneling)', pct: 3, pps: Math.round(totalPps * 0.03), color: '#a855f7' },
        { name: 'ICMP / Other Control', pct: 1, pps: Math.round(totalPps * 0.01), color: '#10b981' },
      ]
    : isSimulating && activeScenario === 'DNS_TUNNEL'
    ? [
        { name: 'DNS (Port 53 / Tunneling)', pct: 48, pps: Math.round(totalPps * 0.48), color: '#f59e0b' },
        { name: 'TCP (HTTP / HTTPS / Raw)', pct: 42, pps: Math.round(totalPps * 0.42), color: '#3b82f6' },
        { name: 'UDP (High Throughput Floods)', pct: 8, pps: Math.round(totalPps * 0.08), color: '#f97316' },
        { name: 'ICMP / Other Control', pct: 2, pps: Math.round(totalPps * 0.02), color: '#10b981' },
      ]
    : isSimulating && (activeScenario === 'SYN_FLOOD' || activeScenario === 'SLOWLORIS')
    ? [
        { name: 'TCP (HTTP / SYN Floods)', pct: 92, pps: Math.round(totalPps * 0.92), color: '#ef4444' },
        { name: 'UDP (High Throughput Floods)', pct: 5, pps: Math.round(totalPps * 0.05), color: '#f97316' },
        { name: 'DNS (Port 53 / Tunneling)', pct: 2, pps: Math.round(totalPps * 0.02), color: '#a855f7' },
        { name: 'ICMP / Other Control', pct: 1, pps: Math.round(totalPps * 0.01), color: '#10b981' },
      ]
    : [
        { name: 'TCP (HTTP / HTTPS / Raw)', pct: 64, pps: Math.round(totalPps * 0.64), color: '#3b82f6' },
        { name: 'UDP (High Throughput Floods)', pct: 22, pps: Math.round(totalPps * 0.22), color: '#f97316' },
        { name: 'DNS (Port 53 / Tunneling)', pct: 11, pps: Math.round(totalPps * 0.11), color: '#a855f7' },
        { name: 'ICMP / Other Control', pct: 3, pps: Math.round(totalPps * 0.03), color: '#10b981' },
      ];

  const TOP_TALKERS = [
    {
      ip: '10.0.0.50',
      name: 'unknown-threat-node',
      role: 'Attacker Node',
      pps: isSimulating && (activeScenario === 'SYN_FLOOD' || activeScenario === 'UDP_FLOOD') ? totalPps : 180,
      bytes: isSimulating ? '142.8 MB' : '14.2 MB',
    },
    {
      ip: '10.0.0.21',
      name: 'ws-engineering-04',
      role: 'Internal Host',
      pps: isSimulating && activeScenario === 'C2_BEACON' ? 420 : 64,
      bytes: isSimulating && activeScenario === 'C2_BEACON' ? '28.4 MB' : '5.1 MB',
    },
    {
      ip: '10.0.0.10',
      name: 'auth-dc01.corp.internal',
      role: 'Internal Server',
      pps: 420,
      bytes: '48.8 MB',
    },
    {
      ip: '10.0.0.31',
      name: 'ws-finance-12',
      role: 'Internal Host',
      pps: isSimulating && activeScenario === 'DNS_TUNNEL' ? 620 : 18,
      bytes: isSimulating && activeScenario === 'DNS_TUNNEL' ? '18.4 MB' : '1.4 MB',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Top Studio Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl">
        <div>
          <div className="eyebrow-label mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span>FLOW SPECTROGRAM & PROTOCOL DECOMPOSITION</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-[#f5efff] tracking-tight">
            Traffic Breakdown & Resolution
          </h1>
          <p className="text-xs sm:text-sm text-[#f5efff]/50 max-w-2xl font-light leading-relaxed mt-1">
            Aggregated traffic statistics categorized by protocols, top network talkers, and multi-resolution time windows.
          </p>
        </div>

        {/* Resolution Tabs */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-[#f5efff]/40 font-mono uppercase tracking-wider">WINDOW:</span>
          <div className="p-1 rounded-full bg-white/[0.04] border border-[#f5efff]/[0.08] inline-flex items-center gap-1">
            {['1s', '5s', '30s', '60s'].map((res) => {
              const isSelected = resolution === res;
              return (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                    isSelected
                      ? 'bg-[#f5efff] text-black shadow-md'
                      : 'text-[#f5efff]/60 hover:text-[#f5efff] hover:bg-white/[0.04]'
                  }`}
                >
                  {res}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Protocol Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROTOCOL_STATS.map((proto) => (
          <div key={proto.name} className="p-5 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#f5efff]">{proto.name}</span>
              <span className="font-editorial text-2xl font-light" style={{ color: proto.color }}>
                {proto.pct}%
              </span>
            </div>

            <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${proto.pct}%`, backgroundColor: proto.color }}
              />
            </div>

            <div className="text-[11px] text-[#f5efff]/40 font-mono flex justify-between pt-1">
              <span>Rate: {proto.pps} pps</span>
              <span className="text-[#a29bfe]">Diode Rx</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Talkers Table */}
      <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#f5efff] tracking-wide">
            Observed Ingress Endpoints (Top Talkers)
          </h2>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#f5efff]/40">
            Hardware Diode Observed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#f5efff]/70">
            <thead className="text-[10px] uppercase font-mono tracking-widest text-[#f5efff]/40 border-b border-[#f5efff]/[0.08] bg-[#f5efff]/[0.02]">
              <tr>
                <th className="py-3 px-4 font-medium">Host IP</th>
                <th className="py-3 px-4 font-medium">Hostname</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Ingress Rate</th>
                <th className="py-3 px-4 font-medium">Total Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efff]/[0.04] font-mono">
              {TOP_TALKERS.map((t) => (
                <tr key={t.ip} className="hover:bg-[#f5efff]/[0.03] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[#f5efff]">{t.ip}</td>
                  <td className="py-3.5 px-4 text-[#f5efff]/60 font-light">{t.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#f5efff]/[0.05] text-[#f5efff]/70 border border-[#f5efff]/[0.08] font-mono">
                      {t.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#a29bfe] font-medium">{t.pps} pps</td>
                  <td className="py-3.5 px-4 text-[#f5efff]/70">{t.bytes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
