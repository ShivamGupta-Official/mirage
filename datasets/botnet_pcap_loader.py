"""CTU-13 and ISOT Botnet PCAP Loader.

Extraction Status:
- RAW PCAP: Requires flow re-extraction (via features.extractor.FlowExtractor / NFStream)
  to generate bidirectional 80-feature flows for the C2/beaconing class.
"""

import glob
import os
import sys
from typing import List, Optional

import pandas as pd

from datasets.aligner import align_to_canonical_schema
from features.extractor import FlowExtractor


class BotnetPcapLoader:
    """Loads and extracts flows from CTU-13 and ISOT raw botnet PCAPs."""

    def __init__(self, data_dir: str = "data/public/botnet_pcaps"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        self.extractor = FlowExtractor()

    def load_and_extract(
        self,
        source_name: str = "ctu13",
        botnet_label: str = "c2_beacon",
        max_flows: Optional[int] = 5000,
    ) -> pd.DataFrame:
        """Processes raw PCAPs from data_dir and extracts canonical flow features."""
        pcap_files = glob.glob(os.path.join(self.data_dir, "**/*.pcap"), recursive=True)
        if not pcap_files:
            return pd.DataFrame()

        flow_dfs = []
        for pcap in pcap_files:
            try:
                base_lower = os.path.basename(pcap).lower()
                cur_source = source_name
                if "isot" in base_lower:
                    cur_source = "isot"
                elif "stratosphere" in base_lower or "mcf" in base_lower:
                    cur_source = "stratosphere"
                elif "ctu" in base_lower or "neris" in base_lower or "rbot" in base_lower:
                    cur_source = "ctu13"

                df_flows = self.extractor.extract_pcap_to_flows(pcap, label=botnet_label)
                if len(df_flows) > 0:
                    aligned = align_to_canonical_schema(df_flows, source_name=cur_source, default_label=botnet_label)
                    flow_dfs.append(aligned)
            except Exception as e:
                print(f"[-] Error extracting flows from botnet pcap {pcap}: {e}")

        if not flow_dfs:
            return pd.DataFrame()

        combined = pd.concat(flow_dfs, ignore_index=True)
        if max_flows and len(combined) > max_flows:
            combined = combined.sample(n=max_flows, random_state=42).reset_index(drop=True)

        return combined
