# MIRAGE
## Multi-resolution Intelligent Risk & Adaptive Graph Engine
### Smart India Hackathon 2026 · Problem Statement ID: 26145
**Organization:** National Technical Research Organisation (NTRO)  
**Category:** Software  
**Theme:** Blockchain & Cybersecurity  

[![CodeRabbit AI Review](https://img.shields.io/badge/CodeRabbit-AI%20Reviewed-blueviolet?style=for-the-badge&logo=coderabbit)](https://coderabbit.ai)
[![Build Status](https://img.shields.io/badge/Next.js%2016-Turbopack%20Passing-success?style=for-the-badge&logo=next.js)](/)
[![Tests](https://img.shields.io/badge/Pytest-8%2F8%20Passed-emerald?style=for-the-badge&logo=pytest)](/)
[![One-Way Diode](https://img.shields.io/badge/Hardware%20Diode-RX%20Enforced-cyan?style=for-the-badge)](/)

---

## Executive Summary

**MIRAGE** is an AI-powered cybersecurity detection platform designed specifically for **Unidirectional IP Traffic** (optical data diodes / one-way network taps). In sensitive critical infrastructure, military enclaves, and intelligence networks, data diodes physically isolate the monitored network by severing the transmit (TX) fiber—allowing packet mirrors to flow outward into the monitoring enclave while making reverse injection physically impossible.

Unlike conventional intrusion detection systems (IDS) that rely on bidirectional TCP handshake tracking, active querying, or synthetic mock numbers, MIRAGE operates with **zero return path**. It ingests passive packet streams, extracts multi-resolution features (packet, connection, session, DNS), dynamically computes host-specific adaptive baselines using Exponentially Weighted Moving Averages (EWMA), flags threats using an ensemble of Isolation Forests and statistical engines, correlates multi-host campaigns onto a temporal graph, and seals all detections into a **tamper-evident, cryptographically chained blockchain audit ledger**.

---

## Architectural Principles & Unidirectional Enforcement

```
┌─────────────────────────────────────────────────────────────┐
│                 MONITORED PRODUCTION NETWORK               │
│                                                             │
│   [Server: 10.0.0.10]    [User: 10.0.0.21]    [Host: 10.0.0.31]│
│         │                      │                    │       │
│         └──────────────────────┼────────────────────┘       │
│                                ▼                            │
│                       [Switch Mirror / TAP]                 │
└────────────────────────────────┬────────────────────────────┘
                                 │
                   SINGLE-STRAND OPTICAL FIBER
                   Tx Physically Severed / Rx Active
                   Photons Only Travel Downward ──►
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│            MIRAGE SECURE ENCLAVE (ZERO RETURN PATH)          │
│                                                             │
│  [One-Way Diode Tap Queue (Write-Only Ingress / Bounded)]   │
│                                │                            │
│                                ▼                            │
│  [Passive Sensor Enclave (Read-Only Consumer)]              │
│                                │                            │
│       ┌────────────────────────┼────────────────────────┐   │
│       ▼                        ▼                        ▼   │
│ [Packet Engine]       [Connection Engine]       [Session Engine]│
│ (SYN/UDP Flood)       (Slowloris Stall)         (C2 / DNS / DGA)│
│       │                        │                        │   │
│       └────────────────────────┼────────────────────────┘   │
│                                ▼                            │
│                [Adaptive Baseline Engine (EWMA)]            │
│                                │                            │
│                                ▼                            │
│           [Machine Learning Outlier (Isolation Forest)]     │
│                                │                            │
│                                ▼                            │
│              [0-100 Risk Engine (Exponential Decay)]        │
│                                │                            │
│       ┌────────────────────────┴────────────────────────┐   │
│       ▼                                                 ▼   │
│ [Explainable Evidence Cards]              [Campaign Correlation]│
│ ("WHY WE FLAGGED THIS")                   (Temporal Graph Nodes)│
│       │                                                 │   │
│       └────────────────────────┬────────────────────────┘   │
│                                ▼                            │
│                 [Blockchain SHA-256 Audit Ledger]           │
│                                │                            │
│                                ▼                            │
│            [PostgreSQL Database / WebSocket Stream]         │
└────────────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
                     [Next.js 16 SOC Dashboard]
```

---

## Benchmark Traffic & Cyber Range Synthesis

As specified in the NTRO problem statement guidelines, MIRAGE includes a built-in **Cyber Range Synthesizer** that replicates the exact traffic sources required:

| Category | Generator / Tool | Characteristics & Attack Signatures |
| :--- | :--- | :--- |
| **Benign Enterprise** | `TRex` & `iperf3` | High-throughput web browsing, API queries, bulk TCP transfers (confirms zero false alarms). |
| **Benign Burst** | `Ostinato` | Multi-protocol packet variations with natural variance and mixed packet sizes. |
| **SYN Flood** | `hping3` | Rapid TCP SYN packet bursts without ACK replies targeting port 80/443 (flags SYN/ACK ratio > 4.0). |
| **UDP Flood** | `hping3` | High-rate randomized UDP datagram floods aiming to saturate tap buffers. |
| **Connection Starvation** | `Slowloris` | 50+ concurrent stalled sockets sending partial HTTP headers at 10s intervals. |
| **DNS Covert Channel** | `dnscat2` / `iodine` | Base32/Base64 encoded DNS TXT queries with Shannon entropy > 3.8 and high subdomain churn. |
| **Stealth DGA** | DGA Synthesizer | Algorithmic pseudo-random domains (`.biz`, `.info`, `.xyz`) querying dynamic C2 rendezvous points. |
| **C2 Beaconing** | Sandboxed C2 Emulator | Highly periodic heartbeats with realistic jitter ($CV < 0.15$), detected via autocorrelation. |
| **Coordinated Campaign** | Multi-Agent APT | 3-host synchronized attack: Flood distraction + internal C2 beaconing + DNS exfiltration. |

---

## 14-Table Telemetry Database Architecture

The backend implements the complete 14-entity relational schema in both PostgreSQL (`backend/db/postgres_schema.sql`) and SQLite (`mirage.db`):

1. **`hosts`**: Every observed IP endpoint, role classification, first/last seen, baseline status (`learning` vs `established`).
2. **`simulation_runs`**: Tracks benchmark runs, traffic generators (`iperf3`, `TRex`, `hping3`, `dnscat2`), and random seeds.
3. **`flows`**: 5-tuple aggregated network flows (timestamps, packet count, bytes, duration, TCP flags, TTL, packet size distribution).
4. **`sessions`**: End-to-end behavioral connection sessions (inter-arrival mean, stddev, coefficient of variation, periodicity score).
5. **`traffic_features`**: Multi-resolution feature vectors over 1s, 5s, 30s, and 60s windows (entropy, rates, ratios, deviations).
6. **`models`**: Versioned registry of ML models (`IsolationForest_NetAnomaly`, `RandomForest_SignatureEnsemble`, `EWMA_AdaptiveBaseline`, `Entropy_DNSTunnel_Classifier`).
7. **`alerts`**: High-confidence detection records with source IP, destination IP, detection engine, and risk score.
8. **`alert_evidence`**: Explainability evidence cards ("WHY WE FLAGGED THIS": observed vs baseline, deviation $\sigma$, and contribution %).
9. **`risk_scores`**: Time-series risk evolution per host with 6-component decomposition (packet, connection, session, ML, baseline, correlation).
10. **`campaigns`**: Correlated multi-host attack operations linking hosts and alerts over time.
11. **`campaign_members`**: Host role assignments (`infected_host`, `c2`, `destination`, `dns`, `source`).
12. **`graph_edges`**: Temporal attack graph edges (`COMMUNICATES_WITH`, `RESOLVES_TO`, `SIMILAR_BEHAVIOR`, `TRIGGERED`, `BEACONS_PERIODIC`).
13. **`dns_events`**: Dedicated DNS tunneling and DGA metrics (query length, label count, Shannon entropy, unique subdomain ratio).
14. **`audit_events`**: Cryptographically chained SHA-256 blockchain audit ledger guaranteeing immutable non-repudiation.

---

## Theme Fulfillment: Blockchain & Cybersecurity

To satisfy the **Blockchain & Cybersecurity** hackathon theme without imposing heavy computational overhead on real-time packet processing, MIRAGE implements a native **SHA-256 Chained Cryptographic Ledger**:
- Every detection, model inference, PCAP ingestion, and simulation run produces an immutable `AuditBlock`.
- Each block contains: `index`, `timestamp`, `event_type`, `actor`, `resource_id`, `action`, `metadata`, `previous_hash`, and `event_hash`.
- The **Forensics** view provides a one-click **"Verify Cryptographic Chain"** audit tool that traverses the entire ledger, recalculates every hash, and guarantees zero retroactive tampering.

---

## Getting Started

### Prerequisites
- Node.js 20+ and npm 10+
- Python 3.12+

### 1. Backend Setup & Local Run
```bash
cd backend
python -m venv .venv

# Windows Powershell
.venv\Scripts\Activate.ps1
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt

# Run Unit Test Suite (8/8 tests verifying isolation, EWMA, risk, and blockchain)
pytest tests/ -v

# Start FastAPI ASGI Server on Port 8000
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup & Run
```bash
# In the project root (mirage/)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **`/`**: Hero Landing Page with animated Three.js shader and architecture overview.
- **`/dashboard`**: Overview SOC dashboard with live metrics, threat stream, and risk leaderboard.
- **`/monitor`**: High-frequency traffic pulse, diode verification, and live packet stream.
- **`/threats`**: Detailed threat alerts with **Explainable Evidence Cards** ("WHY WE FLAGGED THIS").
- **`/hosts`**: Host Risk Leaderboard with EWMA adaptive baseline statistics and risk decomposition.
- **`/campaigns`**: Interactive visual Temporal Attack Graph (D3-inspired SVG node-edge canvas).
- **`/simulation`**: Cyber Range Laboratory to trigger `TRex`, `hping3`, `Slowloris`, `dnscat2`, `DGA`, and `C2` beaconing.
- **`/forensics`**: Blockchain cryptographic ledger verification and safe PCAP upload.
- **`/models`**: AI Model Registry tracking precision, recall, F1, and dataset provenance.

### 3. Docker Deployment (Optional Production Run)
```bash
docker-compose up --build
```
This launches air-gapped PostgreSQL 16 on a private network, the FastAPI backend container, and the Next.js frontend container.

---

## Test Verification Summary

- **Automated Tests:** `pytest backend/tests/ -v` executes 8 comprehensive unit tests:
  - `test_one_way_tap_isolation`: Verifies unidirectional write-only ingress and read-only consumption.
  - `test_bounded_queue_overflow_protection`: Verifies memory safety under saturation.
  - `test_shannon_entropy`: Verifies bit entropy computation for DNS tunnel detection.
  - `test_feature_extractor_sliding_window`: Verifies rolling multi-resolution metrics.
  - `test_adaptive_baseline_welford_convergence`: Verifies EWMA rolling mean and variance.
  - `test_risk_score_strict_bounds`: Verifies 0-100 clamping and exponential decay.
  - `test_blockchain_audit_ledger_integrity`: Verifies cryptographic hash chain and tamper detection.
  - `test_database_initialization`: Verifies auto-creation of all 14 tables and initial seed data.
- **Production Frontend Compilation:** `npm run build` generates all 14 App Router routes with static optimization and TypeScript checking.

---

## CodeRabbit AI Quality & Security Review

This repository is integrated with **CodeRabbit** for automated AI code reviews, security vulnerability scanning, and code health audits:

1. **Configuration**: Configured via [`.coderabbit.yaml`](.coderabbit.yaml) with custom review instructions enforcing:
   - Zero return path diode isolation in `backend/`.
   - PEP 8, strict type hints, and bounded queue sizes.
   - React 19 / Next.js 16 App Router best practices in `src/`.
   - Accessible animations with reduced motion fallbacks.
2. **GitHub Actions CI**: Automated in [`.github/workflows/coderabbit.yml`](.github/workflows/coderabbit.yml) which executes `npm run build`, `npm run lint`, and `pytest` on every commit and pull request.
3. **Connecting CodeRabbit**:
   - Go to [coderabbit.ai](https://coderabbit.ai) and sign in with your GitHub account.
   - Authorize CodeRabbit for this repository.
   - (Optional) Set the repository secret `CODERABBIT_API_KEY` in GitHub Settings > Secrets and Variables > Actions.
   - Every Pull Request will now automatically receive line-by-line security and performance review comments from CodeRabbit.

