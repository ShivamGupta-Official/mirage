"""Real-World Benign-Only Enrichment Dataset Loader.

Extraction Status:
- REAL-WORLD PRODUCTION TRAFFIC: Enterprise & ISP Backbone NetFlow traces.
- LANL: Comprehensive Multi-Source Cyber-Security Events (enterprise auth & netflow).
- UGR'16: Real ISP backbone NetFlow with natural long-duration traffic and background noise.

CRITICAL POLICY:
As per specification, all rows from LANL and UGR'16 are strictly labeled as 'benign' only.
Attack labels are NEVER pulled from these sources without independent ground-truth verification.
This provides realistic, noisy production baselines to counterbalance synthetic lab cleanliness.
"""

import glob
import os
from typing import Optional

import pandas as pd

from datasets.aligner import align_to_canonical_schema
from features.cic_schema import CANONICAL_CICIDS_COLUMNS, FEATURE_COLUMNS


class BenignEnrichmentLoader:
    """Loads and sanitizes real-world enterprise and backbone benign network flows."""

    def __init__(self, data_dir: str = "data/public/benign_enrichment"):
        self.data_dir = data_dir
        self.lanl_dir = os.path.join(data_dir, "lanl")
        self.ugr_dir = os.path.join(data_dir, "ugr16")
        os.makedirs(self.lanl_dir, exist_ok=True)
        os.makedirs(self.ugr_dir, exist_ok=True)

    def load_lanl_enterprise(self, max_rows: Optional[int] = 5000) -> pd.DataFrame:
        """Loads LANL enterprise netflow, enforcing strict 'benign' ground truth."""
        files = glob.glob(os.path.join(self.lanl_dir, "**/*.csv"), recursive=True) + glob.glob(os.path.join(self.lanl_dir, "**/*.txt"), recursive=True)
        if not files:
            return pd.DataFrame()

        dfs = []
        for p in files:
            try:
                raw_df = pd.read_csv(p, low_memory=False)
                # Align and force label to 'benign'
                aligned = align_to_canonical_schema(raw_df, source_name="lanl_enterprise", default_label="benign")
                aligned["Label"] = "benign"  # Strict invariant
                dfs.append(aligned)
            except Exception as e:
                print(f"[-] Error loading LANL file {p}: {e}")

        if not dfs:
            return pd.DataFrame()

        combined = pd.concat(dfs, ignore_index=True)
        if max_rows and len(combined) > max_rows:
            combined = combined.sample(n=max_rows, random_state=42).reset_index(drop=True)
        return combined

    def load_ugr16_backbone(self, max_rows: Optional[int] = 5000) -> pd.DataFrame:
        """Loads UGR'16 ISP backbone NetFlow, enforcing strict 'benign' ground truth."""
        files = glob.glob(os.path.join(self.ugr_dir, "**/*.csv"), recursive=True) + glob.glob(os.path.join(self.ugr_dir, "**/*.txt"), recursive=True)
        if not files:
            return pd.DataFrame()

        dfs = []
        for p in files:
            try:
                raw_df = pd.read_csv(p, low_memory=False)
                aligned = align_to_canonical_schema(raw_df, source_name="ugr16_backbone", default_label="benign")
                aligned["Label"] = "benign"  # Strict invariant
                dfs.append(aligned)
            except Exception as e:
                print(f"[-] Error loading UGR'16 file {p}: {e}")

        if not dfs:
            return pd.DataFrame()

        combined = pd.concat(dfs, ignore_index=True)
        if max_rows and len(combined) > max_rows:
            combined = combined.sample(n=max_rows, random_state=42).reset_index(drop=True)
        return combined
