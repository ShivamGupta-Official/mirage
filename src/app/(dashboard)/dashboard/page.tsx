'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Zap,
  Cpu,
  Database,
  Globe,
  Terminal,
  Layers,
  GitCompare,
  Sliders,
  Send,
  Radar,
  Search,
} from 'lucide-react';
import { useMirage } from '@/components/providers/mirage-provider';
import { CyberGlobe } from '@/components/network/cyber-globe';
import { OneWayNetworkDiagram } from '@/components/network/one-way-diagram';
import { ThreatStream } from '@/components/dashboard/threat-stream';
import { RiskLeaderboard } from '@/components/dashboard/risk-leaderboard';
import { MetricCard } from '@/components/dashboard/metric-card';
import { SystemHealthPanel } from '@/components/dashboard/system-health';
import { ThreatRadarCard } from '@/components/dashboard/threat-radar-card';
import { AttackVolumeCard } from '@/components/dashboard/attack-volume-card';
import { AiDetectionCard } from '@/components/dashboard/ai-detection-card';
import { PipelineView } from '@/components/pipeline/pipeline-view';
import { GeneralizationGapView } from '@/components/pipeline/generalization-gap-view';
import { FlowClassifierBench } from '@/components/pipeline/flow-classifier-bench';
import { ThreatIntelChat } from '@/components/dashboard/threat-intel-chat';
import { cn, formatNumber, formatBytes } from '@/lib/utils';
import type { MetricsSnapshot } from '@/types';

const DEMO_METRICS: MetricsSnapshot = {
  timestamp: new Date().toISOString(),
  packetsPerSec: 847,
  bytesPerSec: 2_340_000,
  activeHosts: 5,
  activeSessions: 34,
  alertsTotal: 0,
  criticalHosts: 0,
  activeCampaigns: 0,
  detectionLatencyMs: 4.2,
};

type DashboardTab = 'operations' | 'pipeline' | 'generalization' | 'classifier';

export default function DashboardPage() {
  const {
    metrics,
    hosts,
    alerts,
    health,
    connection,
    threatStream,
    isSimulating,
    activeScenario,
    stopSimulation,
  } = useMirage();

  const [displayMetrics, setDisplayMetrics] = useState<MetricsSnapshot>(DEMO_METRICS);
  const [activeTab, setActiveTab] = useState<DashboardTab>('operations');
  const [visualizerMode, setVisualizerMode] = useState<'globe' | 'topology'>('globe');

  useEffect(() => {
    if (metrics) setDisplayMetrics(metrics);
  }, [metrics]);

  const activeAlerts = alerts.filter((a) => a.isActive);
  const criticalHosts = hosts.filter((h) => h.riskScore >= 80);

  return (
    <div className="space-y-5">
      {/* ── Compact Header Row ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-editorial text-2xl sm:text-3xl font-light tracking-tight text-white">
            MIRAGE <span className="italic font-normal opacity-70">Intelligence</span>
          </h1>
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded text-white/50 bg-white/5 border border-white/10 hidden sm:inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active Enclave
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isSimulating && (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-mono">
              <AlertTriangle size={12} />
              <span>{activeScenario}</span>
              <button onClick={stopSimulation} className="ml-1 px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px]">STOP</button>
            </div>
          )}
          <StatusPill label="SENSOR" value="ONLINE" color="#10b981" />
          <StatusPill label="PIPELINE" value={health?.pipelineStatus ?? 'HEALTHY'} color={isSimulating ? '#ef4444' : '#10b981'} />
          <StatusPill label="ML" value="READY" color="#38bdf8" />
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-full bg-[#0f0e17]/90 border border-[#f5efff]/[0.06] overflow-x-auto no-scrollbar">
          <TabPill active={activeTab === 'operations'} onClick={() => setActiveTab('operations')} icon={<Globe size={12} />} label="Live Threat Ops" />
          <TabPill active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} icon={<Layers size={12} />} label="NIDS Pipeline" />
          <TabPill active={activeTab === 'generalization'} onClick={() => setActiveTab('generalization')} icon={<GitCompare size={12} />} label="Generalization Gap" />
          <TabPill active={activeTab === 'classifier'} onClick={() => setActiveTab('classifier')} icon={<Sliders size={12} />} label="Flow Classifier" />
        </div>

        {activeTab === 'operations' && (
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#0f0e17]/90 border border-[#f5efff]/[0.06]">
            <button
              onClick={() => setVisualizerMode('globe')}
              className={cn('px-3.5 py-1.5 rounded-full text-xs font-mono transition-all', visualizerMode === 'globe' ? 'bg-[#f5efff] text-[#08080c] font-semibold' : 'text-[#f5efff]/50 hover:text-[#f5efff]')}
            >3D Globe</button>
            <button
              onClick={() => setVisualizerMode('topology')}
              className={cn('px-3.5 py-1.5 rounded-full text-xs font-mono transition-all', visualizerMode === 'topology' ? 'bg-[#f5efff] text-[#08080c] font-semibold' : 'text-[#f5efff]/50 hover:text-[#f5efff]')}
            >Diode</button>
          </div>
        )}
      </div>

      {/* ═══════════════ TAB 1: LIVE OPERATIONS ═══════════════ */}
      {activeTab === 'operations' && (
        <div className="space-y-5">

          {/* ── Globe Hero — Full Width, No Frame ── */}
          <div className="rounded-2xl overflow-hidden bg-[#090910]">
            {visualizerMode === 'globe' ? (
              <CyberGlobe
                alerts={alerts}
                hosts={hosts}
                threatStream={threatStream}
                activeScenario={isSimulating ? activeScenario : null}
                className="h-[580px] w-full"
              />
            ) : (
              <OneWayNetworkDiagram packetsPerSec={displayMetrics.packetsPerSec} hosts={hosts} isActive />
            )}
          </div>

          {/* ── Enclave AI Co-Pilot Input & Chat ── */}
          <ThreatIntelChat />

          {/* ── 5 KPI Cards Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard label="Throughput" value={formatBytes(displayMetrics.bytesPerSec) + '/s'} icon={<Zap size={13} />} sublabel="optical tap RX" highlight={displayMetrics.bytesPerSec > 5000000 ? 'critical' : undefined} className="!p-4" />
            <MetricCard label="Packet Rate" value={formatNumber(displayMetrics.packetsPerSec) + ' pps'} icon={<Activity size={13} />} sublabel="ingestion rate" className="!p-4" />
            <MetricCard label="Unified Flows" value="5,834" icon={<Database size={13} />} sublabel="8 public & lab sources" className="!p-4" />
            <MetricCard label="Active Threats" value={activeAlerts.length.toString()} icon={<AlertTriangle size={13} />} sublabel={criticalHosts.length > 0 ? `${criticalHosts.length} critical` : 'enclave secure'} highlight={activeAlerts.length > 0 ? 'high' : undefined} className="!p-4" />
            <MetricCard label="ML Status" value="DUAL-MODEL" icon={<Cpu size={13} />} sublabel="RF(100) + XGBoost" className="!p-4 hidden sm:flex" />
          </div>

          {/* ── Two-Column Content Grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

            {/* Left Column — 8 cols */}
            <div className="xl:col-span-8 min-w-0 space-y-5">
              <ThreatStream events={threatStream} />
              <SystemHealthPanel health={health} connection={connection} />

              {/* Detection Engines */}
              <div className="p-5 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.06] backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#f5efff]/[0.06] mb-3">
                  <div className="flex items-center gap-2">
                    <Radar size={14} className="text-[#f5efff]/60" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f5efff]/50 font-medium">Detection Engines & Latency</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#f5efff]/30 uppercase tracking-widest">REAL-TIME L3-L7</span>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  {[
                    { name: 'Packet Engine (SYN/UDP Flood)', latency: '2.1ms', status: 'ACTIVE', color: '#34d399' },
                    { name: 'Connection Engine (Slowloris)', latency: '3.4ms', status: 'ACTIVE', color: '#34d399' },
                    { name: 'Session Engine (C2/DGA/DNS)', latency: '8.7ms', status: 'ACTIVE', color: '#34d399' },
                    { name: 'RandomForest NIDS (100 Trees)', latency: '3.1ms', status: 'DEPLOYED', color: '#38bdf8' },
                    { name: 'XGBoost NIDS (Booster)', latency: '2.8ms', status: 'DEPLOYED', color: '#38bdf8' },
                  ].map((e) => (
                    <div key={e.name} className="flex items-center justify-between p-3 rounded-xl bg-[#f5efff]/[0.02] border border-[#f5efff]/[0.04] hover:border-[#f5efff]/[0.12] transition-colors">
                      <span className="text-[#f5efff]/70 text-[10px] truncate mr-2">{e.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[#f5efff]/35 text-[10px]">{e.latency}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ color: e.color, background: `${e.color}12`, border: `1px solid ${e.color}25` }}>{e.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-[#f5efff]/[0.04] flex items-center justify-between text-[10px] font-mono text-[#f5efff]/35 mt-3">
                  <span>AVG INFERENCE LATENCY: 3.42ms</span>
                  <span className="text-emerald-400 font-semibold">ALL 5 ENGINES NOMINAL</span>
                </div>
              </div>
            </div>

            {/* Right Column — 4 cols */}
            <div className="xl:col-span-4 min-w-0 space-y-5">
              <ThreatRadarCard activeSources={activeAlerts.length > 0 ? activeAlerts.length * 123 : 983} />
              <AttackVolumeCard totalEvents={983421} />
              <AiDetectionCard
                highRisk={activeAlerts.filter(a => a.severity === 'CRITICAL').length || 12}
                mediumRisk={activeAlerts.filter(a => a.severity === 'HIGH').length || 47}
                lowRisk={activeAlerts.filter(a => a.severity === 'MEDIUM').length || 156}
                monitoring={768}
                confidence={96.8}
              />
              <RiskLeaderboard hosts={hosts} className="flex-1" />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2 ── */}
      {activeTab === 'pipeline' && <PipelineView />}
      {/* ── TAB 3 ── */}
      {activeTab === 'generalization' && <GeneralizationGapView />}
      {/* ── TAB 4 ── */}
      {activeTab === 'classifier' && <FlowClassifierBench />}
    </div>
  );
}

/* ── Compact Status Pill ── */
function StatusPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-white/10 bg-white/5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span className="font-mono text-[9px] uppercase tracking-wider text-white/50">{label}</span>
      <span className="font-mono text-[9px] font-medium" style={{ color }}>{value}</span>
    </div>
  );
}

/* ── Tab Pill ── */
function TabPill({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all whitespace-nowrap',
        active ? 'bg-white text-zinc-950 font-semibold' : 'text-white/50 hover:text-white hover:bg-white/5'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
