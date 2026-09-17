"""Different-Tool Diversity Dataset Loader.

Ingests benchmark datasets generated with alternative non-CICFlowMeter toolchains:
- UNSW-NB15: Generated using IXIA PerfectStorm toolchain. Guards against overfitting
  to CIC-family synthetic artifacts.
- Bot-IoT & ToN_IoT: IoT-testbed DDoS/DoS/Reconnaissance traffic, providing IoT-context
  generalization for c2_beacon, syn_flood, and udp_flood.
- NSL-KDD: Coarser traditional features, ingested strictly as a secondary baseline check
  rather than primary training data.

Merges features strictly by semantic name and unit normalization, NOT assuming identical
column ordering.
"""

import glob
import os
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

from datasets.aligner import align_to_canonical_schema, map_to_canonical_label
from features.cic_schema import CANONICAL_CICIDS_COLUMNS, FEATURE_COLUMNS

# Explicit semantic mapping for UNSW-NB15 (IXIA PerfectStorm features)
UNSW_SEMANTIC_MAP: Dict[str, str] = {
    "dur": "Flow Duration",               # seconds -> convert to microseconds
    "spkts": "Total Fwd Packets",
    "dpkts": "Total Backward Packets",
    "sbytes": "Total Length of Fwd Packets",
    "dbytes": "Total Length of Bwd Packets",
    "rate": "Flow Packets/s",
    "sload": "Flow Bytes/s",
    "smean": "Fwd Packet Length Mean",
    "dmean": "Bwd Packet Length Mean",
    "sinpkt": "Fwd IAT Mean",             # milliseconds -> convert to microseconds
    "dinpkt": "Bwd IAT Mean",             # milliseconds -> convert to microseconds
    "synack": "Active Mean",
    "ackdat": "Idle Mean",
    "swin": "Init_Win_bytes_forward",
    "dwin": "Init_Win_bytes_backward",
}

# Semantic mapping for Bot-IoT and ToN_IoT
IOT_SEMANTIC_MAP: Dict[str, str] = {
    "dur": "Flow Duration",
    "spkts": "Total Fwd Packets",
    "dpkts": "Total Backward Packets",
    "sbytes": "Total Length of Fwd Packets",
    "dbytes": "Total Length of Bwd Packets",
    "rate": "Flow Packets/s",
    "srate": "Fwd Packets/s",
    "drate": "Bwd Packets/s",
    "mean": "Packet Length Mean",
    "stddev": "Packet Length Std",
    "min": "Min Packet Length",
    "max": "Max Packet Length",
}


def map_unsw_to_cic_schema(unsw_df: pd.DataFrame) -> pd.DataFrame:
    """Transforms UNSW-NB15 IXIA features into standard 78-feature schema."""
    df = pd.DataFrame()
    for col in FEATURE_COLUMNS:
        df[col] = 0.0

    # Apply mappings with proper unit conversions
    if "dur" in unsw_df.columns:
        df["Flow Duration"] = pd.to_numeric(unsw_df["dur"], errors="coerce").fillna(0.0) * 1_000_000.0  # s -> us

    if "spkts" in unsw_df.columns:
        df["Total Fwd Packets"] = pd.to_numeric(unsw_df["spkts"], errors="coerce").fillna(0.0)

    if "dpkts" in unsw_df.columns:
        df["Total Backward Packets"] = pd.to_numeric(unsw_df["dpkts"], errors="coerce").fillna(0.0)

    if "sbytes" in unsw_df.columns:
        df["Total Length of Fwd Packets"] = pd.to_numeric(unsw_df["sbytes"], errors="coerce").fillna(0.0)

    if "dbytes" in unsw_df.columns:
        df["Total Length of Bwd Packets"] = pd.to_numeric(unsw_df["dbytes"], errors="coerce").fillna(0.0)

    if "smean" in unsw_df.columns:
        df["Fwd Packet Length Mean"] = pd.to_numeric(unsw_df["smean"], errors="coerce").fillna(0.0)

    if "dmean" in unsw_df.columns:
        df["Bwd Packet Length Mean"] = pd.to_numeric(unsw_df["dmean"], errors="coerce").fillna(0.0)

    if "rate" in unsw_df.columns:
        df["Flow Packets/s"] = pd.to_numeric(unsw_df["rate"], errors="coerce").fillna(0.0)

    if "sinpkt" in unsw_df.columns:
        df["Fwd IAT Mean"] = pd.to_numeric(unsw_df["sinpkt"], errors="coerce").fillna(0.0) * 1000.0  # ms -> us

    if "dinpkt" in unsw_df.columns:
        df["Bwd IAT Mean"] = pd.to_numeric(unsw_df["dinpkt"], errors="coerce").fillna(0.0) * 1000.0  # ms -> us

    # Map attack category
    label_col = "attack_cat" if "attack_cat" in unsw_df.columns else "label" if "label" in unsw_df.columns else None
    if label_col:
        def unsw_label_mapper(val):
            s = str(val).strip().lower()
            if s in ["normal", "0", "benign"]:
                return "benign"
            elif "dos" in s:
                return "syn_flood"
            elif "backdoor" in s or "reconnaissance" in s:
                return "c2_beacon"
            elif "generic" in s:
                return "udp_flood"
            return "benign"

        df["Label"] = unsw_df[label_col].apply(unsw_label_mapper)
    else:
        df["Label"] = "benign"

    df["source"] = "unsw_nb15"
    return df


class DifferentToolsLoader:
    """Ingests non-CICFlowMeter benchmark datasets with feature-by-name reconciliation."""

    def __init__(self, base_dir: str = "data/public/different_tools"):
        self.base_dir = base_dir
        self.unsw_dir = os.path.join(base_dir, "unsw_nb15")
        self.iot_dir = os.path.join(base_dir, "iot")
        self.nsl_dir = os.path.join(base_dir, "nsl_kdd")

        os.makedirs(self.unsw_dir, exist_ok=True)
        os.makedirs(self.iot_dir, exist_ok=True)
        os.makedirs(self.nsl_dir, exist_ok=True)

    def load_unsw_nb15(self, max_rows: Optional[int] = 5000) -> pd.DataFrame:
        """Loads and aligns UNSW-NB15 IXIA dataset."""
        csv_files = glob.glob(os.path.join(self.unsw_dir, "**/*.csv"), recursive=True)
        if not csv_files:
            return pd.DataFrame()

        dfs = []
        for p in csv_files:
            try:
                raw_df = pd.read_csv(p, low_memory=False)
                aligned = map_unsw_to_cic_schema(raw_df)
                dfs.append(aligned)
            except Exception as e:
                print(f"[-] Error loading UNSW file {p}: {e}")

        if not dfs:
            return pd.DataFrame()

        combined = pd.concat(dfs, ignore_index=True)
        if max_rows and len(combined) > max_rows:
            combined = combined.sample(n=max_rows, random_state=42).reset_index(drop=True)
        return combined

    def load_iot_datasets(self, max_rows: Optional[int] = 5000) -> pd.DataFrame:
        """Loads and aligns Bot-IoT and ToN_IoT datasets."""
        csv_files = glob.glob(os.path.join(self.iot_dir, "**/*.csv"), recursive=True)
        if not csv_files:
            return pd.DataFrame()

        dfs = []
        for p in csv_files:
            try:
                raw_df = pd.read_csv(p, low_memory=False)
                src_tag = "bot_iot" if "bot" in os.path.basename(p).lower() else "ton_iot"
                aligned = align_to_canonical_schema(raw_df, source_name=src_tag)
                dfs.append(aligned)
            except Exception as e:
                print(f"[-] Error loading IoT dataset {p}: {e}")

        if not dfs:
            return pd.DataFrame()

        combined = pd.concat(dfs, ignore_index=True)
        if max_rows and len(combined) > max_rows:
            combined = combined.sample(n=max_rows, random_state=42).reset_index(drop=True)
        return combined

    def load_nsl_kdd(self, max_rows: Optional[int] = 3000) -> pd.DataFrame:
        """Loads NSL-KDD secondary baseline check dataset."""
        csv_files = glob.glob(os.path.join(self.nsl_dir, "**/*.csv"), recursive=True)
        if not csv_files:
            return pd.DataFrame()

        dfs = []
        for p in csv_files:
            try:
                raw_df = pd.read_csv(p, low_memory=False)
                aligned = align_to_canonical_schema(raw_df, source_name="nsl_kdd_secondary")
                dfs.append(aligned)
            except Exception as e:
                print(f"[-] Error loading NSL-KDD {p}: {e}")

        if not dfs:
            return pd.DataFrame()

        combined = pd.concat(dfs, ignore_index=True)
        if max_rows and len(combined) > max_rows:
            combined = combined.sample(n=max_rows, random_state=42).reset_index(drop=True)
        return combined
