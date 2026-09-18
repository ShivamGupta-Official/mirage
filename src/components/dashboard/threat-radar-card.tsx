'use client';

import { Radar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreatRadarCardProps {
  activeSources?: number;
  className?: string;
}

export function ThreatRadarCard({ activeSources = 983, className }: ThreatRadarCardProps) {
  const maxSources = 1500;
  const pct = Math.min(activeSources / maxSources, 1);
  const radius = 58;
  const circumference = Math.PI * radius; // half-circle
  const strokeDash = pct * circumference;

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
          <Radar size={14} className="text-[#f5efff]/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f5efff]/50 font-medium">
            Global Threat Radar
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185] animate-pulse" />
          <span className="font-mono text-[9px] text-rose-400 font-semibold tracking-wider">
            {activeSources > 0 ? `${activeSources} ACTIVE` : 'CLEAR'}
          </span>
        </div>
      </div>

      {/* Radial Gauge */}
      <div className="flex items-center justify-center flex-1">
        <div className="relative">
          <svg width="140" height="80" viewBox="0 0 140 80" className="overflow-visible">
            {/* Background arc */}
            <path
              d="M 10 75 A 58 58 0 0 1 130 75"
              fill="none"
              stroke="rgba(245,239,255,0.06)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Filled arc */}
            <path
              d="M 10 75 A 58 58 0 0 1 130 75"
              fill="none"
              stroke="url(#radarGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a29bfe" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center number */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className="font-editorial text-3xl font-light text-[#f5efff] tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {activeSources.toLocaleString()}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#f5efff]/40 mt-0.5">
              threat sources
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#f5efff]/[0.05] flex items-center justify-between text-[10px] font-mono text-[#f5efff]/40 mt-auto">
        <span>GEOSPATIAL TRIANGULATION</span>
        <span className="text-[#a29bfe]">ML CORRELATED</span>
      </div>
    </div>
  );
}
