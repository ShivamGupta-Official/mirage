'use client';

import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  sublabel?: string;
  highlight?: 'high' | 'critical' | 'low';
  trend?: number;
  className?: string;
}

const HIGHLIGHT_STYLES: Record<string, { border: string; glow: string; text: string }> = {
  low:      { border: 'rgba(56, 189, 248, 0.3)', glow: 'rgba(56, 189, 248, 0.08)', text: '#38bdf8' },
  high:     { border: 'rgba(251, 191, 36, 0.35)', glow: 'rgba(251, 191, 36, 0.08)', text: '#fbbf24' },
  critical: { border: 'rgba(244, 63, 94, 0.4)', glow: 'rgba(244, 63, 94, 0.12)', text: '#f43f5e' },
};

export function MetricCard({
  label,
  value,
  icon,
  sublabel,
  highlight,
  trend,
  className,
}: MetricCardProps) {
  const hl = highlight ? HIGHLIGHT_STYLES[highlight] : null;

  return (
    <div
      className={cn(
        'group relative p-5 rounded-2xl transition-all duration-300 backdrop-blur-xl',
        'bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] hover:border-[#f5efff]/[0.22]',
        'hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between',
        className
      )}
      style={hl ? {
        borderColor: hl.border,
        background: `linear-gradient(135deg, rgba(15, 14, 23, 0.9), ${hl.glow})`,
      } : undefined}
      role="status"
      aria-label={`${label}: ${value}`}
    >
      {/* Top Header: Monospace Micro-Label + Icon Pill */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5efff]/50 font-medium">
          {label}
        </span>
        {icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#f5efff]/[0.04] border border-[#f5efff]/[0.08] transition-colors group-hover:border-[#f5efff]/20"
            style={{ color: hl ? hl.text : 'rgba(245, 239, 255, 0.7)' }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div
        className="font-editorial text-3xl sm:text-4xl font-light tracking-tight my-1"
        style={{
          color: hl ? hl.text : '#f5efff',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>

      {/* Sublabel / Technical Descriptor */}
      {sublabel && (
        <div className="font-mono text-[11px] text-[#f5efff]/40 flex items-center gap-1.5 mt-1">
          <span className="w-1 h-1 rounded-full bg-[#f5efff]/25" />
          <span>{sublabel}</span>
        </div>
      )}
    </div>
  );
}
