"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
export const AmbientParticlesCanvas = ({ scale = 2.0 }: { scale?: number }) => {
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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // --- Interactive Ambient Particles ---
    const particleCount = isMobile ? 6500 : 14000;
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
      size: isMobile ? 0.034 : 0.03,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
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

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        mouseMoved = true;
      }
    };
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

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
      window.removeEventListener('touchmove', handleTouchMove);
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

export default AmbientParticlesCanvas;
