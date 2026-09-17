"""
MIRAGE Network Traffic Dataset Generator
Generates realistic multi-resolution passive telemetry datasets for:
1. Benign Enterprise Operations
2. SYN Flood (L4 Transport)
3. UDP Reflection & Floods (L4 Datagram)
4. Slowloris Connection Starvation (L7 Application)
5. C2 Periodic Beaconing (Command & Control)
6. Covert DNS Tunneling & DGA (Data Exfiltration)

Engineered for passive unidirectional data diode tap monitoring.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from typing import Tuple


def generate_mirage_dataset(
    n_samples: int = 12000,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Generates a balanced multi-class dataset of network telemetry features.
    
    Returns:
        X (DataFrame): Feature matrix
        y (Series): Attack class labels ('benign', 'syn_flood', 'udp_flood', 'slowloris', 'c2_beacon', 'dns_tunnel')
    """
    rng = np.random.default_rng(random_state)
    
    # Class distribution: 50% benign, 10% each of 5 attack types
    n_benign = int(n_samples * 0.50)
    n_attack_each = int((n_samples - n_benign) / 5)
    
    records = []
    labels = []
    
    # 1. BENIGN TRAFFIC (Enterprise baseline: web, email, internal APIs)
    for _ in range(n_benign):
        pps = rng.lognormal(mean=2.8, sigma=0.5)  # ~15-30 pps
        syn_rate = rng.exponential(scale=3.0)     # low SYN rate
        syn_ack_ratio = rng.normal(loc=1.02, scale=0.15)  # balanced handshakes
        udp_rate = rng.exponential(scale=5.0)
        half_open = int(rng.poisson(lam=1.2))
        concurrent = int(rng.poisson(lam=12.0))
        periodicity = rng.beta(a=1.5, b=8.0)      # irregular user traffic
        cv = rng.normal(loc=1.25, scale=0.3)      # high inter-arrival jitter
        dns_entropy = rng.normal(loc=2.4, scale=0.35)  # typical english domain entropy
        dns_query_len = rng.normal(loc=18.0, scale=4.0)
        subdomain_ratio = rng.uniform(0.05, 0.25)
        byte_entropy = rng.normal(loc=4.5, scale=0.5)

        records.append({
            "packets_per_sec": max(1.0, pps),
            "syn_rate": max(0.0, syn_rate),
            "syn_ack_ratio": max(0.5, syn_ack_ratio),
            "udp_rate": max(0.0, udp_rate),
            "half_open_connections": max(0, half_open),
            "concurrent_connections": max(1, concurrent),
            "periodicity_score": np.clip(periodicity, 0.0, 1.0),
            "inter_arrival_cv": max(0.4, cv),
            "dns_entropy": max(1.0, dns_entropy),
            "dns_query_len_mean": max(6.0, dns_query_len),
            "unique_subdomain_ratio": np.clip(subdomain_ratio, 0.0, 1.0),
            "byte_entropy": np.clip(byte_entropy, 1.0, 8.0),
        })
        labels.append("benign")

    # 2. SYN FLOOD (High SYN rate, asymmetric SYN/ACK ratio > 4.0)
    for _ in range(n_attack_each):
        pps = rng.uniform(800.0, 4500.0)
        syn_rate = rng.uniform(400.0, 2500.0)
        syn_ack_ratio = rng.uniform(5.0, 25.0)
        udp_rate = rng.exponential(scale=10.0)
        half_open = int(rng.uniform(80, 500))
        concurrent = int(rng.uniform(150, 800))
        periodicity = rng.beta(a=2.0, b=4.0)
        cv = rng.normal(loc=0.8, scale=0.2)
        dns_entropy = rng.normal(loc=2.3, scale=0.3)
        dns_query_len = rng.normal(loc=16.0, scale=3.0)
        subdomain_ratio = rng.uniform(0.05, 0.2)
        byte_entropy = rng.normal(loc=2.1, scale=0.4)  # repetitive SYN packets

        records.append({
            "packets_per_sec": pps,
            "syn_rate": syn_rate,
            "syn_ack_ratio": syn_ack_ratio,
            "udp_rate": max(0.0, udp_rate),
            "half_open_connections": half_open,
            "concurrent_connections": concurrent,
            "periodicity_score": np.clip(periodicity, 0.0, 1.0),
            "inter_arrival_cv": max(0.2, cv),
            "dns_entropy": max(1.0, dns_entropy),
            "dns_query_len_mean": max(6.0, dns_query_len),
            "unique_subdomain_ratio": np.clip(subdomain_ratio, 0.0, 1.0),
            "byte_entropy": np.clip(byte_entropy, 1.0, 8.0),
        })
        labels.append("syn_flood")

    # 3. UDP FLOOD / REFLECTION
    for _ in range(n_attack_each):
        pps = rng.uniform(1200.0, 6000.0)
        syn_rate = rng.exponential(scale=2.0)
        syn_ack_ratio = rng.normal(loc=1.0, scale=0.1)
        udp_rate = rng.uniform(1000.0, 5500.0)
        half_open = int(rng.poisson(lam=1.0))
        concurrent = int(rng.poisson(lam=8.0))
        periodicity = rng.beta(a=3.0, b=3.0)
        cv = rng.normal(loc=0.35, scale=0.1)
        dns_entropy = rng.normal(loc=2.4, scale=0.3)
        dns_query_len = rng.normal(loc=17.0, scale=3.0)
        subdomain_ratio = rng.uniform(0.05, 0.2)
        byte_entropy = rng.normal(loc=6.8, scale=0.4)  # randomized reflection payload

        records.append({
            "packets_per_sec": pps,
            "syn_rate": max(0.0, syn_rate),
            "syn_ack_ratio": max(0.5, syn_ack_ratio),
            "udp_rate": udp_rate,
            "half_open_connections": max(0, half_open),
            "concurrent_connections": max(1, concurrent),
            "periodicity_score": np.clip(periodicity, 0.0, 1.0),
            "inter_arrival_cv": max(0.1, cv),
            "dns_entropy": max(1.0, dns_entropy),
            "dns_query_len_mean": max(6.0, dns_query_len),
            "unique_subdomain_ratio": np.clip(subdomain_ratio, 0.0, 1.0),
            "byte_entropy": np.clip(byte_entropy, 1.0, 8.0),
        })
        labels.append("udp_flood")

    # 4. SLOWLORIS (Low packet rate, high stalled sockets & half-open connections)
    for _ in range(n_attack_each):
        pps = rng.uniform(8.0, 25.0)  # low pps to evade volumetric filters
        syn_rate = rng.uniform(2.0, 8.0)
        syn_ack_ratio = rng.normal(loc=1.1, scale=0.2)
        udp_rate = rng.exponential(scale=1.0)
        half_open = int(rng.uniform(45, 160))      # stalled sockets
        concurrent = int(rng.uniform(60, 200))
        periodicity = rng.uniform(0.65, 0.95)      # periodic 10s header probes
        cv = rng.normal(loc=0.18, scale=0.06)
        dns_entropy = rng.normal(loc=2.3, scale=0.3)
        dns_query_len = rng.normal(loc=16.0, scale=3.0)
        subdomain_ratio = rng.uniform(0.05, 0.2)
        byte_entropy = rng.normal(loc=3.8, scale=0.4)

        records.append({
            "packets_per_sec": pps,
            "syn_rate": max(0.0, syn_rate),
            "syn_ack_ratio": max(0.5, syn_ack_ratio),
            "udp_rate": max(0.0, udp_rate),
            "half_open_connections": half_open,
            "concurrent_connections": concurrent,
            "periodicity_score": np.clip(periodicity, 0.0, 1.0),
            "inter_arrival_cv": max(0.05, cv),
            "dns_entropy": max(1.0, dns_entropy),
            "dns_query_len_mean": max(6.0, dns_query_len),
            "unique_subdomain_ratio": np.clip(subdomain_ratio, 0.0, 1.0),
            "byte_entropy": np.clip(byte_entropy, 1.0, 8.0),
        })
        labels.append("slowloris")

    # 5. C2 BEACONING (Extreme periodicity, low CV < 0.15, consistent small payload)
    for _ in range(n_attack_each):
        pps = rng.uniform(4.0, 18.0)
        syn_rate = rng.exponential(scale=1.5)
        syn_ack_ratio = rng.normal(loc=1.0, scale=0.1)
        udp_rate = rng.exponential(scale=2.0)
        half_open = int(rng.poisson(lam=0.5))
        concurrent = int(rng.poisson(lam=3.0))
        periodicity = rng.uniform(0.85, 0.99)      # clockwork heartbeat
        cv = rng.uniform(0.02, 0.14)               # low coefficient of variation
        dns_entropy = rng.normal(loc=2.9, scale=0.4)
        dns_query_len = rng.normal(loc=22.0, scale=4.0)
        subdomain_ratio = rng.uniform(0.15, 0.40)
        byte_entropy = rng.normal(loc=5.8, scale=0.4)

        records.append({
            "packets_per_sec": pps,
            "syn_rate": max(0.0, syn_rate),
            "syn_ack_ratio": max(0.5, syn_ack_ratio),
            "udp_rate": max(0.0, udp_rate),
            "half_open_connections": max(0, half_open),
            "concurrent_connections": max(1, concurrent),
            "periodicity_score": np.clip(periodicity, 0.0, 1.0),
            "inter_arrival_cv": max(0.01, cv),
            "dns_entropy": max(1.0, dns_entropy),
            "dns_query_len_mean": max(6.0, dns_query_len),
            "unique_subdomain_ratio": np.clip(subdomain_ratio, 0.0, 1.0),
            "byte_entropy": np.clip(byte_entropy, 1.0, 8.0),
        })
        labels.append("c2_beacon")

    # 6. COVERT DNS TUNNELING & DGA (High Shannon entropy > 3.8, long query names, high subdomain churn)
    for _ in range(n_attack_each):
        pps = rng.uniform(25.0, 120.0)
        syn_rate = rng.exponential(scale=2.0)
        syn_ack_ratio = rng.normal(loc=1.0, scale=0.1)
        udp_rate = rng.uniform(20.0, 90.0)
        half_open = int(rng.poisson(lam=0.8))
        concurrent = int(rng.poisson(lam=5.0))
        periodicity = rng.beta(a=2.0, b=5.0)
        cv = rng.normal(loc=0.7, scale=0.2)
        dns_entropy = rng.uniform(3.85, 4.95)      # Base64/Base32 encoded exfiltration
        dns_query_len = rng.uniform(42.0, 148.0)   # long FQDN queries
        subdomain_ratio = rng.uniform(0.75, 0.98)  # massive unique subdomain churn
        byte_entropy = rng.normal(loc=6.2, scale=0.5)

        records.append({
            "packets_per_sec": pps,
            "syn_rate": max(0.0, syn_rate),
            "syn_ack_ratio": max(0.5, syn_ack_ratio),
            "udp_rate": max(0.0, udp_rate),
            "half_open_connections": max(0, half_open),
            "concurrent_connections": max(1, concurrent),
            "periodicity_score": np.clip(periodicity, 0.0, 1.0),
            "inter_arrival_cv": max(0.1, cv),
            "dns_entropy": dns_entropy,
            "dns_query_len_mean": dns_query_len,
            "unique_subdomain_ratio": np.clip(subdomain_ratio, 0.0, 1.0),
            "byte_entropy": np.clip(byte_entropy, 1.0, 8.0),
        })
        labels.append("dns_tunnel")

    df = pd.DataFrame(records)
    series_labels = pd.Series(labels, name="label")
    return df, series_labels


if __name__ == "__main__":
    X, y = generate_mirage_dataset(n_samples=5000)
    print(f"Generated {len(X)} samples with {X.shape[1]} features.")
    print("Class distribution:\n", y.value_counts())
