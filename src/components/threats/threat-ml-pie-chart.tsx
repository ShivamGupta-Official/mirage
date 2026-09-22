'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Layers, Sparkles, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EvidenceSlice {
  feature_name: string;
  contribution: number; // 0 to 1, e.g. 0.45
  observed_value: number;
  baseline_value: number;
  deviation: number;
  explanation: string;
}

interface ThreatMlPieChartProps {
  threatType: string;
  modelVersion?: string;
  confidence: number;
  evidence: EvidenceSlice[];
  className?: string;
}

// Sophisticated monochrome & subtle slate tonal palette (strictly zero neon)
const SLICE_PALETTE = [
  '#f5efff', // Pure soft white
  '#d4d4d8', // Zinc 300
  '#a1a1aa', // Zinc 400
  '#71717a', // Zinc 500
  '#52525b', // Zinc 600
];

// Fallback ensemble model distribution if viewing model ensemble mode
const MODEL_ENSEMBLES: Record<
  string,
  { name: string; weight: number; role: string }[]
> = {
  C2_BEACON: [
    { name: 'FFT Periodicity Engine', weight: 0.45, role: 'Autocorrelation Peak' },
    { name: 'Welford EWMA Profiler', weight: 0.35, role: 'Baseline Timing Shift' },
    { name: 'Isolation Forest 100-Tree', weight: 0.20, role: 'Zero-Day Structural' },
  ],
  SYN_FLOOD: [
    { name: 'Stateless Packet Rate EWMA', weight: 0.50, role: 'Ingress PPS Volume' },
    { name: 'SYN/ACK Ratio Tracker', weight: 0.35, role: 'Handshake Starvation' },
    { name: 'Socket Ring Buffer Invariant', weight: 0.15, role: 'Queue Boundary' },
  ],
  DNS_TUNNEL: [
    { name: 'Shannon Entropy Scanner', weight: 0.55, role: 'Base32/64 Exfiltration' },
    { name: 'Subdomain Churn Engine', weight: 0.30, role: 'DGA Frequency Ratio' },
    { name: 'Length Anomaly Quantizer', weight: 0.15, role: 'FQDN Distribution' },
  ],
};

export function ThreatMlPieChart({
  threatType,
  modelVersion = 'Hybrid_Engine_v1.0',
  confidence,
  evidence,
  className,
}: ThreatMlPieChartProps) {
  const [viewMode, setViewMode] = useState<'evidence' | 'models'>('evidence');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const ensembleData =
    MODEL_ENSEMBLES[threatType] || [
      { name: 'Isolation Forest Ensemble', weight: 0.50, role: 'Outlier Detection' },
      { name: 'Welford EWMA Moments', weight: 0.35, role: 'Variance Tracking' },
      { name: 'Heuristic Rule Gate', weight: 0.15, role: 'Boundary Verification' },
    ];

  // Slices to render based on viewMode
  const slices =
    viewMode === 'evidence' && evidence.length > 0
      ? evidence.map((item) => ({
          label: item.feature_name,
          pct: Math.round(item.contribution * 100),
          subLabel: `Obs: ${item.observed_value} · Base: ${item.baseline_value}`,
          deviation: item.deviation > 0 ? `+${item.deviation.toFixed(1)}σ` : `${item.deviation.toFixed(1)}σ`,
          explanation: item.explanation,
        }))
      : ensembleData.map((item) => ({
          label: item.name,
          pct: Math.round(item.weight * 100),
          subLabel: item.role,
          deviation: 'Nominal',
          explanation: `Ensemble classification weight: ${Math.round(item.weight * 100)}%`,
        }));

  // Normalize percentages so they sum to 100
  const total = slices.reduce((acc, s) => acc + s.pct, 0) || 100;

  // Compute SVG arc angles
  let accumulatedAngle = 0;
  const radius = 64;
  const innerRadius = 42;
  const cx = 80;
  const cy = 80;

  const arcSlices = slices.map((s, idx) => {
    const angle = (s.pct / total) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    // Convert angles to radians
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    // Outer arc points
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    // Inner arc points
    const ix1 = cx + innerRadius * Math.cos(endRad);
    const iy1 = cy + innerRadius * Math.sin(endRad);
    const ix2 = cx + innerRadius * Math.cos(startRad);
    const iy2 = cy + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    // Path string for donut slice
    const d = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    return {
      ...s,
      d,
      color: SLICE_PALETTE[idx % SLICE_PALETTE.length],
      startAngle,
      endAngle,
    };
  });

  const activeSlice = hoveredIndex !== null ? arcSlices[hoveredIndex] : null;

  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-[#0b0a13] border border-white/[0.08] space-y-4 shadow-xl shadow-black/40',
        className
      )}
    >
      {/* ── Top Header Bar & Mode Toggle ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-zinc-400" />
            <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-200 font-medium">
              ML Model Explainability & Weights
            </h4>
          </div>
          <span className="font-mono text-[10px] text-zinc-500 mt-0.5 block">
            {modelVersion} · 0.38 ms Single-Pass Inference
          </span>
        </div>

        {/* Minimalist Segmented Tabs */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[10.5px] font-mono self-start sm:self-auto">
          <button
            onClick={() => {
              setViewMode('evidence');
              setHoveredIndex(null);
            }}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all',
              viewMode === 'evidence'
                ? 'bg-white text-zinc-950 font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            )}
          >
            Feature Decomposition
          </button>
          <button
            onClick={() => {
              setViewMode('models');
              setHoveredIndex(null);
            }}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all',
              viewMode === 'models'
                ? 'bg-white text-zinc-950 font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            )}
          >
            Ensemble Weights
          </button>
        </div>
      </div>

      {/* ── Chart & Interactive Breakdown Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Donut Chart Canvas */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative py-2">
          <div className="relative w-[160px] h-[160px]">
            <svg
              viewBox="0 0 160 160"
              className="w-full h-full transform -rotate-90 overflow-visible"
            >
              {arcSlices.map((slice, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <path
                    key={i}
                    d={slice.d}
                    fill={slice.color}
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      transformOrigin: '80px 80px',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      opacity: hoveredIndex === null || isHovered ? 1 : 0.45,
                    }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Hole Readout (Dynamic on Hover) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
              <AnimatePresence mode="wait">
                {activeSlice ? (
                  <motion.div
                    key="hovered"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-0.5"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block truncate max-w-[80px]">
                      {activeSlice.label.replace('_', ' ')}
                    </span>
                    <span className="font-sans text-2xl text-white font-bold block leading-none">
                      {activeSlice.pct}%
                    </span>
                    <span className="font-mono text-[8.5px] text-zinc-500 block">
                      {activeSlice.deviation}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-0.5"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">
                      Confidence
                    </span>
                    <span className="font-sans text-2xl text-white font-bold block leading-none">
                      {(confidence * 100).toFixed(0)}%
                    </span>
                    <span className="font-mono text-[8.5px] text-zinc-500 block">
                      Ensemble
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <span className="font-mono text-[9.5px] text-zinc-500 mt-2">
            Hover slice to inspect ML contribution
          </span>
        </div>

        {/* Slices Legend & Telemetry Readouts */}
        <div className="md:col-span-7 space-y-2">
          {arcSlices.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  'p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-xs',
                  isHovered
                    ? 'bg-white/[0.06] border-white/25 shadow-md'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] font-medium text-zinc-200 block truncate">
                      {item.label}
                    </span>
                    <span className="font-mono text-[9.5px] text-zinc-500 block truncate">
                      {item.subLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.02] text-zinc-400">
                    {item.deviation}
                  </span>
                  <span className="font-mono font-medium text-white text-xs w-10 text-right">
                    {item.pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ThreatMlPieChart;
