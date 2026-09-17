"""TRUSTLab Dataset Loader.

Extraction Status:
- ALREADY EXTRACTED: CICFlowMeter 80-feature CSV format.
- Direct merge into canonical schema.
- Includes target attack classes: 'slowloris' and 'c2_beacon'.
"""

import glob
import os
from typing import List, Optional

import pandas as pd

from datasets.aligner import align_to_canonical_schema


class TrustlabLoader:
    """Loads and aligns TRUSTLab 80-feature CSV datasets."""

    def __init__(self, data_dir: str = "data/public/trustlab"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)

    def load_dataset(
        self,
        classes_to_keep: Optional[List[str]] = None,
        max_rows_per_class: Optional[int] = 3000,
    ) -> pd.DataFrame:
        """Loads and filters TRUSTLab CSV files."""
        csv_files = glob.glob(os.path.join(self.data_dir, "**/*.csv"), recursive=True)
        if not csv_files:
            return pd.DataFrame()

        dfs = []
        for csv_path in csv_files:
            try:
                raw_df = pd.read_csv(csv_path, low_memory=False)
                aligned = align_to_canonical_schema(raw_df, source_name="trustlab")
                if classes_to_keep:
                    aligned = aligned[aligned["Label"].isin(classes_to_keep)]
                dfs.append(aligned)
            except Exception as e:
                print(f"[-] Error reading TRUSTLab file {csv_path}: {e}")

        if not dfs:
            return pd.DataFrame()

        combined = pd.concat(dfs, ignore_index=True)
        if max_rows_per_class:
            sampled_dfs = []
            for lbl, grp in combined.groupby("Label"):
                sampled_dfs.append(grp.sample(n=min(len(grp), max_rows_per_class), random_state=42))
            combined = pd.concat(sampled_dfs, ignore_index=True)

        return combined
