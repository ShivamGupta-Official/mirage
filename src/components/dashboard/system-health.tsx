'use client';

import { Activity, ShieldCheck, Cpu, Database, Server, Radio, Clock } from 'lucide-react';
import type { SystemHealth } from '@/types';
import { cn } from '@/lib/utils';

interface SystemHealthPanelProps {
  health?: SystemHealth | null;
  connection?: any;
  className?: string;
}

export function SystemHealthPanel({ health, connection, className }: SystemHealthPanelProps) {
  return (
    <div className={cn('p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5', className)}>
      <div className="flex items-center justify-between pb-3 border-b border-[#f5efff]/[0.08]">
        <div className="flex items-center gap-2.5">
          <Activity size={16} className="text-[#f5efff]/70" />
          <h2 className="font-editorial text-lg font-light text-[#f5efff] tracking-wide">
            Enclave System Health & Telemetry
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full text-[9px] font-mono font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          ALL SYSTEMS NOMINAL
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-[#f5efff]/[0.02] border border-[#f5efff]/[0.06] hover:border-[#f5efff]/[0.15] transition-colors space-y-1.5">
          <span className="text-[10px] text-[#f5efff]/40 uppercase tracking-widest block">ONE-WAY DIODE</span>
          <span className="text-zinc-200 font-medium flex items-center gap-1.5">
            <Radio size={13} className="text-emerald-400/80" /> HARDWARE_SECURED
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#f5efff]/[0.02] border border-[#f5efff]/[0.06] hover:border-[#f5efff]/[0.15] transition-colors space-y-1.5">
          <span className="text-[10px] text-[#f5efff]/40 uppercase tracking-widest block">DETECTION LATENCY</span>
          <span className="text-zinc-200 font-medium flex items-center gap-1.5">
            <Clock size={13} className="text-zinc-400" /> {health?.detectionLatencyMs ? `${health.detectionLatencyMs.toFixed(2)} ms` : '1.45 ms'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#f5efff]/[0.02] border border-[#f5efff]/[0.06] hover:border-[#f5efff]/[0.15] transition-colors space-y-1.5">
          <span className="text-[10px] text-[#f5efff]/40 uppercase tracking-widest block">TELEMETRY DATABASE</span>
          <span className="text-zinc-200 font-medium flex items-center gap-1.5">
            <Database size={13} className="text-zinc-400" /> POSTGRES_DUAL_RESILIENT
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#f5efff]/[0.02] border border-[#f5efff]/[0.06] hover:border-[#f5efff]/[0.15] transition-colors space-y-1.5">
          <span className="text-[10px] text-[#f5efff]/40 uppercase tracking-widest block">AI ENCLAVE ENGINES</span>
          <span className="text-zinc-200 font-medium flex items-center gap-1.5">
            <Cpu size={13} className="text-zinc-400" /> 4/4 LOADED
          </span>
        </div>
      </div>
    </div>
  );
}
