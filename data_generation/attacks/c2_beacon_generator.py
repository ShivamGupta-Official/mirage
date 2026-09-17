"""Sandboxed C2 Emulator for Beaconing Traffic.

Simulates Command and Control (C2) beaconing patterns with diverse timing distributions:
- Fixed periodic intervals
- Uniform random jitter
- Exponential backoff
- Gaussian jitter distributions
Accurately models the inter-arrival time (IAT) variance and periodicity that forms
the core detection signal in flow-based ML models.
"""

import math
import os
import random
from typing import Any, Dict, List, Optional, Tuple

from scapy.layers.inet import IP, TCP
from scapy.layers.l2 import Ether
from scapy.packet import Packet

from data_generation.isolation import (
    LAB_CLIENT_SUBNET,
    LAB_TARGET_SERVER_IP,
    verify_packet_isolation,
)


class C2BeaconGenerator:
    """Emulates C2 agent heartbeats with varied timing distributions and jitter."""

    def __init__(self, c2_server_ip: str = LAB_TARGET_SERVER_IP):
        self.c2_server_ip = c2_server_ip
        verify_packet_isolation(self.c2_server_ip, "10.99.0.1")

    def _sample_next_interval(
        self,
        distribution: str,
        base_interval: float,
        jitter_pct: float,
        iteration: int,
    ) -> float:
        """Computes next beacon sleep interval based on timing distribution."""
        if distribution == "fixed":
            # Strict periodic beacon (minimal nanosecond OS jitter)
            return base_interval + random.uniform(-0.02, 0.02)

        elif distribution == "uniform":
            # Uniform jitter within +/- jitter_pct
            delta = base_interval * jitter_pct
            return random.uniform(base_interval - delta, base_interval + delta)

        elif distribution == "exponential_backoff":
            # Exponential backoff with ceiling (e.g. 2s, 4s, 8s, 16s, 32s...)
            backoff_factor = min(32.0, math.pow(1.5, iteration % 6))
            jitter = random.uniform(0.85, 1.15)
            return base_interval * backoff_factor * jitter

        elif distribution == "gaussian":
            # Gaussian jitter with standard deviation proportional to jitter_pct
            sigma = base_interval * jitter_pct
            val = random.gauss(base_interval, sigma)
            return max(0.5, val)

        else:
            return base_interval

    def generate_beacon_session(
        self,
        distribution: Optional[str] = None,
        base_interval: Optional[float] = None,
        jitter_pct: Optional[float] = None,
        beacon_count: Optional[int] = None,
        client_ip: Optional[str] = None,
        c2_port: int = 8443,
        start_time: float = 0.0,
    ) -> Tuple[List[Packet], Dict[str, Any]]:
        """Simulates a multi-beacon C2 session."""
        distribution = distribution or random.choice(["fixed", "uniform", "exponential_backoff", "gaussian"])
        base_interval = base_interval or random.uniform(2.0, 15.0)
        jitter_pct = jitter_pct or random.uniform(0.10, 0.40)
        beacon_count = beacon_count or random.randint(8, 25)
        client_ip = client_ip or f"10.99.1.{random.randint(10, 240)}"

        verify_packet_isolation(client_ip, self.c2_server_ip)
        packets: List[Packet] = []
        cur_time = start_time
        agent_guid = os.urandom(8).hex()

        intervals_recorded: List[float] = []

        for i in range(beacon_count):
            c_port = random.randint(32768, 61000)
            seq_c = random.randint(10000, 500000)
            seq_s = random.randint(10000, 500000)

            # Handshake
            p_syn = Ether() / IP(src=client_ip, dst=self.c2_server_ip) / TCP(
                sport=c_port, dport=c2_port, flags="S", seq=seq_c, window=64240
            )
            p_syn.time = cur_time
            packets.append(p_syn)

            p_sa = Ether() / IP(src=self.c2_server_ip, dst=client_ip) / TCP(
                sport=c2_port, dport=c_port, flags="SA", seq=seq_s, ack=seq_c + 1, window=65535
            )
            p_sa.time = cur_time + random.uniform(0.001, 0.005)
            packets.append(p_sa)

            seq_c += 1
            seq_s += 1
            p_ack = Ether() / IP(src=client_ip, dst=self.c2_server_ip) / TCP(
                sport=c_port, dport=c2_port, flags="A", seq=seq_c, ack=seq_s, window=64240
            )
            p_ack.time = p_sa.time + random.uniform(0.0005, 0.002)
            packets.append(p_ack)

            # C2 Check-in POST payload
            payload_body = f'{{"id":"{agent_guid}","seq":{i},"status":"alive"}}'.encode()
            http_req = (
                f"POST /api/v1/heartbeat HTTP/1.1\r\n"
                f"Host: c2.internal\r\n"
                f"Content-Type: application/json\r\n"
                f"Content-Length: {len(payload_body)}\r\n\r\n"
            ).encode() + payload_body

            p_req = Ether() / IP(src=client_ip, dst=self.c2_server_ip) / TCP(
                sport=c_port, dport=c2_port, flags="PA", seq=seq_c, ack=seq_s
            ) / http_req
            p_req.time = p_ack.time + random.uniform(0.001, 0.004)
            packets.append(p_req)
            seq_c += len(http_req)

            # C2 Server Response (HTTP 200 OK + ACK)
            resp_body = b'{"status":"ok","tasks":[]}'
            http_resp = (
                f"HTTP/1.1 200 OK\r\n"
                f"Content-Type: application/json\r\n"
                f"Content-Length: {len(resp_body)}\r\n\r\n"
            ).encode() + resp_body

            p_resp = Ether() / IP(src=self.c2_server_ip, dst=client_ip) / TCP(
                sport=c2_port, dport=c_port, flags="PA", seq=seq_s, ack=seq_c
            ) / http_resp
            p_resp.time = p_req.time + random.uniform(0.002, 0.010)
            packets.append(p_resp)
            seq_s += len(http_resp)

            # Client ACK
            p_cack = Ether() / IP(src=client_ip, dst=self.c2_server_ip) / TCP(
                sport=c_port, dport=c2_port, flags="A", seq=seq_c, ack=seq_s
            )
            p_cack.time = p_resp.time + random.uniform(0.0005, 0.002)
            packets.append(p_cack)

            # Teardown
            p_fin = Ether() / IP(src=client_ip, dst=self.c2_server_ip) / TCP(
                sport=c_port, dport=c2_port, flags="FA", seq=seq_c, ack=seq_s
            )
            p_fin.time = p_cack.time + random.uniform(0.001, 0.004)
            packets.append(p_fin)

            # Calculate next sleep interval
            interval = self._sample_next_interval(distribution, base_interval, jitter_pct, i)
            intervals_recorded.append(interval)
            cur_time = p_fin.time + interval

        meta = {
            "attack_type": "c2_beacon",
            "distribution": distribution,
            "base_interval": base_interval,
            "jitter_pct": jitter_pct,
            "beacon_count": beacon_count,
            "client_ip": client_ip,
            "target_ip": self.c2_server_ip,
            "packet_count": len(packets),
            "mean_interval": sum(intervals_recorded) / len(intervals_recorded) if intervals_recorded else 0,
        }
        return packets, meta
