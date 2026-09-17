"""Network Intrusion Detection ML Training Pipeline.

Trains baseline models (Random Forest and XGBoost) on the unified dataset,
evaluates per-class Precision, Recall, and F1 across both:
  1. Stratified Random Split (80/20)
  2. Cross-Source Held-Out Split (out-of-domain public benchmarks)

Quantifies the Generalization Gap (overfitting to single-dataset capture artifacts)
and exports trained models and feature_schema.json to models/ directory.
"""

import json
import os
import sys
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, f1_score, precision_recall_fscore_support
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from features.cic_schema import FEATURE_COLUMNS
from pipeline.balancer import ClassBalancer
from pipeline.splitter import DatasetSplitter


class NidsTrainer:
    """Trains and compares Random Forest and XGBoost under dual-split evaluation."""

    def __init__(
        self,
        data_path: str = "data/processed/unified_dataset.csv",
        models_dir: str = "models",
    ):
        self.data_path = data_path
        self.models_dir = models_dir
        os.makedirs(models_dir, exist_ok=True)

        self.df = pd.read_csv(data_path)
        self.splitter = DatasetSplitter()
        self.balancer = ClassBalancer()
        self.label_encoder = LabelEncoder()

        # Save feature schema immediately for downstream inference services
        self.save_feature_schema()

    def save_feature_schema(self) -> str:
        """Exports the exact 78-feature column schema and order to models/feature_schema.json."""
        schema_path = os.path.join(self.models_dir, "feature_schema.json")
        schema_info = {
            "num_features": len(FEATURE_COLUMNS),
            "columns": FEATURE_COLUMNS,
            "target_classes": sorted(list(self.df["Label"].unique())),
            "format": "CICIDS_80_BIDIRECTIONAL_FLOW",
        }
        with open(schema_path, "w") as f:
            json.dump(schema_info, f, indent=2)
        print(f"[NidsTrainer] Saved feature schema ({len(FEATURE_COLUMNS)} columns) -> {schema_path}")
        return schema_path

    def evaluate_model(
        self,
        model: Any,
        X_test: pd.DataFrame,
        y_test: pd.Series,
        classes: List[str],
    ) -> Dict[str, Any]:
        """Calculates per-class precision, recall, f1, and overall metrics."""
        y_pred = model.predict(X_test)
        p, r, f, s = precision_recall_fscore_support(y_test, y_pred, labels=classes, zero_division=0)
        
        per_class = {}
        for idx, cls_name in enumerate(classes):
            per_class[cls_name] = {
                "precision": float(p[idx]),
                "recall": float(r[idx]),
                "f1": float(f[idx]),
                "support": int(s[idx]),
            }

        macro_f1 = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
        weighted_f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

        return {
            "per_class": per_class,
            "macro_f1": macro_f1,
            "weighted_f1": weighted_f1,
            "report_str": classification_report(y_test, y_pred, labels=classes, zero_division=0),
        }

    def train_and_evaluate_split(
        self,
        X_train: pd.DataFrame,
        X_test: pd.DataFrame,
        y_train: pd.Series,
        y_test: pd.Series,
        split_name: str,
        apply_balancing: bool = True,
    ) -> Dict[str, Any]:
        """Trains Random Forest and XGBoost on train split and evaluates on test split."""
        print(f"\n--- Running Evaluation: {split_name} ---")

        # 1. Handle class imbalance on training set
        if apply_balancing:
            X_tr_bal, y_tr_bal, bal_meta = self.balancer.balance_training_data(X_train, y_train)
        else:
            X_tr_bal, y_tr_bal = X_train, y_train
            bal_meta = {"strategy": "none"}

        # Target classes present in evaluation
        classes = sorted(list(set(y_train.unique()).union(set(y_test.unique()))))

        # Encode labels numerically for XGBoost
        le = LabelEncoder()
        le.fit(classes)
        y_tr_enc = le.transform(y_tr_bal)
        y_te_enc = le.transform(y_test)

        # 2. Train Random Forest Baseline
        print(f"[+] Training Random Forest ({split_name})...")
        rf = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
        rf.fit(X_tr_bal, y_tr_bal)
        rf_metrics = self.evaluate_model(rf, X_test, y_test, classes=classes)

        # 3. Train XGBoost Baseline
        print(f"[+] Training XGBoost ({split_name})...")
        xgb = XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            eval_metric="mlogloss",
            random_state=42,
            n_jobs=-1,
        )
        xgb.fit(X_tr_bal, y_tr_enc)
        
        # Predict with XGBoost
        y_xgb_pred_enc = xgb.predict(X_test)
        y_xgb_pred = le.inverse_transform(y_xgb_pred_enc)
        p, r, f, s = precision_recall_fscore_support(y_test, y_xgb_pred, labels=classes, zero_division=0)
        xgb_per_class = {}
        for idx, cls_name in enumerate(classes):
            xgb_per_class[cls_name] = {
                "precision": float(p[idx]),
                "recall": float(r[idx]),
                "f1": float(f[idx]),
                "support": int(s[idx]),
            }
        xgb_metrics = {
            "per_class": xgb_per_class,
            "macro_f1": float(f1_score(y_test, y_xgb_pred, average="macro", zero_division=0)),
            "weighted_f1": float(f1_score(y_test, y_xgb_pred, average="weighted", zero_division=0)),
            "report_str": classification_report(y_test, y_xgb_pred, labels=classes, zero_division=0),
        }

        return {
            "split_name": split_name,
            "classes": classes,
            "random_forest": {"model": rf, "metrics": rf_metrics},
            "xgboost": {"model": xgb, "label_encoder": le, "metrics": xgb_metrics},
            "balancing_meta": bal_meta,
        }

    def run_full_pipeline(self) -> Dict[str, Any]:
        """Runs comparative training on both Random Split and Cross-Source Held-Out Split."""
        print("=" * 75)
        print("  STARTING NIDS MODEL TRAINING & CROSS-SOURCE VALIDATION")
        print("=" * 75)

        # 1. SPLIT A: Stratified Random Split (80/20)
        X_tr_rnd, X_te_rnd, y_tr_rnd, y_te_rnd = self.splitter.stratified_random_split(self.df, test_size=0.20)
        res_random = self.train_and_evaluate_split(X_tr_rnd, X_te_rnd, y_tr_rnd, y_te_rnd, split_name="Random Stratified Split (80/20)")

        # 2. SPLIT B: Cross-Source Held-Out Split
        X_tr_src, X_te_src, y_tr_src, y_te_src, src_info = self.splitter.cross_source_held_out_split(
            self.df, held_out_sources=["trustlab", "palau_dns"]
        )
        res_cross = self.train_and_evaluate_split(X_tr_src, X_te_src, y_tr_src, y_te_src, split_name="Cross-Source Held-Out Split")

        # 3. Print Comparative Telemetry & Overfitting Gap Analysis
        self.print_comparative_table(res_random, res_cross)

        # 4. Save best production models
        self.export_models(res_random["random_forest"]["model"], res_random["xgboost"]["model"], res_random["xgboost"]["label_encoder"])

        return {"random_split": res_random, "cross_source_split": res_cross}

    def print_comparative_table(self, res_rnd: Dict, res_src: Dict):
        """Displays side-by-side comparison of Random Split vs Cross-Source Held-Out Split."""
        print("\n" + "=" * 90)
        print("  [DUAL-SPLIT GENERALIZATION GAP ANALYSIS]")
        print("=" * 90)
        print(f"{'Class':<15} | {'Random F1 (RF)':<15} {'Cross-Src F1 (RF)':<18} {'Delta F1 (RF)':<14} | {'Cross-Src F1 (XGB)':<18}")
        print("-" * 90)

        rf_rnd = res_rnd["random_forest"]["metrics"]["per_class"]
        rf_src = res_src["random_forest"]["metrics"]["per_class"]
        xgb_src = res_src["xgboost"]["metrics"]["per_class"]

        all_classes = sorted(list(set(rf_rnd.keys()).union(set(rf_src.keys()))))
        for cls in all_classes:
            f1_rnd = rf_rnd.get(cls, {}).get("f1", 0.0)
            f1_src = rf_src.get(cls, {}).get("f1", 0.0)
            f1_xgb_src = xgb_src.get(cls, {}).get("f1", 0.0)
            delta = f1_rnd - f1_src

            delta_str = f"{delta:+.3f}"
            if delta > 0.15:
                delta_str += " [GAP!]"

            print(f"{cls:<15} | {f1_rnd:<15.3f} {f1_src:<18.3f} {delta_str:<14} | {f1_xgb_src:<18.3f}")

        print("-" * 90)
        macro_rnd = res_rnd["random_forest"]["metrics"]["macro_f1"]
        macro_src = res_src["random_forest"]["metrics"]["macro_f1"]
        print(f"{'MACRO AVERAGE':<15} | {macro_rnd:<15.3f} {macro_src:<18.3f} {macro_rnd - macro_src:+.3f}          | {res_src['xgboost']['metrics']['macro_f1']:<18.3f}")
        print("=" * 90)
        print("  NOTE: A significant positive Delta F1 indicates feature memorization of dataset artifacts.")
        print("        Zero or negative delta indicates strong generalizability across network sources.")
        print("=" * 90)

    def export_models(self, rf_model: Any, xgb_model: Any, label_encoder: Any):
        """Saves trained models, label encoders, and checkpoints to models/."""
        rf_path = os.path.join(self.models_dir, "RandomForest_NIDS.joblib")
        xgb_path = os.path.join(self.models_dir, "XGBoost_NIDS.joblib")
        le_path = os.path.join(self.models_dir, "label_encoder.joblib")

        joblib.dump(rf_model, rf_path)
        joblib.dump(xgb_model, xgb_path)
        joblib.dump(label_encoder, le_path)

        print("\n[+] Models exported successfully:")
        print(f"    - Random Forest: {rf_path}")
        print(f"    - XGBoost:       {xgb_path}")
        print(f"    - Label Encoder: {le_path}")
        print(f"    - Feature Schema:{os.path.join(self.models_dir, 'feature_schema.json')}")


def main():
    trainer = NidsTrainer()
    trainer.run_full_pipeline()


if __name__ == "__main__":
    main()
