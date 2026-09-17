'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Sliders, Menu, X, ArrowUpRight } from 'lucide-react';
import { SettingsModal } from './settings-modal';
import { Magnetic } from './magnetic-button';

export function StudioNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close overlay on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen]);

  const navLinks = [
    { num: '01', label: 'Home', href: '/', desc: 'Zero-Return Ingress & 3D Threat Globe' },
    { num: '02', label: 'About', href: '/about', desc: 'Sovereign Defense Architecture & Philosophy' },
    { num: '03', label: 'Work', href: '/work', desc: 'Engineered Systems & Cyber Defense PRJCTs' },
    { num: '04', label: 'Contact', href: '/contact', desc: 'Classified Enclave Inquiries & Dispatch' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3.5 bg-[#08080c]/90 backdrop-blur-2xl border-b border-[#f5efff]/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)]'
            : 'py-6 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
          {/* Brand / Home Link */}
          <Link
            href="/"
            data-cursor="Home"
            className="group flex items-center gap-3.5 focus:outline-none"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#f5efff]/20 bg-[#f5efff]/5 transition-all duration-300 group-hover:border-[#f5efff]/50 group-hover:shadow-[0_0_20px_rgba(245,239,255,0.2)]">
              <Shield className="h-4 w-4 text-[#f5efff] transition-transform duration-300 group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-[0.2em] text-[#f5efff] group-hover:text-white transition-colors">
                MIRAGE
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#f5efff]/45">
                NTRO // PS 26145
              </span>
            </div>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Audio frequency visualizer */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#f5efff]/10 bg-[#f5efff]/5 text-[#f5efff]/70">
              <span className="studio-eq-bar" />
              <span className="studio-eq-bar" />
              <span className="studio-eq-bar" />
              <span className="studio-eq-bar" />
              <span className="ml-1.5 font-mono text-[10px] tracking-wider text-[#f5efff]/50">
                528Hz
              </span>
            </div>

            {/* Settings button */}
            <Magnetic strength={0.25}>
              <button
                onClick={() => setIsSettingsOpen(true)}
                data-cursor="Settings"
                aria-label="Open System Settings"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f5efff]/15 bg-[#f5efff]/5 text-[#f5efff] hover:border-[#f5efff]/40 hover:bg-[#f5efff]/10 transition-all duration-300 focus:outline-none"
              >
                <Sliders className="h-4 w-4" />
              </button>
            </Magnetic>

            {/* Pill CTA Button */}
            <Magnetic strength={0.25}>
              <Link
                href="/contact"
                data-cursor="Send"
                className="hidden sm:inline-flex studio-pill-btn group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Let&apos;s talk</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </Magnetic>

            {/* Hamburger button */}
            <Magnetic strength={0.25}>
              <button
                onClick={() => setIsMenuOpen(true)}
                data-cursor="Menu"
                aria-label="Open Navigation Menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f5efff]/15 bg-[#f5efff]/5 text-[#f5efff] hover:border-[#f5efff]/40 hover:bg-[#f5efff]/10 transition-all duration-300 focus:outline-none"
              >
                <Menu className="h-4 w-4" />
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* Full-Screen Overlay Navigation Menu */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col justify-between bg-[#08080c] px-6 py-8 md:px-16 md:py-12 text-[#f5efff] transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Header inside overlay */}
        <div className="flex items-center justify-between border-b border-[#f5efff]/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#f5efff] shadow-[0_0_8px_#f5efff]" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#f5efff]/70">
              NAVIGATION DIRECTORY
            </span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            data-cursor="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f5efff]/20 bg-[#f5efff]/5 text-[#f5efff] hover:bg-[#f5efff]/15 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Central Menu Items */}
        <div className="my-auto max-w-4xl py-8">
          <nav className="space-y-4 md:space-y-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <div key={link.num} className="group flex flex-col md:flex-row md:items-baseline justify-between py-2 border-b border-[#f5efff]/5 transition-all duration-300 hover:border-[#f5efff]/25">
                  <Link
                    href={link.href}
                    data-cursor="View"
                    className="flex items-baseline gap-4 md:gap-8"
                  >
                    <span className="font-mono text-sm md:text-base text-[#f5efff]/35 group-hover:text-[#f5efff] transition-colors">
                      {link.num}
                    </span>
                    <span
                      className={`font-editorial text-4xl sm:text-6xl md:text-7xl font-light tracking-tight transition-all duration-300 ${
                        isActive
                          ? 'text-[#f5efff] italic underline underline-offset-8 decoration-1 decoration-[#f5efff]/50'
                          : 'text-[#f5efff]/75 group-hover:text-[#f5efff] group-hover:translate-x-3'
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                  <span className="mt-1 md:mt-0 font-mono text-xs text-[#f5efff]/40 tracking-wider">
                    {link.desc}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Enclave Quick Links & Metadata */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#f5efff]/10 pt-6">
          <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-[#f5efff]/50">
            <Link href="/dashboard" className="hover:text-[#f5efff] transition-colors">
              // LIVE SOC CONSOLE
            </Link>
            <Link href="/simulation" className="hover:text-[#f5efff] transition-colors">
              // CYBER RANGE SANDBOX
            </Link>
            <Link href="/forensics" className="hover:text-[#f5efff] transition-colors">
              // BLOCKCHAIN AUDIT
            </Link>
          </div>
          <div className="font-mono text-[10px] text-[#f5efff]/35 uppercase tracking-widest">
            NEW DELHI // IST (UTC+5:30) · NTRO CYBER ENCLAVE
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
