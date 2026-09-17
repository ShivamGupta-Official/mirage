'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Shield, Terminal, CheckCircle2, Lock, Cpu } from 'lucide-react';
import { StudioNav } from '@/components/studio/studio-nav';
import { StudioFooter } from '@/components/studio/studio-footer';
import { Eyebrow } from '@/components/studio/eyebrow';
import { CountUp } from '@/components/studio/count-up';
import { STUDIO_PROJECTS, StudioProject } from '@/lib/studio-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const project = STUDIO_PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const nextProject = STUDIO_PROJECTS.find((p) => p.slug === project.nextSlug) || STUDIO_PROJECTS[0];

  return (
    <div className="relative min-h-screen bg-[#08080c] text-[#f5efff] overflow-x-hidden selection:bg-[#f5efff] selection:text-[#08080c]">
      <StudioNav />

      {/* 1. Hero with Scroll-Scrubbed Entrance */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 md:px-12 border-b border-[#f5efff]/10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <Eyebrow label={`// ${project.code} // ${project.classification}`} tag="active" />
            <span className="font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-0.5 rounded-full uppercase">
              {project.type}
            </span>
          </div>

          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl font-light tracking-tight leading-[0.98] text-[#f5efff] max-w-5xl">
            {project.title}
          </h1>

          <p className="font-mono text-xs sm:text-sm text-[#f5efff]/50 uppercase tracking-widest mt-4">
            {project.subtitle}
          </p>

          <p className="font-sans text-base sm:text-xl text-[#f5efff]/70 font-light leading-relaxed max-w-3xl mt-8">
            {project.summary}
          </p>
        </div>
      </section>

      {/* 2. Clean Meta Bar (Date, Client, Scope, Tech Stack) */}
      <section className="border-b border-[#f5efff]/10 bg-[#060609] py-8 px-6 md:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs">
          <div>
            <span className="text-[#f5efff]/40 uppercase tracking-wider block mb-1">DATE // TIMELINE</span>
            <span className="text-[#f5efff]">{project.date} // SIH 2026</span>
          </div>
          <div>
            <span className="text-[#f5efff]/40 uppercase tracking-wider block mb-1">DEFENSE CLIENT</span>
            <span className="text-[#f5efff]">{project.client}</span>
          </div>
          <div>
            <span className="text-[#f5efff]/40 uppercase tracking-wider block mb-1">SCOPE</span>
            <span className="text-[#f5efff] truncate block">{project.scope}</span>
          </div>
          <div>
            <span className="text-[#f5efff]/40 uppercase tracking-wider block mb-1">TECH ARCHITECTURE</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {project.techTags.slice(0, 2).map((t) => (
                <span key={t} className="text-[#f5efff]/80">
                  {t} ·
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Challenge & Solution Overview */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#08080c]">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 space-y-4">
            <Eyebrow label="// 01 THE DEFENSE CHALLENGE" tag="active" />
            <h2 className="font-editorial text-3xl sm:text-4xl font-light text-[#f5efff]">
              The physical failure of conventional tools.
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#f5efff]/65 leading-relaxed">
              {project.challenge}
            </p>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <Eyebrow label="// 02 THE MIRAGE SOLUTION" tag="active" />
            <h2 className="font-editorial text-3xl sm:text-4xl font-light text-[#f5efff]">
              Asymmetric engineering & stateless modeling.
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#f5efff]/65 leading-relaxed">
              {project.solution}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Full-Bleed Annotated Architectural Blocks Alternating with Text */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#060609]">
        <div className="mx-auto max-w-7xl space-y-16">
          <div className="mb-12">
            <Eyebrow label="// SYSTEM SPECIFICATION BLOCKS" tag="active" />
            <h2 className="font-editorial text-3xl sm:text-5xl font-light text-[#f5efff] mt-3">
              Deep architectural <span className="italic">breakdown</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {project.annotatedBlocks.map((blk, idx) => (
              <div
                key={blk.heading}
                className="rounded-3xl border border-[#f5efff]/10 bg-[#0d0c15] p-8 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs text-[#f5efff]/40 uppercase tracking-widest block mb-4">
                    MODULE // 0{idx + 1}
                  </span>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-light text-[#f5efff] mb-3">
                    {blk.heading}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#f5efff]/65 leading-relaxed">
                    {blk.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#f5efff]/10 font-mono text-[10px] text-emerald-400 uppercase tracking-wider">
                  {blk.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Technical Specifications Checklist */}
          <div className="rounded-3xl border border-[#f5efff]/15 bg-[#0b0a13] p-8 sm:p-12">
            <h3 className="font-editorial text-2xl sm:text-3xl font-light text-[#f5efff] mb-6">
              Core Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-[#f5efff]/80">
              {project.architecture.map((arch) => (
                <div key={arch} className="flex items-start gap-3 py-2 border-b border-[#f5efff]/5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{arch}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Results & Metrics Section (Numbers Counting Up on Scroll) */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#08080c]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center max-w-3xl mx-auto">
            <Eyebrow label="// VERIFIED PERFORMANCE TELEMETRY" tag="active" className="justify-center" />
            <h2 className="font-editorial text-4xl sm:text-6xl font-light text-[#f5efff] mt-3">
              Demonstrated operational metrics.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {project.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-3xl border border-[#f5efff]/15 bg-[#0e0d18] p-8 text-center"
              >
                <div className="font-mono text-4xl sm:text-5xl font-bold text-[#f5efff]">
                  <CountUp end={m.rawNumber} decimals={m.rawNumber % 1 !== 0 ? 2 : 0} suffix={m.suffix} />
                </div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#f5efff]/50 mt-3 block">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Next-Project Navigation Card */}
      <section className="py-20 px-6 md:px-12 border-b border-[#f5efff]/10 bg-[#060609]">
        <div className="mx-auto max-w-7xl">
          <span className="font-mono text-xs text-[#f5efff]/40 uppercase tracking-widest block mb-4">
            NEXT ENCLAVE BLUEPRINT
          </span>
          <Link
            href={`/work/${nextProject.slug}`}
            data-cursor="View"
            className="group block rounded-3xl border border-[#f5efff]/15 bg-[#0d0c15] p-8 sm:p-12 transition-all duration-300 hover:border-[#f5efff]/45 hover:bg-[#12111e]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="font-mono text-xs text-[#f5efff]/50 uppercase tracking-wider">
                  {nextProject.code} // {nextProject.type}
                </span>
                <h3 className="font-editorial text-3xl sm:text-5xl font-light text-[#f5efff] mt-2 group-hover:text-white transition-colors">
                  {nextProject.title}
                </h3>
                <p className="font-mono text-xs text-[#f5efff]/50 mt-1 uppercase">
                  {nextProject.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-[#f5efff] group-hover:text-white uppercase tracking-wider">
                <span>View System Blueprint</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 7. Closing CTA + Shared Footer */}
      <StudioFooter />
    </div>
  );
}
