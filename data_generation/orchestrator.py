"""Master Traffic Generation and PCAP Orchestrator.

Orchestrates all synthetic benign and attack traffic generation runs, strictly verifying
network isolation before execution, randomizing parameters per run, and serializing
labeled PCAPs and ground-truth metadata to disk.
"""

import argparse
import datetime
import json
import os
import random
import sys
import time
import uuid
from typing import Any, Dict, List, Optional

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scapy.utils import wrpcap

from data_generation.attacks.c2_beacon_generator import C2BeaconGenerator
from data_generation.attacks.dga_generator import DgaGenerator
from data_generation.attacks.dns_tunnel_generator import DnsTunnelGenerator
from data_generation.attacks.flood_generator import FloodGenerator
from data_generation.attacks.slowloris_generator import SlowlorisGenerator
from data_generation.benign_generator import BenignTrafficGenerator
from data_generation.isolation import (
    LAB_DNS_SINKHOLE_IP,
    LAB_TARGET_SERVER_IP,
    confirm_network_isolation,
)


CANONICAL_CLASSES = [
    "benign",
    "syn_flood",
    "udp_flood",
    "slowloris",
    "dns_tunnel",
    "dga",
    "c2_beacon",
]


class PcapOrchestrator:
    """Orchestrates isolated traffic generation and exports labeled PCAPs + metadata."""

    def __init__(
        self,
        output_dir: str = "data/raw",
        target_ip: str = LAB_TARGET_SERVER_IP,
        dns_sinkhole_ip: str = LAB_DNS_SINKHOLE_IP,
    ):
        self.output_dir = output_dir
        self.pcap_dir = os.path.join(output_dir, "pcaps")
        self.meta_dir = os.path.join(output_dir, "metadata")
        os.makedirs(self.pcap_dir, exist_ok=True)
        os.makedirs(self.meta_dir, exist_ok=True)

        self.target_ip = target_ip
        self.dns_sinkhole_ip = dns_sinkhole_ip

        # Pre-flight isolation verification
        self.isolation_audit = confirm_network_isolation(verbose=True)

        # Initialize generators
        self.benign_gen = BenignTrafficGenerator(target_ip=target_ip, dns_server_ip=dns_sinkhole_ip)
        self.flood_gen = FloodGenerator(target_ip=target_ip)
        self.slowloris_gen = SlowlorisGenerator(target_ip=target_ip)
        self.dns_tunnel_gen = DnsTunnelGenerator(dns_sinkhole_ip=dns_sinkhole_ip)
        self.dga_gen = DgaGenerator(dns_sinkhole_ip=dns_sinkhole_ip)
        self.c2_gen = C2BeaconGenerator(c2_server_ip=target_ip)

    def generate_single_run(self, label: str) -> Dict[str, Any]:
        """Executes a single randomized run for the specified class and writes PCAP + metadata."""
        if label not in CANONICAL_CLASSES:
            raise ValueError(f"Unknown class '{label}'. Must be one of {CANONICAL_CLASSES}")

        run_id = uuid.uuid4().hex[:8]
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = f"{label}_{timestamp}_{run_id}"
        pcap_path = os.path.join(self.pcap_dir, f"{base_name}.pcap")
        meta_path = os.path.join(self.meta_dir, f"{base_name}.json")

        packets = []
        gen_params: Dict[str, Any] = {}

        if label == "benign":
            sub_type = random.choice(["iperf_tcp", "iperf_udp", "trex_http", "ostinato_mixed", "batch"])
            if sub_type == "iperf_tcp":
                packets, gen_params = self.benign_gen.generate_iperf_stream(protocol="tcp")
            elif sub_type == "iperf_udp":
                packets, gen_params = self.benign_gen.generate_iperf_stream(protocol="udp")
            elif sub_type == "trex_http":
                packets, gen_params = self.benign_gen.generate_trex_transactional()
            elif sub_type == "ostinato_mixed":
                packets, gen_params = self.benign_gen.generate_ostinato_mixed()
            else:
                packets, gen_params_list = self.benign_gen.generate_batch(count=random.randint(3, 6))
                gen_params = {"sub_runs": gen_params_list, "generator": "benign_batch"}

        elif label == "syn_flood":
            packets, gen_params = self.flood_gen.generate_syn_flood()

        elif label == "udp_flood":
            packets, gen_params = self.flood_gen.generate_udp_flood()

        elif label == "slowloris":
            packets, gen_params = self.slowloris_gen.generate_slowloris()

        elif label == "dns_tunnel":
            packets, gen_params = self.dns_tunnel_gen.generate_tunnel()

        elif label == "dga":
            packets, gen_params = self.dga_gen.generate_dga_session()

        elif label == "c2_beacon":
            packets, gen_params = self.c2_gen.generate_beacon_session()

        if not packets:
            raise RuntimeError(f"Failed to generate packets for class {label}")

        # Ensure packets have valid timestamps and are strictly monotonic
        packets.sort(key=lambda p: getattr(p, "time", 0.0))

        # Write PCAP directly to disk (zero socket egress)
        wrpcap(pcap_path, packets)

        # Assemble metadata payload
        metadata = {
            "run_id": run_id,
            "timestamp": timestamp,
            "canonical_label": label,
            "source": "synthetic_lab",
            "pcap_file": os.path.abspath(pcap_path),
            "total_packets": len(packets),
            "file_size_bytes": os.path.getsize(pcap_path),
            "generation_parameters": gen_params,
            "isolation_audit": {
                "status": self.isolation_audit["status"],
                "mode": self.isolation_audit["mode"],
            },
        }

        with open(meta_path, "w") as f:
            json.dump(metadata, f, indent=2)

        return metadata

    def generate_dataset_batch(
        self,
        runs_per_class: int = 5,
        classes: Optional[List[str]] = None,
        verbose: bool = True,
    ) -> List[Dict[str, Any]]:
        """Generates multiple randomized runs across all requested classes."""
        target_classes = classes or CANONICAL_CLASSES
        all_metadata = []

        if verbose:
            print(f"\n[Orchestrator] Starting generation of {runs_per_class} runs per class across {len(target_classes)} classes...")

        for cls in target_classes:
            for idx in range(runs_per_class):
                meta = self.generate_single_run(cls)
                all_metadata.append(meta)
                if verbose:
                    print(
                        f"  [+] Generated {cls.ljust(12)} (Run {idx+1}/{runs_per_class}) -> "
                        f"{meta['total_packets']} packets, {meta['file_size_bytes']} bytes -> {os.path.basename(meta['pcap_file'])}"
                    )

        # Write manifest summary
        manifest_path = os.path.join(self.output_dir, "generation_manifest.json")
        with open(manifest_path, "w") as f:
            json.dump(
                {
                    "generated_at": datetime.datetime.now().isoformat(),
                    "total_pcaps": len(all_metadata),
                    "runs_per_class": runs_per_class,
                    "classes": target_classes,
                    "runs": all_metadata,
                },
                f,
                indent=2,
            )

        if verbose:
            print(f"\n[Orchestrator] Complete! Generated {len(all_metadata)} labeled PCAPs in {self.pcap_dir}")
            print(f"[Orchestrator] Manifest saved to {manifest_path}")

        return all_metadata


def main():
    parser = argparse.ArgumentParser(description="Synthetic Network Intrusion PCAP Orchestrator")
    parser.add_argument("--runs-per-class", type=int, default=5, help="Number of randomized PCAP runs per class")
    parser.add_argument("--classes", nargs="+", choices=CANONICAL_CLASSES, default=CANONICAL_CLASSES, help="Classes to generate")
    parser.add_argument("--output-dir", type=str, default="data/raw", help="Output directory for pcaps and metadata")
    args = parser.parse_args()

    orchestrator = PcapOrchestrator(output_dir=args.output_dir)
    orchestrator.generate_dataset_batch(runs_per_class=args.runs_per_class, classes=args.classes)


if __name__ == "__main__":
    main()
