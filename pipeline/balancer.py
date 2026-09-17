"""Class Distribution Analyzer and Imbalance Balancer.

Audits class distributions, detects minority classes (<5% of majority class count),
and applies either SMOTE (Synthetic Minority Over-sampling Technique) or Balanced
Class Weighting to prevent model bias towards majority classes.
"""

from typing import Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE, RandomOverSampler
from sklearn.utils.class_weight import compute_class_weight


class ClassBalancer:
    """Detects severe class imbalance and balances training splits via SMOTE or Class Weighting."""

    def __init__(self, minority_threshold_pct: float = 0.05):
        self.minority_threshold_pct = minority_threshold_pct

    def analyze_distribution(self, y: pd.Series, verbose: bool = True) -> Dict[str, any]:
        """Analyzes class distribution and flags minority classes < 5% of majority."""
        counts = y.value_counts()
        majority_count = counts.max()
        majority_class = counts.idxmax()

        distribution = {}
        flagged_minority = []

        for cls_name, cnt in counts.items():
            ratio = cnt / majority_count
            is_minority = ratio < self.minority_threshold_pct
            distribution[cls_name] = {
                "count": int(cnt),
                "ratio_to_majority": float(ratio),
                "is_severe_minority": bool(is_minority),
            }
            if is_minority:
                flagged_minority.append(cls_name)

        analysis = {
            "total_samples": int(len(y)),
            "majority_class": majority_class,
            "majority_count": int(majority_count),
            "minority_threshold": self.minority_threshold_pct,
            "flagged_minority_classes": flagged_minority,
            "distribution": distribution,
        }

        if verbose:
            print("\n" + "=" * 70)
            print("  [CLASS IMBALANCE DISTRIBUTION AUDIT]")
            print("=" * 70)
            print(f"  Majority Class: {majority_class} ({majority_count} samples)")
            print(f"  Minority Threshold: < {self.minority_threshold_pct * 100:.1f}% of majority (< {int(majority_count * self.minority_threshold_pct)} samples)")
            print("-" * 70)
            for cls_name, info in distribution.items():
                flag = " [!] SEVERE MINORITY (<5%)" if info["is_severe_minority"] else " [OK]"
                print(
                    f"  {cls_name.ljust(15)} : {str(info['count']).rjust(6)} samples "
                    f"({info['ratio_to_majority'] * 100:5.2f}% of majority){flag}"
                )
            print("=" * 70)

        return analysis

    def balance_training_data(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        method: str = "smote",
        target_ratio: float = 0.25,
    ) -> Tuple[pd.DataFrame, pd.Series, Dict[str, any]]:
        """Balances training data using SMOTE or RandomOverSampler.
        
        CRITICAL: Never apply oversampling to test/validation sets!
        """
        analysis = self.analyze_distribution(y_train, verbose=False)
        flagged = analysis["flagged_minority_classes"]

        if not flagged:
            print("[ClassBalancer] No classes <5% of majority. Training set is within balance thresholds.")
            return X_train, y_train, {"strategy": "none", "samples_added": 0}

        print(f"[ClassBalancer] Detected {len(flagged)} minority classes (<5% of majority): {flagged}")
        print(f"[ClassBalancer] Applying {method.upper()} oversampling to training set...")

        # Determine target counts: elevate minority classes to at least target_ratio of majority
        majority_count = analysis["majority_count"]
        target_count = int(majority_count * target_ratio)

        sampling_strategy = {}
        for cls_name, info in analysis["distribution"].items():
            if info["count"] < target_count:
                sampling_strategy[cls_name] = target_count

        # Check smallest class count for k_neighbors
        min_class_count = min(analysis["distribution"][c]["count"] for c in flagged)

        if min_class_count > 3 and method.lower() == "smote":
            k_neighbors = min(3, min_class_count - 1)
            sampler = SMOTE(sampling_strategy=sampling_strategy, k_neighbors=k_neighbors, random_state=42)
            technique_used = f"SMOTE (k={k_neighbors})"
            rationale = (
                f"Used SMOTE oversampling: Synthesizes plausible continuous flow vectors along "
                f"k-nearest neighbor convex hulls, increasing decision margin for {flagged} without "
                f"exact row duplication."
            )
        else:
            sampler = RandomOverSampler(sampling_strategy=sampling_strategy, random_state=42)
            technique_used = "RandomOverSampler"
            rationale = (
                f"Used RandomOverSampler: Classes {flagged} had fewer than 4 initial flow records, "
                f"requiring robust resampling to prevent sparse manifold distortion."
            )

        X_res, y_res = sampler.fit_resample(X_train, y_train)

        report = {
            "strategy": technique_used,
            "rationale": rationale,
            "initial_samples": len(X_train),
            "balanced_samples": len(X_res),
            "samples_added": len(X_res) - len(X_train),
        }

        print(f"[ClassBalancer] {report['rationale']}")
        print(f"[ClassBalancer] Balanced training set from {report['initial_samples']} to {report['balanced_samples']} flows.")

        return pd.DataFrame(X_res, columns=X_train.columns), pd.Series(y_res, name=y_train.name), report

    def get_balanced_class_weights(self, y_train: pd.Series) -> Dict[str, float]:
        """Calculates balanced inverse class weights for model loss functions."""
        classes = np.unique(y_train)
        weights = compute_class_weight("balanced", classes=classes, y=y_train)
        return dict(zip(classes, weights))
