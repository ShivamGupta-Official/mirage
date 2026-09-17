"""dnscat2 and iodine DNS Covert Tunneling Generator for Isolated Lab Testbed.

Simulates bidirectional DNS tunneling covert channels with varied payload chunk sizes,
query intervals, encoding schemes (Base32, Base64, Hex), and query types (TXT, CNAME, A).
"""

import base64
import os
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


def _encode_payload(data: bytes, encoding: str) -> str:
    """Encodes arbitrary payload into DNS-safe subdomain strings."""
    if encoding == "base32":
        return base64.b32encode(data).decode().rstrip("=").lower()
    elif encoding == "base64":
        # Make URL/DNS safe
        return base64.urlsafe_b64encode(data).decode().rstrip("=").lower()
    else:  # hex
        return data.hex()


class DnsTunnelGenerator:
    """Generates dnscat2 and iodine DNS tunneling flows."""

    def __init__(self, dns_sinkhole_ip: str = LAB_DNS_SINKHOLE_IP):
        self.dns_sinkhole_ip = dns_sinkhole_ip
        verify_packet_isolation(self.dns_sinkhole_ip, "10.99.0.1")

    def generate_tunnel(
        self,
        tool: Optional[str] = None,
        chunk_size: Optional[int] = None,
        query_interval: Optional[float] = None,
        encoding: Optional[str] = None,
        num_queries: Optional[int] = None,
        client_ip: Optional[str] = None,
        start_time: float = 0.0,
    ) -> Tuple[List[Packet], Dict[str, Any]]:
        """Generates a complete DNS covert tunnel session."""
        tool = tool or random.choice(["dnscat2", "iodine"])
        encoding = encoding or random.choice(["base32", "base64", "hex"])
        chunk_size = chunk_size or random.randint(16, 110)
        query_interval = query_interval or random.uniform(0.08, 1.8)
        num_queries = num_queries or random.randint(20, 100)
        client_ip = client_ip or f"10.99.1.{random.randint(10, 240)}"
        c_port = random.randint(30000, 62000)

        verify_packet_isolation(client_ip, self.dns_sinkhole_ip)
        packets: List[Packet] = []
        cur_time = start_time
        session_id = random.randint(1000, 9999)

        root_domain = "tunnel.lab.internal" if tool == "dnscat2" else "i.lab.internal"
        qtype = random.choice(["TXT", "A", "CNAME"]) if tool == "dnscat2" else "NULL" if encoding == "raw" else "TXT"

        for seq in range(num_queries):
            raw_chunk = os.urandom(chunk_size)
            encoded_chunk = _encode_payload(raw_chunk, encoding)

            # Subdomain chunking (limit label length to 63 chars according to RFC 1035)
            labels = [encoded_chunk[i : i + 50] for i in range(0, len(encoded_chunk), 50)]
            subdomain = ".".join(labels)
            qname = f"{tool[:3]}.{session_id}.{seq}.{subdomain}.{root_domain}"
            txid = random.randint(1, 65535)

            # Upstream Client Query
            p_query = Ether() / IP(src=client_ip, dst=self.dns_sinkhole_ip) / UDP(
                sport=c_port, dport=53
            ) / DNS(
                id=txid,
                qr=0,
                opcode=0,
                rd=1,
                qd=DNSQR(qname=qname, qtype=qtype),
            )
            p_query.time = cur_time
            packets.append(p_query)

            # Downstream Sinkhole/Server Response
            cur_time += random.uniform(0.002, 0.020)  # Tunnel transit latency
            downstream_chunk = os.urandom(max(10, chunk_size // 2))
            downstream_str = _encode_payload(downstream_chunk, encoding)

            if qtype == "TXT":
                rr = DNSRR(rrname=qname, type="TXT", rdata=downstream_str[:250], ttl=5)
            elif qtype == "CNAME":
                rr = DNSRR(rrname=qname, type="CNAME", rdata=f"ack.{downstream_str[:40]}.{root_domain}", ttl=5)
            else:
                rr = DNSRR(rrname=qname, type="A", rdata="10.99.0.200", ttl=5)

            p_resp = Ether() / IP(src=self.dns_sinkhole_ip, dst=client_ip) / UDP(
                sport=53, dport=c_port
            ) / DNS(
                id=txid,
                qr=1,
                aa=1,
                ra=1,
                qd=DNSQR(qname=qname, qtype=qtype),
                an=rr,
            )
            p_resp.time = cur_time
            packets.append(p_resp)

            # Jitter between tunnel requests
            cur_time += max(0.01, random.gauss(query_interval, query_interval * 0.25))

        meta = {
            "attack_type": "dns_tunnel",
            "tool": tool,
            "encoding": encoding,
            "chunk_size": chunk_size,
            "query_interval": query_interval,
            "num_queries": num_queries,
            "client_ip": client_ip,
            "packet_count": len(packets),
            "root_domain": root_domain,
            "qtype": qtype,
        }
        return packets, meta
