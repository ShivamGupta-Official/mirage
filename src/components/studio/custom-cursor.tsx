'use client';

import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const [cursorText, setCursorText] = useState<string>('');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Raw mouse coordinates
  const mousePos = useRef({ x: -100, y: -100 });
  // Lerp-smoothed coordinates
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number | null>(null);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run on desktop fine-pointer devices
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReduced) return;

    document.documentElement.classList.add('has-custom-cursor');

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) setIsVisible(true);

      // Reset idle timer
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setIsVisible(false);
      }, 4000);

      // Check hovered elements for contextual data-cursor tags
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest('[data-cursor]') as HTMLElement | null;
      if (cursorTarget) {
        const text = cursorTarget.getAttribute('data-cursor') || '';
        setCursorText(text);
        setIsHovered(true);
      } else {
        // Fallback checks for interactive elements
        const isClickable = target.closest('a, button, [role="button"], input, textarea, select');
        if (isClickable) {
          setIsHovered(true);
          setCursorText('');
        } else {
          setIsHovered(false);
          setCursorText('');
        }
      }

      // Magnetic pull effect on elements with [data-magnetic]
      const magneticTarget = target.closest('[data-magnetic]') as HTMLElement | null;
      if (magneticTarget) {
        const rect = magneticTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.28;
        const deltaY = (e.clientY - centerY) * 0.28;
        magneticTarget.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleResetMagnetic = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const magneticTarget = target.closest('[data-magnetic]') as HTMLElement | null;
      if (magneticTarget) {
        magneticTarget.style.transform = 'translate3d(0, 0, 0)';
      }
    };

    // 60fps lerp interpolation loop
    const render = () => {
      // Easing speed: 0.18 for smooth, luxurious lag
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseout', handleResetMagnetic, { passive: true });
    animFrameId.current = requestAnimationFrame(render);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseout', handleResetMagnetic);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isVisible]);

  return (
    <>
      {/* Small precise center dot */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed top-0 left-0 z-[9999] rounded-full bg-[#f5efff] transition-opacity duration-300 ${
          isVisible && !cursorText ? 'h-1.5 w-1.5 opacity-90' : 'h-1.5 w-1.5 opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Outer lagged ring with contextual morphing */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed top-0 left-0 z-[9998] flex items-center justify-center rounded-full transition-all duration-300 ${
          !isVisible
            ? 'opacity-0 scale-50'
            : cursorText
            ? 'h-20 w-20 bg-[#f5efff] text-[#08080c] shadow-[0_0_30px_rgba(245,239,255,0.4)] opacity-100 scale-100'
            : isHovered
            ? 'h-12 w-12 border border-[#f5efff]/80 bg-[#f5efff]/15 backdrop-blur-[2px] opacity-100 scale-100'
            : 'h-8 w-8 border border-[#f5efff]/35 bg-transparent opacity-80 scale-100'
        }`}
        style={{ willChange: 'transform' }}
      >
        {cursorText && (
          <span
            ref={labelRef}
            className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase select-none"
          >
            {cursorText}
          </span>
        )}
      </div>
    </>
  );
}
