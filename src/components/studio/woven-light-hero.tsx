"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import Link from 'next/link';

interface WovenLightHeroProps {
  headline?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  showNav?: boolean;
  showCanvas?: boolean;
  scale?: number;
  className?: string;
}

// --- Main Hero Component ---
export const WovenLightHero: React.FC<WovenLightHeroProps> = ({
  headline = "Woven by Light",
  subtitle = "An interactive tapestry of light and motion, crafted with code and creativity.",
  ctaText = "Explore the Weave",
  ctaHref = "/dashboard",
  showNav = true,
  showCanvas = true,
  scale = 2.4,
  className = "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white",
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  let charIndexCounter = 0;

  return (
    <div className={className}>
      {showCanvas && <WovenCanvas scale={scale} />}
      {showNav && <HeroNav isReady={isReady} />}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pointer-events-auto">
        <h1
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white font-bold tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 0 50px rgba(255, 255, 255, 0.3)' }}
        >
          {headline.split(" ").map((word, i) => (
            <span key={i} className="inline-block">
              {word.split("").map((char, j) => {
                const idx = charIndexCounter++;
                return (
                  <span
                    key={j}
                    style={{
                      display: 'inline-block',
                      opacity: isReady ? 1 : 0,
                      transform: isReady ? 'translateY(0)' : 'translateY(50px)',
                      transition: `opacity 1.2s cubic-bezier(0.2, 0.65, 0.3, 0.9) ${idx * 60 + 500}ms, transform 1.2s cubic-bezier(0.2, 0.65, 0.3, 0.9) ${idx * 60 + 500}ms`,
                    }}
                  >
                    {char}
                  </span>
                );
              })}
              {i < headline.split(" ").length - 1 && <span>&nbsp;</span>}
            </span>
          ))}
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-slate-300 font-light leading-relaxed"
          style={{
            fontFamily: "'Inter', sans-serif",
            opacity: isReady ? 1 : 0,
            transform: isReady ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 1s cubic-bezier(0.2, 0.65, 0.3, 0.9) 1200ms, transform 1s cubic-bezier(0.2, 0.65, 0.3, 0.9) 1200ms',
          }}
        >
          {subtitle}
        </p>

        <div
          className="mt-10 flex items-center justify-center gap-4 flex-wrap"
          style={{
            opacity: isReady ? 1 : 0,
            transform: isReady ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease 1600ms, transform 1s ease 1600ms',
          }}
        >
          <Link
            href={ctaHref}
            className="rounded-full border-2 border-white/20 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:border-white/40 shadow-lg shadow-white/5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {ctaText}
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 bg-black/40 px-7 py-3.5 font-medium text-white/70 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Launch SOC Console →
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- Navigation Component ---
const HeroNav = ({ isReady }: { isReady: boolean }) => {
  return (
    <nav
      className="absolute top-0 left-0 right-0 z-20 p-6 pointer-events-auto transition-opacity duration-1000"
      style={{ opacity: isReady ? 1 : 0, transitionDelay: '400ms' }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold text-cyan-400 group-hover:scale-110 transition-transform">⎎</span>
          <span className="text-xl font-bold text-white tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Woven</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 ml-2">
            OPTICAL FIBER WEAVE
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs font-mono uppercase tracking-widest text-white/70 hover:text-white transition-colors"
          >
            Enter Enclave →
          </Link>
        </div>
      </div>
    </nav>
  );
};

// --- Three.js Canvas Component ---
export const WovenCanvas = ({ scale = 2.0 }: { scale?: number }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    currentMount.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();

    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // --- Optimized Woven Silk ---
    const particleCount = 14000;
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const geometry = new THREE.BufferGeometry();
    const radius = 1.5 * scale;
    const tube = 0.5 * scale;
    const torusKnot = new THREE.TorusKnotGeometry(radius, tube, 160, 24);

    for (let i = 0; i < particleCount; i++) {
      const vertexIndex = i % torusKnot.attributes.position.count;
      const x = torusKnot.attributes.position.getX(vertexIndex);
      const y = torusKnot.attributes.position.getY(vertexIndex);
      const z = torusKnot.attributes.position.getZ(vertexIndex);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      const color = new THREE.Color();
      color.setHSL((i / particleCount) * 0.7 + 0.5, 0.8, isDarkMode ? 0.55 : 0.7);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.028,
      vertexColors: true,
      blending: isDarkMode ? THREE.NormalBlending : THREE.AdditiveBlending,
      transparent: true,
      opacity: isDarkMode ? 0.95 : 0.85,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let mouseMoved = false;
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouseMoved = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let animationFrameId: number;

    const mouseReach = 3.2 * scale;
    const interactionDist = 1.6 * scale;
    const interactionDistSq = interactionDist * interactionDist;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      const mx = mouse.x * mouseReach;
      const my = mouse.y * mouseReach;

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        if (mouseMoved) {
          const dx = positions[ix] - mx;
          const dy = positions[iy] - my;
          const dz = positions[iz];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < interactionDistSq && distSq > 0.001) {
            const dist = Math.sqrt(distSq);
            const force = (interactionDist - dist) * 0.012;
            const invDist = force / dist;
            velocities[ix] += dx * invDist;
            velocities[iy] += dy * invDist;
            velocities[iz] += dz * invDist;
          }
        }

        // Return spring force + damping
        velocities[ix] = (velocities[ix] + (originalPositions[ix] - positions[ix]) * 0.0012) * 0.94;
        velocities[iy] = (velocities[iy] + (originalPositions[iy] - positions[iy]) * 0.0012) * 0.94;
        velocities[iz] = (velocities[iz] + (originalPositions[iz] - positions[iz]) * 0.0012) * 0.94;

        positions[ix] += velocities[ix];
        positions[iy] += velocities[iy];
        positions[iz] += velocities[iz];
      }
      geometry.attributes.position.needsUpdate = true;

      // Rotate continuously and react to scroll depth
      points.rotation.y = elapsedTime * 0.05 + scrollY * 0.0005;
      points.rotation.x = scrollY * 0.0004;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-auto" />;
};
export default WovenLightHero;
