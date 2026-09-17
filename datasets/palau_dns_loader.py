"""Palau et al. DNS Tunneling Dataset Loader.

Extraction Status:
- ALREADY LABELED: Contains flow-level DNS attributes and tool_code (dnscat2, iodine, etc.).
- Aligns field names and maps attack labels to canonical 'dns_tunnel' class.
"""

import glob
import os
from typing import Optional

import pandas as pd

from datasets.aligner import align_to_canonical_schema


class PalauDnsLoader:
    """Loads and aligns Palau et al. DNS tunneling dataset."""

    def __init__(self, data_dir: str = "data/public/palau_dns"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)

    def load_dataset(
        self,
        max_rows: Optional[int] = 5000,
    ) -> pd.DataFrame:
        """Loads and aligns Palau DNS CSV files."""
        csv_files = glob.glob(os.path.join(self.data_dir, "**/*.csv"), recursive=True)
        if not csv_files:
            return pd.DataFrame()

        dfs = []
        for csv_path in csv_files:
            try:
                raw_df = pd.read_csv(csv_path, low_memory=False)
                # If tool_code is present, treat nonzero as dns_tunnel
                if "tool_code" in raw_df.columns:
                    raw_df["Label"] = raw_df["tool_code"].apply(
                        lambda x: "dns_tunnel" if str(x).strip() not in ["0", "benign", "nan", "None", ""] else "benign"
                    )
                aligned = align_to_canonical_schema(raw_df, source_name="palau_dns")
                dfs.append(aligned)
            except Exception as e:
                print(f"[-] Error reading Palau DNS file {csv_path}: {e}")

        if not dfs:
            return pd.DataFrame()

        combined = pd.concat(dfs, ignore_index=True)
        if max_rows and len(combined) > max_rows:
            combined = combined.sample(n=max_rows, random_state=42).reset_index(drop=True)

        return combined
