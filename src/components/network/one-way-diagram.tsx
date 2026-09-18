'use client';

import { Shield, Lock, Radio, ArrowRight, Eye, Cpu, Database, Activity } from 'lucide-react';

interface OneWayNetworkDiagramProps {
  packetsPerSec?: number;
  hosts?: any[];
  isActive?: boolean;
}

export function OneWayNetworkDiagram({ packetsPerSec, hosts, isActive = true }: OneWayNetworkDiagramProps = {}) {
  return (
    <div className="p-6 rounded-3xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f5efff]/[0.08]">
        <div>
          <h2 className="font-editorial text-xl sm:text-2xl font-light text-[#f5efff] tracking-wide flex items-center gap-2.5">
            <Radio size={16} className="text-[#f5efff]/70" />
            Unidirectional Optical Diode Network Architecture
          </h2>
          <p className="text-xs text-[#f5efff]/50 mt-1 max-w-2xl font-sans leading-relaxed">
            Hardware-enforced isolation. Physical optical diode guarantees zero reverse transmission into the monitored enclave.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          AIR-GAPPED RX ENFORCED
        </span>
      </div>

      {/* Visual Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center py-2 text-xs font-mono">
        {/* Left Enclave: Monitored Network */}
        <div className="md:col-span-4 p-4 rounded-2xl bg-[#f5efff]/[0.02] border border-[#f5efff]/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[#f5efff]/40 text-[10px] uppercase font-bold tracking-widest">
              MONITORED NETWORK (TX ONLY)
            </span>
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8] animate-pulse" />
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.05]">
              <span className="text-[#f5efff] font-medium">auth-dc01 (10.0.0.10)</span>
              <span className="text-[#f5efff]/40 font-mono text-[10px]">Server</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.05]">
              <span className="text-[#f5efff] font-medium">eng-workstation (10.0.0.21)</span>
              <span className="text-[#f5efff]/40 font-mono text-[10px]">Client</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-rose-300 font-medium">threat-node (10.0.0.50)</span>
              <span className="text-rose-400/60 font-mono text-[10px]">Untrusted</span>
            </div>
          </div>
          <div className="text-[10px] text-[#f5efff]/40 pt-1 font-sans">
            Standard IP stack outputting packet mirrors to optical tap.
          </div>
        </div>

        {/* Center: Hardware Data Diode */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.12] text-center space-y-2.5 shadow-xl">
          <div className="w-11 h-11 rounded-full bg-[#f5efff]/5 border border-[#f5efff]/20 flex items-center justify-center text-[#f5efff] shadow-[0_0_20px_rgba(245,239,255,0.1)]">
            <Shield size={20} />
          </div>

          <div className="font-mono font-bold text-[#f5efff] text-xs tracking-wider">DATA DIODE</div>
          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
            <ArrowRight size={12} className="animate-pulse" /> ONE-WAY PHOTONS
          </div>

          <div className="w-full p-2 rounded-xl bg-[#08080c]/80 border border-[#f5efff]/[0.06] text-[9px] text-[#f5efff]/50 space-y-1 font-mono">
            <div className="text-emerald-400 font-semibold">Rx Fiber: CONNECTED</div>
            <div className="text-rose-400 font-semibold">Tx Fiber: CUT (NO ACKs)</div>
          </div>
        </div>

        {/* Right Enclave: MIRAGE Monitoring Enclave */}
        <div className="md:col-span-4 p-4 rounded-2xl bg-[#f5efff]/[0.02] border border-[#f5efff]/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[#f5efff]/40 text-[10px] uppercase font-bold tracking-widest">
              MIRAGE ENCLAVE (PASSIVE RX)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.05] text-[#f5efff]/80">
              <span className="flex items-center gap-2">
                <Eye size={12} className="text-[#f5efff]/60" /> Passive Ingress Tap
              </span>
              <span className="text-emerald-400 font-bold">0 Drop</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.05] text-[#f5efff]/80">
              <span className="flex items-center gap-2">
                <Activity size={12} className="text-purple-400" /> Multi-Engine Detection
              </span>
              <span className="text-purple-300 font-bold">Active</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.05] text-[#f5efff]/80">
              <span className="flex items-center gap-2">
                <Database size={12} className="text-amber-400" /> PostgreSQL & Audit Chain
              </span>
              <span className="text-emerald-400 font-bold">Online</span>
            </div>
          </div>
          <div className="text-[10px] text-[#f5efff]/40 pt-1 font-sans">
            Isolated processing: zero return path physically prevents outbound packet transmission.
          </div>
        </div>
      </div>
    </div>
  );
}
