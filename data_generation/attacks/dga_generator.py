"""DGArchive-style Domain Generation Algorithm (DGA) Generator for Isolated Lab Testbed.

Simulates algorithmic domain generation (Conficker, Necurs, Mirai, Suppobox) and
resolves them strictly against a lab DNS sinkhole (never querying public DNS).
"""

import datetime
import hashlib
import random
from typing import Any, Dict, List, Optional, Tuple

from scapy.layers.dns import DNS, DNSQR, DNSRR
from scapy.layers.inet import IP, UDP
from scapy.layers.l2 import Ether
from scapy.packet import Packet

from data_generation.isolation import (
    LAB_CLIENT_SUBNET,
    LAB_DNS_SINKHOLE_IP,
    verify_packet_isolation,
)

# Words for dictionary-based DGAs (e.g. Suppobox/Matsnu)
DICTIONARY_WORDS = [
    "cloud", "gate", "vector", "stream", "packet", "socket", "beacon", "delta",
    "alpha", "cyber", "shadow", "winter", "silver", "echo", "falcon", "nexus",
    "orbit", "pulse", "zenith", "vortex", "system", "matrix", "crypto", "shield",
]

TLDS = ["com", "net", "org", "info", "biz", "ru", "top", "xyz", "cc"]


def dga_conficker(date: datetime.date, count: int = 10) -> List[str]:
    """Generates domains using Conficker-like pseudo-random date arithmetic."""
    domains = []
    seed = (date.year * 10000) + (date.month * 100) + date.day
    for i in range(count):
        seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
        length = 8 + (seed % 5)
        chars = []
        for _ in range(length):
            seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
            chars.append(chr(ord('a') + (seed % 26)))
        tld = TLDS[(seed >> 8) % len(TLDS)]
        domains.append(f"{''.join(chars)}.{tld}")
    return domains


def dga_necurs(seed: int, count: int = 10) -> List[str]:
    """Generates domains using Necurs-like linear congruential generator."""
    domains = []
    state = seed
    for _ in range(count):
        state = (state * 69069 + 1) & 0xFFFFFFFF
        length = 7 + (state % 9)
        chars = []
        for _ in range(length):
            state = (state * 69069 + 1) & 0xFFFFFFFF
            chars.append(chr(ord('a') + (state % 26)))
        tld = TLDS[(state >> 16) % len(TLDS)]
        domains.append(f"{''.join(chars)}.{tld}")
    return domains


def dga_suppobox(count: int = 10) -> List[str]:
    """Generates domains using Suppobox-like word-pair concatenation."""
    domains = []
    for _ in range(count):
        w1 = random.choice(DICTIONARY_WORDS)
        w2 = random.choice(DICTIONARY_WORDS)
        tld = random.choice(["net", "com", "org", "info"])
        domains.append(f"{w1}{w2}.{tld}")
    return domains


def dga_mirai(count: int = 10) -> List[str]:
    """Generates short alphanumeric domains characteristic of IoT botnet DGAs."""
    domains = []
    for _ in range(count):
        length = random.randint(6, 10)
        domain = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=length))
        tld = random.choice(["top", "xyz", "biz", "cc"])
        domains.append(f"{domain}.{tld}")
    return domains


class DgaGenerator:
    """Generates synthetic DGA query bursts against an isolated lab DNS sinkhole."""

    def __init__(self, dns_sinkhole_ip: str = LAB_DNS_SINKHOLE_IP):
        self.dns_sinkhole_ip = dns_sinkhole_ip
        verify_packet_isolation(self.dns_sinkhole_ip, "10.99.0.1")

    def generate_dga_session(
        self,
        family: Optional[str] = None,
        num_domains: Optional[int] = None,
        query_interval: Optional[float] = None,
        client_ip: Optional[str] = None,
        sinkhole_response_ratio: float = 0.05,
        start_time: float = 0.0,
    ) -> Tuple[List[Packet], Dict[str, Any]]:
        """Simulates an endpoint infected with DGA malware trying to resolve C2 domains."""
        family = family or random.choice(["conficker", "necurs", "suppobox", "mirai"])
        num_domains = num_domains or random.randint(15, 60)
        query_interval = query_interval or random.uniform(0.05, 0.6)
        client_ip = client_ip or f"10.99.1.{random.randint(10, 240)}"
        c_port = random.randint(30000, 62000)

        verify_packet_isolation(client_ip, self.dns_sinkhole_ip)

        # Generate algorithmic domain names
        if family == "conficker":
            target_date = datetime.date.today() + datetime.timedelta(days=random.randint(-100, 100))
            domains = dga_conficker(target_date, count=num_domains)
        elif family == "necurs":
            domains = dga_necurs(random.randint(10000, 9999999), count=num_domains)
        elif family == "suppobox":
            domains = dga_suppobox(count=num_domains)
        else:
            domains = dga_mirai(count=num_domains)

        packets: List[Packet] = []
        cur_time = start_time

        for domain in domains:
            txid = random.randint(1, 65535)

            # DNS Query (Standard A record query to sinkhole)
            p_q = Ether() / IP(src=client_ip, dst=self.dns_sinkhole_ip) / UDP(sport=c_port, dport=53) / DNS(
                id=txid, qr=0, rd=1, qd=DNSQR(qname=domain, qtype="A")
            )
            p_q.time = cur_time
            packets.append(p_q)

            cur_time += random.uniform(0.001, 0.008)

            # Lab Sinkhole Response: Most DGA domains fail (NXDOMAIN, rcode=3), tiny fraction sinkhole IP
            is_sinkhole_hit = random.random() < sinkhole_response_ratio
            if is_sinkhole_hit:
                # Active sinkhole interception
                p_r = Ether() / IP(src=self.dns_sinkhole_ip, dst=client_ip) / UDP(sport=53, dport=c_port) / DNS(
                    id=txid, qr=1, aa=1, ra=1, rcode=0, qd=DNSQR(qname=domain, qtype="A"),
                    an=DNSRR(rrname=domain, type="A", rdata="10.99.0.254", ttl=60)
                )
            else:
                # NXDOMAIN (Domain Name does not exist)
                p_r = Ether() / IP(src=self.dns_sinkhole_ip, dst=client_ip) / UDP(sport=53, dport=c_port) / DNS(
                    id=txid, qr=1, aa=1, ra=1, rcode=3, qd=DNSQR(qname=domain, qtype="A")
                )
            p_r.time = cur_time
            packets.append(p_r)

            # High burstiness with jitter
            cur_time += max(0.005, random.gauss(query_interval, query_interval * 0.3))

        meta = {
            "attack_type": "dga",
            "family": family,
            "domain_count": len(domains),
            "query_interval": query_interval,
            "client_ip": client_ip,
            "packet_count": len(packets),
            "domains_sample": domains[:3],
        }
        return packets, meta
