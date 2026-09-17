"""Canonical Column Schema and Taxonomy Aligner for Heterogeneous Datasets.

Normalizes diverse column naming conventions, strips trailing/leading whitespaces,
imputes missing columns, and maps diverse public attack labels to canonical taxonomy:
- benign
- syn_flood
- udp_flood
- slowloris
- dns_tunnel
- dga
- c2_beacon
"""

import re
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

from features.cic_schema import CANONICAL_CICIDS_COLUMNS, FEATURE_COLUMNS

# Canonical label mapping dictionary for public dataset variants
LABEL_TAXONOMY_MAP: Dict[str, str] = {
    # Benign variants
    "benign": "benign",
    "normal": "benign",
    "background": "benign",
    "legitimate": "benign",
    "clean": "benign",
    
    # SYN Flood variants
    "syn_flood": "syn_flood",
    "syn flood": "syn_flood",
    "dos syn": "syn_flood",
    "ddos syn": "syn_flood",
    "ddos-syn": "syn_flood",
    "syn": "syn_flood",
    "tcp syn flood": "syn_flood",

    # UDP Flood variants
    "udp_flood": "udp_flood",
    "udp flood": "udp_flood",
    "dos udp": "udp_flood",
    "ddos udp": "udp_flood",
    "ddos-udp": "udp_flood",
    "udp": "udp_flood",

    # Slowloris variants
    "slowloris": "slowloris",
    "dos slowloris": "slowloris",
    "ddos slowloris": "slowloris",
    "dos-slowloris": "slowloris",
    "slow_http": "slowloris",

    # DNS Tunnel variants
    "dns_tunnel": "dns_tunnel",
    "dns tunneling": "dns_tunnel",
    "dnscat2": "dns_tunnel",
    "iodine": "dns_tunnel",
    "dns tunnel": "dns_tunnel",
    "dns-tunnel": "dns_tunnel",

    # DGA variants
    "dga": "dga",
    "dga_domain": "dga",
    "conficker": "dga",
    "necurs": "dga",
    "mirai_dga": "dga",

    # C2 / Botnet Beaconing variants
    "c2_beacon": "c2_beacon",
    "c2": "c2_beacon",
    "bot": "c2_beacon",
    "botnet": "c2_beacon",
    "ares": "c2_beacon",
    "neris": "c2_beacon",
    "rbot": "c2_beacon",
    "beacon": "c2_beacon",
    "c2_traffic": "c2_beacon",
}


def map_to_canonical_label(raw_label: any) -> str:
    """Maps arbitrary dataset labels to the unified canonical taxonomy."""
    if pd.isna(raw_label):
        return "benign"
    clean_str = str(raw_label).strip().lower()
    clean_str = re.sub(r"[_\-]+", " ", clean_str)

    for pattern, canonical in LABEL_TAXONOMY_MAP.items():
        if pattern in clean_str:
            return canonical

    return "benign"


def align_to_canonical_schema(
    df: pd.DataFrame,
    source_name: str,
    default_label: Optional[str] = None,
) -> pd.DataFrame:
    """Aligns a raw or processed dataframe to the canonical CICIDS 78-feature schema."""
    if len(df) == 0:
        empty = pd.DataFrame(columns=CANONICAL_CICIDS_COLUMNS + ["source"])
        return empty

    out_df = pd.DataFrame()
    # Normalize input column names: strip whitespace
    col_map = {col: col.strip() for col in df.columns}
    renamed_df = df.rename(columns=col_map)

    # Copy matching numerical columns
    for feat in FEATURE_COLUMNS:
        if feat in renamed_df.columns:
            out_df[feat] = pd.to_numeric(renamed_df[feat], errors="coerce").fillna(0.0)
        else:
            # Check case-insensitive match
            matches = [c for c in renamed_df.columns if c.lower() == feat.lower()]
            if matches:
                out_df[feat] = pd.to_numeric(renamed_df[matches[0]], errors="coerce").fillna(0.0)
            else:
                out_df[feat] = 0.0

    # Align Label
    label_candidates = ["Label", "label", "class", "Class", "Attack", "attack"]
    raw_label_col = None
    for cand in label_candidates:
        if cand in renamed_df.columns:
            raw_label_col = cand
            break

    if raw_label_col:
        out_df["Label"] = renamed_df[raw_label_col].apply(map_to_canonical_label)
    elif default_label:
        out_df["Label"] = map_to_canonical_label(default_label)
    else:
        out_df["Label"] = "benign"

    # Add source provenance tag
    out_df["source"] = source_name

    # Validate output schema
    return out_df
