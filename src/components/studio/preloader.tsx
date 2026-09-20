'use client';

import { useEffect, useState } from 'react';

export function Preloader() {
  const [count, setCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [shouldRender, setShouldRender] = useState<boolean>(true);

  useEffect(() => {
    // Check if user already saw preloader in this session
    const seen = sessionStorage.getItem('mirage_preloader_seen');
    if (seen) {
      setShouldRender(false);
      return;
    }

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFinished(true);
            sessionStorage.setItem('mirage_preloader_seen', 'true');
            setTimeout(() => setShouldRender(false), 350);
          }, 100);
          return 100;
        }
        // Rapid fluid acceleration (~300ms)
        const jump = Math.floor(Math.random() * 14) + 8;
        return Math.min(100, prev + jump);
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col justify-between bg-[#08080c] p-8 md:p-16 transition-opacity duration-700 ease-out pointer-events-none ${
        isFinished ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#f5efff] shadow-[0_0_10px_#f5efff] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#f5efff]/70">
            NTRO // MIRAGE ENCLAVE CORE
          </span>
        </div>
        <span className="font-mono text-xs tracking-[0.2em] text-[#f5efff]/40 uppercase">
          PS ID 26145
        </span>
      </div>

      <div className="flex flex-col items-center justify-center text-center">
        <div className="relative font-mono text-[18vw] font-bold leading-none tracking-tighter text-[#f5efff]">
          {count.toString().padStart(3, '0')}
          <span className="absolute -top-4 -right-10 text-3xl font-light text-[#f5efff]/40">%</span>
        </div>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-[#f5efff]/60">
          Calibrating Optical Diode Transceivers // Welford Baseline Ready
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-[#f5efff]/10 pt-4">
        <span className="font-mono text-[10px] text-[#f5efff]/35 uppercase tracking-widest">
          ZERO-RETURN PHYSICAL LAYER // SHA-256 LEDGER
        </span>
        <span className="font-mono text-[10px] text-[#f5efff]/35 uppercase tracking-widest">
          RESTRICTED
        </span>
      </div>
    </div>
  );
}
