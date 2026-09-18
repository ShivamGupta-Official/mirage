'use client';

import { useState } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Shield,
  Activity,
  Layers,
  Clock,
  Radio,
  FileCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresetItem {
  id: string;
  name: string;
  category: string;
  expected: string;
  source: string;
}

const PRESETS: PresetItem[] = [
  { id: 'syn_flood', name: 'hping3 SYN Flood Conduit', category: 'DoS Flood', expected: 'syn_flood', source: 'synthetic_lab (10.99.1.0/24)' },
  { id: 'udp_flood', name: 'hping3 UDP Volumetric Saturation', category: 'DoS Flood', expected: 'udp_flood', source: 'synthetic_lab (10.99.1.0/24)' },
  { id: 'slowloris', name: 'Slowloris Header Exhaustion', category: 'Starvation', expected: 'slowloris', source: 'trustlab benchmark' },
  { id: 'dns_tunnel', name: 'dnscat2 / iodine DNS Exfiltration', category: 'Covert Tunnel', expected: 'dns_tunnel', source: 'cira_doh benchmark' },
  { id: 'c2_beacon', name: 'Sandboxed C2 Emulator (Uniform Jitter)', category: 'Command & Control', expected: 'c2_beacon', source: 'synthetic_lab (CV < 0.12)' },
  { id: 'benign_trex', name: 'TRex / iperf3 Enterprise Baseline', category: 'Legitimate Traffic', expected: 'benign', source: 'ugr16_backbone & lab' },
];

export function FlowClassifierBench() {
  const [selectedPreset, setSelectedPreset] = useState<string>('syn_flood');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleClassify = async (presetId: string) => {
    setSelectedPreset(presetId);
    setLoading(true);
    try {
      const res = await fetch('/api/nids/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: presetId }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Test Profile Picker ── */}
      <div>
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#f5efff]/[0.05] border border-[#f5efff]/[0.08] flex items-center justify-center">
              <Zap className="text-[#f5efff]" size={15} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-[#f5efff] tracking-wide">
                Select Bidirectional Flow Profile
              </h3>
              <p className="text-[11px] text-[#f5efff]/40 font-mono">
                Evaluates real-time 77-feature inference across Random Forest and XGBoost enclaves
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#f5efff]/40 uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#f5efff]/[0.08] bg-white/[0.02]">
            {PRESETS.length} BENCHMARK PROFILES
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {PRESETS.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleClassify(p.id)}
                className={cn(
                  'p-4 rounded-2xl text-left transition-all border flex flex-col justify-between min-h-[140px]',
                  isSelected
                    ? 'bg-[#f5efff]/[0.08] border-[#f5efff]/30 ring-1 ring-[#f5efff]/20 shadow-lg shadow-black/40 text-[#f5efff]'
                    : 'bg-[#0f0e17]/80 border-[#f5efff]/[0.08] text-[#f5efff]/60 hover:bg-[#f5efff]/[0.04] hover:text-[#f5efff] hover:border-[#f5efff]/20'
                )}
              >
                <div>
                  <span className="eyebrow-label text-[9px] text-[#f5efff]/40 uppercase tracking-wider block mb-1.5">
                    {p.category}
                  </span>
                  <h4 className="text-xs font-medium text-[#f5efff] leading-snug mb-2">{p.name}</h4>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#f5efff]/[0.06]">
                  <span className="text-[10px] font-mono text-[#a29bfe]">
                    {loading && isSelected ? 'Evaluating...' : 'Run Inference →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Inference Results Display ── */}
      {result && (
        <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-5">
          <div className="flex items-start justify-between flex-wrap gap-4 pb-5 border-b border-[#f5efff]/[0.08]">
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <span className="text-xs font-mono text-[#f5efff]/40 uppercase tracking-widest">
                  PREDICTED CLASSIFICATION:
                </span>
                <span
                  className={cn(
                    'text-xs font-mono font-medium px-3 py-0.5 rounded-full border',
                    result.predicted_class === 'benign'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  )}
                >
                  {result.predicted_class.toUpperCase()}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border',
                    result.severity === 'CRITICAL'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : result.severity === 'HIGH'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                  )}
                >
                  SEVERITY: {result.severity}
                </span>
              </div>
              <p className="text-xs text-[#f5efff]/50 font-mono">
                Source Provenance: <span className="text-[#f5efff]">{result.source_provenance}</span> · Risk Score: <span className="text-amber-300 font-medium">{result.risk_score}/100</span>
              </p>
            </div>

            {/* Model Confidence Scores */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-[#f5efff]/[0.08] text-right min-w-[120px]">
                <span className="text-[10px] font-mono text-[#f5efff]/40 uppercase tracking-wider block mb-0.5">Random Forest</span>
                <span className="font-editorial text-2xl font-light text-[#f5efff]">
                  {(result.confidence_rf * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-[#f5efff]/[0.08] text-right min-w-[120px]">
                <span className="text-[10px] font-mono text-[#f5efff]/40 uppercase tracking-wider block mb-0.5">XGBoost</span>
                <span className="font-editorial text-2xl font-light text-[#a29bfe]">
                  {(result.confidence_xgb * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Key Contributing Features & Mitigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h5 className="text-[11px] font-mono font-medium text-[#f5efff]/50 uppercase tracking-widest mb-3">
                Top Contributing Flow Features
              </h5>
              <div className="space-y-2 font-mono text-xs">
                {result.top_features?.map((f: any) => (
                  <div
                    key={f.feature}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0f0e17] border border-[#f5efff]/[0.06]"
                  >
                    <span className="text-[#f5efff]/80 font-medium">{f.feature}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#f5efff]/40">{f.value.toLocaleString()}</span>
                      <span className="text-[#a29bfe] font-medium">{f.contribution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[11px] font-mono font-medium text-[#f5efff]/50 uppercase tracking-widest">
                Recommended Enclave Action
              </h5>
              <div className="p-4 rounded-2xl bg-[#0f0e17] border border-[#f5efff]/[0.08] text-xs text-[#f5efff]/80 leading-relaxed font-light">
                {result.mitigation}
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-[#f5efff]/[0.06] font-mono text-[11px] text-[#f5efff]/40 flex items-center justify-between">
                <span>Inference Latency: <strong className="text-[#f5efff] font-normal">3.4ms</strong></span>
                <span>Features Evaluated: <strong className="text-[#f5efff] font-normal">77 / 77</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
