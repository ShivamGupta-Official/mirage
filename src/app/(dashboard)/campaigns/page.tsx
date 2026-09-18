'use client';

import { useState } from 'react';
import {
  GitBranch,
  Shield,
  AlertTriangle,
  Server,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  Clock,
  Radio,
} from 'lucide-react';

interface CampaignNode {
  id: string;
  type: 'host' | 'c2' | 'server' | 'dns' | 'alert' | 'attacker';
  label: string;
  risk: number;
  x: number;
  y: number;
}

interface CampaignEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  confidence: number;
  risk_score: number;
  host_count: number;
  event_count: number;
  duration: string;
  threat_types: string[];
  nodes: CampaignNode[];
  edges: CampaignEdge[];
}

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-01',
    title: 'CAMPAIGN-APT-CORRELATION-001',
    description: 'Multi-host coordinated intrusion: Reconnaissance flood on 10.0.0.10 masking persistent C2 beaconing on 10.0.0.21 and Base32 DNS exfiltration on 10.0.0.31.',
    severity: 'CRITICAL',
    confidence: 0.94,
    risk_score: 92.4,
    host_count: 4,
    event_count: 26,
    duration: '18 min 42s',
    threat_types: ['SYN_FLOOD', 'C2_BEACON', 'DNS_TUNNEL'],
    nodes: [
      { id: '10.0.0.50', type: 'host', label: 'Attacker (10.0.0.50)', risk: 91.5, x: 80, y: 120 },
      { id: '10.0.0.10', type: 'server', label: 'Auth Target (10.0.0.10)', risk: 35.0, x: 280, y: 120 },
      { id: '10.0.0.21', type: 'host', label: 'Compromised Eng (10.0.0.21)', risk: 88.0, x: 280, y: 280 },
      { id: '198.51.100.42', type: 'c2', label: 'External C2 Server', risk: 95.0, x: 500, y: 280 },
      { id: '10.0.0.31', type: 'host', label: 'Finance Exfil (10.0.0.31)', risk: 72.0, x: 280, y: 440 },
      { id: '1.1.1.1', type: 'dns', label: 'DNS Resolver (1.1.1.1)', risk: 20.0, x: 500, y: 440 },
    ],
    edges: [
      { id: 'e1', source: '10.0.0.50', target: '10.0.0.10', relationship: 'SYN_FLOOD_DISTRACTION' },
      { id: 'e2', source: '10.0.0.21', target: '198.51.100.42', relationship: 'BEACONS_PERIODIC' },
      { id: 'e3', source: '10.0.0.31', target: '1.1.1.1', relationship: 'DNS_TUNNEL_EXFIL' },
      { id: 'e4', source: '10.0.0.10', target: '10.0.0.21', relationship: 'LATERAL_AUTH_TOKEN' },
    ],
  },
];

export default function CampaignsPage() {
  const [campaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>(DEMO_CAMPAIGNS[0]);
  const [selectedNode, setSelectedNode] = useState<CampaignNode | null>(DEMO_CAMPAIGNS[0].nodes[2]);

  return (
    <div className="space-y-6">
      {/* ── Top Studio Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl">
        <div>
          <div className="eyebrow-label mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
            <span>MULTI-STAGE CORRELATION & ATTACK GRAPH</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-[#f5efff] tracking-tight">
            Attack Campaigns & Graph
          </h1>
          <p className="text-xs sm:text-sm text-[#f5efff]/50 max-w-2xl font-light leading-relaxed mt-1">
            Correlates discrete passive detections into coordinated, multi-stage attack campaigns across the network.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-full bg-white/[0.04] border border-[#f5efff]/[0.08] flex items-center gap-2 px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
            <span className="text-xs font-mono text-[#f5efff]">1 ACTIVE APT CAMPAIGN</span>
          </div>
        </div>
      </div>

      {/* Campaign Summary Card */}
      <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#f5efff]/[0.08]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                {selectedCampaign.severity}
              </span>
              <h2 className="font-editorial text-2xl font-light text-[#f5efff]">
                {selectedCampaign.title}
              </h2>
            </div>
            <p className="text-xs text-[#f5efff]/60 mt-1 font-light leading-relaxed">
              {selectedCampaign.description}
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs font-mono">
            <div>
              <div className="text-[10px] text-[#f5efff]/40 uppercase tracking-wider">CONFIDENCE</div>
              <div className="font-editorial text-2xl font-light text-emerald-300">{(selectedCampaign.confidence * 100).toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-[10px] text-[#f5efff]/40 uppercase tracking-wider">RISK SCORE</div>
              <div className="font-editorial text-2xl font-light text-red-400">{selectedCampaign.risk_score.toFixed(1)}/100</div>
            </div>
            <div>
              <div className="text-[10px] text-[#f5efff]/40 uppercase tracking-wider">DURATION</div>
              <div className="font-editorial text-2xl font-light text-[#f5efff]">{selectedCampaign.duration}</div>
            </div>
          </div>
        </div>

        {/* Threat Types Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[#f5efff]/40 text-[10px] font-mono uppercase tracking-wider">TACTICS DETECTED:</span>
          {selectedCampaign.threat_types.map((type) => (
            <span
              key={type}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#f5efff]/[0.05] text-[#f5efff]/80 border border-[#f5efff]/[0.08]"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Interactive Visual Graph Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Graph Viewport */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#f5efff] tracking-wide flex items-center gap-2">
              <Layers size={15} className="text-[#a29bfe]" />
              Temporal Attack Graph Topology
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#f5efff]/40">Click any node to inspect</span>
          </div>

          {/* SVG Graph Viewport */}
          <div className="relative w-full h-[520px] rounded-lg bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 620 540">
              {/* Grid Background */}
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Edges */}
              {selectedCampaign.edges.map((edge) => {
                const srcNode = selectedCampaign.nodes.find((n) => n.id === edge.source);
                const tgtNode = selectedCampaign.nodes.find((n) => n.id === edge.target);
                if (!srcNode || !tgtNode) return null;

                const midX = (srcNode.x + tgtNode.x) / 2;
                const midY = (srcNode.y + tgtNode.y) / 2;

                return (
                  <g key={edge.id}>
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={tgtNode.x}
                      y2={tgtNode.y}
                      stroke="rgba(59,158,255,0.4)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-pulse"
                    />
                    <text
                      x={midX}
                      y={midY - 6}
                      fill="rgba(255,255,255,0.5)"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.relationship}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {selectedCampaign.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const nodeColor =
                  node.type === 'c2'
                    ? '#ef4444'
                    : node.type === 'attacker'
                    ? '#f97316'
                    : node.risk > 70
                    ? '#eab308'
                    : '#3b82f6';

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform duration-200"
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  >
                    {/* Outer Glow */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 24 : 18}
                      fill={nodeColor}
                      fillOpacity={isSelected ? 0.3 : 0.15}
                      stroke={nodeColor}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    {/* Inner Core */}
                    <circle cx={node.x} cy={node.y} r={isSelected ? 10 : 8} fill={nodeColor} />
                    {/* Label */}
                    <text
                      x={node.x}
                      y={node.y + 32}
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.label}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 44}
                      fill="rgba(255,255,255,0.4)"
                      fontSize="8"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      Risk: {node.risk.toFixed(1)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Inspector */}
        <div className="lg:col-span-4">
          {selectedNode ? (
            <div className="p-6 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] backdrop-blur-xl space-y-4">
              <div className="pb-3.5 border-b border-[#f5efff]/[0.08]">
                <div className="eyebrow-label text-[10px] text-[#f5efff]/40 uppercase tracking-wider">GRAPH NODE INSPECTION</div>
                <h4 className="font-editorial text-xl font-light text-[#f5efff] mt-1">{selectedNode.label}</h4>
                <div className="text-xs text-[#f5efff]/50 font-mono mt-0.5">ID: {selectedNode.id}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0f0e17] border border-[#f5efff]/[0.06]">
                  <span className="text-[#f5efff]/40 block text-[9px] uppercase tracking-wider">NODE ROLE</span>
                  <span className="text-[#f5efff] font-medium uppercase mt-0.5 block">{selectedNode.type}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0f0e17] border border-[#f5efff]/[0.06]">
                  <span className="text-[#f5efff]/40 block text-[9px] uppercase tracking-wider">ISOLATED RISK</span>
                  <span className="text-red-400 font-medium mt-0.5 block">{selectedNode.risk.toFixed(1)}/100</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#f5efff]/50">
                  Associated Graph Edges:
                </div>
                {selectedCampaign.edges
                  .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                  .map((e) => (
                    <div key={e.id} className="p-2.5 rounded-xl bg-[#0f0e17] border border-[#f5efff]/[0.06] font-mono text-[11px]">
                      <span className="text-[#a29bfe] font-medium">{e.relationship}</span>
                      <div className="text-[#f5efff]/40 text-[10px] mt-0.5">
                        {e.source} → {e.target}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-3.5 rounded-xl bg-[#f5efff]/[0.03] border border-[#f5efff]/[0.06] text-xs text-[#f5efff]/50 leading-relaxed font-light">
                MIRAGE groups hosts by shared command-and-control external IPs, common timing distributions, and synchronized volume spikes.
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-[#f5efff]/40 rounded-2xl bg-[#0f0e17]/80 border border-[#f5efff]/[0.08] font-mono text-xs">
              Click a graph node to inspect edge relationships.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
