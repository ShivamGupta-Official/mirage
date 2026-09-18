'use client';

import { useState, useEffect } from 'react';
import {
  Layers,
  Database,
  Shield,
  Activity,
  Cpu,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  Info,
  Terminal,
  Zap,
  Filter,
  Flame,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineData {
  isolation: {
    status: string;
    subnet: string;
    dns_sinkhole: string;
    mode: string;
    physical_adapters_egress_blocked: string[];
    socket_safety: string;
  };
  dataset_summary: {
    total_flows: number;
    total_features: number;
    sources_count: number;
    sources: Array<{ id: string; name: string; type: string; flows: number; role: string }>;
    class_matrix: Array<{
      class: string;
      synthetic_lab: number;
      cicids2017: number;
      trustlab: number;
      cira_doh: number;
      palau_dns: number;
      unsw_nb15: number;
      lanl_enterprise: number;
      ugr16_backbone: number;
      total: number;
    }>;
    imbalance_audit: {
      majority_class: string;
      majority_count: number;
      threshold_5pct: number;
      flagged_minority_classes: string[];
      strategy_applied: string;
      balanced_train_size: number;
    };
  };
  generalization_gap: {
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
  };
  models: Array<{
    id: string;
    name: string;
    type: string;
    file: string;
    size_mb: number;
    features: number;
    random_split_f1: number;
    cross_source_f1: number;
    status: string;
  }>;
  feature_categories: Array<{
    name: string;
    count: number;
    examples: string[];
  }>;
}

export function PipelineView() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matrix' | 'features' | 'imbalance'>('matrix');

  useEffect(() => {
    fetch('/api/nids/pipeline')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load pipeline stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center p-12 text-white/50 text-sm font-mono animate-pulse">
        <Activity className="animate-spin mr-2" size={16} />
        Loading NIDS ML Pipeline Telemetry...
      </div>
    );
  }

  const { isolation, dataset_summary, feature_categories } = data;

  return (
    <div className="space-y-6">
      {/* ── Top Architecture Flow (5-Part Pipeline) ── */}
      <div className="p-6 rounded-3xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f5efff]/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="eyebrow-label">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                // 5-STAGE FLOW EXTRACTION & INGESTION
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-light text-[#f5efff] tracking-wide flex items-center gap-2.5">
              <Layers className="text-[#f5efff]/70" size={20} />
              End-to-End NIDS Data Pipeline Architecture
            </h2>
            <p className="text-xs text-[#f5efff]/50 mt-1 max-w-2xl font-sans leading-relaxed">
              Complete automated telemetry pipeline from high-speed lab network taps through 78 bidirectional flow metrics and held-out cross-dataset benchmark evaluation.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5 self-start sm:self-auto">
            <Shield size={11} /> 100% ISOLATED LAB NETWORKING
          </span>
        </div>

        {/* 5-Step Pipeline Cards (Aligned Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-stretch">
          {[
            {
              step: 'PART 1',
              title: 'Lab Traffic Gen',
              desc: 'iperf3, TRex, Ostinato, hping3 floods, Slowloris, dnscat2, DGA & C2 timing jitter',
              badge: 'In-Memory PCAP',
              badgeColor: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
            },
            {
              step: 'PART 2',
              title: 'Flow Extraction',
              desc: 'NFStream / CICFlowMeter 78 bidirectional flow metrics, 0-NaN/Inf assertion',
              badge: '77 Numerical Feats',
              badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
            },
            {
              step: 'PART 3',
              title: 'Benchmark Ingestion',
              desc: '8 public benchmarks (CICIDS, TRUSTLab, CIRA-DoH, UNSW, LANL, UGR16)',
              badge: '5,834 Flows Tagged',
              badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
            },
            {
              step: 'PART 4',
              title: 'Balance & Split',
              desc: 'Flag minority classes <5%, apply SMOTE on train split only, hold out public sources',
              badge: 'Strict Source Split',
              badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
            },
            {
              step: 'PART 5',
              title: 'ML & Gap Analysis',
              desc: 'Train Random Forest & XGBoost, measure ΔF1 gap between random & held-out test',
              badge: 'Generalization Audit',
              badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-4 rounded-2xl bg-[#f5efff]/[0.02] border border-[#f5efff]/[0.06] hover:border-[#f5efff]/[0.15] transition-all flex flex-col justify-between min-h-[170px]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f5efff]/40">{item.step}</span>
                  <span className={cn('text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border', item.badgeColor)}>
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-xs font-mono font-semibold text-[#f5efff] mb-1.5">{item.title}</h4>
                <p className="text-[11px] text-[#f5efff]/50 font-sans leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sub-Tab Navigation for Deep Details (Floating Pill Bar) ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#0f0e17]/90 border border-[#f5efff]/[0.08] backdrop-blur-xl overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => setActiveTab('matrix')}
          className={cn(
            'px-4 py-2 rounded-full text-xs font-mono transition-all duration-300 flex items-center gap-2 whitespace-nowrap',
            activeTab === 'matrix'
              ? 'bg-[#f5efff] text-[#08080c] font-semibold shadow-[0_0_20px_rgba(245,239,255,0.25)]'
              : 'text-[#f5efff]/60 hover:text-[#f5efff] hover:bg-[#f5efff]/5'
          )}
        >
          <Database size={13} />
          <span>8-Source Dataset Telemetry Matrix ({dataset_summary.total_flows} flows)</span>
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={cn(
            'px-4 py-2 rounded-full text-xs font-mono transition-all duration-300 flex items-center gap-2 whitespace-nowrap',
            activeTab === 'features'
              ? 'bg-[#f5efff] text-[#08080c] font-semibold shadow-[0_0_20px_rgba(245,239,255,0.25)]'
              : 'text-[#f5efff]/60 hover:text-[#f5efff] hover:bg-[#f5efff]/5'
          )}
        >
          <Cpu size={13} />
          <span>78-Feature Canonical Schema Catalog</span>
        </button>
        <button
          onClick={() => setActiveTab('imbalance')}
          className={cn(
            'px-4 py-2 rounded-full text-xs font-mono transition-all duration-300 flex items-center gap-2 whitespace-nowrap',
            activeTab === 'imbalance'
              ? 'bg-[#f5efff] text-[#08080c] font-semibold shadow-[0_0_20px_rgba(245,239,255,0.25)]'
              : 'text-[#f5efff]/60 hover:text-[#f5efff] hover:bg-[#f5efff]/5'
          )}
        >
          <BarChart3 size={13} />
          <span>Class Imbalance & SMOTE Audit</span>
        </button>
      </div>

      {/* ── Tab 1: Dataset Telemetry Matrix ── */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-[#f5efff]/[0.08] bg-[#0f0e17]/80 backdrop-blur-xl shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#f5efff]/[0.08] bg-[#f5efff]/[0.03] text-[#f5efff]/60 font-semibold">
                  <th className="py-3 px-4 uppercase tracking-wider">Attack Class</th>
                  <th className="py-3 px-4 text-right uppercase tracking-wider">Synthetic Lab</th>
                  <th className="py-3 px-4 text-right uppercase tracking-wider">CICIDS2017</th>
                  <th className="py-3 px-4 text-right uppercase tracking-wider">TRUSTLab</th>
                  <th className="py-3 px-4 text-right uppercase tracking-wider">CIRA-DoH</th>
                  <th className="py-3 px-4 text-right uppercase tracking-wider">Palau DNS</th>
                  <th className="py-3 px-4 text-right uppercase tracking-wider">UNSW-NB15</th>
                  <th className="py-3 px-4 text-right uppercase tracking-wider">LANL</th>
                  <th className="py-3 px-4 text-right uppercase tracking-wider">UGR'16</th>
                  <th className="py-3 px-4 font-bold text-right text-emerald-400 uppercase tracking-wider">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5efff]/[0.03]">
                {dataset_summary.class_matrix.map((row) => (
                  <tr key={row.class} className="hover:bg-[#f5efff]/[0.03] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#f5efff] flex items-center gap-2.5">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          row.class === 'benign'
                            ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                            : row.class.includes('flood')
                            ? 'bg-rose-400 shadow-[0_0_6px_#f43f5e]'
                            : 'bg-amber-400'
                        )}
                      />
                      <span>{row.class}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#f5efff]/70">{row.synthetic_lab.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-[#f5efff]/70">{row.cicids2017}</td>
                    <td className="py-3 px-4 text-right text-[#f5efff]/70">{row.trustlab}</td>
                    <td className="py-3 px-4 text-right text-[#f5efff]/70">{row.cira_doh}</td>
                    <td className="py-3 px-4 text-right text-[#f5efff]/70">{row.palau_dns}</td>
                    <td className="py-3 px-4 text-right text-[#f5efff]/70">{row.unsw_nb15}</td>
                    <td className="py-3 px-4 text-right text-[#f5efff]/70">{row.lanl_enterprise}</td>
                    <td className="py-3 px-4 text-right text-[#f5efff]/70">{row.ugr16_backbone}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      {row.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl">
              <span className="text-[#f5efff]/40 font-mono text-[10px] uppercase tracking-widest block mb-1.5">DATASET TIERS</span>
              <p className="text-[#f5efff]/70 leading-relaxed font-sans text-xs">
                Direct merge (CICIDS/TRUSTLab) + PCAP re-extraction (Palau/CTU-13) + Tool Diversity (UNSW IXIA) + Real Benign (LANL/UGR16).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl">
              <span className="text-[#f5efff]/40 font-mono text-[10px] uppercase tracking-widest block mb-1.5">PROVENANCE TAGGING</span>
              <p className="text-[#f5efff]/70 leading-relaxed font-sans text-xs">
                Every flow records its <code className="text-[#f5efff] font-mono bg-[#f5efff]/10 px-1 py-0.5 rounded">source</code> tag so that public benchmarks can be held out as pure unseen test sets.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl">
              <span className="text-[#f5efff]/40 font-mono text-[10px] uppercase tracking-widest block mb-1.5">QUALITY ASSERTION</span>
              <p className="text-[#f5efff]/70 leading-relaxed font-sans text-xs">
                Flow validator verified <strong className="text-emerald-400">0 NaNs</strong> and <strong className="text-emerald-400">0 Infs</strong>, preserving 1-packet flood attacks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: 78-Feature Schema Catalog ── */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {feature_categories.map((cat) => (
              <div key={cat.name} className="p-5 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#f5efff]/[0.08]">
                  <h4 className="font-editorial text-base font-light text-[#f5efff] tracking-wide">{cat.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f5efff]/5 text-[#f5efff]/70 border border-[#f5efff]/15">
                    {cat.count} features
                  </span>
                </div>
                <ul className="space-y-1.5 text-[11px] font-mono text-[#f5efff]/60">
                  {cat.examples.map((feat) => (
                    <li key={feat} className="truncate hover:text-[#f5efff] transition-colors flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#f5efff]/30" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] text-xs text-[#f5efff]/60 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>Full canonical schema exported to <strong className="text-[#f5efff]">models/feature_schema.json</strong> (77 features + 7 target classes).</span>
          </div>
        </div>
      )}

      {/* ── Tab 3: Class Imbalance Audit ── */}
      {activeTab === 'imbalance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#f5efff]/[0.08]">
                <AlertTriangle className="text-amber-400" size={16} />
                <h4 className="font-editorial text-lg font-light text-[#f5efff]">Minority Class Detection (&lt;5% Threshold)</h4>
              </div>
              <p className="text-xs text-[#f5efff]/70 leading-relaxed font-sans">
                The majority class is <strong className="text-rose-400">{dataset_summary.imbalance_audit.majority_class}</strong> ({dataset_summary.imbalance_audit.majority_count} flows). The 5% threshold is <strong className="text-[#f5efff]">{dataset_summary.imbalance_audit.threshold_5pct} flows</strong>.
              </p>
              <div className="space-y-2 font-mono text-xs pt-1">
                {dataset_summary.imbalance_audit.flagged_minority_classes.map((cls) => (
                  <div key={cls} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <span>{cls}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20">FLAGGED MINORITY</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#f5efff]/[0.08]">
                <CheckCircle2 className="text-emerald-400" size={16} />
                <h4 className="font-editorial text-lg font-light text-[#f5efff]">Balancing Strategy & Boundary Guard</h4>
              </div>
              <p className="text-xs text-[#f5efff]/70 leading-relaxed font-sans">
                Applied <strong className="text-[#f5efff]">RandomOverSampler / SMOTE</strong> combined with balanced class weighting.
              </p>
              <ul className="space-y-2.5 text-xs text-[#f5efff]/70 font-sans pt-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong className="text-[#f5efff]">Strict Boundary Guard:</strong> Resampling is applied strictly to <code className="text-[#f5efff] bg-[#f5efff]/10 px-1 py-0.5 rounded font-mono">X_train</code>, never to <code className="text-[#f5efff] bg-[#f5efff]/10 px-1 py-0.5 rounded font-mono">X_test</code>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong className="text-[#f5efff]">Balanced Training Volume:</strong> Training split was expanded from 5,434 to <strong className="text-[#f5efff]">{dataset_summary.imbalance_audit.balanced_train_size.toLocaleString()} flows</strong>.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
