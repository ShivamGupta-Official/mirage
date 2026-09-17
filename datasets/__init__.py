"""Datasets Package for Network Intrusion Detection Benchmark Alignment and Ingestion.

Provides dedicated loaders and aligners for public intrusion detection datasets:
1. Direct merge (CICFlowMeter-schema, 80 features):
   - CICIDS2017, CSE-CIC-IDS2018, CIC-DDoS2019
   - TRUSTLab (Slowloris & C2/beaconing classes)
   - CIRA-CIC-DoHBrw-2020 (dns2tcp, DNSCat2, Iodine)
2. Raw PCAP re-extraction:
   - CTU-13 & Stratosphere IPS Malware Capture Facility
   - ISOT Botnet
3. Different-tool diversity (feature-by-name alignment):
   - UNSW-NB15 (IXIA PerfectStorm)
   - Bot-IoT & ToN_IoT (IoT testbeds)
   - NSL-KDD (Secondary baseline check)
4. Real-world benign-only enrichment:
   - LANL Comprehensive Multi-Source Cyber-Security Events
   - UGR'16 ISP backbone NetFlow
5. Domain-level enrichment (not flow data):
   - Bambenek OSINT & UMUDGA Domain Feeds (Feeds Part 1 DGA resolution)
"""

from datasets.aligner import align_to_canonical_schema, map_to_canonical_label
from datasets.cicids_loader import CicidsLoader
from datasets.trustlab_loader import TrustlabLoader
from datasets.cira_doh_loader import CiraDohLoader
from datasets.botnet_pcap_loader import BotnetPcapLoader
from datasets.different_tools_loader import DifferentToolsLoader
from datasets.benign_enrichment_loader import BenignEnrichmentLoader
from datasets.palau_dns_loader import PalauDnsLoader
from datasets.dga_feed_loader import DgaFeedLoader
from datasets.manager import DatasetManager

__all__ = [
    "align_to_canonical_schema",
    "map_to_canonical_label",
    "CicidsLoader",
    "TrustlabLoader",
    "CiraDohLoader",
    "BotnetPcapLoader",
    "DifferentToolsLoader",
    "BenignEnrichmentLoader",
    "PalauDnsLoader",
    "DgaFeedLoader",
    "DatasetManager",
]
