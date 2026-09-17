"""hping3-style SYN and UDP Flood Generator for Isolated Lab Testbed.

Simulates volumetric SYN floods and UDP reflection/floods with randomized rates,
spoofed source addresses strictly within the lab subnet, varied packet sizes,
and jitter to ensure realistic variance across runs.
"""

import os
import random
from typing import Any, Dict, List, Optional, Tuple

from scapy.layers.inet import IP, TCP, UDP
from scapy.layers.l2 import Ether
from scapy.packet import Packet

from data_generation.isolation import (
    LAB_CLIENT_MAC,
    LAB_SERVER_MAC,
    LAB_CLIENT_SUBNET,
    LAB_TARGET_SERVER_IP,
    verify_packet_isolation,
)


def _sample_spoofed_lab_ip() -> str:
    """Generates a randomized spoofed IP strictly within the lab subnet 10.99.1.0/24."""
    host = random.randint(2, 254)
    return f"10.99.1.{host}"


class FloodGenerator:
    """Generates volumetric SYN and UDP flood attacks."""

    def __init__(self, target_ip: str = LAB_TARGET_SERVER_IP):
        self.target_ip = target_ip
        verify_packet_isolation(self.target_ip, "10.99.0.1")

    def generate_syn_flood(
        self,
        duration: Optional[float] = None,
        rate_pps: Optional[float] = None,
        packet_size: Optional[int] = None,
        spoof_sources: bool = True,
        target_port: Optional[int] = None,
        start_time: float = 0.0,
    ) -> Tuple[List[Packet], Dict[str, Any]]:
        """Simulates an hping3 SYN flood with randomized rates, sizes, and spoofed lab IPs."""
        duration = duration or random.uniform(1.0, 5.0)
        rate_pps = rate_pps or random.uniform(100.0, 500.0)
        target_port = target_port or random.choice([80, 443, 8080, 22, 5201])
        base_src_ip = _sample_spoofed_lab_ip()

        total_packets = int(duration * rate_pps)
        total_packets = max(20, min(total_packets, 1200))
        interval = 1.0 / rate_pps

        packets: List[Packet] = []
        cur_time = start_time

        for _ in range(total_packets):
            src_ip = _sample_spoofed_lab_ip() if spoof_sources else base_src_ip
            verify_packet_isolation(src_ip, self.target_ip)
            sport = random.randint(1024, 65535)
            seq = random.randint(1000, 4000000000)
            window = random.choice([1024, 2048, 4096, 8192, 16384, 64240])

            pad_len = packet_size if packet_size is not None else random.choice([0, 0, 0, 32, 64, 128])
            payload = os.urandom(pad_len) if pad_len > 0 else b""

            pkt = Ether(src=LAB_CLIENT_MAC, dst=LAB_SERVER_MAC) / IP(
                src=src_ip, dst=self.target_ip, ttl=random.randint(48, 128)
            ) / TCP(
                sport=sport, dport=target_port, flags="S", seq=seq, window=window
            ) / payload
            pkt.time = cur_time
            packets.append(pkt)

            # High-rate flood jitter
            cur_time += max(0.00001, random.gauss(interval, interval * 0.15))

        meta = {
            "attack_type": "syn_flood",
            "target_ip": self.target_ip,
            "target_port": target_port,
            "duration": duration,
            "rate_pps": rate_pps,
            "packet_count": len(packets),
            "spoofed_sources": spoof_sources,
            "avg_packet_size": sum(len(p) for p in packets) / len(packets),
        }
        return packets, meta

    def generate_udp_flood(
        self,
        duration: Optional[float] = None,
        rate_pps: Optional[float] = None,
        packet_size: Optional[int] = None,
        spoof_sources: bool = True,
        start_time: float = 0.0,
    ) -> Tuple[List[Packet], Dict[str, Any]]:
        """Simulates an hping3 UDP flood with randomized payloads and target ports."""
        duration = duration or random.uniform(1.0, 5.0)
        rate_pps = rate_pps or random.uniform(100.0, 500.0)
        base_src_ip = _sample_spoofed_lab_ip()

        total_packets = int(duration * rate_pps)
        total_packets = max(20, min(total_packets, 1200))
        interval = 1.0 / rate_pps

        packets: List[Packet] = []
        cur_time = start_time

        for _ in range(total_packets):
            src_ip = _sample_spoofed_lab_ip() if spoof_sources else base_src_ip
            verify_packet_isolation(src_ip, self.target_ip)
            sport = random.randint(1024, 65535)
            dport = random.randint(1024, 65535)

            p_size = packet_size if packet_size is not None else random.randint(64, 1400)
            payload = os.urandom(max(1, p_size - 28))

            pkt = Ether(src=LAB_CLIENT_MAC, dst=LAB_SERVER_MAC) / IP(
                src=src_ip, dst=self.target_ip, ttl=random.randint(50, 128)
            ) / UDP(
                sport=sport, dport=dport
            ) / payload
            pkt.time = cur_time
            packets.append(pkt)

            cur_time += max(0.00001, random.gauss(interval, interval * 0.15))

        meta = {
            "attack_type": "udp_flood",
            "target_ip": self.target_ip,
            "duration": duration,
            "rate_pps": rate_pps,
            "packet_count": len(packets),
            "spoofed_sources": spoof_sources,
            "avg_packet_size": sum(len(p) for p in packets) / len(packets),
        }
        return packets, meta
