'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Direction the element enters from */
  direction?: 'left' | 'right' | 'top' | 'bottom' | 'fade';
  /** Delay in ms before animation starts */
  delay?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Distance in px the element travels */
  distance?: number;
  /** Additional CSS classes */
  className?: string;
  /** Only animate once (default true) */
  once?: boolean;
}

export function ScrollReveal({
  children,
  direction = 'bottom',
  delay = 0,
  duration = 900,
  distance = 80,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const getInitialTransform = (): string => {
    switch (direction) {
      case 'left':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(${distance}px, 0, 0)`;
      case 'top':
        return `translate3d(0, -${distance}px, 0)`;
      case 'bottom':
        return `translate3d(0, ${distance}px, 0)`;
      case 'fade':
        return 'translate3d(0, 16px, 0)';
      default:
        return `translate3d(0, ${distance}px, 0)`;
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: isVisible ? 'translate3d(0, 0, 0)' : getInitialTransform(),
        opacity: isVisible ? 1 : 0,
        transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity ${Math.round(duration * 0.75)}ms ease ${delay}ms`,
        willChange: isVisible ? 'auto' : 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
