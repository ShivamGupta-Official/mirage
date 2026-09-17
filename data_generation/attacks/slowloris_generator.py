"""Slowloris HTTP Exhaustion Generator for Isolated Lab Testbed.

Simulates slow HTTP header starvation attacks with varied concurrent socket counts,
socket hold times, keep-alive header intervals, and randomized client ports.
"""

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


class SlowlorisGenerator:
    """Simulates Slowloris HTTP slow-header connection exhaustion."""

    def __init__(self, target_ip: str = LAB_TARGET_SERVER_IP):
        self.target_ip = target_ip
        verify_packet_isolation(self.target_ip, "10.99.0.1")

    def generate_slowloris(
        self,
        connection_count: Optional[int] = None,
        hold_time: Optional[float] = None,
        keepalive_interval: Optional[float] = None,
        client_ip: Optional[str] = None,
        target_port: int = 80,
        start_time: float = 0.0,
    ) -> Tuple[List[Packet], Dict[str, Any]]:
        """Generates Slowloris attack session with concurrent held sockets."""
        connection_count = connection_count or random.randint(15, 60)
        hold_time = hold_time or random.uniform(15.0, 90.0)
        keepalive_interval = keepalive_interval or random.uniform(5.0, 15.0)
        client_ip = client_ip or f"10.99.1.{random.randint(10, 200)}"

        verify_packet_isolation(client_ip, self.target_ip)
        packets: List[Packet] = []

        # Stagger socket openings over first few seconds
        for conn_idx in range(connection_count):
            c_port = 30000 + conn_idx
            c_start = start_time + random.uniform(0.0, min(5.0, hold_time * 0.2))
            seq_c = random.randint(10000, 500000)
            seq_s = random.randint(10000, 500000)

            # Handshake
            p_syn = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                sport=c_port, dport=target_port, flags="S", seq=seq_c, window=29200
            )
            p_syn.time = c_start
            packets.append(p_syn)

            p_sa = Ether() / IP(src=self.target_ip, dst=client_ip) / TCP(
                sport=target_port, dport=c_port, flags="SA", seq=seq_s, ack=seq_c + 1, window=28960
            )
            p_sa.time = c_start + random.uniform(0.001, 0.005)
            packets.append(p_sa)

            seq_c += 1
            seq_s += 1
            p_ack = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                sport=c_port, dport=target_port, flags="A", seq=seq_c, ack=seq_s, window=29200
            )
            p_ack.time = p_sa.time + random.uniform(0.0005, 0.002)
            packets.append(p_ack)

            # Incomplete HTTP GET request header
            initial_req = (
                f"GET /?{random.randint(1000, 9999)} HTTP/1.1\r\n"
                f"Host: lab.target\r\n"
                f"User-Agent: Mozilla/5.0 (Slowloris/LabTestbed)\r\n"
                f"Accept: text/html,*/*\r\n"
            ).encode()

            p_req = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                sport=c_port, dport=target_port, flags="PA", seq=seq_c, ack=seq_s
            ) / initial_req
            p_req.time = p_ack.time + random.uniform(0.005, 0.02)
            packets.append(p_req)
            seq_c += len(initial_req)

            # Server ACK
            p_srv_ack = Ether() / IP(src=self.target_ip, dst=client_ip) / TCP(
                sport=target_port, dport=c_port, flags="A", seq=seq_s, ack=seq_c
            )
            p_srv_ack.time = p_req.time + random.uniform(0.001, 0.004)
            packets.append(p_srv_ack)

            # Periodic slow keepalive headers
            t_probe = p_srv_ack.time + keepalive_interval + random.uniform(-1.0, 1.0)
            end_conn_time = c_start + hold_time

            probe_counter = 0
            while t_probe < end_conn_time:
                hdr_probe = f"X-a-{probe_counter}: {random.randint(100, 999)}\r\n".encode()
                p_probe = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                    sport=c_port, dport=target_port, flags="PA", seq=seq_c, ack=seq_s
                ) / hdr_probe
                p_probe.time = t_probe
                packets.append(p_probe)
                seq_c += len(hdr_probe)

                # Server ACK for partial header
                p_probe_ack = Ether() / IP(src=self.target_ip, dst=client_ip) / TCP(
                    sport=target_port, dport=c_port, flags="A", seq=seq_s, ack=seq_c
                )
                p_probe_ack.time = t_probe + random.uniform(0.001, 0.005)
                packets.append(p_probe_ack)

                t_probe += keepalive_interval + random.uniform(-1.0, 1.5)
                probe_counter += 1

        packets.sort(key=lambda p: getattr(p, "time", 0.0))

        meta = {
            "attack_type": "slowloris",
            "client_ip": client_ip,
            "target_ip": self.target_ip,
            "connection_count": connection_count,
            "hold_time": hold_time,
            "keepalive_interval": keepalive_interval,
            "packet_count": len(packets),
        }
        return packets, meta
