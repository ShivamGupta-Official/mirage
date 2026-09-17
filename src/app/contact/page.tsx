'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, ArrowUpRight, Shield, Lock, Send, MapPin, Clock } from 'lucide-react';
import { StudioNav } from '@/components/studio/studio-nav';
import { StudioFooter } from '@/components/studio/studio-footer';
import { Eyebrow } from '@/components/studio/eyebrow';
import { Magnetic } from '@/components/studio/magnetic-button';

export function ContactPageContent() {
  const [copied, setCopied] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    scope: 'Optical TAP Deployment',
    message: '',
  });

  const email = 'enclave@mirage-ntro.defense.gov.in';

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: '',
        email: '',
        organization: '',
        scope: 'Optical TAP Deployment',
        message: '',
      });
    }, 4000);
  };

  return (
    <div className="relative min-h-screen bg-[#08080c] text-[#f5efff] overflow-x-hidden selection:bg-[#f5efff] selection:text-[#08080c]">
      <StudioNav />

      {/* 1. Intro Header */}
      <section className="relative pt-36 pb-16 md:pt-44 md:pb-24 px-6 md:px-12 border-b border-[#f5efff]/10">
        <div className="mx-auto max-w-7xl">
          <Eyebrow label="// 04 CONTACT // ENCLAVE DISPATCH & BRIEFINGS" tag="active" />
          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-light tracking-tight leading-[0.98] text-[#f5efff] mt-6 max-w-5xl">
            Initiate sovereign <span className="italic underline decoration-1 decoration-[#f5efff]/40">defense</span> communication.
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#f5efff]/65 font-light leading-relaxed max-w-2xl mt-6">
            For technical inquiries regarding unidirectional optical data diode architectures, Welford statistical baselines, or air-gapped forensic audit ledgers.
          </p>
        </div>
      </section>

      {/* 2. Contact Form & Direct Communication Grid */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#060609]">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Direct Email, Channels & Location */}
          <div className="lg:col-span-5 space-y-12">
            {/* Direct Email Block with Copy */}
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#f5efff]/45 block">
                DIRECT SECURE DISPATCH
              </span>
              <button
                onClick={handleCopy}
                data-cursor="Copy"
                className="group flex items-center justify-between w-full rounded-2xl border border-[#f5efff]/15 bg-[#0d0c15] p-5 text-left transition-all duration-300 hover:border-[#f5efff]/40 hover:bg-[#12111d]"
              >
                <div className="space-y-1">
                  <span className="font-mono text-sm sm:text-base text-[#f5efff] group-hover:text-white block">
                    {email}
                  </span>
                  <span className="font-mono text-[10px] text-[#f5efff]/45 uppercase tracking-wider block">
                    PGP KEY: 4A8F 9C21 7B03 E194
                  </span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f5efff]/15 bg-[#f5efff]/5 text-[#f5efff] group-hover:border-[#f5efff]/40 transition-colors">
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-[#f5efff]/60" />}
                </div>
              </button>
            </div>

            {/* Sovereign Location & Timezone Note */}
            <div className="rounded-2xl border border-[#f5efff]/10 bg-[#0d0c15] p-6 space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#f5efff]/50">
                <MapPin className="h-3.5 w-3.5 text-[#f5efff]/60" />
                <span>PHYSICAL ENCLAVE LOCATION</span>
              </div>
              <p className="font-sans text-sm text-[#f5efff] leading-relaxed">
                National Technical Research Organisation (NTRO)<br />
                Block-III, Cyber Defense Command Sector<br />
                New Delhi, 110001 · India
              </p>
              <div className="pt-2 border-t border-[#f5efff]/10 flex items-center justify-between font-mono text-xs text-[#f5efff]/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#f5efff]/40" />
                  <span>TIMEZONE: IST (UTC+5:30)</span>
                </span>
                <span className="text-emerald-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE LINK
                </span>
              </div>
            </div>

            {/* Social / Technical Repositories */}
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#f5efff]/45 block">
                TECHNICAL CHANNELS
              </span>
              <div className="space-y-2 font-mono text-xs">
                <a
                  href="https://github.com/ShivamGupta-Official/mirage"
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="View"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#f5efff]/10 bg-[#0d0c15] hover:border-[#f5efff]/30 hover:bg-[#12111d] transition-all"
                >
                  <span className="text-[#f5efff]">GitHub Repository // Open Source Kernel</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#f5efff]/60" />
                </a>
                <Link
                  href="/forensics"
                  data-cursor="View"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#f5efff]/10 bg-[#0d0c15] hover:border-[#f5efff]/30 hover:bg-[#12111d] transition-all"
                >
                  <span className="text-[#f5efff]">Blockchain Forensic Ledger // Instant Audit</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#f5efff]/60" />
                </Link>
                <Link
                  href="/simulation"
                  data-cursor="View"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#f5efff]/10 bg-[#0d0c15] hover:border-[#f5efff]/30 hover:bg-[#12111d] transition-all"
                >
                  <span className="text-[#f5efff]">Cyber Range Sandbox // Live Evaluation</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#f5efff]/60" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Minimal Contact Form with Accent Focus States */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[#f5efff]/15 bg-[#0e0d18] p-8 sm:p-12 shadow-[0_20px_70px_rgba(0,0,0,0.7)]">
              <div className="mb-8">
                <Eyebrow label="// TRANSMIT DISPATCH REQUEST" tag="active" />
                <h2 className="font-editorial text-2xl sm:text-3xl font-light text-[#f5efff] mt-2">
                  Request an Enclave Briefing
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#f5efff]/60 mt-1">
                  Transmissions are locally sanitized. All fields are handled with strict defense confidentiality.
                </p>
              </div>

              {formSubmitted ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="font-editorial text-2xl font-light text-[#f5efff]">
                    Dispatch Received & Sealed
                  </h3>
                  <p className="font-sans text-xs text-[#f5efff]/70 max-w-sm mx-auto">
                    Your transmission has been assigned hash digest <code>#7a8f9c21...</code> and routed to the NTRO assessment team.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="font-mono text-xs text-[#f5efff]/70 uppercase tracking-wider block">
                      Full Name // Rank
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Commander Rajesh Varma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-[#f5efff]/15 bg-[#08080c] px-4 py-3.5 font-sans text-sm text-[#f5efff] placeholder-[#f5efff]/30 focus:border-[#f5efff] focus:outline-none focus:ring-1 focus:ring-[#f5efff] transition-all"
                    />
                  </div>

                  {/* Email & Organization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono text-xs text-[#f5efff]/70 uppercase tracking-wider block">
                        Official Defense Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="officer@enclave.gov.in"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-[#f5efff]/15 bg-[#08080c] px-4 py-3.5 font-sans text-sm text-[#f5efff] placeholder-[#f5efff]/30 focus:border-[#f5efff] focus:outline-none focus:ring-1 focus:ring-[#f5efff] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-xs text-[#f5efff]/70 uppercase tracking-wider block">
                        Unit / Organization
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. NTRO Cyber Directorate"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full rounded-xl border border-[#f5efff]/15 bg-[#08080c] px-4 py-3.5 font-sans text-sm text-[#f5efff] placeholder-[#f5efff]/30 focus:border-[#f5efff] focus:outline-none focus:ring-1 focus:ring-[#f5efff] transition-all"
                      />
                    </div>
                  </div>

                  {/* Project Scope Selection */}
                  <div className="space-y-2">
                    <label className="font-mono text-xs text-[#f5efff]/70 uppercase tracking-wider block">
                      Enclave Technical Focus
                    </label>
                    <select
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      className="w-full rounded-xl border border-[#f5efff]/15 bg-[#08080c] px-4 py-3.5 font-sans text-sm text-[#f5efff] focus:border-[#f5efff] focus:outline-none focus:ring-1 focus:ring-[#f5efff] transition-all"
                    >
                      <option value="Optical TAP Deployment">Optical TAP Physical Layer Deployment</option>
                      <option value="Welford EWMA Baseline Engine">Welford EWMA Host Profiling Engine</option>
                      <option value="Blockchain Forensic Ledger">SHA-256 Blockchain Forensic Audit Trail</option>
                      <option value="DNS Covert Channel Detection">Covert DNS Tunneling & DGA Interceptor</option>
                      <option value="Smart India Hackathon Jury Briefing">SIH 2026 Evaluation Jury Technical Briefing</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="font-mono text-xs text-[#f5efff]/70 uppercase tracking-wider block">
                      Transmission Payload / Inquiries
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Specify technical parameters, optical link bandwidth, or audit requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl border border-[#f5efff]/15 bg-[#08080c] px-4 py-3.5 font-sans text-sm text-[#f5efff] placeholder-[#f5efff]/30 focus:border-[#f5efff] focus:outline-none focus:ring-1 focus:ring-[#f5efff] transition-all resize-none"
                    />
                  </div>

                  {/* Magnetic Submit Button */}
                  <div className="pt-2">
                    <Magnetic strength={0.25}>
                      <button
                        type="submit"
                        data-cursor="Send"
                        className="studio-pill-btn studio-pill-btn-primary w-full sm:w-auto py-4 px-10 text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Transmit Encrypted Dispatch</span>
                      </button>
                    </Magnetic>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Closing CTA + Shared Footer */}
      <StudioFooter />
    </div>
  );
}

export default function ContactPage() {
  return <ContactPageContent />;
}
