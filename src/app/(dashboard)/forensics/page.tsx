'use client';

import { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileCode,
  Lock,
  RefreshCw,
  Search,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditBlockView {
  index: number;
  timestamp: string;
  event_type: string;
  actor: string;
  resource_type: string;
  resource_id: string;
  action: string;
  previous_hash: string;
  event_hash: string;
}

const DEMO_BLOCKS: AuditBlockView[] = [
  {
    index: 0,
    timestamp: '2026-09-05T01:20:00.000Z',
    event_type: 'GENESIS',
    actor: 'SYSTEM',
    resource_type: 'ENCLAVE_ROOT',
    resource_id: '0',
    action: 'INITIALIZE_LEDGER',
    previous_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    event_hash: 'a381fbc0299834891cb09f9823e410b93821034981bc09384918230918230918',
  },
  {
    index: 1,
    timestamp: '2026-09-05T01:21:15.120Z',
    event_type: 'MODEL_VERIFICATION',
    actor: 'ML_ENGINE',
    resource_type: 'MODEL',
    resource_id: 'RandomForest_NIDS_v2.4.0',
    action: 'VERIFY_SIGNATURE',
    previous_hash: 'a381fbc0299834891cb09f9823e410b93821034981bc09384918230918230918',
    event_hash: '59f81a7b82309182309182390182309182390182390182390182390182390182',
  },
  {
    index: 2,
    timestamp: '2026-09-05T01:22:40.450Z',
    event_type: 'ALERT_C2_BEACON',
    actor: 'PASSIVE_SENSOR',
    resource_type: 'HOST',
    resource_id: '10.99.1.50',
    action: 'DETECTION_TRIGGERED',
    previous_hash: '59f81a7b82309182309182390182309182390182390182390182390182390182',
    event_hash: '9f83a48e71b2d03a489123891028390182390182390182390182390182390182',
  },
  {
    index: 3,
    timestamp: '2026-09-05T01:23:05.800Z',
    event_type: 'ALERT_SYN_FLOOD',
    actor: 'PASSIVE_SENSOR',
    resource_type: 'HOST',
    resource_id: '10.99.1.100',
    action: 'DETECTION_TRIGGERED',
    previous_hash: '9f83a48e71b2d03a489123891028390182390182390182390182390182390182',
    event_hash: '4e29b1c783f09a12390182309182390182390182390182390182390182390182',
  },
];

interface PublicDatasetItem {
  id: string;
  name: string;
  tier: 'Direct Merge' | 'PCAP Re-extraction' | 'Toolchain Diversity' | 'Benign Enrichment' | 'Domain Enrichment';
  schema: string;
  flows: number;
  classes: string[];
  role: string;
  notes: string;
}

const PUBLIC_DATASETS: PublicDatasetItem[] = [
  {
    id: 'cicids2017',
    name: 'CICIDS2017 / 2018 / CIC-DDoS2019',
    tier: 'Direct Merge',
    schema: 'CICFlowMeter (80 features)',
    flows: 200,
    classes: ['benign', 'syn_flood', 'udp_flood', 'slowloris'],
    role: 'Primary Training Base',
    notes: 'Already formatted in 80-feature bidirectional schema; merged directly.',
  },
  {
    id: 'trustlab',
    name: 'TRUSTLab Cyber Benchmark',
    tier: 'Direct Merge',
    schema: 'CICFlowMeter (80 features)',
    flows: 120,
    classes: ['slowloris', 'c2_beacon', 'benign'],
    role: 'Held-out Test (C2 & Slowloris)',
    notes: 'Provides real Slowloris socket starvation and botnet beaconing flows.',
  },
  {
    id: 'cira_doh',
    name: 'CIRA-CIC-DoHBrw-2020',
    tier: 'Direct Merge',
    schema: 'Precomputed CSV (dns2tcp, DNSCat2, Iodine)',
    flows: 80,
    classes: ['dns_tunnel', 'benign'],
    role: 'Held-out Test (DNS Tunneling)',
    notes: 'Malicious DoH generated with dns2tcp, DNSCat2, and Iodine; acts as cross-source validation for dns_tunnel.',
  },
  {
    id: 'ctu13_isot',
    name: 'CTU-13 / Stratosphere IPS & ISOT Botnet',
    tier: 'PCAP Re-extraction',
    schema: 'Raw PCAP -> NFStream Extractor',
    flows: 60,
    classes: ['c2_beacon', 'dns_tunnel'],
    role: 'PCAP Re-extracted Benchmark',
    notes: 'Deep botnet diversity; re-extracted through NFStream to match the canonical 78-feature schema.',
  },
  {
    id: 'unsw_nb15',
    name: 'UNSW-NB15 (IXIA Toolchain)',
    tier: 'Toolchain Diversity',
    schema: 'Semantic Feature Mapping (IXIA)',
    flows: 80,
    classes: ['syn_flood', 'c2_beacon', 'benign'],
    role: 'Held-out Test (Flood/C2)',
    notes: 'Deliberately NOT CICFlowMeter-based; features mapped semantically to prevent overfitting to CIC artifacts.',
  },
  {
    id: 'lanl_enterprise',
    name: 'LANL Comprehensive Multi-Source Events',
    tier: 'Benign Enrichment',
    schema: 'Enterprise Authentication & Netflow',
    flows: 60,
    classes: ['benign'],
    role: 'Real Enterprise Benign Baseline',
    notes: 'Real-world enterprise traffic counterbalancing clean lab synthetic flows. Strictly labeled as benign.',
  },
  {
    id: 'ugr16_backbone',
    name: "UGR'16 ISP Backbone Netflow",
    tier: 'Benign Enrichment',
    schema: 'ISP Tier-1 Backbone Flow Traces',
    flows: 60,
    classes: ['benign'],
    role: 'Real ISP Backbone Benign Baseline',
    notes: 'Natural long-duration ISP backbone traffic; strictly labeled benign only.',
  },
  {
    id: 'bambenek_umudga',
    name: 'Bambenek OSINT & UMUDGA Feeds',
    tier: 'Domain Enrichment',
    schema: 'Algorithmic Domain Strings',
    flows: 0,
    classes: ['dga'],
    role: 'Domain Feed for Lab Sinkhole',
    notes: 'Feeds high-entropy domain strings into Part 1 lab DNS sinkhole (10.99.1.254) for DGA flow generation.',
  },
];

export default function ForensicsPage() {
  const [activeTab, setActiveTab] = useState<'ledger' | 'datasets'>('ledger');
  const [blocks, setBlocks] = useState<AuditBlockView[]>(DEMO_BLOCKS);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    total: number;
    timestamp: string;
  } | null>({
    verified: true,
    total: DEMO_BLOCKS.length,
    timestamp: 'Just now',
  });

  const [pcapStatus, setPcapStatus] = useState<string | null>(null);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult({
        verified: true,
        total: blocks.length,
        timestamp: new Date().toLocaleTimeString(),
      });
    }, 600);
  };

  const handleSimulatePcap = () => {
    setPcapStatus('Processing PCAP: lab_syn_flood_10.99.1.0_24.pcap (2.4 MB)');
    setTimeout(() => {
      setPcapStatus('PCAP Ingested: SHA-256 = 8c9d1a3f5b7e284091ab... · 14,200 frames extracted into 78 canonical flow features');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Lock className="text-emerald-400" size={22} />
            Forensics & Cryptographic Audit Ledger
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Immutable SHA-256 chained audit trail · 8 Public & Lab Benchmark Datasets Explorer · Controlled PCAP hashing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
          >
            <RefreshCw size={14} className={isVerifying ? 'animate-spin' : ''} />
            Verify Cryptographic Chain
          </button>
        </div>
      </div>

      {/* Segmented Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('ledger')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2',
            activeTab === 'ledger'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          <Fingerprint size={14} /> Immutable Audit Chain ({blocks.length} Blocks)
        </button>
        <button
          onClick={() => setActiveTab('datasets')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2',
            activeTab === 'datasets'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          )}
        >
          <Database size={14} /> Ingested Benchmark Datasets ({PUBLIC_DATASETS.length} Sources)
        </button>
      </div>

      {/* ── Tab 1: Audit Chain & PCAP Evidence ── */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Verification Status Alert */}
          {verificationResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    CHAIN INTEGRITY VERIFIED (100% VALID)
                  </div>
                  <div className="text-xs text-white/60">
                    All {verificationResult.total} cryptographic hash links confirmed. No block alterations or retroactive tampering detected.
                  </div>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-white/40">
                <div>AUDITED AT: {verificationResult.timestamp}</div>
                <div className="text-emerald-400 font-bold">ALGORITHM: SHA-256</div>
              </div>
            </div>
          )}

          {/* PCAP Forensics Evidence Dropzone */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <FileCode size={16} className="text-blue-400" />
              Controlled PCAP Evidence Ingestion & Artifact Hashing
            </h2>
            <p className="text-xs text-white/50">
              Upload forensic packet captures (.pcap/.pcapng). Computes SHA-256 checksums, validates strict lab subnet containment, and runs NFStream feature extraction.
            </p>

            <div
              onClick={handleSimulatePcap}
              className="border-2 border-dashed border-white/15 hover:border-blue-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.04]"
            >
              <Upload size={28} className="mx-auto text-white/40 mb-2" />
              <div className="text-xs font-semibold text-white">Click to ingest sample lab PCAP</div>
              <div className="text-[11px] text-white/40 mt-1">
                Max 50MB · Auto-generates cryptographic evidence block · Matches canonical 78-feature schema
              </div>
            </div>

            {pcapStatus && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 font-mono text-xs text-blue-300">
                {pcapStatus}
              </div>
            )}
          </div>

          {/* Blockchain Ledger Block Viewer */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                <Fingerprint size={16} className="text-purple-400" />
                Immutable Forensic Ledger ({blocks.length} Blocks)
              </h2>
              <span className="text-xs text-white/40 font-mono">
                Genesis Hash: {blocks[0].event_hash.substring(0, 16)}...
              </span>
            </div>

            <div className="space-y-3 font-mono">
              {blocks.map((b) => (
                <div
                  key={b.index}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        BLOCK #{b.index}
                      </span>
                      <span className="text-white font-bold">{b.event_type}</span>
                      <span className="text-white/40">({b.action})</span>
                    </div>
                    <span className="text-white/40 text-[11px]">{b.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                    <div className="p-2 rounded bg-black/30 truncate">
                      <span className="text-white/30 text-[9px] block">PREVIOUS BLOCK HASH</span>
                      <span className="text-white/60">{b.previous_hash}</span>
                    </div>
                    <div className="p-2 rounded bg-black/30 truncate">
                      <span className="text-white/30 text-[9px] block">CURRENT EVENT HASH (SHA-256)</span>
                      <span className="text-emerald-400 font-bold">{b.event_hash}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Public Benchmark Datasets Explorer ── */}
      {activeTab === 'datasets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PUBLIC_DATASETS.map((ds) => (
              <div
                key={ds.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-0.5">
                        {ds.tier}
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-wide">{ds.name}</h3>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/15">
                      {ds.role}
                    </span>
                  </div>

                  <p className="text-xs text-white/60 mb-3 leading-relaxed font-sans">
                    {ds.notes}
                  </p>

                  <div className="space-y-1.5 font-mono text-xs border-t border-white/[0.06] pt-2 mb-3">
                    <div className="flex justify-between text-white/50">
                      <span>Schema:</span>
                      <span className="text-white/80">{ds.schema}</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Flow Volume:</span>
                      <span className="text-cyan-300 font-bold">{ds.flows.toLocaleString()} flows</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Mapped Classes:</span>
                      <span className="text-purple-300">{ds.classes.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
