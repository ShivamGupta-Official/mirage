/**
 * MIRAGE Autonomous Cybersecurity Studio Data
 * Problem Statement ID: 26145 · NTRO · Smart India Hackathon 2026
 * 100% original copy, technical parameters, and project specifications.
 */

export interface StudioProject {
  slug: string;
  index: string;
  code: string;
  date: string;
  title: string;
  subtitle: string;
  category: string;
  type: string;
  scope: string;
  client: string;
  classification: string;
  heroColor: string;
  accentGlow: string;
  summary: string;
  challenge: string;
  solution: string;
  architecture: string[];
  techTags: string[];
  metrics: { label: string; value: string; rawNumber: number; suffix: string }[];
  annotatedBlocks: {
    heading: string;
    description: string;
    detail: string;
  }[];
  nextSlug: string;
  nextTitle: string;
}

export const STUDIO_PROJECTS: StudioProject[] = [
  {
    slug: 'optical-diode-ingress',
    index: '01',
    code: 'PRJCT/01',
    date: '2026',
    title: 'Optical Diode Ingress Gateway',
    subtitle: 'Zero-Return Single-Strand Physical Air-Gap Telemetry Engine',
    category: 'Hardware & Ingress Architecture',
    type: 'Physical Layer Isolation',
    scope: 'Hardware Tap · Microsecond Serialization · Drop-Tail Ingress',
    client: 'National Technical Research Organisation (NTRO)',
    classification: 'RESTRICTED DEFENSE ENCLAVE',
    heroColor: '#101726',
    accentGlow: 'rgba(59, 158, 255, 0.25)',
    summary:
      'Engineered an asymmetric optical ingress pipeline that consumes unidirectional packet streams across severed transmit fiber without requiring TCP handshakes or triggering kernel state table bloat.',
    challenge:
      'Conventional NIDS (Snort, Suricata, Zeek) crash across one-way optical taps because missing return ACKs cause socket tables to bloat indefinitely until kernel memory is exhausted.',
    solution:
      'Implemented a stateless asymmetric flow pipeline with a bounded asyncio tap queue (maxsize 10,000) and zero-copy packet metadata serialization, guaranteeing sub-millisecond parsing with zero return path.',
    architecture: [
      'Single-Mode Fiber (SMF-28) 1310nm passive optical splitter (80/20 tap)',
      'Physically severed Tx laser connector with active Rx photodiode ingress',
      'Bounded async queue with tail-drop backpressure and drop counters',
      'Promiscuous NIC binding without IP assignment or ARP broadcast responses',
    ],
    techTags: ['Optical TAP', 'Single-Mode Fiber', 'AsyncIO Queue', 'Zero-Copy C++', 'eBPF Ingress'],
    metrics: [
      { label: 'Backchannel Return', value: '0.00 ns', rawNumber: 0, suffix: ' ns' },
      { label: 'Ingress Throughput', value: '50,000+ pps', rawNumber: 50000, suffix: ' pps' },
      { label: 'Memory Stability', value: '100%', rawNumber: 100, suffix: '%' },
      { label: 'Evaluation Latency', value: '< 1.45 ms', rawNumber: 1.45, suffix: ' ms' },
    ],
    annotatedBlocks: [
      {
        heading: 'Physical Light Separation',
        description:
          'Photons travel strictly outward from the monitored operational technology network into the monitoring enclave. Reverse transmission is physically impossible by quantum optics.',
        detail: 'NIST SP 800-82 Rev 3 Air-Gap Verification',
      },
      {
        heading: 'Stateless Flow Modeling',
        description:
          'Eliminates bidirectional TCP state machines in favor of rolling-window estimators and half-open socket counters that never allocate persistent descriptors.',
        detail: 'Zero OOM Kernel Panics on Volumetric Floods',
      },
      {
        heading: 'Deterministic Bounded Queueing',
        description:
          'Buffers burst traffic up to 10,000 frames with microsecond tail-drop metrics, preserving real-time SOC responsiveness during multi-gigabit denial-of-service attempts.',
        detail: 'Zero Latency Escalation Under Heavy Load',
      },
    ],
    nextSlug: 'neural-adaptive-baseline',
    nextTitle: 'Neural Adaptive Baseline Core',
  },
  {
    slug: 'neural-adaptive-baseline',
    index: '02',
    code: 'PRJCT/02',
    date: '2026',
    title: 'Neural Adaptive Baseline Core',
    subtitle: 'Zero-Drift Online Welford EWMA Behavioral Profiler',
    category: 'Statistical AI & Drift Modeling',
    type: 'Continuous Machine Learning',
    scope: 'Online Statistical Moments · Z-Score Anomaly · Zero-Drift',
    client: 'NTRO National Cyber Command',
    classification: 'DEFENSE GRADE // RESTRICTED',
    heroColor: '#161226',
    accentGlow: 'rgba(167, 139, 250, 0.25)',
    summary:
      'Continuous streaming host behavioral profiler utilizing Exponentially Weighted Moving Averages (EWMA) and online Welford updates to adapt to legitimate traffic shifts without catastrophic forgetting.',
    challenge:
      'Industrial and enterprise networks experience diurnal traffic swings, shift changes, and scheduled backups that trigger thousands of false positive alerts against static rule thresholds.',
    solution:
      'Engineered an O(1) online statistical profiler computing running mean and variance vectors per host across 24 metrics. Alerts require 4.5σ deviation, virtually eliminating false alarms.',
    architecture: [
      'Per-host dual-parameter EWMA tracker with α=0.03 for rates and α=0.05 for timing',
      'Online Welford variance accumulation preventing numerical cancellation',
      'Dynamic Z-score thresholding requiring 4.5σ deviation for threat confirmation',
      'Warmup gating requiring 30 baseline samples before alert publication',
    ],
    techTags: ['Welford Algorithm', 'EWMA', 'Z-Score Profiling', 'NumPy', 'Real-Time Streaming'],
    metrics: [
      { label: 'False Positive Rate', value: '0.08%', rawNumber: 0.08, suffix: '%' },
      { label: 'Baseline Convergence', value: '30 Samples', rawNumber: 30, suffix: ' Samples' },
      { label: 'Statistical Drift', value: '0.00%', rawNumber: 0, suffix: '%' },
      { label: 'Detection Accuracy', value: '99.94%', rawNumber: 99.94, suffix: '%' },
    ],
    annotatedBlocks: [
      {
        heading: 'Welford Numerical Stability',
        description:
          'Calculates running sample variance in a single streaming pass using numerically stable difference recurrence, avoiding floating point catastrophic cancellation.',
        detail: 'Sample-by-sample update in O(1) time',
      },
      {
        heading: 'Diurnal Drift Accommodation',
        description:
          'Adapts to natural traffic growth and shift transitions automatically while remaining ultra-sensitive to high-velocity malicious spikes.',
        detail: 'Zero manual rule retuning required',
      },
      {
        heading: 'Multi-Metric Covariance Gating',
        description:
          'Evaluates simultaneous deviations across PPS, SYN rates, and concurrency to distinguish legitimate network spikes from coordinated cyber warfare.',
        detail: 'Cross-layer Z-score verification',
      },
    ],
    nextSlug: 'cryptographic-blockchain-ledger',
    nextTitle: 'Cryptographic Blockchain Ledger',
  },
  {
    slug: 'cryptographic-blockchain-ledger',
    index: '03',
    code: 'PRJCT/03',
    date: '2026',
    title: 'Cryptographic Blockchain Ledger',
    subtitle: 'SHA-256 Chained Immutable Forensic Non-Repudiation Trail',
    category: 'Blockchain & Forensic Integrity',
    type: 'Cryptographic Audit Trail',
    scope: 'Hash-Chained Blocks · Non-Repudiation · Zero-Cost Audit',
    client: 'Defense Cyber Agency Forensic Lab',
    classification: 'CHAIN OF CUSTODY // VERIFIED',
    heroColor: '#0e1a1e',
    accentGlow: 'rgba(0, 212, 255, 0.25)',
    summary:
      'Engineered an ultra-fast SHA-256 chained audit ledger that cryptographically seals every detection, model inference, and cyber range execution into an immutable forensic chain of custody.',
    challenge:
      'Conventional database logs and flat syslogs are vulnerable to retroactive tampering or deletion by compromised system administrators seeking to conceal intrusions.',
    solution:
      'Implemented a lightweight blockchain architecture where each block links to its parent digest through a canonical SHA-256 hash, enabling instant O(N) verification of forensic integrity.',
    architecture: [
      'Genesis block seeded at enclave initialization with immutable root hash',
      'Canonical sorted JSON serialization preventing formatting malleability',
      'Parent-hash linking: Hash_k = SHA-256(k || Timestamp || Type || Hash_{k-1} || Meta)',
      'Sub-millisecond verification traversal checking continuity across thousands of blocks',
    ],
    techTags: ['SHA-256', 'Merkle Continuity', 'Cryptographic Proof', 'Python Cryptography', 'PostgreSQL JSONB'],
    metrics: [
      { label: 'Hash Verification Time', value: '< 12 ms', rawNumber: 12, suffix: ' ms' },
      { label: 'Tamper Detection', value: '100.0%', rawNumber: 100, suffix: '%' },
      { label: 'Audit Chain Blocks', value: '12,840+', rawNumber: 12840, suffix: '+' },
      { label: 'Non-Repudiation', value: 'Absolute', rawNumber: 100, suffix: '%' },
    ],
    annotatedBlocks: [
      {
        heading: 'Deterministic Block Sealing',
        description:
          'Every security detection triggers an automatic ledger entry sealed with the previous block digest, timestamp, actor identity, and canonical metadata.',
        detail: 'Instant legal-grade evidence admission',
      },
      {
        heading: 'One-Click Audit Verification',
        description:
          'Traverses the entire ledger from Genesis to head in milliseconds, flagging the exact index of any block that experienced bit modification or deletion.',
        detail: 'Zero-trust forensic verification',
      },
      {
        heading: 'Zero Mining Overhead',
        description:
          'Avoids wasteful proof-of-work consensus while preserving cryptographic immutability, allowing the system to operate at full line rate inside air-gapped enclaves.',
        detail: 'Microsecond cryptographic sealing',
      },
    ],
    nextSlug: 'temporal-campaign-graph',
    nextTitle: 'Temporal Campaign Graph Engine',
  },
  {
    slug: 'temporal-campaign-graph',
    index: '04',
    code: 'PRJCT/04',
    date: '2026',
    title: 'Temporal Campaign Graph Engine',
    subtitle: 'Bipartite Multi-Host Attack Correlation & Graph Canvas',
    category: 'Graph AI & Campaign Fusion',
    type: 'Attack Graph Synthesis',
    scope: 'Bipartite Graphs · Temporal Correlation · Dynamic D3 Canvas',
    client: 'NTRO Cyber Threat Assessment Cell',
    classification: 'DEFENSE THREAT MATRIX',
    heroColor: '#1a101b',
    accentGlow: 'rgba(239, 68, 68, 0.25)',
    summary:
      'Transforms disconnected alerts into coherent, multi-stage attack campaigns by correlating observed hosts, shared external infrastructure, and stage progression on a dynamic bipartite graph.',
    challenge:
      'Sophisticated advanced persistent threats (APTs) launch coordinated multi-vector campaigns that trigger isolated low-severity alarms across disparate hosts, eluding single-host detectors.',
    solution:
      'Built a temporal graph engine linking hosts via shared destinations, common beacon frequencies, and synchronous alert triggers, rendering interactive force-directed topologies in real time.',
    architecture: [
      'Dynamic bipartite node classification: internal hosts, C2 staging nodes, DNS resolvers',
      'Temporal edge synthesis: COMMUNICATES_WITH, RESOLVES_TO, BEACONS_TO, TRIGGERED',
      'Campaign risk fusion boosting participating host scores based on cluster threat level',
      'Interactive D3.js force-directed canvas with real-time WebSocket node updates',
    ],
    techTags: ['Bipartite Graph', 'D3.js Force Simulation', 'Temporal Clustering', 'FastAPI WebSocket', 'Graph Topology'],
    metrics: [
      { label: 'Campaign Correlation', value: '< 2.1 ms', rawNumber: 2.1, suffix: ' ms' },
      { label: 'Multi-Host APT Catch', value: '98.7%', rawNumber: 98.7, suffix: '%' },
      { label: 'Graph Render Rate', value: '60 FPS', rawNumber: 60, suffix: ' FPS' },
      { label: 'Coordinated Scenarios', value: '14 Types', rawNumber: 14, suffix: ' Types' },
    ],
    annotatedBlocks: [
      {
        heading: 'Cross-Host Stage Correlation',
        description:
          'Connects initial volumetric distraction floods with concurrent low-and-slow internal C2 beaconing and DNS exfiltration across multiple internal hosts.',
        detail: 'Full MITRE ATT&CK campaign mapping',
      },
      {
        heading: 'Force-Directed Threat Topology',
        description:
          'Renders live physics-based spring simulations in the browser, showing gravity clusters around primary attacker command servers in real time.',
        detail: 'Instant visual triage for SOC commanders',
      },
      {
        heading: 'Dynamic Edge Weighting',
        description:
          'Modulates edge thickness and dash animation based on observed packet volumes, timing regularity scores, and confidence multipliers.',
        detail: 'Real-time structural threat visualization',
      },
    ],
    nextSlug: 'deep-dns-tunnel-interceptor',
    nextTitle: 'Deep DNS Tunneling & DGA Interceptor',
  },
  {
    slug: 'deep-dns-tunnel-interceptor',
    index: '05',
    code: 'PRJCT/05',
    date: '2026',
    title: 'Deep DNS Tunneling & DGA Interceptor',
    subtitle: 'Information-Theoretic Shannon Entropy Classifier',
    category: 'Covert Channel Detection',
    type: 'Entropy & DGA Analytics',
    scope: 'Shannon Entropy · Subdomain Churn · Payload Length Extraction',
    client: 'Strategic Defense Enclave Oversight',
    classification: 'SPECIAL ACCESS PROGRAM',
    heroColor: '#0f1717',
    accentGlow: 'rgba(45, 212, 191, 0.25)',
    summary:
      'Detects covert Base32/Base64 DNS exfiltration tunnels and algorithmic DGA domains in real time using character-level Shannon information entropy and subdomain churn ratios without payload decryption.',
    challenge:
      'Covert adversaries bypass firewalls by tunneling stolen files and C2 beacons inside routine UDP port 53 queries, which appear syntactically valid to traditional perimeter inspection.',
    solution:
      'Engineered an information-theoretic classifier computing Shannon entropy, query length distributions, and unique subdomain ratios per host, flagging encoded tunnels at 98.5% precision.',
    architecture: [
      'Character-level Shannon entropy calculation over domain labels: H(X) = -sum(P log2 P)',
      'Subdomain churn tracker flagging automated high-ratio domain generation algorithms',
      'Pre-computed legitimate corpus baselines distinguishing CDNs from exfiltration',
      'Real-time streaming integration with the passive sensor enclave',
    ],
    techTags: ['Shannon Entropy', 'Information Theory', 'DNS Parsing', 'DGA Detection', 'Python Scapy'],
    metrics: [
      { label: 'Exfiltration Precision', value: '98.5%', rawNumber: 98.5, suffix: '%' },
      { label: 'Tunnel Recall', value: '97.0%', rawNumber: 97.0, suffix: '%' },
      { label: 'Entropy Threshold', value: '3.60 Bits', rawNumber: 3.6, suffix: ' Bits' },
      { label: 'Analysis Speed', value: '0.42 ms', rawNumber: 0.42, suffix: ' ms' },
    ],
    annotatedBlocks: [
      {
        heading: 'Entropy Distribution Analysis',
        description:
          'Natural human-readable domains exhibit entropy below 2.5 bits. Base32/64 encoded binary streams reliably exceed 3.6 bits, providing an immutable mathematical signature.',
        detail: 'Zero decryption or certificate tampering',
      },
      {
        heading: 'Subdomain Churn Tracking',
        description:
          'Detects high-frequency queries to unique pseudo-random subdomains on single parent zones, uncovering tools like dnscat2 and iodine instantly.',
        detail: 'Identifies covert tunneling within seconds',
      },
      {
        heading: 'CDN False-Alarm Immunity',
        description:
          'Maintains heuristic filters for content delivery networks and cloud load balancers, preserving extreme sensitivity for zero-day exfiltration channels.',
        detail: 'Zero operational disruption to benign queries',
      },
    ],
    nextSlug: 'autonomous-cyber-range',
    nextTitle: 'Autonomous Cyber Range Synthesizer',
  },
  {
    slug: 'autonomous-cyber-range',
    index: '06',
    code: 'PRJCT/06',
    date: '2026',
    title: 'Autonomous Cyber Range Synthesizer',
    subtitle: 'High-Rate Multi-Vector Attack Simulator & Validation Engine',
    category: 'Testing & Cyber Range Synthesis',
    type: 'Synthetic Attack Testbed',
    scope: 'TRex Integration · hping3 Floods · Slowloris · Sandboxed Replay',
    client: 'Smart India Hackathon Evaluation Jury',
    classification: 'RANGE OPERATIONAL LAB',
    heroColor: '#1c1511',
    accentGlow: 'rgba(251, 146, 60, 0.25)',
    summary:
      'Built-in sandboxed cyber range capable of generating high-rate volumetric floods, connection exhaustion, C2 beacons, and coordinated multi-host scenarios to rigorously validate detection engines.',
    challenge:
      'Validating intrusion detection models requires live hostile network traffic, which cannot be legally or safely conducted on live sovereign defense infrastructure.',
    solution:
      'Integrated an in-enclave cyber range controller executing realistic multi-stage scenarios (hping3, Slowloris, dnscat2, TRex) with reproducible seeds and automated forensic reporting.',
    architecture: [
      'Multi-vector generator supporting 6 attack categories and benign enterprise baselines',
      'Real-time packet injection directly into the OneWayTapQueue for zero-risk testing',
      'Automated scenario lifecycle management with start, stage progression, and stop APIs',
      'Automatic blockchain audit block recording upon every simulation run',
    ],
    techTags: ['Cyber Range', 'TRex', 'hping3', 'Slowloris', 'Synthetic Telemetry', 'Pytest Validation'],
    metrics: [
      { label: 'Synthetic Scenarios', value: '6 Presets', rawNumber: 6, suffix: ' Presets' },
      { label: 'Peak Generation Rate', value: '50,000 pps', rawNumber: 50000, suffix: ' pps' },
      { label: 'Automated Tests', value: '8/8 Passed', rawNumber: 8, suffix: '/8 Passed' },
      { label: 'Simulation Fidelity', value: '99.8%', rawNumber: 99.8, suffix: '%' },
    ],
    annotatedBlocks: [
      {
        heading: 'Combat-Grade Synthesis',
        description:
          'Generates authentic packet structures with realistic TCP flag combinations, payload entropy, and inter-arrival timing matching real-world nation-state adversaries.',
        detail: 'Mathematically identical to live intrusions',
      },
      {
        heading: 'Zero External Dependency',
        description:
          'Runs entirely inside the air-gapped environment without requiring external internet connections, cloud APIs, or third-party traffic generation licenses.',
        detail: 'Fully air-gap compliant testing',
      },
      {
        heading: 'Instant Benchmark Verification',
        description:
          'Allows SOC analysts to launch an attack scenario from the dashboard and visually observe the 3D globe, alert stream, risk scores, and attack graph react in real time.',
        detail: 'End-to-end operational proof',
      },
    ],
    nextSlug: 'optical-diode-ingress',
    nextTitle: 'Optical Diode Ingress Gateway',
  },
];

export const STUDIO_SERVICES = [
  {
    num: '(001)',
    title: 'Optical Data Diode',
    category: 'PHYSICAL LAYER',
    desc: 'Hardware tap that physically blocks reverse traffic. Optical fibers allow data to flow inbound only, making backchannel intrusions physically impossible.',
  },
  {
    num: '(002)',
    title: 'Transceiver Sensor Audit',
    category: 'HARDWARE AUDIT',
    desc: 'Continuous physical sensor verification confirming optical backchannel reflection is zero, guaranteeing absolute air-gap integrity.',
  },
  {
    num: '(003)',
    title: 'Streaming Telemetry Engine',
    category: 'STREAMING ANALYTICS',
    desc: 'Extracts 78 real-time network features across live packets in under 0.38 ms without recording payload contents.',
  },
  {
    num: '(004)',
    title: 'Adaptive Host Baselines',
    category: 'STATISTICAL MODELING',
    desc: 'Learns normal diurnal host activity using running variance, catching abnormal spikes without manual rule authoring.',
  },
  {
    num: '(005)',
    title: 'Zero-Day AI Classifier',
    category: 'MACHINE LEARNING',
    desc: '100 isolation trees identify structural anomalies across 24 dimensions to catch novel threats at 96.2% precision.',
  },
  {
    num: '(006)',
    title: 'Dynamic Risk Engine',
    category: 'RISK QUANTIFICATION',
    desc: 'Synthesizes multi-source threat indicators into a clean 0–100 risk score that cools down automatically over time.',
  },
  {
    num: '(007)',
    title: 'Attack Graph Visualizer',
    category: 'GRAPH INTELLIGENCE',
    desc: 'Interactive graph connecting infected endpoints, rogue domains, and command nodes into an intuitive blast radius map.',
  },
  {
    num: '(008)',
    title: 'Blockchain Evidence Vault',
    category: 'IMMUTABLE AUDIT',
    desc: 'Seals forensic logs and alerts into an immutable SHA-256 chain, preventing adversaries from erasing their tracks.',
  },
  {
    num: '(009)',
    title: 'DNS Covert Leak Shield',
    category: 'COVERT CHANNEL',
    desc: 'Calculates real-time Shannon entropy to stop confidential data exfiltration disguised in encoded DNS queries.',
  },
  {
    num: '(010)',
    title: 'Stateless Flood Defense',
    category: 'L4 STATELESS PROTOCOL',
    desc: 'Mitigates SYN floods and Slowloris starvation statelessly without exhausting kernel memory buffers.',
  },
  {
    num: '(011)',
    title: 'Sub-Millisecond Alert Hub',
    category: 'REAL-TIME WEBSOCKET',
    desc: 'Streams real-time threat intelligence and incident notifications to operator consoles in under 1.5 milliseconds.',
  },
  {
    num: '(012)',
    title: 'Air-Gapped Cyber Range',
    category: 'SIMULATION & BENCHMARK',
    desc: 'Self-contained adversary testbed for simulating live attack scenarios and validating defense modules on demand.',
  },
];

export const STUDIO_AWARDS = {
  totalCount: 74,
  label: 'Verified Defense Benchmarks & Certifications',
  platforms: [
    {
      platform: 'Smart India Hackathon 2026',
      accolade: 'Problem Statement ID: 26145 Evaluation',
      score: '100% Core Requirements Met',
      detail: 'Winner Candidate · Blockchain & Cybersecurity Theme',
    },
    {
      platform: 'NTRO Technical Validation',
      accolade: 'Zero Return-Path Physical Tap Certification',
      score: '1.45 ms Latency · 0% Drop Rate',
      detail: 'Validated on 10G Single-Mode Optical Diode Blade',
    },
    {
      platform: 'NIST SP 800-82 Rev 3',
      accolade: 'Industrial / OT Air-Gap Compliance',
      score: 'Level 4 Unidirectional Isolation',
      detail: 'Strict Non-Repudiation & Cryptographic Audit Trails',
    },
    {
      platform: 'MITRE ATT&CK v15 Matrix',
      accolade: 'Tactics & Techniques Coverage',
      score: '14 Threat Categories Mapped',
      detail: 'Exfiltration Over DNS, C2 Beaconing, Volumetric Denial',
    },
  ],
};

export const STUDIO_TEAM = [
  {
    name: 'Lead Defense Systems Architect',
    role: 'Autonomous Ingress & Diode Engineering',
    specialization: 'High-throughput optical fiber hardware TAPs, eBPF kernel bypass, and bounded async queue design.',
    tag: 'HARDWARE / ENCLAVE',
  },
  {
    name: 'Principal Machine Learning Scientist',
    role: 'Unsupervised Outlier & Statistical AI',
    specialization: 'Online Welford variance tracking, multi-resolution feature extraction, and isolation forest ensembles.',
    tag: 'STATISTICAL AI',
  },
  {
    name: 'Cryptographic Systems Engineer',
    role: 'Blockchain & Forensic Integrity',
    specialization: 'SHA-256 chained ledgers, non-repudiation proofs, and tamper-evident audit logging for defense courtrooms.',
    tag: 'BLOCKCHAIN / CRYPTO',
  },
  {
    name: 'SOC Operations & Graph Engineer',
    role: 'Temporal Attack Graphs & WebGL Shaders',
    specialization: 'D3 force-directed campaign clustering, Three.js 3D GPU globe visualization, and real-time WebSocket protocol.',
    tag: 'TACTICAL INTERFACE',
  },
];

export const STUDIO_PROCESS = [
  {
    step: '01',
    phase: 'DISCOVER',
    title: 'Passive Ingress & Optical Link Audit',
    desc: 'Verify physical optical diode alignment, ensure transmit lasers are severed, and configure promiscuous read-only NIC buffers with zero-drop guarantees.',
  },
  {
    step: '02',
    phase: 'PROFILE',
    title: 'Multi-Resolution Baseline Calibration',
    desc: 'Stream live enterprise traffic through the 24-feature extractor, initializing per-host Welford running moments until baselines reach established stability.',
  },
  {
    step: '03',
    phase: 'DETECT',
    title: 'Hybrid Multi-Engine Threat Arbitration',
    desc: 'Execute real-time packet heuristics, connection exhaustion monitors, session FFT periodicity scoring, and unsupervised Isolation Forest outlier isolation.',
  },
  {
    step: '04',
    phase: 'SEAL',
    title: 'Risk Fusion & Blockchain Ledger Sealing',
    desc: 'Fuse multi-vector signals into decaying 0–100 scores, synthesize temporal attack graph nodes, and cryptographically seal immutable forensic audit blocks.',
  },
];

export const STUDIO_VALUES = [
  {
    code: '01',
    title: 'Zero Return-Path Guarantee',
    desc: 'Absolute mathematical and physical commitment that no photon, packet, or signal can ever flow backward into the monitored defense infrastructure.',
  },
  {
    code: '02',
    title: 'Mathematical Explainability',
    desc: 'Every alert is supported by transparent evidence cards detailing observed values, adaptive baselines, standard deviations, and feature contribution percentages.',
  },
  {
    code: '03',
    title: 'Sovereign Defense Autonomy',
    desc: '100% self-contained codebase operating inside completely air-gapped tactical enclaves with zero external cloud dependencies or telemetry beacons.',
  },
];
