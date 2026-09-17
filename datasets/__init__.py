"""Datasets Package for Network Intrusion Detection Benchmark Alignment and Ingestion.

Provides dedicated loaders and aligners for public intrusion detection datasets:
- CICIDS2017, CSE-CIC-IDS2018, CIC-DDoS2019 (Already CICFlowMeter-extracted CSVs)
- TRUSTLab Dataset (Already CICFlowMeter-extracted CSVs)
- CTU-13 and ISOT Botnet (Raw PCAPs requiring flow re-extraction)
- Palau et al. DNS Tunneling Dataset
- Bambenek & UMUDGA Domain Feeds (Domain-level enrichment for DGA generation)
"""

from datasets.aligner import align_to_canonical_schema, map_to_canonical_label
from datasets.cicids_loader import CicidsLoader
from datasets.trustlab_loader import TrustlabLoader
from datasets.botnet_pcap_loader import BotnetPcapLoader
from datasets.palau_dns_loader import PalauDnsLoader
from datasets.dga_feed_loader import DgaFeedLoader

__all__ = [
    "align_to_canonical_schema",
    "map_to_canonical_label",
    "CicidsLoader",
    "TrustlabLoader",
    "BotnetPcapLoader",
    "PalauDnsLoader",
    "DgaFeedLoader",
]
