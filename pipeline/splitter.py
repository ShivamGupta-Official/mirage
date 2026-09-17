"""Evaluation Dataset Splitter.

Implements two complementary evaluation split strategies:
1. Stratified Random Split (80/20): Conventional ML benchmark baseline.
2. Cross-Source Held-Out Split: Holds out entire independent public dataset sources
   (e.g., test on TRUSTLab, Palau DNS) while training exclusively on synthetic lab and
   CICIDS2017 sources. This rigorously tests whether the model learns real attack signatures
   or merely memorizes single-dataset collection artifacts.
"""

from typing import Dict, List, Optional, Tuple

import pandas as pd
from sklearn.model_selection import train_test_split

from features.cic_schema import FEATURE_COLUMNS


class DatasetSplitter:
    """Manages cross-validation and out-of-domain evaluation splits."""

    def __init__(self, feature_cols: Optional[List[str]] = None, target_col: str = "Label"):
        self.feature_cols = feature_cols or FEATURE_COLUMNS
        self.target_col = target_col

    def get_features_and_target(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Extracts numerical features X and target labels y."""
        X = df[self.feature_cols].copy()
        y = df[self.target_col].copy()
        return X, y

    def stratified_random_split(
        self,
        df: pd.DataFrame,
        test_size: float = 0.20,
        random_state: int = 42,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        """Performs a conventional stratified random 80/20 train/test split."""
        X, y = self.get_features_and_target(df)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, stratify=y, random_state=random_state
        )
        return X_train, X_test, y_train, y_test

    def cross_source_held_out_split(
        self,
        df: pd.DataFrame,
        held_out_sources: Optional[List[str]] = None,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, Dict[str, any]]:
        """Splits data strictly by SOURCE provenance.
        
        Holds out at least one entire public dataset per class as a cross-source test set:
        - cira_doh: for dns_tunnel
        - trustlab: for slowloris and c2_beacon
        - unsw_nb15: for syn_flood and c2_beacon
        - lanl_enterprise & ugr16_backbone: for real-world benign production baseline
        """
        if "source" not in df.columns:
            raise ValueError("Dataset does not contain 'source' column required for cross-source split.")

        available_sources = list(df["source"].unique())

        if held_out_sources is None:
            # Hold out entire public benchmark sources across each target class
            candidates = ["cira_doh", "trustlab", "unsw_nb15", "lanl_enterprise", "ugr16_backbone"]
            held_out_sources = [s for s in candidates if s in available_sources]
            if not held_out_sources:
                held_out_sources = [s for s in available_sources if s != "synthetic_lab"][:2]

        train_mask = ~df["source"].isin(held_out_sources)
        test_mask = df["source"].isin(held_out_sources)

        train_df = df[train_mask].copy()
        test_df = df[test_mask].copy()

        if len(test_df) == 0:
            raise RuntimeError(f"No samples found for held-out sources: {held_out_sources}")

        X_train, y_train = self.get_features_and_target(train_df)
        X_test, y_test = self.get_features_and_target(test_df)

        split_info = {
            "strategy": "cross_source_held_out",
            "train_sources": list(train_df["source"].unique()),
            "held_out_test_sources": held_out_sources,
            "train_samples": len(train_df),
            "test_samples": len(test_df),
            "train_classes": sorted(list(y_train.unique())),
            "test_classes": sorted(list(y_test.unique())),
        }

        print("\n" + "=" * 70)
        print("  [CROSS-SOURCE HELD-OUT SPLIT CONFIGURATION]")
        print("=" * 70)
        print(f"  Training Sources:     {split_info['train_sources']} ({split_info['train_samples']} flows)")
        print(f"  Held-out Test Sources:{split_info['held_out_test_sources']} ({split_info['test_samples']} flows)")
        print(f"  Training Classes:     {split_info['train_classes']}")
        print(f"  Test Classes:         {split_info['test_classes']}")
        print("=" * 70)

        return X_train, X_test, y_train, y_test, split_info
