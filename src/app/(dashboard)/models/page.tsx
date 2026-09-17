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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Cpu className="text-purple-400" size={22} />
            <h1 className="text-xl font-bold text-white tracking-wide">
              AI & ML Model Registry
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
              CICIDS 78-FEATURE CANONICAL
            </span>
          </div>
          <p className="text-xs text-white/50">
            Cryptographically signed model checkpoints · Dual-split cross-source validation telemetry · Live inference bench.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/40 block">CANONICAL FEATURES</span>
            <span className="text-sm font-mono font-bold text-cyan-300">77 Numerical + 1 Target</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/40 block">SPLIT STRATEGY</span>
            <span className="text-sm font-mono font-bold text-emerald-400">Strict Source Held-Out</span>
          </div>
        </div>
      </div>

      {/* ── Segmented Navigation ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('models')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2',
            activeTab === 'models'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          <Layers size={14} /> Production Model Checkpoints ({PRODUCTION_MODELS.length})
        </button>
        <button
          onClick={() => setActiveTab('gap')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2',
            activeTab === 'gap'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          <GitCompare size={14} /> Dual-Split Generalization Gap Matrix
        </button>
        <button
          onClick={() => setActiveTab('bench')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2',
            activeTab === 'bench'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          <Sliders size={14} /> Live Inference Bench & Playground
        </button>
      </div>

      {/* ── Tab 1: Production Models ── */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {PRODUCTION_MODELS.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 font-bold block mb-0.5">
                        {m.version}
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-wide">{m.name}</h3>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {m.status}
                    </span>
                  </div>

                  <p className="text-xs text-white/60 mb-4 leading-relaxed font-sans">
                    {m.description}
                  </p>

                  <div className="space-y-1.5 font-mono text-xs border-t border-white/[0.06] pt-3 mb-4">
                    <div className="flex justify-between text-white/50">
                      <span>Architecture:</span>
                      <span className="text-white/90 truncate max-w-[170px]">{m.model_type}</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Feature Schema:</span>
                      <span className="text-cyan-300">{m.features_count} Canonical Feats</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Random Split F1:</span>
                      <span className="text-emerald-400 font-bold">{(m.random_f1 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Held-Out Split F1:</span>
                      <span className="text-amber-400 font-bold">{(m.held_out_f1 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Generalization Δ:</span>
                      <span className="text-rose-400 font-bold">+{m.delta_gap.toFixed(3)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/40">
                  <span>{m.file_path}</span>
                  <span className="text-white/60">{m.file_size_mb}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <FileCode className="text-cyan-400" size={18} />
              <div>
                <h4 className="text-xs font-bold text-white">models/feature_schema.json</h4>
                <p className="text-[11px] text-white/50">
                  Exact feature names and column ordering required by live inference services.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-bold">
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
