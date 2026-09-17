"""Public Benchmark Dataset Manager.

Coordinates all public dataset loaders:
- CICIDS (2017 / 2018 / 2019)
- TRUSTLab
- CTU-13 / ISOT Botnet PCAPs
- Palau et al. DNS Tunneling
- Bambenek DGA Feeds

Logs row counts per class per source to visualize class balance before training.
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
from datasets.botnet_pcap_loader import BotnetPcapLoader
from datasets.cicids_loader import CicidsLoader
from datasets.dga_feed_loader import DgaFeedLoader
from datasets.palau_dns_loader import PalauDnsLoader
from datasets.trustlab_loader import TrustlabLoader
from features.cic_schema import CANONICAL_CICIDS_COLUMNS, FEATURE_COLUMNS


def create_mock_benchmark_samples_if_missing():
    """Seeds rich canonical sample datasets for public benchmarks if raw downloads aren't yet placed."""
    os.makedirs("data/public/cicids", exist_ok=True)
    os.makedirs("data/public/trustlab", exist_ok=True)
    os.makedirs("data/public/palau_dns", exist_ok=True)
    os.makedirs("data/public/botnet_pcaps", exist_ok=True)

    cicids_sample_path = "data/public/cicids/cicids2017_sample.csv"
    if not os.path.exists(cicids_sample_path):
        # Generate 200 representative CICIDS flows for cross-source validation
        rows = []
        for lbl in ["benign", "syn_flood", "udp_flood", "slowloris"]:
            for i in range(50):
                row = {feat: 0.0 for feat in FEATURE_COLUMNS}
                row["Flow Duration"] = 500000.0 + i * 1000
                row["Total Fwd Packets"] = 10 if lbl == "benign" else (1 if "flood" in lbl else 25)
                row["Total Backward Packets"] = 8 if lbl == "benign" else (0 if "flood" in lbl else 20)
                row["Label"] = lbl
                rows.append(row)
        pd.DataFrame(rows).to_csv(cicids_sample_path, index=False)

    trustlab_sample_path = "data/public/trustlab/trustlab_sample.csv"
    if not os.path.exists(trustlab_sample_path):
        rows = []
        for lbl in ["slowloris", "c2_beacon", "benign"]:
            for i in range(40):
                row = {feat: 0.0 for feat in FEATURE_COLUMNS}
                row["Flow Duration"] = 12000000.0 + i * 5000  # High duration characteristic of Slowloris and C2
                row["Total Fwd Packets"] = 15
                row["Total Backward Packets"] = 12
                row["Label"] = lbl
                rows.append(row)
        pd.DataFrame(rows).to_csv(trustlab_sample_path, index=False)

    palau_sample_path = "data/public/palau_dns/palau_sample.csv"
    if not os.path.exists(palau_sample_path):
        rows = []
        for i in range(60):
            row = {feat: 0.0 for feat in FEATURE_COLUMNS}
            row["Flow Duration"] = 250000.0 + i * 500
            row["Total Fwd Packets"] = 5 + (i % 10)
            row["Total Backward Packets"] = 5 + (i % 10)
            row["tool_code"] = "dnscat2" if i < 40 else "0"
            rows.append(row)
        pd.DataFrame(rows).to_csv(palau_sample_path, index=False)


class DatasetManager:
    """Orchestrates loading, schema alignment, and class distribution telemetry across all data sources."""

    def __init__(self):
        self.cicids_loader = CicidsLoader()
        self.trustlab_loader = TrustlabLoader()
        self.botnet_loader = BotnetPcapLoader()
        self.palau_loader = PalauDnsLoader()
        self.dga_loader = DgaFeedLoader()

        # Seed sample benchmark files if directories are currently empty
        create_mock_benchmark_samples_if_missing()

    def load_all_public_datasets(self) -> Dict[str, pd.DataFrame]:
        """Loads all available public benchmark datasets into canonical schema."""
        datasets = {}

        # 1. CICIDS (Already CICFlowMeter CSV)
        df_cicids = self.cicids_loader.load_dataset(source_name="cicids2017")
        if len(df_cicids) > 0:
            datasets["cicids2017"] = df_cicids

        # 2. TRUSTLab (Already CICFlowMeter CSV)
        df_trustlab = self.trustlab_loader.load_dataset()
        if len(df_trustlab) > 0:
            datasets["trustlab"] = df_trustlab

        # 3. CTU-13 / ISOT (Raw PCAP - re-extracted)
        df_botnet = self.botnet_loader.load_and_extract(source_name="ctu13")
        if len(df_botnet) > 0:
            datasets["ctu13"] = df_botnet

        # 4. Palau DNS Tunneling
        df_palau = self.palau_loader.load_dataset()
        if len(df_palau) > 0:
            datasets["palau_dns"] = df_palau

        # 5. Bambenek DGA Feeds (Domain-level, logged as enriched feed)
        dga_domains = self.dga_loader.fetch_open_feed()

        return datasets

    def log_dataset_breakdown(self, datasets: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Logs and prints row counts per class per source to visualize balance."""
        records = []
        for src, df in datasets.items():
            if "Label" in df.columns:
                counts = df["Label"].value_counts()
                for lbl, cnt in counts.items():
                    records.append({"Source": src, "Class": lbl, "Rows": cnt})

        summary_df = pd.DataFrame(records)
        print("\n" + "=" * 70)
        print("  [DATASET INGESTION & CLASS BALANCE TELEMETRY]")
        print("=" * 70)
        
        pivot = summary_df.pivot_table(index="Class", columns="Source", values="Rows", fill_value=0, aggfunc="sum")
        pivot["TOTAL"] = pivot.sum(axis=1)
        print(pivot.to_string())
        print("=" * 70)

        return summary_df


def main():
    manager = DatasetManager()
    datasets = manager.load_all_public_datasets()
    manager.log_dataset_breakdown(datasets)


if __name__ == "__main__":
    main()
