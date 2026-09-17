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
  className?: string;
}

// --- Main Hero Component ---
export const WovenLightHero: React.FC<WovenLightHeroProps> = ({
  headline = "Woven by Light",
  subtitle = "An interactive tapestry of light and motion, crafted with code and creativity.",
  ctaText = "Explore the Weave",
  ctaHref = "/dashboard",
  showNav = true,
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
      <WovenCanvas />
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
export const WovenCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();

    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // --- Woven Silk ---
    const particleCount = 50000;
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const geometry = new THREE.BufferGeometry();
    const torusKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 32);

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
      color.setHSL(Math.random(), 0.8, isDarkMode ? 0.5 : 0.7);
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
      size: 0.02,
      vertexColors: true,
      blending: isDarkMode ? THREE.NormalBlending : THREE.AdditiveBlending,
      transparent: true,
      opacity: isDarkMode ? 1.0 : 0.8,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      const mouseWorld = new THREE.Vector3(mouse.x * 3, mouse.y * 3, 0);

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        const currentPos = new THREE.Vector3(positions[ix], positions[iy], positions[iz]);
        const originalPos = new THREE.Vector3(originalPositions[ix], originalPositions[iy], originalPositions[iz]);
        const velocity = new THREE.Vector3(velocities[ix], velocities[iy], velocities[iz]);

        const dist = currentPos.distanceTo(mouseWorld);
        if (dist < 1.5) {
          const force = (1.5 - dist) * 0.01;
          const direction = new THREE.Vector3().subVectors(currentPos, mouseWorld).normalize();
          velocity.add(direction.multiplyScalar(force));
        }

        // Return to original position
        const returnForce = new THREE.Vector3().subVectors(originalPos, currentPos).multiplyScalar(0.001);
        velocity.add(returnForce);
        
        // Damping
        velocity.multiplyScalar(0.95);

        positions[ix] += velocity.x;
        positions[iy] += velocity.y;
        positions[iz] += velocity.z;
        
        velocities[ix] = velocity.x;
        velocities[iy] = velocity.y;
        velocities[iz] = velocity.z;
      }
      geometry.attributes.position.needsUpdate = true;

      points.rotation.y = elapsedTime * 0.05;
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
