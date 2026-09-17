'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal, Shield, Zap, Sparkles, RefreshCw, Cpu, Activity } from 'lucide-react';
import { Eyebrow } from './eyebrow';
import { Magnetic } from './magnetic-button';

interface TypewriterHeroProps {
  scrollY: number;
}

export function TypewriterHero({ scrollY }: TypewriterHeroProps) {
  const line1Target = 'Multi-Resolution';
  const line2Target = 'Passive Threat Intelligence';
  const descTarget =
    'Hardware-enforced unidirectional optical tap monitoring. Extracts packet, connection, and session graph invariants with zero physical return channel.';

  const [displayedLine1, setDisplayedLine1] = useState<string>('');
  const [displayedLine2, setDisplayedLine2] = useState<string>('');
  const [displayedDesc, setDisplayedDesc] = useState<string>('');
  const [typingComplete, setTypingComplete] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>('');
  const [photonBurst, setPhotonBurst] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isAutoTyping = useRef<boolean>(true);

  // Play subtle mechanical key click via WebAudio
  const playKeyClick = () => {
    if (typeof window === 'undefined') return;
    const soundEnabled = localStorage.getItem('mirage_sound_enabled') === 'true';
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400 + Math.random() * 400, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext ignored if locked
    }
  };

  // Automated typewriter on initial mount with organic key pacing
  useEffect(() => {
    let index1 = 0;
    let index2 = 0;
    let indexDesc = 0;
    let timeoutId: NodeJS.Timeout;

    const typeDesc = () => {
      if (indexDesc < descTarget.length) {
        setDisplayedDesc(descTarget.slice(0, indexDesc + 1));
        setActiveKey(descTarget[indexDesc].toUpperCase());
        playKeyClick();
        indexDesc++;
        timeoutId = setTimeout(typeDesc, 14);
      } else {
        setTypingComplete(true);
        setPhotonBurst(true);
        isAutoTyping.current = false;
        setActiveKey('');
        setTimeout(() => setPhotonBurst(false), 2400);
      }
    };

    const typeLine2 = () => {
      if (index2 < line2Target.length) {
        setDisplayedLine2(line2Target.slice(0, index2 + 1));
        setActiveKey(line2Target[index2].toUpperCase());
        playKeyClick();
        index2++;
        timeoutId = setTimeout(typeLine2, 28);
      } else {
        timeoutId = setTimeout(typeDesc, 120);
      }
    };

    const typeLine1 = () => {
      if (index1 < line1Target.length) {
        setDisplayedLine1(line1Target.slice(0, index1 + 1));
        setActiveKey(line1Target[index1].toUpperCase());
        playKeyClick();
        index1++;
        timeoutId = setTimeout(typeLine1, 35);
      } else {
        timeoutId = setTimeout(typeLine2, 140);
      }
    };

    // Begin typing after brief ambient pause
    timeoutId = setTimeout(typeLine1, 350);

    return () => clearTimeout(timeoutId);
  }, []);

  // Scroll scrub: If the user scrolls down, drive progression directly from scroll position
  useEffect(() => {
    if (isAutoTyping.current) return;
    // Scrub ratio over first 400px of scroll
    const scrollScrub = Math.min(1, Math.max(0, scrollY / 320));

    if (scrollScrub > 0.05 && scrollScrub < 1.0) {
      const l1Length = Math.round(line1Target.length * Math.min(1, scrollScrub * 2.5));
      const l2Length = Math.round(
        line2Target.length * Math.min(1, Math.max(0, (scrollScrub - 0.25) * 2.2))
      );
      const descLength = Math.round(
        descTarget.length * Math.min(1, Math.max(0, (scrollScrub - 0.5) * 2.0))
      );

      setDisplayedLine1(line1Target.slice(0, l1Length));
      setDisplayedLine2(line2Target.slice(0, l2Length));
      setDisplayedDesc(descTarget.slice(0, descLength));

      if (descLength >= descTarget.length) {
        setTypingComplete(true);
      }
    }
  }, [scrollY]);

  const replayTyping = () => {
    setDisplayedLine1('');
    setDisplayedLine2('');
    setDisplayedDesc('');
    setTypingComplete(false);
    setPhotonBurst(false);
    isAutoTyping.current = true;

    let index1 = 0;
    let index2 = 0;
    let indexDesc = 0;
    let timeoutId: NodeJS.Timeout;

    const typeDesc = () => {
      if (indexDesc < descTarget.length) {
        setDisplayedDesc(descTarget.slice(0, indexDesc + 1));
        setActiveKey(descTarget[indexDesc].toUpperCase());
        playKeyClick();
        indexDesc++;
        timeoutId = setTimeout(typeDesc, 12);
      } else {
        setTypingComplete(true);
        setPhotonBurst(true);
        isAutoTyping.current = false;
        setActiveKey('');
        setTimeout(() => setPhotonBurst(false), 2400);
      }
    };

    const typeLine2 = () => {
      if (index2 < line2Target.length) {
        setDisplayedLine2(line2Target.slice(0, index2 + 1));
        setActiveKey(line2Target[index2].toUpperCase());
        playKeyClick();
        index2++;
        timeoutId = setTimeout(typeLine2, 24);
      } else {
        timeoutId = setTimeout(typeDesc, 100);
      }
    };

    const typeLine1 = () => {
      if (index1 < line1Target.length) {
        setDisplayedLine1(line1Target.slice(0, index1 + 1));
        setActiveKey(line1Target[index1].toUpperCase());
        playKeyClick();
        index1++;
        timeoutId = setTimeout(typeLine1, 30);
      } else {
        timeoutId = setTimeout(typeLine2, 100);
      }
    };

    timeoutId = setTimeout(typeLine1, 100);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl border border-[#f5efff]/15 bg-[#0a0913]/90 backdrop-blur-2xl p-6 sm:p-10 md:p-14 shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-500"
    >
      {/* Semantic Accessible Heading */}
      <div className="sr-only">
        <h1>Multi-Resolution Passive Threat Intelligence</h1>
        <p>Hardware-enforced unidirectional optical tap monitoring. Extracts packet, connection, and session graph invariants with zero physical return channel.</p>
      </div>
      {/* ─── Creative Laser / Photon Beam Animation ─── */}
      <div
        className={`pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f5efff] to-transparent transition-all duration-1000 ${
          photonBurst
            ? 'opacity-100 scale-x-100 shadow-[0_0_30px_#f5efff]'
            : 'opacity-0 scale-x-0'
        }`}
      />

      {/* Cyber pulse ambient background aura */}
      <div
        className={`pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[350px] w-[650px] rounded-full blur-[140px] transition-all duration-1000 ${
          typingComplete
            ? 'bg-[#f5efff]/10 shadow-[0_0_100px_rgba(245,239,255,0.15)]'
            : 'bg-[#f5efff]/5'
        }`}
      />

      {/* Terminal Bar Top */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f5efff]/10 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]/60" />
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#f5efff]/70">
            NTRO // MIRAGE UNIDIRECTIONAL TELEMETRY APPARATUS
          </span>
        </div>

        <div className="flex items-center gap-3">
          {activeKey && (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#f5efff]/60 bg-[#f5efff]/5 border border-[#f5efff]/15 px-2.5 py-1 rounded-md">
              <span className="text-[#f5efff]/40">KEYSTROKE:</span>
              <span className="font-bold text-[#f5efff] animate-pulse">[{activeKey}]</span>
            </div>
          )}

          <button
            onClick={replayTyping}
            data-cursor="Replay"
            className="flex items-center gap-1.5 font-mono text-[11px] text-[#f5efff]/50 hover:text-[#f5efff] transition-colors bg-[#f5efff]/5 border border-[#f5efff]/10 hover:border-[#f5efff]/30 px-3 py-1 rounded-full"
          >
            <RefreshCw className="h-3 w-3" />
            <span>REPLAY TYPEWRITER</span>
          </button>

          <span className="hidden sm:inline-block font-mono text-[10px] text-emerald-400 border border-emerald-800/40 bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
            PHYSICAL TAP ACTIVE
          </span>
        </div>
      </div>

      {/* ─── The Main Title Being Written on a Keyboard ─── */}
      <div className="space-y-3 relative z-10">
        {/* Line 1: Multi-Resolution */}
        <div className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[5.75rem] font-light tracking-tight leading-[1.0] text-[#f5efff] flex items-baseline flex-wrap">
          <span className="bg-gradient-to-r from-white via-[#f5efff] to-[#f5efff]/85 bg-clip-text text-transparent">
            {displayedLine1}
          </span>
          {displayedLine1.length < line1Target.length && (
            <span className="inline-block w-3 sm:w-5 h-8 sm:h-12 bg-[#f5efff] ml-2 animate-pulse shadow-[0_0_12px_#f5efff]" />
          )}
        </div>

        {/* Line 2: Passive Threat Intelligence */}
        <div className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[5.75rem] font-light tracking-tight leading-[1.0] text-[#f5efff] flex items-baseline flex-wrap">
          <span className="italic underline decoration-1 decoration-[#f5efff]/40 text-white">
            {displayedLine2}
          </span>
          {displayedLine1.length >= line1Target.length && displayedLine2.length < line2Target.length && (
            <span className="inline-block w-3 sm:w-5 h-8 sm:h-12 bg-[#f5efff] ml-2 animate-pulse shadow-[0_0_12px_#f5efff]" />
          )}
        </div>

        {/* Description Paragraph Written in Real Time */}
        <div className="pt-6 max-w-3xl min-h-[4.5rem]">
          <p className="font-sans text-base sm:text-lg text-[#f5efff]/80 font-light leading-relaxed">
            {displayedDesc}
            {displayedLine2.length >= line2Target.length && displayedDesc.length < descTarget.length && (
              <span className="inline-block w-2 h-4 bg-[#f5efff]/80 ml-1.5 animate-pulse" />
            )}
          </p>
        </div>
      </div>

      {/* ─── Creative Post-Typing Animation: Invariants Telemetry Badges Eruption ─── */}
      <div
        className={`mt-10 pt-8 border-t border-[#f5efff]/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${
          typingComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <div className="rounded-2xl border border-[#f5efff]/10 bg-[#0e0d18] p-4 flex items-start gap-3 hover:border-[#f5efff]/30 transition-colors">
          <div className="p-2 rounded-xl bg-[#f5efff]/5 border border-[#f5efff]/10 text-[#f5efff]">
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-[#f5efff]/40 uppercase tracking-wider block">
              L1 PACKET INVARIANTS
            </span>
            <span className="font-mono text-xs text-[#f5efff] font-semibold mt-0.5 block">
              1–5ms Sliding Entropy
            </span>
            <span className="text-[10px] text-[#f5efff]/50">Volumetric flood defense</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#f5efff]/10 bg-[#0e0d18] p-4 flex items-start gap-3 hover:border-[#f5efff]/30 transition-colors">
          <div className="p-2 rounded-xl bg-[#f5efff]/5 border border-[#f5efff]/10 text-[#f5efff]">
            <Cpu className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-[#f5efff]/40 uppercase tracking-wider block">
              L2 CONNECTION INVARIANTS
            </span>
            <span className="font-mono text-xs text-[#f5efff] font-semibold mt-0.5 block">
              Online Welford EWMA
            </span>
            <span className="text-[10px] text-[#f5efff]/50">Zero-drift host baselines</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#f5efff]/10 bg-[#0e0d18] p-4 flex items-start gap-3 hover:border-[#f5efff]/30 transition-colors">
          <div className="p-2 rounded-xl bg-[#f5efff]/5 border border-[#f5efff]/10 text-[#f5efff]">
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-[#f5efff]/40 uppercase tracking-wider block">
              L3 SESSION INVARIANTS
            </span>
            <span className="font-mono text-xs text-[#f5efff] font-semibold mt-0.5 block">
              FFT Beaconing & CV &lt; 0.15
            </span>
            <span className="text-[10px] text-[#f5efff]/50">Stealth C2 & DNS tunneling</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#f5efff]/10 bg-[#0e0d18] p-4 flex items-start gap-3 hover:border-[#f5efff]/30 transition-colors">
          <div className="p-2 rounded-xl bg-[#f5efff]/5 border border-[#f5efff]/10 text-[#f5efff]">
            <Shield className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-[#f5efff]/40 uppercase tracking-wider block">
              PHYSICAL AIR GAP
            </span>
            <span className="font-mono text-xs text-emerald-400 font-semibold mt-0.5 block">
              0.00 ns Return Channel
            </span>
            <span className="text-[10px] text-[#f5efff]/50">Physical optical diode tap</span>
          </div>
        </div>
      </div>

      {/* Bottom Keyboard Interactive Wireframe Indicator */}
      <div className="mt-8 pt-4 border-t border-[#f5efff]/5 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] text-[#f5efff]/40 uppercase tracking-widest">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f5efff]/50 animate-ping" />
          <span>REAL-TIME KEYSTROKE STREAM // MECHANICAL TYPEWRITER PROTOCOL</span>
        </span>
        <span>SCROLL TO SCRUB TYPING PROGRESS // 100% INVARIANT EXTRACTION</span>
      </div>
    </div>
  );
}
