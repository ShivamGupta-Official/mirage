'use client';

import { useState } from 'react';
import { Shield, Activity, Lock, Cpu, Database, Eye, Terminal, Zap, CheckCircle2, Layers } from 'lucide-react';
import { STUDIO_SERVICES } from '@/lib/studio-data';
import { ScrollReveal } from '@/components/studio/scroll-reveal';
import { cn } from '@/lib/utils';

// Enriched metadata for each service tier
const TIER_METADATA: Record<string, { status: string; metric: string; statusColor: string }> = {
  '(001)': { status: 'ENFORCED', metric: '0.00 ns Refl.', statusColor: '#4ade80' },
  '(002)': { status: 'VERIFIED', metric: 'Hardware Pass', statusColor: '#4ade80' },
  '(003)': { status: 'ACTIVE', metric: '78 Features', statusColor: '#3b9eff' },
  '(004)': { status: 'LEARNING', metric: '4.5σ Dynamic', statusColor: '#fbbf24' },
  '(005)': { status: 'DEPLOYED', metric: '100 Trees', statusColor: '#3b9eff' },
  '(006)': { status: 'EVALUATING', metric: 'λ=0.96 Decay', statusColor: '#f97316' },
  '(007)': { status: 'STREAMING', metric: 'D3 Force Graph', statusColor: '#a855f7' },
  '(008)': { status: 'SEALED', metric: 'SHA-256 Chain', statusColor: '#4ade80' },
  '(009)': { status: 'SCANNING', metric: 'Entropy H(X)', statusColor: '#f43f5e' },
  '(010)': { status: 'PROTECTED', metric: 'Stateless L4', statusColor: '#4ade80' },
  '(011)': { status: 'STREAMING', metric: '1.45 ms Async', statusColor: '#3b9eff' },
  '(012)': { status: 'READY', metric: 'Lab Subnet Only', statusColor: '#4ade80' },
};

const CATEGORIES = [
  'ALL',
  'PHYSICAL & HARDWARE',
  'STREAMING & ML',
  'GRAPH & RISK',
  'AUDIT & COVERT DEFENSE',
];

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#f5efff]/[0.08]">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400 block mb-2">
            // FULL-SPECTRUM DEFENSE ARCHITECTURE
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#f5efff] leading-[1.05]">
            Full-spectrum <span className="italic">defense</span> modules.
          </h2>
          <p className="text-sm sm:text-base text-[#f5efff]/50 max-w-2xl leading-[1.7] mt-3">
            Twelve specialized engineering tiers for monitoring, analyzing, and sealing high-rate optical network streams with zero physical return channel.
          </p>
        </div>

        {/* Real-time Enclave Status Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10 font-mono text-xs text-white/70 whitespace-nowrap">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>12 / 12 TIERS DEPLOYED</span>
          <span className="text-white/20">|</span>
          <span className="text-cyan-300 font-bold">0.00 ns RETURN PATH</span>
        </div>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap border',
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.05]'
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

      {/* ── Balanced 3-Column Responsive Grid (Fills 100% of Space) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredServices.map((srv, idx) => {
          const meta = TIER_METADATA[srv.num] || {
            status: 'ACTIVE',
            metric: 'Enforced',
            statusColor: '#4ade80',
          };

          return (
            <ScrollReveal
              key={srv.num}
              direction="bottom"
              delay={Math.min(idx * 40, 300)}
              distance={25}
            >
              <div className="group h-full rounded-2xl border border-[#f5efff]/[0.08] bg-[#0b0a14]/90 p-6 sm:p-7 flex flex-col justify-between transition-all duration-400 hover:border-cyan-500/40 hover:bg-[#0f0e1c] hover:shadow-xl hover:shadow-cyan-500/5">
                <div>
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[10px] sm:text-xs text-[#f5efff]/40 tracking-[0.15em] uppercase">
                      {srv.num} // {srv.category}
                    </span>
                    <span
                      className="font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase"
                      style={{
                        color: meta.statusColor,
                        borderColor: `${meta.statusColor}40`,
                        background: `${meta.statusColor}15`,
                      }}
                    >
                      {meta.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-editorial text-xl sm:text-2xl font-light text-[#f5efff] group-hover:text-white transition-colors leading-snug mb-3">
                    {srv.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-xs sm:text-sm text-[#f5efff]/50 leading-[1.7]">
                    {srv.desc}
                  </p>
                </div>

                {/* Card footer with operational metric */}
                <div className="mt-5 pt-4 border-t border-[#f5efff]/[0.06] flex items-center justify-between font-mono text-[11px] text-white/40">
                  <span className="flex items-center gap-1.5 text-[#f5efff]/60">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: meta.statusColor }}
                    />
                    Hardware Diode Tier
                  </span>
                  <span className="text-cyan-300 font-semibold">{meta.metric}</span>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
export default DefenseModulesGrid;
