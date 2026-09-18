'use client';

import { useState, useEffect } from 'react';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info,
  ShieldAlert,
  Cpu,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GapData {
  macro_random_f1: number;
  macro_cross_source_f1: number;
  macro_delta_gap: number;
  classes: Array<{
    name: string;
    random_f1: number;
    cross_f1: number;
    delta: number;
    gap: boolean;
    reason: string;
  }>;
  insight: string;
}

export function GeneralizationGapView() {
  const [gapData, setGapData] = useState<GapData | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/nids/pipeline')
      .then((res) => res.json())
      .then((data) => {
        if (data.generalization_gap) {
          setGapData(data.generalization_gap);
          if (data.generalization_gap.classes?.length > 0) {
            setSelectedClass(data.generalization_gap.classes[0].name);
          }
        }
      })
      .catch((err) => console.error('Failed to load gap data:', err));
  }, []);

  if (!gapData) {
    return (
      <div className="p-8 text-center text-white/50 text-sm font-mono">
        Loading Dual-Split Generalization Telemetry...
      </div>
    );
  }

  const selectedClassInfo = gapData.classes.find((c) => c.name === selectedClass);

  return (
    <div className="space-y-6">
      {/* ── Metric Summary Bar ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl transition-all duration-300 hover:border-[#f5efff]/20">
          <span className="eyebrow-label text-[10px] text-[#f5efff]/40 uppercase tracking-widest block mb-1">
            Random Stratified Split (80/20)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-editorial text-3xl sm:text-4xl font-light text-[#f5efff]">
              {(gapData.macro_random_f1 * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-[#a29bfe] font-mono">Macro F1</span>
          </div>
          <p className="text-xs text-[#f5efff]/50 mt-2 font-light leading-relaxed">
            Evaluated on randomly shuffled held-out flows from the same collection distributions.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl transition-all duration-300 hover:border-[#f5efff]/20">
          <span className="eyebrow-label text-[10px] text-[#f5efff]/40 uppercase tracking-widest block mb-1">
            Cross-Source Held-Out Split
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-editorial text-3xl sm:text-4xl font-light text-[#f5efff]">
              {(gapData.macro_cross_source_f1 * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-rose-400 font-mono">Macro F1</span>
          </div>
          <p className="text-xs text-[#f5efff]/50 mt-2 font-light leading-relaxed">
            Evaluated exclusively on held-out public datasets (CIRA-DoH, TRUSTLab, UNSW-NB15, LANL, UGR16).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f0e17]/80 border border-amber-500/20 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/30">
          <span className="eyebrow-label text-[10px] text-amber-300/60 uppercase tracking-widest block mb-1">
            Generalization Gap (Δ F1)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-editorial text-3xl sm:text-4xl font-light text-amber-300">
              +{gapData.macro_delta_gap.toFixed(3)}
            </span>
            <span className="text-[10px] font-mono font-medium text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              OVERFITTING DETECTED
            </span>
          </div>
          <p className="text-xs text-[#f5efff]/50 mt-2 font-light leading-relaxed">
            Difference reveals model memorization of toolchain artifacts rather than invariant threat signatures.
          </p>
        </div>
      </div>

      {/* ── Side-by-Side Dual-Split Table ── */}
      <div className="overflow-hidden rounded-2xl border border-[#f5efff]/[0.08] bg-[#0f0e17]/80 backdrop-blur-xl">
        <div className="p-4 sm:p-5 border-b border-[#f5efff]/[0.08] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#f5efff]/[0.05] border border-[#f5efff]/[0.08] flex items-center justify-center">
              <GitCompare className="text-[#f5efff]" size={15} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-[#f5efff] tracking-wide">
                Per-Class Generalization Gap Breakdown
              </h3>
              <p className="text-[11px] text-[#f5efff]/40 font-mono">
                Click any row to inspect artifact root cause and synthesis guidelines
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#f5efff]/40 uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#f5efff]/[0.08] bg-white/[0.02]">
            {gapData.classes.length} EVALUATED CLASSES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#f5efff]/[0.06] bg-[#f5efff]/[0.02] text-[#f5efff]/50">
                <th className="py-3 px-5 font-medium">Traffic Class</th>
                <th className="py-3 px-5 font-medium text-right">Random Split F1</th>
                <th className="py-3 px-5 font-medium text-right">Cross-Source F1</th>
                <th className="py-3 px-5 font-medium text-right">Delta Gap (ΔF1)</th>
                <th className="py-3 px-5 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efff]/[0.04]">
              {gapData.classes.map((item) => {
                const isSelected = selectedClass === item.name;
                return (
                  <tr
                    key={item.name}
                    onClick={() => setSelectedClass(item.name)}
                    className={cn(
                      'cursor-pointer transition-colors',
                      isSelected ? 'bg-[#f5efff]/[0.07]' : 'hover:bg-[#f5efff]/[0.03]'
                    )}
                  >
                    <td className="py-3.5 px-5 font-medium text-[#f5efff] flex items-center gap-2.5">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          item.gap ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        )}
                      />
                      {item.name}
                    </td>
                    <td className="py-3.5 px-5 text-right text-[#f5efff]/90 font-medium">
                      {item.random_f1.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-5 text-right text-[#f5efff]/70 font-medium">
                      {item.cross_f1.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-medium text-amber-300">
                      +{item.delta.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {item.gap ? (
                        <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
                          ARTIFACT GAP!
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                          GENERALIZED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Deep-Dive Explanatory Card for Selected Class ── */}
      {selectedClassInfo && (
        <div className="p-5 rounded-2xl bg-[#0f0e17]/90 border border-[#f5efff]/[0.12] backdrop-blur-xl">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-6 h-6 rounded-md bg-[#f5efff]/[0.06] border border-[#f5efff]/[0.1] flex items-center justify-center">
              <Info className="text-[#f5efff]" size={14} />
            </div>
            <h4 className="text-xs font-mono font-semibold text-[#f5efff] uppercase tracking-wider">
              Root Cause & Artifact Analysis: <span className="text-[#a29bfe] font-bold">{selectedClassInfo.name}</span>
            </h4>
          </div>
          <p className="text-xs text-[#f5efff]/70 leading-relaxed font-light mb-4">
            {selectedClassInfo.reason}
          </p>
          <div className="p-3.5 rounded-xl bg-black/40 border border-[#f5efff]/[0.06] text-[11px] font-mono text-[#f5efff]/60 flex items-center justify-between flex-wrap gap-2">
            <span>
              Recommendation: Add multi-generator augmentation (TRex + IXIA + Scapy) to synthesize varied TCP window sizes and MSS.
            </span>
            <span className="text-[#f5efff] font-mono text-[10px] px-2 py-0.5 rounded-full border border-[#f5efff]/20 bg-[#f5efff]/[0.05] whitespace-nowrap">
              PART 5 COMPLIANT
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
