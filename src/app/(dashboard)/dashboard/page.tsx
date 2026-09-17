'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  Activity,
  Server,
  AlertTriangle,
  GitBranch,
  Zap,
  Eye,
  Radar,
  Clock,
  Cpu,
  Database,
  CircleAlert,
  Globe,
  Terminal,
  RefreshCw,
  Layers,
  GitCompare,
  Sliders,
} from 'lucide-react';
import { useMirage } from '@/components/providers/mirage-provider';
import { CyberGlobe } from '@/components/network/cyber-globe';
import { OneWayNetworkDiagram } from '@/components/network/one-way-diagram';
import { ThreatStream } from '@/components/dashboard/threat-stream';
import { RiskLeaderboard } from '@/components/dashboard/risk-leaderboard';
import { MetricCard } from '@/components/dashboard/metric-card';
import { SystemHealthPanel } from '@/components/dashboard/system-health';
import { PipelineView } from '@/components/pipeline/pipeline-view';
import { GeneralizationGapView } from '@/components/pipeline/generalization-gap-view';
import { FlowClassifierBench } from '@/components/pipeline/flow-classifier-bench';
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
    <div className="space-y-6">
      {/* ── Top Hero Strip ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield size={22} className="text-cyan-400" />
            <h1 className="text-2xl font-black tracking-wide text-white">
              MIRAGE INTELLIGENCE
            </h1>
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              style={{ letterSpacing: '0.12em' }}
            >
              UNIDIRECTIONAL SENSOR ENCLAVE
            </span>
          </div>
          <p className="text-xs text-white/50">
            Hardware-isolated optical tap inspection · Bidirectional flow feature analytics · Multi-dataset cross-source validation.
          </p>
        </div>

        {/* System status & Simulation Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          {isSimulating && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-400 font-mono animate-pulse">
              <AlertTriangle size={13} />
              <span>ATTACK ACTIVE: {activeScenario}</span>
              <button
                onClick={stopSimulation}
                className="ml-2 px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition-colors"
              >
                STOP
              </button>
            </div>
          )}
          <StatusBadge label="SENSOR" value="ONLINE" color="#4ade80" pulse />
          <StatusBadge label="ONE-WAY" value="ENFORCED" color="#4ade80" pulse />
          <StatusBadge
            label="PIPELINE"
            value={health?.pipelineStatus ?? (isSimulating ? 'EVALUATING' : 'HEALTHY')}
            color={isSimulating ? '#ef4444' : '#4ade80'}
            pulse
          />
          <StatusBadge label="ML ENGINE" value="READY" color="#3b9eff" pulse />
        </div>
      </div>

      {/* ── Essential Metrics Bar (Spacious 5-Card Layout) ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5" role="region" aria-label="Primary metrics">
        <MetricCard
          label="Throughput"
          value={formatBytes(displayMetrics.bytesPerSec) + '/s'}
          icon={<Zap size={15} />}
          sublabel="optical tap RX"
          highlight={displayMetrics.bytesPerSec > 5000000 ? 'critical' : undefined}
        />
        <MetricCard
          label="Packet Rate"
          value={formatNumber(displayMetrics.packetsPerSec) + ' pps'}
          icon={<Activity size={15} />}
          sublabel="ingestion rate"
          highlight={displayMetrics.packetsPerSec > 5000 ? 'critical' : undefined}
        />
        <MetricCard
          label="Unified Flows"
          value="5,834"
          icon={<Database size={15} />}
          sublabel="8 public & lab sources"
        />
        <MetricCard
          label="Active Threats"
          value={activeAlerts.length.toString()}
          icon={<AlertTriangle size={15} />}
          sublabel={criticalHosts.length > 0 ? `${criticalHosts.length} critical hosts` : 'enclave secure'}
          highlight={activeAlerts.length > 0 ? 'high' : undefined}
        />
        <MetricCard
          label="ML Invariant Status"
          value="DUAL-MODEL"
          icon={<Cpu size={15} />}
          sublabel="RF (100) + XGBoost"
        />
      </div>

      {/* ── Segmented Navigation Tabs (Uncrowded, Organized, High-Information) ── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/10">
          <TabButton
            active={activeTab === 'operations'}
            onClick={() => setActiveTab('operations')}
            icon={<Globe size={14} />}
            label="Live Threat Operations"
            badge="NetScout Horizon"
          />
          <TabButton
            active={activeTab === 'pipeline'}
            onClick={() => setActiveTab('pipeline')}
            icon={<Layers size={14} />}
            label="NIDS Data Pipeline"
            badge="8 Sources"
          />
          <TabButton
            active={activeTab === 'generalization'}
            onClick={() => setActiveTab('generalization')}
            icon={<GitCompare size={14} />}
            label="Dual-Split Generalization Gap"
            badge="Artifact Analysis"
          />
          <TabButton
            active={activeTab === 'classifier'}
            onClick={() => setActiveTab('classifier')}
            icon={<Sliders size={14} />}
            label="Live Flow Classifier"
            badge="Inference Bench"
          />
        </div>

        {activeTab === 'operations' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVisualizerMode('globe')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all border',
                visualizerMode === 'globe'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
              )}
            >
              3D Threat Globe
            </button>
            <button
              onClick={() => setVisualizerMode('topology')}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all border',
                visualizerMode === 'topology'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
                  : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
              )}
            >
              Hardware Diode
            </button>
          </div>
        )}
      </div>

      {/* ── TAB 1: Live Operations & Threat Globe ── */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          {/* Visualizer Canvas */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
            {visualizerMode === 'globe' ? (
              <CyberGlobe
                alerts={alerts}
                hosts={hosts}
                threatStream={threatStream}
                activeScenario={isSimulating ? activeScenario : null}
                className="h-[600px]"
              />
            ) : (
              <OneWayNetworkDiagram
                packetsPerSec={displayMetrics.packetsPerSec}
                hosts={hosts}
                isActive
              />
            )}
          </div>

          {/* Clean 2-Column Operational Dock */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ThreatStream events={threatStream} />
            <SystemHealthPanel health={health} connection={connection} />
          </div>

          {/* Host Risk & Engine Status */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <RiskLeaderboard hosts={hosts} />
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Radar size={16} className="text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Detection Engines & Latency
                </h3>
              </div>
              <div className="space-y-2.5 font-mono text-xs">
                {[
                  { name: 'Packet Engine (SYN/UDP Flood)', latency: '2.1ms', status: 'ACTIVE', color: '#4ade80' },
                  { name: 'Connection Engine (Slowloris)', latency: '3.4ms', status: 'ACTIVE', color: '#4ade80' },
                  { name: 'Session Engine (C2/DGA/DNS Tunnel)', latency: '8.7ms', status: 'ACTIVE', color: '#4ade80' },
                  { name: 'RandomForest_NIDS (100 Trees)', latency: '3.1ms', status: 'DEPLOYED', color: '#3b9eff' },
                  { name: 'XGBoost_NIDS (Gradient Booster)', latency: '2.8ms', status: 'DEPLOYED', color: '#3b9eff' },
                ].map((e) => (
                  <div
                    key={e.name}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <span className="text-white/80">{e.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40">{e.latency}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                        style={{ color: e.color, background: `${e.color}15` }}
                      >
                        {e.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: NIDS Data Pipeline & 8-Source Ingestion ── */}
      {activeTab === 'pipeline' && <PipelineView />}

      {/* ── TAB 3: Dual-Split Generalization Gap Analysis ── */}
      {activeTab === 'generalization' && <GeneralizationGapView />}

      {/* ── TAB 4: Live Flow Classifier & Inference Bench ── */}
      {activeTab === 'classifier' && <FlowClassifierBench />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
        active
          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      )}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span
          className={cn(
            'text-[9px] font-mono px-1.5 py-0.5 rounded ml-1',
            active ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/10 text-white/40'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function StatusBadge({
  label,
  value,
  color,
  pulse = false,
}: {
  label: string;
  value: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${label}: ${value}`}>
      <span
        className={cn('status-dot', pulse && 'status-dot-pulse')}
        style={{ background: color }}
        aria-hidden="true"
      />
      <span className="text-label text-[10px] text-white/50">{label}</span>
      <span style={{ color, fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em' }}>
        {value}
      </span>
    </div>
  );
}
