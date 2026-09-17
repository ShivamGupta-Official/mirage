'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Filter, Shield } from 'lucide-react';
import { StudioNav } from '@/components/studio/studio-nav';
import { StudioFooter } from '@/components/studio/studio-footer';
import { Eyebrow } from '@/components/studio/eyebrow';
import { STUDIO_PROJECTS } from '@/lib/studio-data';

export default function WorkPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Hardware & Ingress Architecture',
    'Statistical AI & Drift Modeling',
    'Blockchain & Forensic Integrity',
    'Graph AI & Campaign Fusion',
    'Covert Channel Detection',
    'Testing & Cyber Range Synthesis',
  ];

  const filteredProjects =
    selectedCategory === 'All'
      ? STUDIO_PROJECTS
      : STUDIO_PROJECTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="relative min-h-screen bg-[#08080c] text-[#f5efff] overflow-x-hidden selection:bg-[#f5efff] selection:text-[#08080c]">
      <StudioNav />

      {/* 1. Intro Header */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-24 px-6 md:px-12 border-b border-[#f5efff]/10">
        <div className="mx-auto max-w-7xl">
          <Eyebrow label="// 03 WORK // DEFENSE SYSTEM ARCHITECTURES" tag="active" />
          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-light tracking-tight leading-[0.98] text-[#f5efff] mt-6 max-w-5xl">
            Selected <span className="italic underline decoration-1 decoration-[#f5efff]/40">PRJCT</span> implementations.
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#f5efff]/65 font-light leading-relaxed max-w-2xl mt-6">
            Explore the six core technical systems engineered for the National Technical Research Organisation. From physical layer optical taps to blockchain-sealed audit ledgers.
          </p>

          {/* 2. Filter / Tag Bar */}
          <div className="mt-12 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            <span className="flex items-center gap-1.5 font-mono text-xs text-[#f5efff]/40 uppercase mr-3">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </span>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 font-mono text-xs transition-all duration-300 ${
                    isActive
                      ? 'bg-[#f5efff] text-[#08080c] font-bold shadow-[0_0_20px_rgba(245,239,255,0.3)]'
                      : 'bg-[#f5efff]/5 border border-[#f5efff]/10 text-[#f5efff]/70 hover:border-[#f5efff]/30 hover:text-[#f5efff]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Full Projects Grid */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#060609]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {filteredProjects.map((proj) => (
              <div
                key={proj.slug}
                data-cursor="View"
                className="group rounded-3xl border border-[#f5efff]/10 bg-[#0c0b14] p-8 sm:p-10 flex flex-col justify-between transition-all duration-400 hover:border-[#f5efff]/40 hover:bg-[#121120] hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
              >
                <div>
                  {/* Card Meta Bar */}
                  <div className="flex items-center justify-between border-b border-[#f5efff]/10 pb-4 mb-6">
                    <span className="font-mono text-xs text-[#f5efff]/50 tracking-widest uppercase">
                      {proj.code} // {proj.date}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-0.5 rounded-full uppercase">
                      {proj.classification}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-light text-[#f5efff] group-hover:text-white transition-colors leading-[1.05]">
                    {proj.title}
                  </h2>
                  <p className="font-mono text-xs text-[#f5efff]/50 mt-1 uppercase tracking-wider">
                    {proj.subtitle}
                  </p>

                  <p className="font-sans text-sm text-[#f5efff]/65 mt-5 leading-relaxed">
                    {proj.summary}
                  </p>

                  {/* Scope note */}
                  <div className="mt-6 rounded-xl border border-[#f5efff]/5 bg-[#f5efff]/[0.02] p-3.5 font-mono text-[11px] text-[#f5efff]/70">
                    <span className="text-[#f5efff]/40 uppercase tracking-wider block mb-1">
                      SCOPE & SPECIFICATION:
                    </span>
                    <span>{proj.scope}</span>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-10 pt-6 border-t border-[#f5efff]/10">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {proj.techTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-[#f5efff]/10 bg-[#f5efff]/5 px-2.5 py-1 font-mono text-[10px] text-[#f5efff]/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/work/${proj.slug}`}
                    data-cursor="View"
                    className="inline-flex items-center justify-between w-full font-mono text-xs uppercase tracking-wider text-[#f5efff] group-hover:text-white pt-2 border-t border-[#f5efff]/5"
                  >
                    <span>Inspect Full Blueprint & Architecture</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Closing CTA + Shared Footer */}
      <StudioFooter />
    </div>
  );
}
