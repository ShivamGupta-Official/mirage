'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Copy, Check, Shield, Lock } from 'lucide-react';
import { Eyebrow } from './eyebrow';
import { Magnetic } from './magnetic-button';

export function StudioFooter() {
  const [copied, setCopied] = useState<boolean>(false);
  const email = 'enclave@mirage-ntro.defense.gov.in';

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="relative border-t border-[#f5efff]/10 bg-[#060609] pt-24 pb-16 text-[#f5efff] overflow-hidden">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#f5efff]/5 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        {/* Top Closing CTA */}
        <div className="mb-20 pb-20 border-b border-[#f5efff]/10 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="max-w-2xl space-y-4">
            <Eyebrow label="// SOVEREIGN ENCLAVE DISPATCH" tag="active" />
            <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#f5efff] leading-[1.05]">
              Let&apos;s engineer your <span className="italic underline decoration-1 decoration-[#f5efff]/40">unidirectional</span> defense.
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#f5efff]/60 max-w-xl pt-2">
              From physical optical data diode taps to real-time ML anomaly detection and SHA-256 blockchain audit ledgers. Built for sovereign air-gapped enclaves.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Magnetic strength={0.3}>
              <Link
                href="/contact"
                data-cursor="Send"
                className="studio-pill-btn studio-pill-btn-primary group text-sm py-4 px-8"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Initiate Briefing</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </Link>
            </Magnetic>

            {/* Email copyable block */}
            <button
              onClick={handleCopy}
              data-cursor="Copy"
              className="flex items-center gap-2.5 rounded-full border border-[#f5efff]/15 bg-[#f5efff]/5 px-5 py-3.5 text-xs font-mono text-[#f5efff]/80 hover:border-[#f5efff]/40 hover:bg-[#f5efff]/10 transition-all duration-300"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">COPIED TO CLIPBOARD</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#f5efff]/50" />
                  <span>{email}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Col 1 */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#f5efff]/45">
              (001) ARCHITECTURE
            </span>
            <ul className="space-y-2.5 font-mono text-xs text-[#f5efff]/70">
              <li>
                <Link href="/" className="studio-nav-link hover:text-[#f5efff]">
                  01 Home / Ingress
                </Link>
              </li>
              <li>
                <Link href="/about" className="studio-nav-link hover:text-[#f5efff]">
                  02 About / Philosophy
                </Link>
              </li>
              <li>
                <Link href="/work" className="studio-nav-link hover:text-[#f5efff]">
                  03 Work / Projects
                </Link>
              </li>
              <li>
                <Link href="/contact" className="studio-nav-link hover:text-[#f5efff]">
                  04 Contact / Dispatch
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#f5efff]/45">
              (002) DEFENSE SYSTEMS
            </span>
            <ul className="space-y-2.5 font-mono text-xs text-[#f5efff]/70">
              <li>
                <Link href="/work/optical-diode-ingress" className="studio-nav-link hover:text-[#f5efff]">
                  Hardware Diode Tap
                </Link>
              </li>
              <li>
                <Link href="/work/neural-adaptive-baseline" className="studio-nav-link hover:text-[#f5efff]">
                  Welford EWMA Core
                </Link>
              </li>
              <li>
                <Link href="/work/cryptographic-blockchain-ledger" className="studio-nav-link hover:text-[#f5efff]">
                  SHA-256 Audit Ledger
                </Link>
              </li>
              <li>
                <Link href="/work/temporal-campaign-graph" className="studio-nav-link hover:text-[#f5efff]">
                  Temporal Campaign Graph
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#f5efff]/45">
              (003) OPERATIONAL SOC
            </span>
            <ul className="space-y-2.5 font-mono text-xs text-[#f5efff]/70">
              <li>
                <Link href="/dashboard" className="studio-nav-link hover:text-[#f5efff]">
                  Live Threat Console
                </Link>
              </li>
              <li>
                <Link href="/simulation" className="studio-nav-link hover:text-[#f5efff]">
                  Cyber Range Sandbox
                </Link>
              </li>
              <li>
                <Link href="/forensics" className="studio-nav-link hover:text-[#f5efff]">
                  Forensic Chain Verifier
                </Link>
              </li>
              <li>
                <Link href="/models" className="studio-nav-link hover:text-[#f5efff]">
                  ML Model Registry
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#f5efff]/45">
              (004) LOCATION & APPARATUS
            </span>
            <div className="space-y-2 font-mono text-xs text-[#f5efff]/60 leading-relaxed">
              <p className="text-[#f5efff]">National Technical Research Organisation</p>
              <p>Block-III, Cyber Command Enclave</p>
              <p>New Delhi, India (IST UTC+5:30)</p>
              <a
                href="https://mirage-sooty.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="pt-2 text-[11px] text-[#f5efff]/70 hover:text-white flex items-center gap-1.5 transition-colors group"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Edge: mirage-sooty.vercel.app</span>
                <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Security Attestation */}
        <div className="border-t border-[#f5efff]/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-[10px] text-[#f5efff]/40 uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <Shield className="h-3.5 w-3.5 text-[#f5efff]/60" />
            <span>MIRAGE // SMART INDIA HACKATHON 2026 // PS 26145</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span>NIST SP 800-82 REV 3 COMPLIANT</span>
            <span>ZERO RETURN ASSURANCE</span>
            <span>TEAM VOID MINDS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
