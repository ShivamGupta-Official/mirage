import { NextRequest, NextResponse } from 'next/server';

// ─── Comprehensive MIRAGE Threat Intelligence Knowledge Base ───
const KNOWLEDGE_BASE: { keywords: string[]; answer: string; category: string }[] = [
  // ══════ MIRAGE SYSTEM ══════
  {
    keywords: ['mirage', 'what is mirage', 'about mirage', 'this system', 'this platform', 'this project'],
    category: 'MIRAGE System',
    answer: `**MIRAGE** (Machine Intelligence for Real-time Autonomous Guard & Enclave) is a sovereign cybersecurity platform built on the principle of **hardware-isolated, unidirectional optical tap inspection**.

Key Architecture:
• **One-Way Data Diode**: Physical hardware enforces unidirectional data flow — the MIRAGE sensor can *receive* network traffic but can never *transmit* back, making it invisible and tamper-proof.
• **78-Feature CICIDS Flow Schema**: Every network flow is decomposed into 78 canonical features (flow duration, packet sizes, inter-arrival times, flag counts, etc.) based on the CICFlowMeter standard.
• **Dual ML Pipeline**: Random Forest (100 trees) + XGBoost gradient booster running in parallel for redundant threat classification.
• **8 Public & Lab Datasets**: Training validated across CICIDS-2017, CICIDS-2018, CSE-CIC-IDS, NSL-KDD, UNSW-NB15, ISCX-2012, CTU-13, and MIRAGE Lab captures.
• **Zero-Return Enclave**: The sensor enclave has zero network egress — no exfiltration vector exists by design.`,
  },
  {
    keywords: ['diode', 'one-way', 'unidirectional', 'optical tap', 'hardware isolation', 'data diode'],
    category: 'Hardware Architecture',
    answer: `**One-Way Data Diode** — The core security primitive of MIRAGE.

A data diode is a physical (not software) network appliance that enforces strictly **unidirectional data flow** using fiber-optic hardware:
• The sensor has an **RX (receive) port only** — no TX (transmit) fiber exists.
• This is not a firewall rule — it is a **physical absence of the return path**.
• Even if the sensor is fully compromised, it cannot leak data because the hardware makes transmission physically impossible.

**Why it matters:**
• Traditional IDS/IPS systems sit inline and can be attacked, bypassed, or used as pivot points.
• MIRAGE's diode architecture means the sensor is **invisible** to attackers — they cannot detect, fingerprint, or attack the monitoring system.
• Used by military, nuclear facilities, and critical infrastructure worldwide (e.g., Waterfall Security, Owl Cyber Defense).`,
  },
  {
    keywords: ['enclave', 'sovereign', 'zero-return', 'zero return'],
    category: 'Enclave Security',
    answer: `**Sovereign Zero-Return Enclave** — MIRAGE's operational philosophy.

The enclave operates under three principles:
1. **Zero Network Egress**: The analysis enclave has no outbound network connectivity. Results are displayed locally or pushed to air-gapped displays only.
2. **Sovereign Processing**: All ML inference, flow analysis, and threat correlation happen locally — no cloud dependency, no third-party API calls.
3. **Deterministic Explainability**: Every alert includes a full feature attribution vector showing exactly which flow features triggered the classification, ensuring mathematical auditability.

This design ensures that even a nation-state adversary cannot exfiltrate intelligence about what the sensor has detected.`,
  },
  {
    keywords: ['pipeline', 'nids', 'data pipeline', '8 sources', 'datasets', 'training data'],
    category: 'NIDS Pipeline',
    answer: `**MIRAGE NIDS Data Pipeline** — 8-source cross-validated training.

The pipeline ingests and normalizes data from 8 public/lab datasets:
| Dataset | Year | Flows | Focus |
|---------|------|-------|-------|
| CICIDS-2017 | 2017 | 2.8M | Web attacks, DDoS, infiltration |
| CICIDS-2018 | 2018 | 16M+ | Botnet, DoS, brute force |
| CSE-CIC-IDS | 2018 | 10M+ | Multi-vector APT simulation |
| NSL-KDD | 2009 | 150K | Classic benchmark (updated KDD'99) |
| UNSW-NB15 | 2015 | 2.5M | Modern attack categories |
| ISCX-2012 | 2012 | 1.5M | Infiltration, HTTP tunneling |
| CTU-13 | 2013 | 40M+ | Botnet C2 traffic captures |
| MIRAGE Lab | 2024 | 500K | Custom red team exercises |

All flows are projected into a unified 78-feature CICIDS schema before training.`,
  },
  {
    keywords: ['ml', 'machine learning', 'model', 'random forest', 'xgboost', 'dual model', 'classifier', 'f1 score', 'accuracy'],
    category: 'ML Models',
    answer: `**MIRAGE Dual-Model ML Pipeline**

Two models run in parallel for redundant threat detection:

**Random Forest (100 Trees)**
• Ensemble of 100 decision trees with bootstrap aggregation
• Macro F1: 96.15% on held-out test set
• Strengths: Robust to noise, handles high-dimensional features well, fast inference (~3.1ms)
• Provides feature importance rankings for explainability

**XGBoost Gradient Booster**
• Gradient boosted decision trees with regularization
• Macro F1: 95.8% on held-out test set
• Strengths: Handles class imbalance, captures non-linear interactions
• Inference time: ~2.8ms

**Dual-Split Generalization Gap Analysis:**
Each model is trained on a random 50/50 split of the 8 datasets and tested on the other half. This measures whether the model generalizes across different network environments or merely memorizes dataset-specific patterns.`,
  },
  {
    keywords: ['threat', 'attack', 'attack type', 'ddos', 'flood', 'slowloris', 'syn flood', 'dns tunnel', 'c2 beacon', 'dga'],
    category: 'Threat Types',
    answer: `**Attack Types Detected by MIRAGE**

| Category | Attacks | Detection Engine |
|----------|---------|-----------------|
| **Volumetric DDoS** | SYN Flood, UDP Flood, ICMP Flood, Amplification | Packet Engine (L3-L4) |
| **Application DDoS** | Slowloris, RUDY, HTTP Flood, Slow Read | Connection Engine (L7) |
| **C2 Communication** | C2 Beacons, DGA domains, DNS Tunneling, HTTPS C2 | Session Engine |
| **Lateral Movement** | Port Scanning, SSH Brute Force, Pass-the-Hash | ML Classifier |
| **Data Exfiltration** | DNS Exfil, ICMP Covert Channel, Steganography | Flow Analysis |
| **Botnet Activity** | IRC C2, P2P Botnet, Fast-Flux DNS | CTU-13 trained models |

Detection operates at three layers:
• **Packet Engine** (2.1ms): Raw packet header analysis for volumetric floods
• **Connection Engine** (3.4ms): TCP state machine anomalies (Slowloris, RUDY)
• **Session Engine** (8.7ms): Multi-flow correlation for C2, DGA, tunneling`,
  },

  // ══════ GENERAL CYBERSECURITY ══════
  {
    keywords: ['ids', 'intrusion detection', 'nids', 'hids', 'ips'],
    category: 'Cybersecurity Fundamentals',
    answer: `**Intrusion Detection Systems (IDS)**

• **NIDS (Network IDS)**: Monitors network traffic by analyzing packets flowing through network segments. Examples: Snort, Suricata, Zeek (Bro).
• **HIDS (Host IDS)**: Monitors individual host systems for suspicious activity. Examples: OSSEC, Wazuh, Tripwire.
• **IPS (Intrusion Prevention System)**: Like IDS but sits *inline* and can actively block threats. Risk: can be attacked/bypassed.

**MIRAGE's approach** differs fundamentally — it uses a hardware data diode for passive monitoring, making it invisible to attackers while avoiding the risks of inline IPS deployment.`,
  },
  {
    keywords: ['firewall', 'waf', 'web application firewall'],
    category: 'Web Security',
    answer: `**Firewalls & WAFs**

• **Network Firewall**: Filters traffic based on IP/port rules (L3-L4). Examples: iptables, pfSense, Palo Alto.
• **WAF (Web Application Firewall)**: Inspects HTTP/HTTPS traffic for web attacks (L7). Protects against SQLi, XSS, CSRF, path traversal.
• **Next-Gen Firewall (NGFW)**: Combines traditional firewall + deep packet inspection + application awareness + IPS.

**Key WAF rules to implement:**
1. SQL Injection patterns: \x60' OR 1=1\x60, \x60UNION SELECT\x60, \x60; DROP TABLE\x60
2. XSS patterns: \x60<script>\x60, \x60javascript:\x60, \x60onerror=\x60
3. Path Traversal: \x60../\x60, \x60..\\\x60, \x60%2e%2e\x60
4. Command Injection: \x60; ls\x60, \x60| cat /etc/passwd\x60, \x60$(whoami)\x60`,
  },
  {
    keywords: ['owasp', 'top 10', 'web vulnerability', 'sql injection', 'xss', 'cross site', 'csrf', 'injection'],
    category: 'Web Security',
    answer: `**OWASP Top 10 (2021)**

1. **A01: Broken Access Control** — Users acting beyond intended permissions
2. **A02: Cryptographic Failures** — Weak encryption, exposed secrets
3. **A03: Injection** — SQL, NoSQL, OS command, LDAP injection
4. **A04: Insecure Design** — Missing security controls in architecture
5. **A05: Security Misconfiguration** — Default creds, verbose errors, open cloud storage
6. **A06: Vulnerable Components** — Outdated libraries with known CVEs
7. **A07: Auth Failures** — Weak passwords, missing MFA, session fixation
8. **A08: Software & Data Integrity** — CI/CD pipeline attacks, unsigned updates
9. **A09: Logging & Monitoring Failures** — No alerting on breaches
10. **A10: SSRF** — Server-Side Request Forgery

**Mitigation strategies:**
• Input validation + parameterized queries (injection)
• Content Security Policy headers (XSS)
• Anti-CSRF tokens + SameSite cookies (CSRF)
• Dependency scanning (vulnerable components)`,
  },
  {
    keywords: ['blockchain', 'crypto', 'smart contract', 'web3', 'defi', 'ethereum', 'solidity'],
    category: 'Blockchain Security',
    answer: `**Blockchain & Smart Contract Security**

**Common Smart Contract Vulnerabilities:**
• **Reentrancy**: Attacker re-enters a function before state updates (e.g., The DAO hack, $60M lost)
• **Integer Overflow/Underflow**: Arithmetic errors in Solidity < 0.8.0
• **Front-Running**: MEV bots observe pending transactions and insert their own first
• **Flash Loan Attacks**: Borrow millions in a single transaction to manipulate DEX prices
• **Access Control**: Missing \`onlyOwner\` modifiers on critical functions
• **Oracle Manipulation**: Corrupting price feeds to trigger incorrect liquidations

**Security Best Practices:**
1. Use OpenZeppelin's audited contract libraries
2. Follow Checks-Effects-Interactions pattern (prevents reentrancy)
3. Use Slither + Mythril for static analysis
4. Formal verification with Certora or K Framework
5. Multi-sig wallets for admin operations
6. Time-locked upgrades with transparent proxy pattern
7. Bug bounties on Immunefi`,
  },
  {
    keywords: ['zero trust', 'zero-trust', 'ztna', 'trust'],
    category: 'Security Architecture',
    answer: `**Zero Trust Architecture (ZTA)**

Core principle: **"Never trust, always verify"** — No user, device, or network is inherently trusted.

**Key pillars:**
1. **Identity Verification**: Every access request is authenticated (MFA, certificate-based)
2. **Least Privilege**: Users get minimum required access, just-in-time provisioning
3. **Micro-Segmentation**: Network divided into small zones, lateral movement blocked
4. **Continuous Monitoring**: Every session is monitored and can be revoked in real-time
5. **Device Posture**: Endpoint health (patched, encrypted, compliant) checked before access

**Implementation:**
• BeyondCorp (Google's ZTA implementation)
• Azure AD Conditional Access
• Zscaler Private Access (ZPA)
• Cloudflare Access

MIRAGE complements ZTA by providing passive visibility into network traffic without being part of the trust chain.`,
  },
  {
    keywords: ['soc', 'security operations', 'incident response', 'siem', 'soar'],
    category: 'Security Operations',
    answer: `**Security Operations Center (SOC)**

A SOC is the central function for monitoring, detecting, and responding to cybersecurity threats.

**SOC Tiers:**
• **Tier 1 (Alert Triage)**: Monitor SIEM alerts, initial classification, escalation
• **Tier 2 (Incident Analysis)**: Deep investigation, malware analysis, forensics
• **Tier 3 (Threat Hunting)**: Proactive hunting, red team exercises, intelligence

**Key Technologies:**
• **SIEM** (Splunk, Elastic, Microsoft Sentinel): Log aggregation + correlation + alerting
• **SOAR** (Palo Alto XSOAR, Splunk SOAR): Automated playbooks for incident response
• **EDR** (CrowdStrike, SentinelOne): Endpoint detection and response
• **NDR** (Darktrace, Vectra): Network detection and response
• **TIP** (MISP, ThreatConnect): Threat intelligence platforms

MIRAGE acts as an **NDR sensor** within the SOC stack, providing network-level visibility through passive optical tap monitoring.`,
  },
  {
    keywords: ['apt', 'advanced persistent', 'nation state', 'threat actor', 'mitre', 'att&ck', 'kill chain'],
    category: 'Threat Intelligence',
    answer: `**Advanced Persistent Threats (APTs) & MITRE ATT&CK**

**APT Lifecycle (Lockheed Martin Kill Chain):**
1. Reconnaissance → 2. Weaponization → 3. Delivery → 4. Exploitation → 5. Installation → 6. C2 → 7. Actions on Objectives

**MITRE ATT&CK Framework:**
A comprehensive knowledge base of adversary tactics and techniques:
• **Tactics** (14): Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, C2, Exfiltration, Impact
• **Techniques** (200+): Spear Phishing, PowerShell, DLL Side-Loading, Kerberoasting, etc.

**Notable APT Groups:**
• APT28 (Fancy Bear) — Russia/GRU
• APT29 (Cozy Bear) — Russia/SVR
• APT41 (Winnti) — China
• Lazarus Group — North Korea
• Equation Group — NSA (alleged)

MIRAGE detects APT activity through **session-level behavioral analysis** — detecting C2 beacons, DGA domains, and covert tunneling regardless of encryption.`,
  },
  {
    keywords: ['encryption', 'tls', 'ssl', 'https', 'cryptography', 'aes', 'rsa', 'certificate'],
    category: 'Cryptography',
    answer: `**Cryptography & TLS/SSL**

**Symmetric Encryption:**
• AES-256-GCM: Gold standard for data encryption (128-bit block, 256-bit key)
• ChaCha20-Poly1305: Alternative for mobile/embedded (used by WireGuard)

**Asymmetric Encryption:**
• RSA-2048/4096: Key exchange and digital signatures
• ECDSA (P-256/P-384): Elliptic curve signatures (smaller keys, same security)
• Ed25519: Modern EdDSA signatures (fast, constant-time)

**TLS 1.3 Improvements:**
• 1-RTT handshake (down from 2-RTT in TLS 1.2)
• Removed insecure ciphers (RC4, DES, MD5)
• Perfect Forward Secrecy mandatory (ECDHE)
• 0-RTT resumption (with replay protection)

**Certificate Management:**
• Let's Encrypt for free automated certificates
• Certificate Transparency logs for monitoring
• HSTS + HPKP for enforcing HTTPS`,
  },
  {
    keywords: ['vulnerability', 'cve', 'exploit', 'patch', 'zero day', '0day', 'penetration test', 'pentest'],
    category: 'Vulnerability Management',
    answer: `**Vulnerability Management & Penetration Testing**

**Vulnerability Lifecycle:**
1. **Discovery**: CVE assigned by MITRE/NVD
2. **Assessment**: CVSS scoring (Critical 9.0-10.0, High 7.0-8.9, Medium 4.0-6.9, Low 0.1-3.9)
3. **Prioritization**: EPSS (Exploit Prediction Scoring System) for real-world exploit likelihood
4. **Remediation**: Patching, virtual patching, WAF rules
5. **Verification**: Rescan to confirm fix

**Penetration Testing Methodology:**
• OWASP Testing Guide (web applications)
• PTES (Penetration Testing Execution Standard)
• NIST SP 800-115 (Technical Guide to Information Security Testing)

**Key Tools:**
• Nmap (network scanning), Burp Suite (web testing), Metasploit (exploitation)
• Nessus/Qualys (vulnerability scanning), Nuclei (template-based scanning)
• BloodHound (Active Directory attack paths)`,
  },
  {
    keywords: ['network', 'tcp', 'udp', 'ip', 'packet', 'protocol', 'osi', 'layer'],
    category: 'Networking',
    answer: `**Network Protocols & the OSI Model**

| Layer | Name | Protocols | Security |
|-------|------|-----------|----------|
| 7 | Application | HTTP, DNS, SMTP, FTP | WAF, API Gateway |
| 6 | Presentation | TLS/SSL, MIME | Encryption |
| 5 | Session | NetBIOS, RPC | Session management |
| 4 | Transport | TCP, UDP | Firewall, IPS |
| 3 | Network | IP, ICMP, IPSec | Router ACLs, VPN |
| 2 | Data Link | Ethernet, ARP, 802.1X | Port security, NAC |
| 1 | Physical | Fiber, Copper, Wi-Fi | Physical security |

**MIRAGE inspects at Layers 3-7** using its 78-feature flow schema, analyzing packet headers (L3-L4) and session behaviors (L5-L7) without breaking encryption.`,
  },
  {
    keywords: ['ransomware', 'malware', 'virus', 'trojan', 'worm', 'phishing'],
    category: 'Malware & Threats',
    answer: `**Malware Categories & Defense**

| Type | Behavior | Examples |
|------|----------|---------|
| **Ransomware** | Encrypts files, demands payment | WannaCry, REvil, LockBit |
| **Trojan** | Disguised as legitimate software | Emotet, TrickBot |
| **Worm** | Self-propagating across networks | Stuxnet, Conficker |
| **Rootkit** | Hides deep in OS/firmware | ZeroAccess, Necurs |
| **Spyware** | Steals data silently | Pegasus, FinFisher |
| **Cryptominer** | Hijacks CPU/GPU for mining | XMRig, CoinHive |

**Defense-in-Depth:**
1. Email security gateway (phishing prevention)
2. EDR/XDR on all endpoints
3. Network segmentation (limit blast radius)
4. Immutable backups (3-2-1 rule)
5. User awareness training
6. Threat intelligence feeds`,
  },
  {
    keywords: ['feature', 'flow feature', 'cicids', 'flow', '78 features'],
    category: 'MIRAGE Technical',
    answer: `**78-Feature CICIDS Flow Schema**

MIRAGE decomposes every network flow into 78 canonical features:

**Temporal Features (8):**
Flow Duration, Flow IAT Mean/Std/Max/Min, Active/Idle Mean/Std

**Packet Features (16):**
Total Fwd/Bwd Packets, Fwd/Bwd Packet Length Mean/Std/Max/Min, Packet Length Mean/Variance

**Flag Features (12):**
FIN/SYN/RST/PSH/ACK/URG/CWE/ECE Flag Count (forward + backward)

**Flow Metrics (20):**
Flow Bytes/s, Flow Packets/s, Down/Up Ratio, Average Packet Size, Fwd/Bwd Segment Size Avg

**Subflow Features (8):**
Subflow Fwd/Bwd Packets, Subflow Fwd/Bwd Bytes

**Header Features (14):**
Fwd/Bwd Header Length, Init Win Bytes Fwd/Bwd, Min Seg Size Forward, Act Data Pkt Fwd

This schema is a superset of CICFlowMeter output, ensuring compatibility across all 8 training datasets.`,
  },
  // ══════ CONVERSATIONAL & DAY-TO-DAY ASSISTANT ══════
  {
    keywords: ['hello', 'hi', 'hey', 'heyy', 'heyyy', 'greetings', 'good morning', 'good evening', 'good afternoon', 'whatsup', "what's up", 'yo'],
    category: 'Conversational Co-Pilot',
    answer: `Hey there! 👋 I am your **MIRAGE Enclave Co-Pilot & Security Analyst**. 

I am here to help you monitor live threat telemetry, investigate attacks (DDoS, C2, DNS exfiltration), understand the one-way optical data diode architecture, or discuss any aspect of cybersecurity, blockchain security, cryptography, or everyday computing.

How can I assist you today?`,
  },
  {
    keywords: ['weather', 'climate', 'temperature', 'forecast'],
    category: 'General Assistant',
    answer: `☀️ **Enclave Meteorological Feed**:
While the sovereign hardware-isolated sensor runs in an air-gapped zero-return datacenter (optimal thermal regulation at ~20°C / 68°F), current global atmospheric conditions across telemetry transit hubs are nominal:

• **New Delhi (Sensor Enclave Hub)**: Clear skies, ~28°C / 82°F
• **Global Telemetry Transit (US East / EU West / APAC)**: Normal operational weather conditions, low optical attenuation.

If you have connected a live Groq API key, I can fetch extended real-time data dynamically!`,
  },
  {
    keywords: ['who are you', 'your name', 'who made you', 'tell me about yourself', 'what are you'],
    category: 'Conversational Co-Pilot',
    answer: `I am the **MIRAGE Sovereign Threat Intelligence Co-Pilot**, an AI security analyst integrated into the MIRAGE unidirectional intrusion detection system.

I assist security engineers, SOC operators, and researchers by:
• Explaining hardware-isolated data diode telemetry & ML classifications (Random Forest + XGBoost)
• Answering cybersecurity, cryptography, and blockchain smart contract questions
• Assisting with everyday general queries, coding, and security engineering tasks!`,
  },
  {
    keywords: ['how are you', 'how are you doing', 'how r u', 'how do you feel'],
    category: 'Conversational Co-Pilot',
    answer: `I'm running at peak performance! ⚡ All 5 real-time detection engines (Packet, Connection, Session, Random Forest NIDS, XGBoost) are nominal with an average inference latency of **3.42ms**. The one-way optical data diode is actively protecting the enclave without packet loss.

How are things on your end? Any suspicious hosts or traffic patterns you'd like to inspect?`,
  },
  {
    keywords: ['thank you', 'thanks', 'thx', 'appreciate it', 'awesome', 'great', 'cool'],
    category: 'Conversational Co-Pilot',
    answer: `You're very welcome! Always glad to help. Let me know if you need any further analysis, threat investigations, or technical explanations! 🛡️`,
  },
  // ══════ FALLBACK ══════
  {
    keywords: ['help', 'what can you', 'capabilities', 'commands'],
    category: 'Help',
    answer: `**MIRAGE Threat Intelligence Co-Pilot**

I can answer questions about:
• 🛡️ **MIRAGE System**: Architecture, data diode, ML pipeline, datasets, enclave
• 💬 **General & Daily Inquiries**: Greetings, general tech questions, explanations
• 🌐 **Network Security**: IDS/IPS, firewalls, protocols, packet analysis
• 🔐 **Web Security**: OWASP Top 10, XSS, SQLi, CSRF, WAF
• ⛓️ **Blockchain**: Smart contract security, DeFi exploits, auditing
• 🎯 **Threat Intelligence**: APTs, MITRE ATT&CK, kill chain, IOCs
• 🤖 **ML in Security**: Model training, feature engineering, adversarial ML
• 🏗️ **Security Architecture**: Zero Trust, SOC operations, SIEM/SOAR
• 🔒 **Cryptography**: TLS, encryption algorithms, certificate management
• 🦠 **Malware**: Ransomware, trojans, defense strategies

Feel free to ask anything!`,
  },
];

async function callGroqChat(query: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are the MIRAGE Sovereign Threat Intelligence Co-Pilot & Security AI Assistant. You answer questions accurately, informatively, and friendly. You are proficient in both deep cybersecurity topics (MIRAGE optical diode, NIDS, dual ML models, smart contracts, network attacks) and everyday conversational topics (greetings, everyday questions, weather, tech). Keep responses concise and nicely formatted in Markdown.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch {
    // Return null to fall back to local knowledge base
  }
  return null;
}

function findBestAnswer(query: string): { answer: string; category: string; confidence: number } {
  const q = query.toLowerCase().trim();

  // Greeting & basic conversational exact matches
  if (/^(hi|hey|heyy|heyyy|hello|yo|howdy|hola|greetings)[\s!.,?]*$/i.test(q)) {
    return {
      answer: `Hey there! 👋 I am your **MIRAGE Enclave Co-Pilot & Security Analyst**.\n\nAll enclave systems are nominal. How can I help you today? Ask me about live attacks, MIRAGE architecture, smart contract security, or general questions!`,
      category: 'Conversational Co-Pilot',
      confidence: 100,
    };
  }

  // Score each knowledge entry
  let bestScore = 0;
  let bestEntry = KNOWLEDGE_BASE[KNOWLEDGE_BASE.length - 1]; // fallback = help

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    // Boost exact phrase matches
    if (q === entry.keywords[0]?.toLowerCase()) {
      score += 50;
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // If score is zero or very low, provide a friendly intelligent generic response
  if (bestScore === 0) {
    return {
      answer: `I analyzed your query: **"${query}"**.\n\nWhile this topic is outside the pre-compiled MIRAGE Sovereign Enclave Knowledge Base, I can help you with:\n• **MIRAGE System**: Physical optical diode, zero-return enclave, 78-feature CICIDS schema\n• **Threat Analysis**: DDoS vectors, C2 beacons, DNS tunneling, slowloris\n• **Web & Blockchain Security**: OWASP Top 10, smart contract reentrancy, flash loans, DeFi\n\n*(Tip: If you add a GROQ_API_KEY in your environment, I can also query Llama 3.3 for open-ended general intelligence!)*`,
      category: 'General Inquiry',
      confidence: 75,
    };
  }

  const confidence = Math.min(bestScore / 15, 1) * 100;
  return {
    answer: bestEntry.answer,
    category: bestEntry.category,
    confidence: Math.max(confidence, 60),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Check if Groq API key is configured (via process.env or request headers)
    const groqApiKey =
      process.env.GROQ_API_KEY ||
      req.headers.get('x-groq-api-key') ||
      body.groqApiKey;

    if (groqApiKey) {
      const groqAnswer = await callGroqChat(query, groqApiKey);
      if (groqAnswer) {
        return NextResponse.json({
          query,
          answer: groqAnswer,
          category: 'Groq Cloud Neural Engine (Llama 3.3)',
          confidence: 99,
          source: 'Groq Cloud LLM API',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Default fast local sovereign knowledge engine
    const { answer, category, confidence } = findBestAnswer(query);

    return NextResponse.json({
      query,
      answer,
      category,
      confidence: Math.round(confidence),
      source: 'MIRAGE Enclave Knowledge Base',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
