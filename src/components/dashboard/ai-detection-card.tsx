'use client';

import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiDetectionCardProps {
  highRisk?: number;
  mediumRisk?: number;
  lowRisk?: number;
  monitoring?: number;
  confidence?: number;
  className?: string;
}

export function AiDetectionCard({
  highRisk = 12,
  mediumRisk = 47,
  lowRisk = 156,
  monitoring = 768,
  confidence = 96.8,
  className,
}: AiDetectionCardProps) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f5efff]/[0.08]">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-[#f5efff]/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f5efff]/50 font-medium">
            AI Threat Detection
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#f5efff]/40">
          DUAL-MODEL
        </span>
      </div>

      {/* 2x2 Risk Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <RiskCell label="High Risk" count={highRisk} color="#ef4444" bgColor="rgba(239,68,68,0.06)" borderColor="rgba(239,68,68,0.18)" />
        <RiskCell label="Medium" count={mediumRisk} color="#f97316" bgColor="rgba(249,115,22,0.06)" borderColor="rgba(249,115,22,0.18)" />
        <RiskCell label="Low Risk" count={lowRisk} color="#a29bfe" bgColor="rgba(162,155,254,0.06)" borderColor="rgba(162,155,254,0.18)" />
        <RiskCell label="Monitoring" count={monitoring} color="#10b981" bgColor="rgba(16,185,129,0.06)" borderColor="rgba(16,185,129,0.18)" />
      </div>

      {/* Invariant Confidence Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#f5efff]/50">
            AI Invariant Confidence
          </span>
          <span
            className="font-editorial text-lg font-light tracking-tight"
            style={{ color: confidence >= 95 ? '#10b981' : confidence >= 85 ? '#f59e0b' : '#ef4444', fontVariantNumeric: 'tabular-nums' }}
          >
            {confidence}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#f5efff]/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${confidence}%`,
              background: confidence >= 95
                ? 'linear-gradient(90deg, #64748b, #10b981)'
                : confidence >= 85
                ? 'linear-gradient(90deg, #64748b, #f59e0b)'
                : 'linear-gradient(90deg, #64748b, #ef4444)',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#f5efff]/[0.05] flex items-center justify-between text-[10px] font-mono text-[#f5efff]/40">
        <span>RF(100) + XGBOOST</span>
        <span className="text-zinc-400">MACRO F1: 96.15%</span>
      </div>
    </div>
  );
}

function RiskCell({
  label,
  count,
  color,
  bgColor,
  borderColor,
}: {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div
      className="p-3 rounded-xl border flex flex-col gap-1 transition-colors"
      style={{ background: bgColor, borderColor }}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: `${color}cc` }}>
        {label}
      </span>
      <span
        className="font-editorial text-xl font-light tracking-tight"
        style={{ color, fontVariantNumeric: 'tabular-nums' }}
      >
        {count.toLocaleString()}
      </span>
    </div>
  );
}
