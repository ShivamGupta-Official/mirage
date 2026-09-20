'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { OlivierEarth } from '@/components/network/olivier-earth';

export default function GlobePreviewPage() {
  return (
    <div className="min-h-screen bg-[#08080c] text-[#f5efff] p-6 sm:p-10 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f5efff]/10 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full bg-[#f5efff]/5 hover:bg-[#f5efff]/10 border border-[#f5efff]/10 text-[#f5efff]/70 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#f5efff]/60">
                LOCAL PREVIEW // OLIVIER LAROSE 3D EARTH
              </span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-light text-[#f5efff] mt-1">
              3D Earth Texture & Lighting Showcase
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/olivierlarose/3d-earth-scroll"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5efff]/5 border border-[#f5efff]/15 hover:border-[#f5efff]/30 text-xs font-mono text-[#f5efff]/80 transition-all"
          >
            <ExternalLink size={12} /> Source: olivierlarose/3d-earth-scroll
          </a>
        </div>
      </div>

      {/* Main 3D Earth Stage */}
      <div className="my-8 flex-1 w-full max-w-5xl mx-auto rounded-3xl border border-[#f5efff]/10 bg-[#06060a] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.8)] relative min-h-[550px] flex items-center justify-center">
        {/* Ambient background aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

        {/* The Exact 3D Earth Component */}
        <OlivierEarth className="w-full h-[550px] sm:h-[640px]" />
      </div>

      {/* Footer Info Badges */}
      <div className="border-t border-[#f5efff]/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#f5efff]/40">
        <div className="flex items-center gap-3">
          <Globe size={14} className="text-cyan-400" />
          <span>TEXTURES: COLOR.JPG (554KB) · NORMAL.PNG (624KB) · OCCLUSION.JPG (428KB)</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>LIGHTING: SUN [1, 0, -0.25] @ 3.5 INTENSITY</span>
          <span>•</span>
          <span className="text-emerald-400">STATUS: READY FOR SITE INTEGRATION</span>
        </div>
      </div>
    </div>
  );
}
