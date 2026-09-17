"""Dataset Builder and Concatenation Engine.

Merges all synthetic lab PCAP-extracted flows and public benchmark datasets into
a single, unified training corpus, tagging each flow with its origin 'source'
and 'Label' to enable rigorous cross-source validation.
"""

import glob
import os
import sys
from typing import Dict, List, Optional, Tuple

import pandas as pd

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from datasets.aligner import align_to_canonical_schema
from datasets.manager import DatasetManager
from features.cic_schema import CANONICAL_CICIDS_COLUMNS, FEATURE_COLUMNS
from features.validator import FlowValidator


class DatasetBuilder:
    """Combines synthetic lab flows and public benchmark datasets into a unified corpus."""

    def __init__(
        self,
        processed_dir: str = "data/processed",
        output_file: str = "data/processed/unified_dataset.csv",
    ):
        self.processed_dir = processed_dir
        self.output_file = output_file
        self.dataset_manager = DatasetManager()
        self.validator = FlowValidator()

    def load_synthetic_flows(self) -> pd.DataFrame:
        """Loads all extracted synthetic lab flow CSVs."""
        csv_files = glob.glob(os.path.join(self.processed_dir, "*_flows.csv"))
        if not csv_files:
            return pd.DataFrame()

        dfs = []
        for fpath in csv_files:
            try:
                raw_df = pd.read_csv(fpath)
                aligned = align_to_canonical_schema(raw_df, source_name="synthetic_lab")
                dfs.append(aligned)
            except Exception as e:
                print(f"[-] Error loading synthetic flow file {fpath}: {e}")

        if not dfs:
            return pd.DataFrame()

        combined_syn = pd.concat(dfs, ignore_index=True)
        return combined_syn

    def build_unified_corpus(self, verbose: bool = True) -> pd.DataFrame:
        """Concatenates synthetic lab data and all public benchmark datasets."""
        # 1. Load synthetic lab data
        df_synthetic = self.load_synthetic_flows()
        
        # 2. Load public benchmarks
        public_datasets = self.dataset_manager.load_all_public_datasets()

        all_dfs = []
        if len(df_synthetic) > 0:
            all_dfs.append(df_synthetic)

        for src_name, df_pub in public_datasets.items():
            if len(df_pub) > 0:
                all_dfs.append(df_pub)

        if not all_dfs:
            raise RuntimeError("No datasets found! Run data generation and check public folders.")

        unified = pd.concat(all_dfs, ignore_index=True)

        # 3. Final validation and sanitization pass
        unified, rep = self.validator.validate_and_clean(unified, source_name="unified_dataset")

        # Save to disk
        unified.to_csv(self.output_file, index=False)

        if verbose:
            print("\n" + "=" * 70)
            print("  [UNIFIED CORPUS ASSEMBLED]")
            print("=" * 70)
            print(f"  Total Flows:        {len(unified)}")
            print(f"  Saved to:           {self.output_file}")
            print(f"  Sources included:   {sorted(unified['source'].unique())}")
            print("=" * 70)

            # Print source vs class pivot
            pivot = unified.pivot_table(index="Label", columns="source", values="Flow Duration", aggfunc="count", fill_value=0)
            pivot["TOTAL"] = pivot.sum(axis=1)
            print("\nBreakdown (Rows per Class per Source):")
            print(pivot.to_string())
            print("=" * 70)

        return unified


def main():
    builder = DatasetBuilder()
    builder.build_unified_corpus()


if __name__ == "__main__":
    main()
