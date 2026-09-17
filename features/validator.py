"""Flow Feature Quality Validation and Data Sanitization.

Validates that flow data contains 0 NaN and 0 Inf values, caps extreme rates,
flags capture artifacts (flows with suspiciously low packet counts <= 2),
and provides audit telemetry before features enter the ML training pipeline.
"""

import glob
import os
import sys
from typing import Dict, Optional, Tuple

import numpy as np
import pandas as pd

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from features.cic_schema import FEATURE_COLUMNS


class FlowValidator:
    """Validates data quality, bounds, and artifact suppression on flow feature dataframes."""

    def __init__(self, min_packets_threshold: int = 1):
        self.min_packets_threshold = min_packets_threshold

    def validate_and_clean(
        self,
        df: pd.DataFrame,
        source_name: str = "unknown",
        clean_in_place: bool = True,
        filter_artifacts: bool = False,
    ) -> Tuple[pd.DataFrame, Dict[str, any]]:
        """Audits and sanitizes a flow dataframe.
        
        Returns:
            Tuple[pd.DataFrame, Dict]: (Cleaned DataFrame, Audit Report)
        """
        initial_count = len(df)
        report = {
            "source": source_name,
            "initial_flow_count": initial_count,
            "nan_cells_found": 0,
            "inf_cells_found": 0,
            "low_packet_artifacts_flagged": 0,
            "final_flow_count": 0,
            "passed": True,
        }

        if initial_count == 0:
            report["final_flow_count"] = 0
            return df, report

        work_df = df.copy()

        # 1. Identify and handle Inf values in numerical features
        num_cols = [c for c in FEATURE_COLUMNS if c in work_df.columns]
        
        # Check inf
        is_inf = np.isinf(work_df[num_cols].values)
        inf_count = int(np.sum(is_inf))
        report["inf_cells_found"] = inf_count

        if inf_count > 0 and clean_in_place:
            for col in num_cols:
                mask_inf = np.isinf(work_df[col])
                if mask_inf.any():
                    finite_vals = work_df.loc[~mask_inf, col]
                    col_max = finite_vals.max() if len(finite_vals) > 0 else 1e9
                    work_df.loc[mask_inf, col] = col_max

        # 2. Identify and handle NaN values
        nan_count = int(work_df[num_cols].isna().sum().sum())
        report["nan_cells_found"] = nan_count

        if nan_count > 0 and clean_in_place:
            for col in num_cols:
                if work_df[col].isna().any():
                    median_val = work_df[col].median()
                    work_df[col] = work_df[col].fillna(0.0 if pd.isna(median_val) else median_val)

        # 3. Flag flows with low packet counts (<= 2 packets)
        # In flood attacks (SYN/UDP floods), 1-packet flows are ground-truth attack behaviors.
        # We flag them for telemetry and only drop true empty artifacts (packets < 1).
        if "Total Fwd Packets" in work_df.columns and "Total Backward Packets" in work_df.columns:
            total_pkts = work_df["Total Fwd Packets"] + work_df["Total Backward Packets"]
            flagged_mask = total_pkts <= 2
            report["low_packet_artifacts_flagged"] = int(flagged_mask.sum())

            # Drop zero-packet ghost flows if any exist
            zero_mask = total_pkts < 1
            if zero_mask.any():
                work_df = work_df[~zero_mask].reset_index(drop=True)

            # If user explicitly requested aggressive filtering for non-flood classes
            if filter_artifacts and not any(k in source_name.lower() for k in ["flood", "scan"]):
                work_df = work_df[~flagged_mask].reset_index(drop=True)

        report["final_flow_count"] = len(work_df)

        # Final assertion check
        final_nans = int(work_df[num_cols].isna().sum().sum())
        final_infs = int(np.isinf(work_df[num_cols].values).sum())

        if final_nans > 0 or final_infs > 0:
            report["passed"] = False
            raise AssertionError(
                f"FlowValidator failed for {source_name}: {final_nans} NaNs and {final_infs} Infs remain."
            )

        return work_df, report

    def validate_processed_directory(self, processed_dir: str = "data/processed") -> Dict[str, Dict]:
        """Validates and updates all CSV files in processed_dir."""
        csv_files = glob.glob(os.path.join(processed_dir, "*.csv"))
        reports = {}

        print("=" * 70)
        print("  [FLOW FEATURE VALIDATION REPORT]")
        print("=" * 70)

        for csv_path in sorted(csv_files):
            df = pd.read_csv(csv_path)
            clean_df, rep = self.validate_and_clean(df, source_name=os.path.basename(csv_path))
            clean_df.to_csv(csv_path, index=False)
            reports[os.path.basename(csv_path)] = rep
            status_str = "PASSED" if rep["passed"] else "FAILED"
            print(
                f"  {rep['source'].ljust(25)} | Flows: {rep['initial_flow_count']} -> {rep['final_flow_count']} | "
                f"NaNs: {rep['nan_cells_found']} | Infs: {rep['inf_cells_found']} | "
                f"Low-pkt Flagged: {rep['low_packet_artifacts_flagged']} | [{status_str}]"
            )

        print("=" * 70)
        return reports


def main():
    validator = FlowValidator()
    validator.validate_processed_directory()


if __name__ == "__main__":
    main()
