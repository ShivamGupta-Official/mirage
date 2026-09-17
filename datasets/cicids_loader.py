"""CICIDS-family (CICIDS2017, CSE-CIC-IDS2018, CIC-DDoS2019) Dataset Loader.

Extraction Status:
- ALREADY EXTRACTED: CICFlowMeter CSV format.
- Direct merge into canonical schema (no pcap re-extraction required).
"""

import glob
import os
from typing import List, Optional

import pandas as pd

from datasets.aligner import align_to_canonical_schema


class CicidsLoader:
    """Loads and aligns CICIDS family CSV datasets."""

    def __init__(self, data_dir: str = "data/public/cicids"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)

    def load_dataset(
        self,
        source_name: str = "cicids2017",
        classes_to_keep: Optional[List[str]] = None,
        max_rows_per_class: Optional[int] = 5000,
    ) -> pd.DataFrame:
        """Loads and filters CICIDS CSV files from data_dir."""
        csv_files = glob.glob(os.path.join(self.data_dir, "**/*.csv"), recursive=True)
        if not csv_files:
            return pd.DataFrame()

        dfs = []
        for csv_path in csv_files:
            try:
                # Read chunks to conserve memory on massive CICIDS dumps
                chunk_list = []
                for chunk in pd.read_csv(csv_path, chunksize=10000, low_memory=False):
                    aligned = align_to_canonical_schema(chunk, source_name=source_name)
                    if classes_to_keep:
                        aligned = aligned[aligned["Label"].isin(classes_to_keep)]
                    chunk_list.append(aligned)
                    if max_rows_per_class and sum(len(c) for c in chunk_list) >= max_rows_per_class * 4:
                        break
                if chunk_list:
                    dfs.append(pd.concat(chunk_list, ignore_index=True))
            except Exception as e:
                print(f"[-] Error reading {csv_path}: {e}")

        if not dfs:
            return pd.DataFrame()

        combined = pd.concat(dfs, ignore_index=True)
        if max_rows_per_class:
            # Subsample to balance
            sampled_dfs = []
            for lbl, grp in combined.groupby("Label"):
                sampled_dfs.append(grp.sample(n=min(len(grp), max_rows_per_class), random_state=42))
            combined = pd.concat(sampled_dfs, ignore_index=True)

        return combined
