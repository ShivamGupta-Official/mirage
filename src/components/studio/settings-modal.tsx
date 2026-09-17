'use client';

import { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Moon, Sparkles, Sliders, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [themeTone, setThemeTone] = useState<'obsidian' | 'midnight'>('obsidian');
  const [renderQuality, setRenderQuality] = useState<'ultra' | 'balanced'>('ultra');

  // Load preferences from localStorage
  useEffect(() => {
    const savedSound = localStorage.getItem('mirage_sound_enabled');
    if (savedSound === 'true') setSoundEnabled(true);

    const savedTone = localStorage.getItem('mirage_theme_tone');
    if (savedTone === 'midnight') setThemeTone('midnight');

    const savedQuality = localStorage.getItem('mirage_render_quality');
    if (savedQuality === 'balanced') setRenderQuality('balanced');
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('mirage_sound_enabled', String(next));

    if (next && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime); // 528 Hz defense resonance
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch (e) {
        console.debug('WebAudio play notice:', e);
      }
    }
  };

  const handleToneChange = (tone: 'obsidian' | 'midnight') => {
    setThemeTone(tone);
    localStorage.setItem('mirage_theme_tone', tone);
    if (tone === 'midnight') {
      document.documentElement.style.setProperty('--studio-bg', '#040407');
    } else {
      document.documentElement.style.setProperty('--studio-bg', '#08080c');
    }
  };

  const handleQualityChange = (quality: 'ultra' | 'balanced') => {
    setRenderQuality(quality);
    localStorage.setItem('mirage_render_quality', quality);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-[#08080c]/85">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#f5efff]/15 bg-[#0f0e17] p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] text-[#f5efff] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f5efff]/10 pb-5">
          <div className="flex items-center gap-3">
            <Sliders className="h-4 w-4 text-[#f5efff]/70" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#f5efff]">
              SYSTEM PREFERENCES
            </span>
          </div>
          <button
            onClick={onClose}
            data-cursor="Close"
            className="rounded-full p-2 text-[#f5efff]/60 hover:text-[#f5efff] hover:bg-[#f5efff]/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#f5efff]">
                {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-[#f5efff]/40" />}
                Audio Feedback & 528Hz Ambient
              </div>
              <p className="text-xs text-[#f5efff]/50 mt-1">
                Procedural WebAudio soundscape and tactical click response
              </p>
            </div>
            <button
              onClick={toggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? 'bg-[#f5efff]' : 'bg-[#f5efff]/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#08080c] transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Theme Tone */}
          <div className="border-t border-[#f5efff]/10 pt-5">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#f5efff]">
              <Moon className="h-4 w-4 text-[#f5efff]/70" />
              Dark Mode Color Space
            </div>
            <p className="text-xs text-[#f5efff]/50 mt-1 mb-3">
              Tailored contrast palettes for tactical SOC lighting conditions
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleToneChange('obsidian')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  themeTone === 'obsidian'
                    ? 'border-[#f5efff] bg-[#f5efff]/10 shadow-[0_0_15px_rgba(245,239,255,0.15)]'
                    : 'border-[#f5efff]/10 bg-[#08080c] hover:border-[#f5efff]/30'
                }`}
              >
                <span className="font-mono text-xs font-semibold">Obsidian Void</span>
                <span className="text-[10px] text-[#f5efff]/50 mt-0.5">Deep near-black (#08080c)</span>
              </button>
              <button
                onClick={() => handleToneChange('midnight')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  themeTone === 'midnight'
                    ? 'border-[#f5efff] bg-[#f5efff]/10 shadow-[0_0_15px_rgba(245,239,255,0.15)]'
                    : 'border-[#f5efff]/10 bg-[#040407] hover:border-[#f5efff]/30'
                }`}
              >
                <span className="font-mono text-xs font-semibold">Midnight Velvet</span>
                <span className="text-[10px] text-[#f5efff]/50 mt-0.5">Ultra pure OLED black (#040407)</span>
              </button>
            </div>
          </div>

          {/* Render Quality */}
          <div className="border-t border-[#f5efff]/10 pt-5">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#f5efff]">
              <Sparkles className="h-4 w-4 text-[#f5efff]/70" />
              WebGL Shader Fidelity
            </div>
            <p className="text-xs text-[#f5efff]/50 mt-1 mb-3">
              Configure 3D Cyber Globe particle density and simulation rate
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQualityChange('ultra')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  renderQuality === 'ultra'
                    ? 'border-[#f5efff] bg-[#f5efff]/10 shadow-[0_0_15px_rgba(245,239,255,0.15)]'
                    : 'border-[#f5efff]/10 bg-[#08080c] hover:border-[#f5efff]/30'
                }`}
              >
                <span className="font-mono text-xs font-semibold">Ultra (GPU 60 FPS)</span>
                <span className="text-[10px] text-[#f5efff]/50 mt-0.5">Full particle rings & arcs</span>
              </button>
              <button
                onClick={() => handleQualityChange('balanced')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  renderQuality === 'balanced'
                    ? 'border-[#f5efff] bg-[#f5efff]/10 shadow-[0_0_15px_rgba(245,239,255,0.15)]'
                    : 'border-[#f5efff]/10 bg-[#08080c] hover:border-[#f5efff]/30'
                }`}
              >
                <span className="font-mono text-xs font-semibold">Power Saver</span>
                <span className="text-[10px] text-[#f5efff]/50 mt-0.5">Optimized battery footprint</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-between border-t border-[#f5efff]/10 pt-4">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-[#f5efff]/40" />
            <span className="font-mono text-[10px] text-[#f5efff]/40 uppercase tracking-wider">
              NTRO ENCLAVE // BUILD 2026.09
            </span>
          </div>
          <button
            onClick={onClose}
            className="studio-pill-btn text-xs py-2 px-5"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
