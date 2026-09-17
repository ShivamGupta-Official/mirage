"""CIRA-CIC-DoHBrw-2020 Dataset Loader.

Extraction Status:
- PRECOMPUTED CSV: 33 statistical flow features + timestamp.
- RAW PCAP: Can be re-extracted via features.extractor.FlowExtractor for full 80-feature
  canonical schema consistency.
- Malicious DoH traffic was generated with dns2tcp, DNSCat2, and Iodine (matching our Part 1
  dns_tunnel tooling), providing an ideal cross-source validation benchmark for 'dns_tunnel'.
"""

import glob
import os
from typing import List, Optional

import numpy as np
import pandas as pd

from datasets.aligner import align_to_canonical_schema, map_to_canonical_label
from features.cic_schema import CANONICAL_CICIDS_COLUMNS, FEATURE_COLUMNS
from features.extractor import FlowExtractor


class CiraDohLoader:
    """Loads and aligns CIRA-CIC-DoHBrw-2020 dataset from precomputed CSV or raw PCAP."""

    def __init__(self, data_dir: str = "data/public/cira_doh"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        self.extractor = FlowExtractor()

    def load_dataset(
        self,
        prefer_pcap_reextraction: bool = True,
        max_rows: Optional[int] = 5000,
    ) -> pd.DataFrame:
        """Loads CIRA-DoH dataset, preferring PCAP re-extraction for 80-feature consistency if available."""
        pcap_files = glob.glob(os.path.join(self.data_dir, "**/*.pcap"), recursive=True)

        if prefer_pcap_reextraction and pcap_files:
            print(f"[CiraDohLoader] Re-extracting 80-feature flows from {len(pcap_files)} CIRA-DoH PCAPs...")
            flow_dfs = []
            for pcap in pcap_files:
                base = os.path.basename(pcap).lower()
                is_tunnel = any(k in base for k in ["dnscat", "iodine", "dns2tcp", "malicious"])
                lbl = "dns_tunnel" if is_tunnel else "benign"
                df_flows = self.extractor.extract_pcap_to_flows(pcap, label=lbl)
                if len(df_flows) > 0:
                    aligned = align_to_canonical_schema(df_flows, source_name="cira_doh", default_label=lbl)
                    flow_dfs.append(aligned)
            if flow_dfs:
                combined = pd.concat(flow_dfs, ignore_index=True)
                if max_rows and len(combined) > max_rows:
                    combined = combined.sample(n=max_rows, random_state=42).reset_index(drop=True)
                return combined

        # Fallback to precomputed CSVs
        csv_files = glob.glob(os.path.join(self.data_dir, "**/*.csv"), recursive=True)
        if not csv_files:
            return pd.DataFrame()

        print(f"[CiraDohLoader] Loading precomputed CIRA-DoH CSVs from {self.data_dir}...")
        dfs = []
        for csv_path in csv_files:
            try:
                raw_df = pd.read_csv(csv_path, low_memory=False)
                # Map CIRA-DoH label column
                label_col = None
                for c in ["Label", "label", "DoH", "Class"]:
                    if c in raw_df.columns:
                        label_col = c
                        break

                if label_col:
                    raw_df["Label"] = raw_df[label_col].apply(
                        lambda x: "dns_tunnel" if any(k in str(x).lower() for k in ["dnscat", "iodine", "dns2tcp", "malicious", "1"]) else "benign"
                    )

                aligned = align_to_canonical_schema(raw_df, source_name="cira_doh")
                dfs.append(aligned)
            except Exception as e:
                print(f"[-] Error loading CIRA-DoH CSV {csv_path}: {e}")

        if not dfs:
            return pd.DataFrame()

        combined = pd.concat(dfs, ignore_index=True)
        if max_rows and len(combined) > max_rows:
            combined = combined.sample(n=max_rows, random_state=42).reset_index(drop=True)

        return combined
