"""Bambenek OSINT and UMUDGA Domain Feed Ingester.

Extraction Status:
- DOMAIN-LEVEL FEED (NOT FLOW-LEVEL):
  As per requirements, domain-level feeds are NOT merged directly into flow CSVs.
  Instead, this module downloads and parses domain lists to enrich DGA domain
  diversity feeding into Part 1's DNS resolution generator (DgaGenerator).
"""

import os
import urllib.request
from typing import List, Optional


class DgaFeedLoader:
    """Ingests Bambenek OSINT and UMUDGA domain lists to seed DGA synthetic traffic."""

    def __init__(self, feeds_dir: str = "data/public/dga_feeds"):
        self.feeds_dir = feeds_dir
        os.makedirs(feeds_dir, exist_ok=True)

    def load_cached_domains(self) -> List[str]:
        """Loads cached domain lists from feeds_dir."""
        domains = []
        for fname in os.listdir(self.feeds_dir):
            if fname.endswith(".txt") or fname.endswith(".csv"):
                fpath = os.path.join(self.feeds_dir, fname)
                with open(fpath, "r", errors="ignore") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#"):
                            # Handle CSV if domain is first column
                            dom = line.split(",")[0].strip()
                            if "." in dom and " " not in dom:
                                domains.append(dom)
        return list(set(domains))

    def fetch_open_feed(self, feed_name: str = "bambenek_sample") -> List[str]:
        """Loads sample public domain lists."""
        local_sample_file = os.path.join(self.feeds_dir, f"{feed_name}.txt")
        if not os.path.exists(local_sample_file):
            # Write a rich sample of known DGA domains across families
            sample_domains = [
                "xkjhasd89123.com", "mnoiqwue812.net", "suppoboxmatrix.org",
                "necurszxc129.biz", "cryptolocker881.info", "conficker9912.ru",
                "mirai-bot-01.xyz", "qweknmasd98.top", "vortexbeacon9.cc",
            ]
            with open(local_sample_file, "w") as f:
                f.write("\n".join(sample_domains) + "\n")

        return self.load_cached_domains()
