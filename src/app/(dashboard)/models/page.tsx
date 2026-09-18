'use client';

import { useState } from 'react';
import {
  Cpu,
  Shield,
  CheckCircle2,
  TrendingUp,
  Database,
  Layers,
  Sparkles,
  BarChart2,
  Lock,
  GitCompare,
  Sliders,
  FileCode,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { GeneralizationGapView } from '@/components/pipeline/generalization-gap-view';
import { FlowClassifierBench } from '@/components/pipeline/flow-classifier-bench';
import { cn } from '@/lib/utils';

interface ModelItem {
  id: string;
  name: string;
  version: string;
  model_type: string;
  dataset: string;
  feature_version: string;
  features_count: number;
  random_f1: number;
  held_out_f1: number;
  delta_gap: number;
  status: string;
  description: string;
  file_path: string;
  file_size_mb: string;
}

const PRODUCTION_MODELS: ModelItem[] = [
  {
    id: 'rf-nids',
    name: 'RandomForest_NIDS',
    version: 'v2.4.0 (100 Trees)',
    model_type: 'Balanced Supervised Random Forest Ensemble',
    dataset: '8 Public & Lab Benchmarks (5,834 flows, balanced to 9,536)',
    feature_version: 'CICIDS_78_BIDIRECTIONAL_FLOW',
    features_count: 77,
    random_f1: 0.907,
    held_out_f1: 0.125,
    delta_gap: 0.782,
    status: 'ACTIVE_IN_ENCLAVE',
    description:
      'Trained on synthetic lab pcaps (hping3 floods, Slowloris, dnscat2, DGA, C2) and public benchmark flows (CICIDS, TRUSTLab, CIRA-DoH, UNSW, LANL, UGR16) with RandomOverSampler/SMOTE balancing.',
    file_path: 'models/RandomForest_NIDS.joblib',
    file_size_mb: '1.88 MB',
  },
  {
    id: 'xgb-nids',
    name: 'XGBoost_NIDS',
    version: 'v2.1.2 (GradBoost)',
    model_type: 'Multi-Class Gradient Boosted Decision Trees',
    dataset: '8 Public & Lab Benchmarks (5,834 flows, balanced to 9,536)',
    feature_version: 'CICIDS_78_BIDIRECTIONAL_FLOW',
    features_count: 77,
    random_f1: 0.895,
    held_out_f1: 0.181,
    delta_gap: 0.714,
    status: 'ACTIVE_IN_ENCLAVE',
    description:
      'Gradient boosted trees optimizing multi:softprob cross-entropy with early stopping. Excels at non-linear boundary separation on high-dimensional flow statistics.',
    file_path: 'models/XGBoost_NIDS.joblib',
    file_size_mb: '0.83 MB',
  },
  {
    id: 'iso-forest',
    name: 'IsolationForest_ZeroDay',
    version: 'v1.4.2',
    model_type: 'Unsupervised Isolation Forest',
    dataset: 'Passive Unidirectional Stream Baseline',
    feature_version: 'fv3_temporal_fft',
    features_count: 32,
    random_f1: 0.941,
    held_out_f1: 0.880,
    delta_gap: 0.061,
    status: 'ACTIVE_IN_ENCLAVE',
    description:
      'Partitions multivariate behavioral feature spaces to detect zero-day exfiltration and unknown anomaly vectors without requiring prior attack labels.',
    file_path: 'models/best_model.pt',
    file_size_mb: '0.05 MB',
  },
];

export default function ModelsPage() {
  const [activeTab, setActiveTab] = useState<'models' | 'gap' | 'bench'>('models');

  return (
    <div className="space-y-6">
      {/* ── Top Header Strip ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl">
        <div>
          <div className="eyebrow-label mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
            <span>ENCLAVE MODEL REGISTRY & TELEMETRY</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-[#f5efff] tracking-tight">
            AI & ML Model Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#f5efff]/50 max-w-2xl font-light leading-relaxed mt-1">
            Cryptographically signed model checkpoints · Dual-split cross-source validation telemetry · Live inference bench.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#f5efff]/40 block uppercase tracking-wider">CANONICAL FEATURES</span>
            <span className="font-editorial text-2xl font-light text-[#a29bfe]">77 Numerical + 1 Target</span>
          </div>
          <div className="h-8 w-px bg-[#f5efff]/10" />
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#f5efff]/40 block uppercase tracking-wider">SPLIT STRATEGY</span>
            <span className="font-editorial text-2xl font-light text-emerald-300">Strict Source Held-Out</span>
          </div>
        </div>
      </div>

      {/* ── Segmented Navigation Tabs ── */}
      <div className="flex items-center justify-start overflow-x-auto pb-1 no-scrollbar">
        <div className="p-1.5 rounded-full bg-white/[0.04] border border-[#f5efff]/[0.08] inline-flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('models')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-2',
              activeTab === 'models'
                ? 'bg-[#f5efff] text-black shadow-md'
                : 'text-[#f5efff]/60 hover:text-[#f5efff] hover:bg-white/[0.04]'
            )}
          >
            <Layers size={13} /> Production Models ({PRODUCTION_MODELS.length})
          </button>
          <button
            onClick={() => setActiveTab('gap')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-2',
              activeTab === 'gap'
                ? 'bg-[#f5efff] text-black shadow-md'
                : 'text-[#f5efff]/60 hover:text-[#f5efff] hover:bg-white/[0.04]'
            )}
          >
            <GitCompare size={13} /> Dual-Split Generalization Gap
          </button>
          <button
            onClick={() => setActiveTab('bench')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-2',
              activeTab === 'bench'
                ? 'bg-[#f5efff] text-black shadow-md'
                : 'text-[#f5efff]/60 hover:text-[#f5efff] hover:bg-white/[0.04]'
            )}
          >
            <Sliders size={13} /> Live Inference Bench
          </button>
        </div>
      </div>

      {/* ── Tab 1: Production Models ── */}
      {activeTab === 'models' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {PRODUCTION_MODELS.map((m) => (
              <div
                key={m.id}
                className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl hover:border-[#f5efff]/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="eyebrow-label text-[10px] text-[#a29bfe] uppercase tracking-wider block mb-1">
                        {m.version}
                      </span>
                      <h3 className="font-editorial text-xl font-light text-[#f5efff]">{m.name}</h3>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {m.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#f5efff]/60 mb-4 leading-relaxed font-light">
                    {m.description}
                  </p>

                  <div className="space-y-2 font-mono text-xs border-t border-[#f5efff]/[0.06] pt-3.5 mb-4">
                    <div className="flex justify-between text-[#f5efff]/50">
                      <span>Architecture:</span>
                      <span className="text-[#f5efff]/90 truncate max-w-[170px]">{m.model_type}</span>
                    </div>
                    <div className="flex justify-between text-[#f5efff]/50">
                      <span>Feature Schema:</span>
                      <span className="text-[#a29bfe]">{m.features_count} Canonical Feats</span>
                    </div>
                    <div className="flex justify-between text-[#f5efff]/50">
                      <span>Random Split F1:</span>
                      <span className="text-emerald-300 font-medium">{(m.random_f1 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-[#f5efff]/50">
                      <span>Held-Out Split F1:</span>
                      <span className="text-amber-300 font-medium">{(m.held_out_f1 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-[#f5efff]/50">
                      <span>Generalization Δ:</span>
                      <span className="text-rose-400 font-medium">+{m.delta_gap.toFixed(3)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#f5efff]/[0.06] flex items-center justify-between text-[11px] font-mono text-[#f5efff]/40">
                  <span>{m.file_path}</span>
                  <span className="text-[#f5efff]/60">{m.file_size_mb}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f5efff]/[0.05] border border-[#f5efff]/[0.08] flex items-center justify-center">
                <FileCode className="text-[#f5efff]" size={16} />
              </div>
              <div>
                <h4 className="text-xs font-mono font-medium text-[#f5efff]">models/feature_schema.json</h4>
                <p className="text-[11px] text-[#f5efff]/50 font-light">
                  Exact feature names and column ordering required by live inference services.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-[#a29bfe] font-medium px-3 py-1 rounded-full bg-[#f5efff]/[0.05] border border-[#f5efff]/[0.08]">
              77 BIDIRECTIONAL FEATURES
            </span>
          </div>
        </div>
      )}

      {/* ── Tab 2: Generalization Gap Analysis ── */}
      {activeTab === 'gap' && <GeneralizationGapView />}

      {/* ── Tab 3: Inference Bench ── */}
      {activeTab === 'bench' && <FlowClassifierBench />}
    </div>
  );
}
