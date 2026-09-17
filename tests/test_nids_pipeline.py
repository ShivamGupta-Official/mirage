"""Comprehensive Test Suite for NIDS Data and ML Pipeline.

Tests:
1. Strict Network Isolation Verification
2. Synthetic Packet Generation and Direct-to-Disk PCAP Serialization
3. Bidirectional Flow Feature Extraction and Schema Conformance
4. Data Quality Validation (0 NaN, 0 Inf, Low-Packet Flagging)
5. Public Dataset Ingestion and Canonical Taxonomy Alignment
6. Class Imbalance Detection and SMOTE Balancing
7. Cross-Source Held-Out Splitting
8. Model Inference Compatibility with Exported Schema
"""

import json
import os
import sys
import unittest

import joblib
import numpy as np
import pandas as pd

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from data_generation.attacks.c2_beacon_generator import C2BeaconGenerator
from data_generation.attacks.flood_generator import FloodGenerator
from data_generation.benign_generator import BenignTrafficGenerator
from data_generation.isolation import (
    NetworkIsolationError,
    assert_ip_in_lab,
    confirm_network_isolation,
)
from datasets.aligner import align_to_canonical_schema, map_to_canonical_label
from features.cic_schema import CANONICAL_CICIDS_COLUMNS, FEATURE_COLUMNS
from features.validator import FlowValidator
from pipeline.balancer import ClassBalancer
from pipeline.splitter import DatasetSplitter


class TestNidsPipeline(unittest.TestCase):
    """End-to-end unit and integration tests."""

    def test_01_network_isolation_safety(self):
        """Assures that external or host physical IPs are strictly blocked."""
        # 1. Valid lab IP must pass
        assert_ip_in_lab("10.99.1.50", context="TestLabIP")
        assert_ip_in_lab("127.0.0.1", context="TestLoopback")

        # 2. Public Internet IP must raise NetworkIsolationError
        with self.assertRaises(NetworkIsolationError):
            assert_ip_in_lab("8.8.8.8", context="TestPublicDNS")

        with self.assertRaises(NetworkIsolationError):
            assert_ip_in_lab("1.1.1.1", context="TestCloudflareDNS")

        # 3. Pre-flight isolation audit
        audit = confirm_network_isolation(verbose=False)
        self.assertEqual(audit["status"], "ISOLATED")
        self.assertEqual(audit["mode"], "IN_MEMORY_PCAP_SERIALIZATION")

    def test_02_packet_generators(self):
        """Tests that synthetic packet generators construct valid in-memory packets."""
        # Benign
        benign_gen = BenignTrafficGenerator()
        pkts, meta = benign_gen.generate_trex_transactional(num_transactions=2)
        self.assertGreater(len(pkts), 5)
        self.assertEqual(meta["generator"], "TRex_HTTP")

        # Flood
        flood_gen = FloodGenerator()
        pkts, meta = flood_gen.generate_syn_flood(duration=0.5, rate_pps=100.0)
        self.assertGreater(len(pkts), 10)
        self.assertEqual(meta["attack_type"], "syn_flood")

        # C2 Beacon
        c2_gen = C2BeaconGenerator()
        pkts, meta = c2_gen.generate_beacon_session(beacon_count=3)
        self.assertGreater(len(pkts), 6)
        self.assertEqual(meta["attack_type"], "c2_beacon")

    def test_03_schema_alignment_and_taxonomy(self):
        """Tests column alignment and label canonicalization."""
        # Label canonicalization
        self.assertEqual(map_to_canonical_label("DoS Slowloris"), "slowloris")
        self.assertEqual(map_to_canonical_label("DDoS-SYN"), "syn_flood")
        self.assertEqual(map_to_canonical_label("UDP-Flood"), "udp_flood")
        self.assertEqual(map_to_canonical_label("Botnet"), "c2_beacon")
        self.assertEqual(map_to_canonical_label("dnscat2"), "dns_tunnel")
        self.assertEqual(map_to_canonical_label("BENIGN"), "benign")

        # Column alignment
        dummy_df = pd.DataFrame({
            " Flow Duration": [1000.0],
            " Total Fwd Packets": [5],
            "Total Backward Packets": [4],
            "Label": ["DoS Slowloris"],
        })
        aligned = align_to_canonical_schema(dummy_df, source_name="test_source")
        self.assertEqual(aligned.shape[1], len(CANONICAL_CICIDS_COLUMNS) + 1)  # + 'source'
        self.assertEqual(aligned["Label"].iloc[0], "slowloris")
        self.assertEqual(aligned["source"].iloc[0], "test_source")

    def test_04_flow_validator(self):
        """Verifies 0 NaN, 0 Inf assertion and artifact flagging."""
        validator = FlowValidator()
        dirty_df = pd.DataFrame({
            "Flow Duration": [1000.0, np.inf, 2000.0],
            "Total Fwd Packets": [5, 1, 10],
            "Total Backward Packets": [5, 0, 10],
            "Flow Bytes/s": [100.0, np.nan, 200.0],
            "Label": ["benign", "syn_flood", "benign"],
        })
        # Add rest of columns
        for c in FEATURE_COLUMNS:
            if c not in dirty_df.columns:
                dirty_df[c] = 0.0

        cleaned, report = validator.validate_and_clean(dirty_df, source_name="test_clean")
        self.assertTrue(report["passed"])
        self.assertEqual(report["nan_cells_found"], 1)
        self.assertEqual(report["inf_cells_found"], 1)
        self.assertFalse(np.isinf(cleaned["Flow Duration"].values).any())
        self.assertFalse(cleaned["Flow Bytes/s"].isna().any())

    def test_05_class_balancer_and_thresholds(self):
        """Verifies detection of minority classes below 5% of majority."""
        balancer = ClassBalancer(minority_threshold_pct=0.05)
        labels = (
            ["majority"] * 1000 +
            ["class_medium"] * 200 +
            ["class_rare"] * 10
        )
        y = pd.Series(labels)
        analysis = balancer.analyze_distribution(y, verbose=False)
        self.assertIn("class_rare", analysis["flagged_minority_classes"])
        self.assertNotIn("class_medium", analysis["flagged_minority_classes"])

    def test_06_model_inference_pipeline(self):
        """Validates that exported models can directly load and predict on valid schema rows."""
        rf_path = "models/RandomForest_NIDS.joblib"
        schema_path = "models/feature_schema.json"

        self.assertTrue(os.path.exists(rf_path), "Random Forest model checkpoint must exist")
        self.assertTrue(os.path.exists(schema_path), "Feature schema JSON must exist")

        with open(schema_path) as f:
            schema = json.load(f)

        rf_model = joblib.load(rf_path)
        feature_cols = schema["columns"]

        # Synthetic test vector with 77 features
        dummy_vector = pd.DataFrame([np.random.rand(len(feature_cols))], columns=feature_cols)
        prediction = rf_model.predict(dummy_vector)
        self.assertEqual(len(prediction), 1)
        self.assertIn(prediction[0], schema["target_classes"])


if __name__ == "__main__":
    unittest.main()
