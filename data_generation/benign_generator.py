"""Benign Traffic Generator modeling iperf3, Ostinato, and TRex profiles.

Synthesizes realistic bidirectional enterprise traffic (bulk transfers, transactional HTTP,
DNS, mixed protocols) with natural jitter, burstiness, Poisson concurrency, and randomized
packet size distributions in a strictly isolated lab environment.
"""

import math
import os
import random
import time
from typing import Any, Dict, List, Optional, Tuple

from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.layers.dns import DNS, DNSQR, DNSRR
from scapy.layers.l2 import Ether
from scapy.packet import Packet

from data_generation.isolation import (
    LAB_CLIENT_SUBNET,
    LAB_DNS_SINKHOLE_IP,
    LAB_TARGET_SERVER_IP,
    verify_packet_isolation,
)


def _random_lab_client_ip() -> str:
    """Selects a randomized IP within the lab client subnet 10.99.1.0/24."""
    host_id = random.randint(2, 253)
    return f"10.99.1.{host_id}"


def _sample_packet_size() -> int:
    """Samples realistic internet packet size distribution (bimodal: ~64B, ~576B, ~1500B)."""
    r = random.random()
    if r < 0.35:
        # Small ACK / control packets
        return random.randint(54, 84)
    elif r < 0.55:
        # Medium transactions / DNS / HTTP responses
        return random.randint(200, 750)
    else:
        # Full MTU payload
        return random.randint(1200, 1514)


def _jittered_iat(base_interval: float, jitter_ratio: float = 0.4) -> float:
    """Generates realistic inter-arrival time with heavy-tailed Pareto/Gamma jitter."""
    # Mix exponential arrivals with Pareto burstiness
    exp_jitter = random.expovariate(1.0 / max(base_interval, 0.0001))
    pareto_burst = (random.paretovariate(alpha=1.5) - 1.0) * base_interval * 0.2
    iat = (base_interval * (1 - jitter_ratio)) + (exp_jitter * jitter_ratio) + pareto_burst
    return max(0.00005, iat)


class BenignTrafficGenerator:
    """Generates realistic benign traffic matching iperf3, Ostinato, and TRex behavior."""

    def __init__(
        self,
        target_ip: str = LAB_TARGET_SERVER_IP,
        dns_server_ip: str = LAB_DNS_SINKHOLE_IP,
    ):
        self.target_ip = target_ip
        self.dns_server_ip = dns_server_ip
        verify_packet_isolation(target_ip, dns_server_ip)

    def generate_iperf_stream(
        self,
        client_ip: Optional[str] = None,
        duration: Optional[float] = None,
        protocol: str = "tcp",
        base_rate_pps: Optional[float] = None,
        start_time: float = 0.0,
    ) -> Tuple[List[Packet], Dict[str, Any]]:
        """Generates an iperf3 bulk transfer session (TCP window sliding or UDP stream)."""
        client_ip = client_ip or _random_lab_client_ip()
        duration = duration or random.uniform(2.0, 30.0)
        base_rate_pps = base_rate_pps or random.uniform(50.0, 400.0)
        client_port = random.randint(32768, 61000)
        server_port = 5201  # Default iperf3 port

        verify_packet_isolation(client_ip, self.target_ip)
        packets: List[Packet] = []
        cur_time = start_time

        if protocol.lower() == "tcp":
            # 1. 3-Way Handshake
            seq_c = random.randint(10000, 500000)
            seq_s = random.randint(10000, 500000)

            # SYN
            p_syn = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                sport=client_port, dport=server_port, flags="S", seq=seq_c, window=64240
            )
            p_syn.time = cur_time
            packets.append(p_syn)
            cur_time += random.uniform(0.0005, 0.005)  # RTT jitter

            # SYN-ACK
            p_synack = Ether() / IP(src=self.target_ip, dst=client_ip) / TCP(
                sport=server_port, dport=client_port, flags="SA", seq=seq_s, ack=seq_c + 1, window=65535
            )
            p_synack.time = cur_time
            packets.append(p_synack)
            cur_time += random.uniform(0.0005, 0.003)

            # ACK
            seq_c += 1
            seq_s += 1
            p_ack = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                sport=client_port, dport=server_port, flags="A", seq=seq_c, ack=seq_s, window=64240
            )
            p_ack.time = cur_time
            packets.append(p_ack)

            # 2. Bulk Data Transfer
            end_time = start_time + duration
            base_interval = 1.0 / base_rate_pps
            bytes_transferred = 0

            while cur_time < end_time:
                # Client sends data segments (MSS 1460) with occasional burst
                burst_size = random.choice([1, 2, 3, 4])
                for _ in range(burst_size):
                    payload_len = random.choice([1460, 1420, 1024, 512])
                    p_data = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                        sport=client_port, dport=server_port, flags="PA", seq=seq_c, ack=seq_s, window=64240
                    ) / (b"X" * payload_len)
                    p_data.time = cur_time
                    packets.append(p_data)
                    seq_c += payload_len
                    bytes_transferred += payload_len
                    cur_time += random.uniform(0.00005, 0.0003)

                # Server ACKs
                p_sack = Ether() / IP(src=self.target_ip, dst=client_ip) / TCP(
                    sport=server_port, dport=client_port, flags="A", seq=seq_s, ack=seq_c, window=65535
                )
                p_sack.time = cur_time + random.uniform(0.0005, 0.002)
                packets.append(p_sack)

                cur_time += _jittered_iat(base_interval)

            # 3. Teardown (FIN-ACK)
            p_fin = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                sport=client_port, dport=server_port, flags="FA", seq=seq_c, ack=seq_s
            )
            p_fin.time = cur_time
            packets.append(p_fin)
            cur_time += random.uniform(0.0005, 0.003)

            p_finack = Ether() / IP(src=self.target_ip, dst=client_ip) / TCP(
                sport=server_port, dport=client_port, flags="FA", seq=seq_s, ack=seq_c + 1
            )
            p_finack.time = cur_time
            packets.append(p_finack)
            cur_time += random.uniform(0.0005, 0.002)

            p_lastack = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                sport=client_port, dport=server_port, flags="A", seq=seq_c + 1, ack=seq_s + 1
            )
            p_lastack.time = cur_time
            packets.append(p_lastack)

        else:
            # UDP stream
            end_time = start_time + duration
            base_interval = 1.0 / base_rate_pps
            pkt_id = 0
            while cur_time < end_time:
                payload_len = random.randint(512, 1470)
                payload = f"iperf3_udp_{pkt_id}_".encode() + os.urandom(max(0, payload_len - 20))
                p_udp = Ether() / IP(src=client_ip, dst=self.target_ip) / UDP(
                    sport=client_port, dport=server_port
                ) / payload
                p_udp.time = cur_time
                packets.append(p_udp)
                cur_time += _jittered_iat(base_interval, jitter_ratio=0.3)
                pkt_id += 1

        meta = {
            "generator": "iperf3",
            "protocol": protocol,
            "client_ip": client_ip,
            "target_ip": self.target_ip,
            "duration": duration,
            "rate_pps": base_rate_pps,
            "packet_count": len(packets),
        }
        return packets, meta

    def generate_trex_transactional(
        self,
        client_ip: Optional[str] = None,
        num_transactions: Optional[int] = None,
        start_time: float = 0.0,
    ) -> Tuple[List[Packet], Dict[str, Any]]:
        """Generates realistic TRex-style stateful HTTP/1.1 transactions with Poisson arrivals."""
        client_ip = client_ip or _random_lab_client_ip()
        num_transactions = num_transactions or random.randint(3, 15)
        client_port = random.randint(32768, 61000)
        server_port = 80

        verify_packet_isolation(client_ip, self.target_ip)
        packets: List[Packet] = []
        cur_time = start_time

        seq_c = random.randint(10000, 200000)
        seq_s = random.randint(10000, 200000)

        # 3-Way Handshake
        p1 = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(sport=client_port, dport=server_port, flags="S", seq=seq_c)
        p1.time = cur_time
        packets.append(p1)
        cur_time += random.uniform(0.001, 0.005)

        p2 = Ether() / IP(src=self.target_ip, dst=client_ip) / TCP(sport=server_port, dport=client_port, flags="SA", seq=seq_s, ack=seq_c + 1)
        p2.time = cur_time
        packets.append(p2)
        cur_time += random.uniform(0.001, 0.004)

        seq_c += 1
        seq_s += 1
        p3 = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(sport=client_port, dport=server_port, flags="A", seq=seq_c, ack=seq_s)
        p3.time = cur_time
        packets.append(p3)

        uris = ["/index.html", "/api/v1/status", "/static/app.js", "/images/logo.png", "/metrics", "/login"]
        for _ in range(num_transactions):
            cur_time += random.uniform(0.05, 0.8)  # User think time
            uri = random.choice(uris)
            req = f"GET {uri} HTTP/1.1\r\nHost: lab.internal\r\nUser-Agent: Mozilla/5.0 LabClient/1.0\r\nAccept: */*\r\n\r\n".encode()
            
            p_req = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                sport=client_port, dport=server_port, flags="PA", seq=seq_c, ack=seq_s
            ) / req
            p_req.time = cur_time
            packets.append(p_req)
            seq_c += len(req)
            cur_time += random.uniform(0.002, 0.015)  # Server processing latency

            # Server Response
            resp_body = os.urandom(random.randint(120, 4096))
            resp_hdr = f"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: {len(resp_body)}\r\n\r\n".encode()
            resp_full = resp_hdr + resp_body

            # Chunk into MSS slices
            for offset in range(0, len(resp_full), 1460):
                chunk = resp_full[offset : offset + 1460]
                p_resp = Ether() / IP(src=self.target_ip, dst=client_ip) / TCP(
                    sport=server_port, dport=client_port, flags="PA", seq=seq_s, ack=seq_c
                ) / chunk
                p_resp.time = cur_time
                packets.append(p_resp)
                seq_s += len(chunk)
                cur_time += random.uniform(0.0001, 0.0008)

            # Client ACK
            p_ack = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(
                sport=client_port, dport=server_port, flags="A", seq=seq_c, ack=seq_s
            )
            p_ack.time = cur_time
            packets.append(p_ack)

        # Connection teardown
        cur_time += random.uniform(0.01, 0.05)
        p_fin = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(sport=client_port, dport=server_port, flags="FA", seq=seq_c, ack=seq_s)
        p_fin.time = cur_time
        packets.append(p_fin)

        meta = {
            "generator": "TRex_HTTP",
            "client_ip": client_ip,
            "target_ip": self.target_ip,
            "transactions": num_transactions,
            "packet_count": len(packets),
        }
        return packets, meta

    def generate_ostinato_mixed(
        self,
        client_ip: Optional[str] = None,
        duration: Optional[float] = None,
        start_time: float = 0.0,
    ) -> Tuple[List[Packet], Dict[str, Any]]:
        """Generates Ostinato-style mixed multi-stream background traffic (DNS, NTP, ICMP, FTP)."""
        client_ip = client_ip or _random_lab_client_ip()
        duration = duration or random.uniform(5.0, 25.0)
        verify_packet_isolation(client_ip, self.target_ip)
        verify_packet_isolation(client_ip, self.dns_server_ip)

        packets: List[Packet] = []
        cur_time = start_time
        end_time = start_time + duration

        while cur_time < end_time:
            stream_type = random.choices(["dns", "icmp", "ntp", "tcp_probe"], weights=[0.45, 0.20, 0.15, 0.20])[0]

            if stream_type == "dns":
                qname = f"service-{random.randint(1, 100)}.lab.internal"
                txid = random.randint(1, 65535)
                # Query
                p_q = Ether() / IP(src=client_ip, dst=self.dns_server_ip) / UDP(sport=random.randint(30000, 60000), dport=53) / DNS(
                    id=txid, qr=0, qd=DNSQR(qname=qname, qtype="A")
                )
                p_q.time = cur_time
                packets.append(p_q)
                cur_time += random.uniform(0.001, 0.008)

                # Response
                p_r = Ether() / IP(src=self.dns_server_ip, dst=client_ip) / UDP(sport=53, dport=p_q[UDP].sport) / DNS(
                    id=txid, qr=1, aa=1, qd=DNSQR(qname=qname, qtype="A"),
                    an=DNSRR(rrname=qname, type="A", rdata=self.target_ip, ttl=300)
                )
                p_r.time = cur_time
                packets.append(p_r)

            elif stream_type == "icmp":
                seq_icmp = random.randint(1, 500)
                p_echo = Ether() / IP(src=client_ip, dst=self.target_ip) / ICMP(type=8, id=100, seq=seq_icmp) / (b"LAB_ECHO_" * 4)
                p_echo.time = cur_time
                packets.append(p_echo)
                cur_time += random.uniform(0.001, 0.004)

                p_rep = Ether() / IP(src=self.target_ip, dst=client_ip) / ICMP(type=0, id=100, seq=seq_icmp) / (b"LAB_ECHO_" * 4)
                p_rep.time = cur_time
                packets.append(p_rep)

            elif stream_type == "ntp":
                ntp_payload = b"\x1b" + 47 * b"\x00"
                p_ntp_q = Ether() / IP(src=client_ip, dst=self.target_ip) / UDP(sport=random.randint(30000, 60000), dport=123) / ntp_payload
                p_ntp_q.time = cur_time
                packets.append(p_ntp_q)
                cur_time += random.uniform(0.001, 0.003)

                p_ntp_r = Ether() / IP(src=self.target_ip, dst=client_ip) / UDP(sport=123, dport=p_ntp_q[UDP].sport) / ntp_payload
                p_ntp_r.time = cur_time
                packets.append(p_ntp_r)

            else:
                # TCP probe
                sport = random.randint(30000, 60000)
                dport = random.choice([22, 443, 8080])
                seq = random.randint(1000, 50000)
                p_s = Ether() / IP(src=client_ip, dst=self.target_ip) / TCP(sport=sport, dport=dport, flags="S", seq=seq)
                p_s.time = cur_time
                packets.append(p_s)
                cur_time += random.uniform(0.001, 0.003)

                p_ra = Ether() / IP(src=self.target_ip, dst=client_ip) / TCP(sport=dport, dport=sport, flags="RA", seq=0, ack=seq + 1)
                p_ra.time = cur_time
                packets.append(p_ra)

            cur_time += random.uniform(0.02, 0.3)

        meta = {
            "generator": "Ostinato_Mixed",
            "client_ip": client_ip,
            "target_ip": self.target_ip,
            "duration": duration,
            "packet_count": len(packets),
        }
        return packets, meta

    def generate_batch(self, count: int = 10) -> Tuple[List[Packet], List[Dict[str, Any]]]:
        """Generates an interleaved batch of realistic benign flows with varying concurrency."""
        all_packets: List[Packet] = []
        all_meta: List[Dict[str, Any]] = []

        timeline_start = 0.0
        for _ in range(count):
            choice = random.choice(["iperf_tcp", "iperf_udp", "trex_http", "ostinato_mixed"])
            st = timeline_start + random.uniform(0.0, 5.0)

            if choice == "iperf_tcp":
                pkts, m = self.generate_iperf_stream(protocol="tcp", start_time=st)
            elif choice == "iperf_udp":
                pkts, m = self.generate_iperf_stream(protocol="udp", start_time=st)
            elif choice == "trex_http":
                pkts, m = self.generate_trex_transactional(start_time=st)
            else:
                pkts, m = self.generate_ostinato_mixed(start_time=st)

            all_packets.extend(pkts)
            all_meta.append(m)
            timeline_start += random.uniform(0.5, 3.0)

        # Sort all packets by timestamp to produce valid merged pcap
        all_packets.sort(key=lambda p: getattr(p, "time", 0.0))
        return all_packets, all_meta
