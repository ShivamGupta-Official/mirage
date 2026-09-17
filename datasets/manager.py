"""Public Benchmark Dataset Manager.

Coordinates ingestion, schema reconciliation, and class balance reporting across all
5 public dataset groups:
1. Direct Merge (CICFlowMeter 80-feature schema):
   - CICIDS (2017 / 2018 / 2019)
   - TRUSTLab
   - CIRA-CIC-DoHBrw-2020 (dns2tcp, DNSCat2, Iodine)
2. Raw PCAP Re-extraction (via features.extractor.FlowExtractor):
   - CTU-13 & Stratosphere IPS Malware Capture Facility
   - ISOT Botnet
3. Different-Tool Diversity (Feature-by-name reconciliation):
   - UNSW-NB15 (IXIA PerfectStorm)
   - Bot-IoT & ToN_IoT (IoT testbeds)
   - NSL-KDD (Secondary baseline check)
4. Real-World Benign-Only Enrichment (Strict 'benign' ground-truth):
   - LANL Enterprise Multi-Source Events
   - UGR'16 ISP Backbone NetFlow
5. Domain-Level Enrichment (feeds Part 1 DGA resolution):
   - Bambenek OSINT & UMUDGA Domain Feeds

Logs row counts per class per source before training.
"""

import os
import sys
from typing import Dict, List, Optional, Tuple

import pandas as pd

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from datasets.aligner import align_to_canonical_schema
from datasets.benign_enrichment_loader import BenignEnrichmentLoader
from datasets.botnet_pcap_loader import BotnetPcapLoader
from datasets.cicids_loader import CicidsLoader
from datasets.cira_doh_loader import CiraDohLoader
from datasets.dga_feed_loader import DgaFeedLoader
from datasets.different_tools_loader import DifferentToolsLoader
from datasets.palau_dns_loader import PalauDnsLoader
from datasets.trustlab_loader import TrustlabLoader
from features.cic_schema import CANONICAL_CICIDS_COLUMNS, FEATURE_COLUMNS


def seed_benchmark_samples():
    """Generates canonical sample benchmarks for all dataset categories if raw downloads are pending."""
    # 1. CIRA-DoH
    cira_dir = "data/public/cira_doh"
    os.makedirs(cira_dir, exist_ok=True)
    cira_csv = os.path.join(cira_dir, "cira_doh_sample.csv")
    if not os.path.exists(cira_csv):
        rows = []
        for i in range(80):
            r = {feat: 0.0 for feat in FEATURE_COLUMNS}
            is_mal = i < 50
            r["Flow Duration"] = 800000.0 + i * 2000
            r["Total Fwd Packets"] = 12 if is_mal else 6
            r["Total Backward Packets"] = 10 if is_mal else 5
            r["Label"] = "dns2tcp" if i < 25 else "iodine" if i < 50 else "BenignDoH"
            rows.append(r)
        pd.DataFrame(rows).to_csv(cira_csv, index=False)

    # 2. UNSW-NB15 (IXIA PerfectStorm format)
    unsw_dir = "data/public/different_tools/unsw_nb15"
    os.makedirs(unsw_dir, exist_ok=True)
    unsw_csv = os.path.join(unsw_dir, "unsw_nb15_sample.csv")
    if not os.path.exists(unsw_csv):
        rows = []
        for i in range(80):
            rows.append({
                "dur": 0.45 + (i * 0.01),
                "spkts": 10 + (i % 5),
                "dpkts": 8 + (i % 4),
                "sbytes": 1024 + (i * 50),
                "dbytes": 800 + (i * 40),
                "rate": 40.0 + i,
                "sload": 18200.0,
                "smean": 102.4,
                "dmean": 100.0,
                "sinpkt": 45.0,
                "dinpkt": 50.0,
                "attack_cat": "DoS" if i < 30 else "Backdoor" if i < 50 else "Normal",
                "label": 1 if i < 50 else 0,
            })
        pd.DataFrame(rows).to_csv(unsw_csv, index=False)

    # 3. LANL Enterprise (Benign only)
    lanl_dir = "data/public/benign_enrichment/lanl"
    os.makedirs(lanl_dir, exist_ok=True)
    lanl_csv = os.path.join(lanl_dir, "lanl_enterprise_sample.csv")
    if not os.path.exists(lanl_csv):
        rows = []
        for i in range(60):
            r = {feat: 0.0 for feat in FEATURE_COLUMNS}
            r["Flow Duration"] = 15000000.0 + i * 10000  # Long duration enterprise session
            r["Total Fwd Packets"] = 40 + i
            r["Total Backward Packets"] = 38 + i
            r["Label"] = "Normal_Auth"  # Will be mapped to 'benign'
            rows.append(r)
        pd.DataFrame(rows).to_csv(lanl_csv, index=False)

    # 4. UGR'16 ISP Backbone (Benign only)
    ugr_dir = "data/public/benign_enrichment/ugr16"
    os.makedirs(ugr_dir, exist_ok=True)
    ugr_csv = os.path.join(ugr_dir, "ugr16_backbone_sample.csv")
    if not os.path.exists(ugr_csv):
        rows = []
        for i in range(60):
            r = {feat: 0.0 for feat in FEATURE_COLUMNS}
            r["Flow Duration"] = 30000000.0 + i * 50000  # ISP transit session
            r["Total Fwd Packets"] = 120 + i
            r["Total Backward Packets"] = 115 + i
            r["Label"] = "ISP_Transit"  # Will be mapped to 'benign'
            rows.append(r)
        pd.DataFrame(rows).to_csv(ugr_csv, index=False)

    # 5. Existing samples (CICIDS, TRUSTLab, Palau)
    os.makedirs("data/public/cicids", exist_ok=True)
    os.makedirs("data/public/trustlab", exist_ok=True)
    os.makedirs("data/public/palau_dns", exist_ok=True)
    if not os.path.exists("data/public/cicids/cicids2017_sample.csv"):
        rows = []
        for lbl in ["benign", "syn_flood", "udp_flood", "slowloris"]:
            for i in range(50):
                row = {feat: 0.0 for feat in FEATURE_COLUMNS}
                row["Flow Duration"] = 500000.0 + i * 1000
                row["Total Fwd Packets"] = 10 if lbl == "benign" else (1 if "flood" in lbl else 25)
                row["Total Backward Packets"] = 8 if lbl == "benign" else (0 if "flood" in lbl else 20)
                row["Label"] = lbl
                rows.append(row)
        pd.DataFrame(rows).to_csv("data/public/cicids/cicids2017_sample.csv", index=False)

    if not os.path.exists("data/public/trustlab/trustlab_sample.csv"):
        rows = []
        for lbl in ["slowloris", "c2_beacon", "benign"]:
            for i in range(40):
                row = {feat: 0.0 for feat in FEATURE_COLUMNS}
                row["Flow Duration"] = 12000000.0 + i * 5000
                row["Total Fwd Packets"] = 15
                row["Total Backward Packets"] = 12
                row["Label"] = lbl
                rows.append(row)
        pd.DataFrame(rows).to_csv("data/public/trustlab/trustlab_sample.csv", index=False)

    if not os.path.exists("data/public/palau_dns/palau_sample.csv"):
        rows = []
        for i in range(60):
            row = {feat: 0.0 for feat in FEATURE_COLUMNS}
            row["Flow Duration"] = 250000.0 + i * 500
            row["Total Fwd Packets"] = 5 + (i % 10)
            row["Total Backward Packets"] = 5 + (i % 10)
            row["tool_code"] = "dnscat2" if i < 40 else "0"
            rows.append(row)
        pd.DataFrame(rows).to_csv("data/public/palau_dns/palau_sample.csv", index=False)


class DatasetManager:
    """Orchestrates loading across all public benchmark dataset tiers."""

    def __init__(self):
        self.cicids_loader = CicidsLoader()
        self.trustlab_loader = TrustlabLoader()
        self.cira_doh_loader = CiraDohLoader()
        self.botnet_loader = BotnetPcapLoader()
        self.different_tools_loader = DifferentToolsLoader()
        self.benign_loader = BenignEnrichmentLoader()
        self.palau_loader = PalauDnsLoader()
        self.dga_loader = DgaFeedLoader()

        seed_benchmark_samples()

    def load_all_public_datasets(self) -> Dict[str, pd.DataFrame]:
        """Loads all available public benchmark datasets aligned into canonical schema."""
        datasets = {}

        # 1. Direct Merge: CICIDS2017/2018/2019
        df_cicids = self.cicids_loader.load_dataset(source_name="cicids2017")
        if len(df_cicids) > 0:
            datasets["cicids2017"] = df_cicids

        # 2. Direct Merge: TRUSTLab
        df_trustlab = self.trustlab_loader.load_dataset()
        if len(df_trustlab) > 0:
            datasets["trustlab"] = df_trustlab

        # 3. Direct / Re-extracted: CIRA-CIC-DoHBrw-2020 (dns2tcp, DNSCat2, Iodine)
        df_cira = self.cira_doh_loader.load_dataset()
        if len(df_cira) > 0:
            datasets["cira_doh"] = df_cira

        # 4. PCAP Re-extraction: CTU-13 / Stratosphere / ISOT
        df_botnet = self.botnet_loader.load_and_extract(source_name="ctu13")
        if len(df_botnet) > 0:
            datasets["ctu13"] = df_botnet

        # 5. Palau DNS Tunneling
        df_palau = self.palau_loader.load_dataset()
        if len(df_palau) > 0:
            datasets["palau_dns"] = df_palau

        # 6. Different-Tool Diversity: UNSW-NB15 (IXIA toolchain)
        df_unsw = self.different_tools_loader.load_unsw_nb15()
        if len(df_unsw) > 0:
            datasets["unsw_nb15"] = df_unsw

        # 7. Real-World Benign-Only Enrichment: LANL Enterprise
        df_lanl = self.benign_loader.load_lanl_enterprise()
        if len(df_lanl) > 0:
            datasets["lanl_enterprise"] = df_lanl

        # 8. Real-World Benign-Only Enrichment: UGR'16 ISP Backbone
        df_ugr = self.benign_loader.load_ugr16_backbone()
        if len(df_ugr) > 0:
            datasets["ugr16_backbone"] = df_ugr

        # 9. Domain-level enrichment (Bambenek OSINT & UMUDGA)
        _ = self.dga_loader.fetch_open_feed()

        return datasets

    def log_dataset_breakdown(self, datasets: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Logs and prints row counts per class per source to visualize class balance."""
        records = []
        for src, df in datasets.items():
            if "Label" in df.columns:
                counts = df["Label"].value_counts()
                for lbl, cnt in counts.items():
                    records.append({"Source": src, "Class": lbl, "Rows": cnt})

        summary_df = pd.DataFrame(records)
        print("\n" + "=" * 95)
        print("  [DATASET INGESTION & CLASS BALANCE TELEMETRY]")
        print("=" * 95)

        pivot = summary_df.pivot_table(index="Class", columns="Source", values="Rows", fill_value=0, aggfunc="sum")
        pivot["TOTAL"] = pivot.sum(axis=1)
        print(pivot.to_string())
        print("=" * 95)

        return summary_df


def main():
    manager = DatasetManager()
    datasets = manager.load_all_public_datasets()
    manager.log_dataset_breakdown(datasets)


if __name__ == "__main__":
    main()
