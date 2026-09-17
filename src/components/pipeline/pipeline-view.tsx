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
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Layers className="text-cyan-400" size={18} />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              End-to-End NIDS Data Pipeline Architecture
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
            <Shield size={11} /> 100% ISOLATED LAB NETWORKING
          </span>
        </div>

        {/* 5-Step Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              step: 'PART 1',
              title: 'Lab Traffic Gen',
              desc: 'iperf3, TRex, Ostinato, hping3 floods, Slowloris, dnscat2, DGA & C2 timing jitter',
              badge: 'In-Memory PCAP',
              badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
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
          ].map((item, idx) => (
            <div
              key={item.step}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-white/40">{item.step}</span>
                  <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border', item.badgeColor)}>
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-[11px] text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sub-Tab Navigation for Deep Details ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5',
            activeTab === 'matrix'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          <Database size={13} /> 8-Source Dataset Telemetry Matrix ({dataset_summary.total_flows} flows)
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5',
            activeTab === 'features'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          <Cpu size={13} /> 78-Feature Canonical Schema Catalog
        </button>
        <button
          onClick={() => setActiveTab('imbalance')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5',
            activeTab === 'imbalance'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          <BarChart3 size={13} /> Class Imbalance & SMOTE Audit
        </button>
      </div>

      {/* ── Tab 1: Dataset Telemetry Matrix ── */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04] text-white/60">
                  <th className="py-2.5 px-3 font-semibold">Attack Class</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Synthetic Lab</th>
                  <th className="py-2.5 px-3 font-semibold text-right">CICIDS2017</th>
                  <th className="py-2.5 px-3 font-semibold text-right">TRUSTLab</th>
                  <th className="py-2.5 px-3 font-semibold text-right">CIRA-DoH</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Palau DNS</th>
                  <th className="py-2.5 px-3 font-semibold text-right">UNSW-NB15</th>
                  <th className="py-2.5 px-3 font-semibold text-right">LANL</th>
                  <th className="py-2.5 px-3 font-semibold text-right">UGR'16</th>
                  <th className="py-2.5 px-3 font-bold text-right text-cyan-400">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {dataset_summary.class_matrix.map((row) => (
                  <tr key={row.class} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          row.class === 'benign'
                            ? 'bg-emerald-400'
                            : row.class.includes('flood')
                            ? 'bg-rose-400'
                            : 'bg-amber-400'
                        )}
                      />
                      {row.class}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white/70">{row.synthetic_lab.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-white/70">{row.cicids2017}</td>
                    <td className="py-2.5 px-3 text-right text-white/70">{row.trustlab}</td>
                    <td className="py-2.5 px-3 text-right text-white/70">{row.cira_doh}</td>
                    <td className="py-2.5 px-3 text-right text-white/70">{row.palau_dns}</td>
                    <td className="py-2.5 px-3 text-right text-white/70">{row.unsw_nb15}</td>
                    <td className="py-2.5 px-3 text-right text-white/70">{row.lanl_enterprise}</td>
                    <td className="py-2.5 px-3 text-right text-white/70">{row.ugr16_backbone}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-cyan-300">
                      {row.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-white/40 font-mono text-[10px] block mb-1">DATASET TIERS</span>
              <p className="text-white/80">
                Direct merge (CICIDS/TRUSTLab) + PCAP re-extraction (Palau/CTU-13) + Tool Diversity (UNSW IXIA) + Real Benign (LANL/UGR16).
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-white/40 font-mono text-[10px] block mb-1">PROVENANCE TAGGING</span>
              <p className="text-white/80">
                Every flow records its <code className="text-cyan-400 font-mono">source</code> tag so that public benchmarks can be held out as pure unseen test sets.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-white/40 font-mono text-[10px] block mb-1">QUALITY ASSERTION</span>
              <p className="text-white/80">
                Flow validator verified <strong className="text-emerald-400">0 NaNs</strong> and <strong className="text-emerald-400">0 Infs</strong>, preserving 1-packet flood attacks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: 78-Feature Schema Catalog ── */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {feature_categories.map((cat) => (
              <div key={cat.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white uppercase">{cat.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {cat.count} features
                  </span>
                </div>
                <ul className="space-y-1 text-[11px] font-mono text-white/60">
                  {cat.examples.map((feat) => (
                    <li key={feat} className="truncate hover:text-white transition-colors">
                      • {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-white/60 font-mono">
            Full canonical schema exported to <span className="text-cyan-400 font-bold">models/feature_schema.json</span> (77 features + 7 target classes).
          </div>
        </div>
      )}

      {/* ── Tab 3: Class Imbalance Audit ── */}
      {activeTab === 'imbalance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-amber-400" size={16} />
                <h4 className="text-xs font-bold text-white uppercase">Minority Class Detection (&lt;5% Threshold)</h4>
              </div>
              <p className="text-xs text-white/70 mb-3 leading-relaxed">
                The majority class is <strong className="text-rose-400">{dataset_summary.imbalance_audit.majority_class}</strong> ({dataset_summary.imbalance_audit.majority_count} flows). The 5% threshold is <strong className="text-cyan-400">{dataset_summary.imbalance_audit.threshold_5pct} flows</strong>.
              </p>
              <div className="space-y-1.5 font-mono text-xs">
                {dataset_summary.imbalance_audit.flagged_minority_classes.map((cls) => (
                  <div key={cls} className="flex items-center justify-between p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <span>{cls}</span>
                    <span className="text-[10px] font-bold">FLAGGED MINORITY</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="text-emerald-400" size={16} />
                <h4 className="text-xs font-bold text-white uppercase">Balancing Strategy & Boundary Guard</h4>
              </div>
              <p className="text-xs text-white/70 mb-3 leading-relaxed">
                Applied <strong className="text-white font-semibold">RandomOverSampler / SMOTE</strong> combined with balanced class weighting.
              </p>
              <ul className="space-y-2 text-xs text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Strict Boundary Guard:</strong> Resampling is applied strictly to <code className="text-cyan-400">X_train</code>, never to <code className="text-cyan-400">X_test</code>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Balanced Training Volume:</strong> Training split was expanded from 5,434 to <strong className="text-white">{dataset_summary.imbalance_audit.balanced_train_size.toLocaleString()} flows</strong>.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
