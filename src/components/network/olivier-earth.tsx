'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* ────────────────────────────────────────────────────────
   OLIVIER LAROSE 3D EARTH (Exact Replica)
   Source: github.com/olivierlarose/3d-earth-scroll
   Textures: /assets/color.jpg, /assets/normal.png, /assets/occlusion.jpg
   Lighting: directionalLight [1, 0, -0.25] @ 3.5 + ambientLight @ 0.2
──────────────────────────────────────────────────────── */

export interface OlivierEarthProps {
  className?: string;
  autoRotateSpeed?: number;
  interactive?: boolean;
}

export function OlivierEarth({
  className = 'w-full h-full min-h-[500px]',
  autoRotateSpeed = 0.002,
  interactive = true,
}: OlivierEarthProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(true);
  autoRotateRef.current = autoRotate;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId = 0;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lighting (exact matching olivierlarose/3d-earth-scroll)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
    // [1, 0, -0.25] orientation normalized
    sunLight.position.set(16, 1, -4);
    scene.add(sunLight);

    // Subtle soft rim light to complement dark space
    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
    rimLight.position.set(-15, 6, -8);
    scene.add(rimLight);

    // Earth Sphere geometry (64 segments like olivierlarose repo)
    const globeRadius = 4.5;
    const geometry = new THREE.SphereGeometry(globeRadius, 64, 64);

    // Load textures
    const textureLoader = new THREE.TextureLoader();
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 3) {
        setLoading(false);
      }
    };

    const colorMap = textureLoader.load('/assets/color.jpg', checkLoaded);
    colorMap.colorSpace = THREE.SRGBColorSpace;

    const normalMap = textureLoader.load('/assets/normal.png', checkLoaded);
    const aoMap = textureLoader.load('/assets/occlusion.jpg', checkLoaded);

    const material = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap,
      aoMap: aoMap,
      roughness: 0.8,
      metalness: 0.1,
    });

    const earthMesh = new THREE.Mesh(geometry, material);
    scene.add(earthMesh);

    // Atmosphere halo
    const atmoGeom = new THREE.SphereGeometry(globeRadius * 1.12, 32, 32);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 0.85;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmoMesh = new THREE.Mesh(atmoGeom, atmoMat);
    scene.add(atmoMesh);

    // Mouse drag interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      earthMesh.rotation.y += dx * 0.005;
      earthMesh.rotation.x = Math.max(-1.1, Math.min(1.1, earthMesh.rotation.x + dy * 0.003));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    // Scroll-driven rotation (matching olivierlarose scroll binding)
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let scrollDelta = 0;
    const onScroll = () => {
      const curr = window.scrollY;
      scrollDelta = (curr - lastScrollY) * 0.003;
      lastScrollY = curr;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Wheel zoom
    const dom = renderer.domElement;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(7.5, Math.min(25, camera.position.z + e.deltaY * 0.012));
    };
    dom.addEventListener('wheel', onWheel, { passive: false });

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation loop
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Auto-rotation when not dragging
      if (autoRotateRef.current && !isDragging) {
        earthMesh.rotation.y += autoRotateSpeed;
      }

      // Smooth scroll rotation decay
      earthMesh.rotation.y += scrollDelta;
      scrollDelta *= 0.92;

      renderer?.render(scene, camera);
    };
    animate();

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw > 0 && nh > 0 && renderer) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (renderer && renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [interactive, autoRotateSpeed]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* 3D Canvas Mount */}
      <div
        ref={containerRef}
        className={`${className} cursor-grab active:cursor-grabbing w-full h-full`}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#090910]/80 backdrop-blur-sm z-10 transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span className="font-mono text-xs text-[#f5efff]/70 uppercase tracking-widest">
              Loading 3D Earth Textures (Color, Normal, AO)...
            </span>
          </div>
        </div>
      )}

      {/* Floating Controls Overlay */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate((prev) => !prev)}
          className="px-3 py-1.5 rounded-full bg-[#0c0b16]/90 border border-[#f5efff]/15 hover:border-[#f5efff]/30 text-[11px] font-mono text-[#f5efff]/80 backdrop-blur-md transition-all flex items-center gap-1.5"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${autoRotate ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          {autoRotate ? 'Auto-Rotate: ON' : 'Auto-Rotate: PAUSED'}
        </button>
        <span className="font-mono text-[10px] text-[#f5efff]/40 px-2 py-1 rounded-full bg-[#0c0b16]/60 border border-[#f5efff]/10 hidden sm:inline-block">
          Drag to rotate · Scroll to zoom
        </span>
      </div>
    </div>
  );
}
