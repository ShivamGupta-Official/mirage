'use client';

import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttackVolumeCardProps {
  totalEvents?: number;
  className?: string;
}

export function AttackVolumeCard({ totalEvents = 983421, className }: AttackVolumeCardProps) {
  // Sparkline bar data (simulated 24-hour volume distribution)
  const bars = [
    32, 45, 28, 52, 38, 65, 44, 71, 55, 80, 62, 48,
    90, 72, 58, 85, 95, 68, 42, 55, 75, 60, 50, 35,
  ];
  const maxBar = Math.max(...bars);

  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f5efff]/[0.08] mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-[#f5efff]/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f5efff]/50 font-medium">
            Attack Volume Trend
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#f5efff]/40">
          24H
        </span>
      </div>

      {/* Big number */}
      <div className="mb-3">
        <span className="font-editorial text-3xl font-light text-[#f5efff] tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {totalEvents.toLocaleString()}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f5efff]/40 ml-2">
          Events
        </span>
      </div>

      {/* Sparkline bars */}
      <div className="flex items-end gap-[3px] flex-1 min-h-[48px]">
        {bars.map((val, i) => {
          const h = (val / maxBar) * 100;
          const isHigh = val > maxBar * 0.8;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all duration-300"
              style={{
                height: `${h}%`,
                background: isHigh
                  ? 'linear-gradient(to top, #a29bfe, #f97316)'
                  : 'rgba(162,155,254,0.35)',
                minHeight: '4px',
              }}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#f5efff]/[0.05] flex items-center justify-between text-[10px] font-mono text-[#f5efff]/40 mt-3">
        <span>INGRESS VOLUME</span>
        <span className="text-emerald-400">↑ 12.4% vs 7d avg</span>
      </div>
    </div>
  );
}
