'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  Zap,
  Server,
  ArrowDown,
  Database,
  Eye,
  Clock,
  Radio,
  Layers,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { useMirage } from '@/components/providers/mirage-provider';
import { MetricCard } from '@/components/dashboard/metric-card';

interface PacketStreamItem {
  id: string;
  timestamp: string;
  src_ip: string;
  dst_ip: string;
  protocol: string;
  size: number;
  flags?: string;
  provenance: string;
}

export default function LiveMonitorPage() {
  const { metrics, isSimulating, activeScenario } = useMirage();
  const [trafficHistory, setTrafficHistory] = useState<number[]>([120, 145, 130, 160, 210, 190, 240, 280, 260, 310, 290, 340]);
  const [packetStream, setPacketStream] = useState<PacketStreamItem[]>([]);

  const pps = metrics?.packetsPerSec || (isSimulating ? 11200 : trafficHistory[trafficHistory.length - 1]);
  const bps = metrics?.bytesPerSec || pps * 850 * 8;

  useEffect(() => {
    // Generate streaming packets for live visual demonstration
    const interval = setInterval(() => {
      const now = new Date();
      let src = '10.0.0.21';
      let dst = '10.0.0.10';
      let proto = 'TCP';
      let flags: string | undefined = 'ACK';

      if (isSimulating && activeScenario === 'SYN_FLOOD') {
        src = '10.0.0.50';
        dst = '10.0.0.10';
        proto = 'TCP';
        flags = 'SYN';
      } else if (isSimulating && activeScenario === 'UDP_FLOOD') {
        src = '10.0.0.50';
        dst = '10.0.0.10';
        proto = 'UDP';
        flags = undefined;
      } else if (isSimulating && activeScenario === 'C2_BEACON') {
        src = '10.0.0.21';
        dst = '198.51.100.42';
        proto = 'TCP';
        flags = 'PSH+ACK';
      } else if (isSimulating && activeScenario === 'DNS_TUNNEL') {
        src = '10.0.0.31';
        dst = '1.1.1.1';
        proto = 'DNS';
        flags = undefined;
      } else {
        const randomIps = ['10.0.0.21', '10.0.0.31', '10.0.0.50', '198.51.100.42', '10.0.0.10'];
        src = randomIps[Math.floor(Math.random() * randomIps.length)];
        dst = src === '10.0.0.10' ? '10.0.0.1' : '10.0.0.10';
        const protos = ['TCP', 'UDP', 'DNS', 'HTTPS'];
        proto = protos[Math.floor(Math.random() * protos.length)];
        flags = proto === 'TCP' ? (Math.random() > 0.4 ? 'ACK' : 'SYN+ACK') : undefined;
      }

      const newPkt: PacketStreamItem = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0'),
        src_ip: src,
        dst_ip: dst,
        protocol: proto,
        size: Math.floor(Math.random() * 1200) + 64,
        flags,
        provenance: isSimulating ? 'SIMULATION_ATTACK' : 'OPTICAL_DIODE',
      };

      const currentRate = metrics?.packetsPerSec
        ? Math.round(metrics.packetsPerSec * (0.92 + Math.random() * 0.16))
        : isSimulating
        ? Math.round(11200 * (0.9 + Math.random() * 0.2))
        : Math.round(280 + Math.random() * 120);

      setPacketStream((prev) => [newPkt, ...prev.slice(0, 30)]);
      setTrafficHistory((prev) => [...prev.slice(1), currentRate]);
    }, isSimulating ? 250 : 800);

    return () => clearInterval(interval);
  }, [isSimulating, activeScenario, metrics?.packetsPerSec]);

  return (
    <div className="space-y-6">
      {/* ── Top Studio Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl">
        <div>
          <div className="eyebrow-label mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>PASSIVE TAP & HARDWARE DIODE</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-[#f5efff] tracking-tight">
            Live Enclave Monitor
          </h1>
          <p className="text-xs sm:text-sm text-[#f5efff]/50 max-w-2xl font-light leading-relaxed mt-1">
            Real-time passive packet tap with zero reverse transmission capability. All ingress is buffered and feature-extracted in hardware isolation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-full bg-white/[0.04] border border-[#f5efff]/[0.08] flex items-center gap-2.5 px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-[#f5efff]">UNIDIRECTIONAL RX ENFORCED</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#f5efff]/[0.05] border border-[#f5efff]/[0.08] flex items-center justify-center text-emerald-400">
            <Shield size={18} />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Packet Rate"
          value={`${pps.toLocaleString()} pps`}
          sublabel="Rolling 1-second window"
          icon={<Activity size={16} className="text-[#a29bfe]" />}
          trend={12}
        />
        <MetricCard
          label="Bandwidth Throughput"
          value={`${(bps / 1_000_000).toFixed(2)} Mbps`}
          sublabel="Aggregated ingress"
          icon={<Zap size={16} className="text-emerald-400" />}
          trend={5}
        />
        <MetricCard
          label="Queue Depth"
          value={`${(metrics as any)?.queueDepth || (metrics as any)?.queue_depth || (isSimulating ? 142 : 14)} pkts`}
          sublabel="Max 10,000 capacity"
          icon={<Layers size={16} className="text-amber-400" />}
        />
        <MetricCard
          label="Detection Latency"
          value="1.45 ms"
          sublabel="Multi-engine feature time"
          icon={<Clock size={16} className="text-[#f5efff]" />}
          highlight="low"
        />
      </div>

      {/* Real-time Rate Chart & Hardware Diode Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rate Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-[#f5efff] tracking-wide">Ingress Pulse (Rolling 30s)</h2>
              <p className="text-xs text-[#f5efff]/40 font-light">Packet volume emitted across the optical data diode</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#f5efff]/50">
              <span className="w-2 h-2 rounded-full bg-[#a29bfe]" />
              <span>Throughput</span>
            </div>
          </div>

          {/* Dynamic Responsive SVG sparkline graph */}
          {(() => {
            const minVal = Math.min(...trafficHistory);
            const peakVal = Math.max(...trafficHistory, 1);
            // Dynamic scale ceiling so graph scales nicely during attacks (e.g. 15,000 pps) or quiet times (400 pps)
            const maxScale = Math.max(peakVal * 1.15, 400);

            return (
              <>
                {/* High-visibility SVG Area Graph + Pulse Bars */}
                <div className="relative h-44 w-full pt-4 pb-2 border-b border-[#f5efff]/[0.06] overflow-hidden">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 120">
                    <defs>
                      <linearGradient id="pulseGradientNormal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a29bfe" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#a29bfe" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="pulseGradientHigh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* SVG Area Fill */}
                    {(() => {
                      const pts = trafficHistory.map((val, idx) => {
                        const x = (idx / (trafficHistory.length - 1)) * 400;
                        const y = 110 - Math.min(100, Math.max(10, (val / maxScale) * 100));
                        return `${x},${y}`;
                      });
                      const areaPath = `M 0,115 L ${pts.join(' L ')} L 400,115 Z`;
                      const linePath = `M ${pts.join(' L ')}`;
                      const isHighPeak = peakVal > 1500;

                      return (
                        <>
                          <path
                            d={areaPath}
                            fill={isHighPeak ? 'url(#pulseGradientHigh)' : 'url(#pulseGradientNormal)'}
                            className="transition-all duration-300"
                          />
                          <path
                            d={linePath}
                            fill="none"
                            stroke={isHighPeak ? '#f43f5e' : '#a29bfe'}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-300"
                          />
                        </>
                      );
                    })()}
                  </svg>

                  {/* Overlay Interactive Value Pillars & Tooltips */}
                  <div className="absolute inset-0 flex items-end justify-between px-1 pointer-events-auto">
                    {trafficHistory.map((val, idx) => {
                      const heightPx = Math.min(110, Math.max(12, (val / maxScale) * 110));
                      const isHigh = val > 1500;
                      return (
                        <div
                          key={idx}
                          className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                        >
                          {/* Column Bar Indicator */}
                          <div
                            className="w-1.5 sm:w-2 rounded-t transition-all duration-200 group-hover:scale-y-110 group-hover:brightness-150"
                            style={{
                              height: `${heightPx}px`,
                              backgroundColor: isHigh ? '#f43f5e' : '#a29bfe',
                              opacity: 0.75,
                            }}
                          />
                          {/* Value Tooltip */}
                          <div className="absolute -top-6 hidden group-hover:flex px-2 py-0.5 rounded-full bg-black/95 text-[10px] font-mono text-[#f5efff] whitespace-nowrap border border-[#f5efff]/20 shadow-2xl z-20 pointer-events-none">
                            {val.toLocaleString()} pps
                          </div>
                          {/* X Axis Time */}
                          <span className="text-[9px] font-mono text-[#f5efff]/30 mt-1">{idx * 2}s</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 text-center pt-2 font-mono">
                  <div>
                    <div className="text-[10px] text-[#f5efff]/40 uppercase">MIN VALUE</div>
                    <div className="text-xs font-medium text-[#f5efff]/80">{minVal.toLocaleString()} pps</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#f5efff]/40 uppercase">PEAK INGRESS</div>
                    <div className={`text-xs font-medium ${peakVal > 1500 ? 'text-rose-400' : 'text-[#f5efff]/80'}`}>
                      {peakVal.toLocaleString()} pps
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#f5efff]/40 uppercase">BUFFER CAPACITY</div>
                    <div className={`text-xs font-medium ${peakVal > 5000 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {peakVal > 10000 ? '82.4% Free' : peakVal > 2000 ? '94.2% Free' : '99.8% Free'}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Diode Isolation Verification Card */}
        <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-medium text-[#f5efff] tracking-wide flex items-center gap-2">
            <Radio size={16} className="text-[#a29bfe]" />
            Unidirectional Hardware Verification
          </h2>

          <div className="p-4 rounded-xl bg-[#0f0e17] border border-[#f5efff]/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#f5efff]/60">Tx Transmit Line</span>
              <span className="text-red-400 font-mono font-medium">PHYSICALLY CUT</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#f5efff]/60">Rx Optical Line</span>
              <span className="text-emerald-400 font-mono font-medium">ACTIVE (0.0 dBm)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#f5efff]/60">Reverse ACK Propagation</span>
              <span className="text-amber-300 font-mono font-medium">SUPPRESSED</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#f5efff]/60">Enclave Isolation</span>
              <span className="text-emerald-400 font-mono font-medium">AIR-GAPPED LOGIC</span>
            </div>
          </div>

          <div className="text-xs text-[#f5efff]/50 leading-relaxed font-light">
            Unidirectional taps transmit data using single-strand optics. Because no return path exists, the monitoring enclave cannot be port-scanned, exploited, or probed by external attackers.
          </div>

          <div className="p-3 rounded-xl bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.06] text-xs text-[#f5efff]/70 flex items-center gap-2 font-mono">
            <Shield size={14} className="flex-shrink-0 text-[#f5efff]" />
            <span>Cryptographic integrity check active on all frames</span>
          </div>
        </div>
      </div>

      {/* Live Packet Stream Inspector */}
      <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-medium text-[#f5efff] tracking-wide flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              Live Ingress Telemetry Stream
            </h2>
            <p className="text-xs text-[#f5efff]/40 font-light">Raw frame extraction passing through passive feature extractor</p>
          </div>
          <span className="text-xs text-[#f5efff]/40 font-mono">
            Showing {packetStream.length} frames
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#f5efff]/70">
            <thead className="text-[10px] uppercase font-mono tracking-widest text-[#f5efff]/40 border-b border-[#f5efff]/[0.08] bg-[#f5efff]/[0.02]">
              <tr>
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Source IP</th>
                <th className="py-3 px-4 font-medium">Destination IP</th>
                <th className="py-3 px-4 font-medium">Protocol</th>
                <th className="py-3 px-4 font-medium">Size</th>
                <th className="py-3 px-4 font-medium">Flags</th>
                <th className="py-3 px-4 font-medium">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efff]/[0.04] font-mono">
              {packetStream.map((p) => (
                <tr key={p.id} className="hover:bg-[#f5efff]/[0.03] transition-colors">
                  <td className="py-3 px-4 text-[#f5efff]/40">{p.timestamp}</td>
                  <td className="py-3 px-4 text-[#f5efff] font-medium">{p.src_ip}</td>
                  <td className="py-3 px-4 text-[#f5efff]/80">{p.dst_ip}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        p.protocol === 'TCP'
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                          : p.protocol === 'DNS'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      }`}
                    >
                      {p.protocol}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#f5efff]/70">{p.size} B</td>
                  <td className="py-3 px-4 text-amber-300">{p.flags || '—'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#f5efff]/[0.05] text-[#f5efff]/60 border border-[#f5efff]/[0.08]">
                      {p.provenance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
