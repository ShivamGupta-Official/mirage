'use client';

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { GLOBE, PHASES } from '@/lib/globe-phases';

export interface GlobeSceneProps {
  progress: React.MutableRefObject<number>;
  reducedMotion?: boolean;
  visible?: boolean;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function latLonToVector3(lat: number, lon: number, radius = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function ThreatAttackNetwork() {
  const targetPos = useMemo(() => latLonToVector3(28.6139, 77.2090, 1.002), []);

  const attackData = useMemo(() => {
    const rawVectors = [
      { id: '1', name: 'Beijing', lat: 39.9042, lon: 116.4074, color: '#ef4444' },
      { id: '2', name: 'Moscow', lat: 55.7558, lon: 37.6173, color: '#f43f5e' },
      { id: '3', name: 'Frankfurt', lat: 50.1109, lon: 8.6821, color: '#f59e0b' },
      { id: '4', name: 'Ashburn, VA', lat: 39.0438, lon: -77.4874, color: '#a855f7' },
      { id: '5', name: 'Pyongyang', lat: 39.0392, lon: 125.7625, color: '#dc2626' },
      { id: '6', name: 'Amsterdam', lat: 52.3676, lon: 4.9041, color: '#eab308' },
      { id: '7', name: 'Shenzhen', lat: 22.5431, lon: 114.0579, color: '#06b6d4' },
    ];

    return rawVectors.map((atk, idx) => {
      const srcPos = latLonToVector3(atk.lat, atk.lon, 1.002);
      const mid = srcPos.clone().add(targetPos).multiplyScalar(0.5);
      const dist = srcPos.distanceTo(targetPos);
      const altitude = 1.0 + Math.min(0.42, dist * 0.22);
      mid.normalize().multiplyScalar(altitude);
      const curve = new THREE.QuadraticBezierCurve3(srcPos, mid, targetPos);
      const points = curve.getPoints(40);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(atk.color),
        transparent: true,
        opacity: 0.65,
      });
      const line = new THREE.Line(geom, lineMat);

      return {
        ...atk,
        srcPos,
        curve,
        geom,
        line,
        colorHex: atk.color,
        threeColor: new THREE.Color(atk.color),
        speed: 0.35 + (idx % 3) * 0.1,
        offset1: (idx * 0.17) % 1.0,
        offset2: ((idx * 0.17) + 0.5) % 1.0,
      };
    });
  }, [targetPos]);

  const pulseGroupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.lookAt(targetPos.clone().multiplyScalar(2));
    }
  }, [targetPos]);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (pulseGroupRef.current) {
      let childIdx = 0;
      attackData.forEach((atk) => {
        const pulse1 = pulseGroupRef.current.children[childIdx++];
        const pulse2 = pulseGroupRef.current.children[childIdx++];
        if (pulse1 && pulse2) {
          const t1 = (time * atk.speed + atk.offset1) % 1.0;
          const t2 = (time * atk.speed + atk.offset2) % 1.0;
          atk.curve.getPoint(t1, pulse1.position);
          atk.curve.getPoint(t2, pulse2.position);
        }
      });
    }

    if (ringRef.current) {
      const ringScale = 1.0 + (time * 1.6) % 3.0;
      ringRef.current.scale.setScalar(ringScale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        0.9 - (ringScale - 1.0) / 3.0
      );
    }
  });

  return (
    <group>
      {/* Target Pin Beacon at New Delhi */}
      <mesh position={targetPos}>
        <sphereGeometry args={[0.016, 16, 16]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      {/* Expanding Target Radar Shockwave Ring */}
      <mesh ref={ringRef} position={targetPos}>
        <ringGeometry args={[0.02, 0.038, 32]} />
        <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} transparent opacity={0.85} />
      </mesh>

      {/* Attacker Origin Pins and Trajectory Arcs */}
      {attackData.map((atk) => (
        <group key={atk.id}>
          <mesh position={atk.srcPos}>
            <sphereGeometry args={[0.012, 12, 12]} />
            <meshBasicMaterial color={atk.threeColor} />
          </mesh>
          <primitive object={atk.line} />
        </group>
      ))}

      {/* Traveling Laser Photon Pulses */}
      <group ref={pulseGroupRef}>
        {attackData.map((atk) => (
          <React.Fragment key={`pulses-${atk.id}`}>
            <mesh>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.010, 8, 8]} />
              <meshBasicMaterial color={atk.threeColor} />
            </mesh>
          </React.Fragment>
        ))}
      </group>
    </group>
  );
}

function EarthMesh({
  progress,
  reducedMotion,
}: {
  progress: React.MutableRefObject<number>;
  reducedMotion?: boolean;
}) {
  const outer = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const clouds = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();

  const isLowEnd = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const lowCores = (navigator.hardwareConcurrency ?? 4) <= 4;
    const smallScreen = window.innerWidth < 640;
    return lowCores || smallScreen;
  }, []);

  const segments = isLowEnd ? 32 : 64;

  // Load all 5 textures from /public/textures/
  const [colorMap, normalMap, specularMap, cloudsMap, lightsMap] = useTexture([
    '/textures/earth_atmos_2048.jpg',
    '/textures/earth_normal_2048.jpg',
    '/textures/earth_specular_2048.jpg',
    '/textures/earth_clouds_1024.png',
    '/textures/earth_lights_2048.png',
  ]);

  useMemo(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace;
    colorMap.anisotropy = 8;
    lightsMap.colorSpace = THREE.SRGBColorSpace;
    lightsMap.anisotropy = 8;
    cloudsMap.colorSpace = THREE.SRGBColorSpace;
    cloudsMap.anisotropy = 8;
  }, [colorMap, lightsMap, cloudsMap]);

  // Atmosphere back-side Fresnel shader material
  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
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
            float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(0.25, 0.60, 1.0, 1.0) * intensity * 1.25;
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  const smooth = useRef(0);
  const idle = useRef(0);

  // Axial tilt on mount
  useEffect(() => {
    if (outer.current) {
      outer.current.rotation.z = (GLOBE.tiltDeg * Math.PI) / 180;
    }
  }, []);

  useFrame((_, dt) => {
    if (!outer.current || !spin.current) return;

    if (reducedMotion) {
      const vh = viewport.height;
      const vw = viewport.width;
      const R = Math.min(vw, vh) * GLOBE.radiusVsViewport;
      outer.current.position.y = 0;
      outer.current.scale.setScalar(R);
      return;
    }

    // Exact placement math from spec
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.current, GLOBE.damping, dt);
    const p = smooth.current;
    const vh = viewport.height;
    const vw = viewport.width;
    const R = Math.min(vw, vh) * GLOBE.radiusVsViewport;

    // where the center must be so only the top cap peeks over the bottom edge
    const yTip = -vh / 2 + GLOBE.tipFraction * 2 * R - R;
    const R_final = Math.min(vw, vh) * GLOBE.finalRadiusVsViewport;
    const yFinal = vh * GLOBE.finalYFraction;

    const riseT = easeInOutCubic(seg(p, PHASES.rise[0], PHASES.rise[1]));
    const settleT = easeInOutCubic(seg(p, PHASES.sink[0], PHASES.sink[1]));

    let y = THREE.MathUtils.lerp(yTip, 0, riseT);
    y = THREE.MathUtils.lerp(y, yFinal, settleT);
    const s = THREE.MathUtils.lerp(R, R_final, settleT);

    idle.current += dt * GLOBE.idleSpeed; // continuously rotates at its place
    outer.current.position.y = y;
    outer.current.scale.setScalar(s);
    spin.current.rotation.y = idle.current + p * Math.PI * 2 * GLOBE.spinTurns;

    if (clouds.current) {
      clouds.current.rotation.y = idle.current * 1.15 + p * Math.PI * 2.1 * GLOBE.spinTurns;
    }
  });

  return (
    <group ref={outer}>
      {/* Atmosphere back-side glow at 1.06 radius */}
      <mesh material={atmosphereMaterial}>
        <sphereGeometry args={[1.06, segments, segments]} />
      </mesh>

      {/* Inner spin group for axial Y rotation */}
      <group ref={spin}>
        {/* Base Earth sphere with day + normal + specular + emissive night lights */}
        <mesh>
          <sphereGeometry args={[1, segments, segments]} />
          <meshStandardMaterial
            map={colorMap}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.85, 0.85)}
            roughnessMap={specularMap}
            roughness={0.7}
            metalness={0.1}
            emissiveMap={lightsMap}
            emissive={new THREE.Color(0xffffff)}
            emissiveIntensity={0.65}
          />
        </mesh>

        {/* Cloud layer at 1.01 radius (skipped on low-end) */}
        {!isLowEnd && (
          <mesh ref={clouds}>
            <sphereGeometry args={[1.012, segments, segments]} />
            <meshStandardMaterial
              map={cloudsMap}
              transparent
              opacity={0.38}
              blending={THREE.NormalBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* 3D Ballistic Threat Attack Trajectories & Radar Beacons */}
        <ThreatAttackNetwork />
      </group>
    </group>
  );
}

// Fallback sphere while textures load
function FallbackGlobe({
  progress,
  reducedMotion,
}: {
  progress: React.MutableRefObject<number>;
  reducedMotion?: boolean;
}) {
  const outer = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const { viewport } = useThree();
  const smooth = useRef(0);
  const idle = useRef(0);

  useEffect(() => {
    if (outer.current) {
      outer.current.rotation.z = (GLOBE.tiltDeg * Math.PI) / 180;
    }
  }, []);

  useFrame((_, dt) => {
    if (!outer.current || !spin.current) return;
    if (reducedMotion) {
      const vh = viewport.height, vw = viewport.width;
      const R = Math.min(vw, vh) * GLOBE.radiusVsViewport;
      outer.current.position.y = 0;
      outer.current.scale.setScalar(R);
      return;
    }

    smooth.current = THREE.MathUtils.damp(smooth.current, progress.current, GLOBE.damping, dt);
    const p = smooth.current;
    const vh = viewport.height, vw = viewport.width;
    const R = Math.min(vw, vh) * GLOBE.radiusVsViewport;

    const yTip = -vh / 2 + GLOBE.tipFraction * 2 * R - R;
    const R_final = Math.min(vw, vh) * GLOBE.finalRadiusVsViewport;
    const yFinal = vh * GLOBE.finalYFraction;

    const riseT = easeInOutCubic(seg(p, PHASES.rise[0], PHASES.rise[1]));
    const settleT = easeInOutCubic(seg(p, PHASES.sink[0], PHASES.sink[1]));

    let y = THREE.MathUtils.lerp(yTip, 0, riseT);
    y = THREE.MathUtils.lerp(y, yFinal, settleT);
    const s = THREE.MathUtils.lerp(R, R_final, settleT);

    idle.current += dt * GLOBE.idleSpeed;
    outer.current.position.y = y;
    outer.current.scale.setScalar(s);
    spin.current.rotation.y = idle.current + p * Math.PI * 2 * GLOBE.spinTurns;
  });

  return (
    <group ref={outer}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.6} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

export default function GlobeScene({ progress, reducedMotion = false, visible = true }: GlobeSceneProps) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 35 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      frameloop={visible ? 'always' : 'never'}
      className="w-full h-full block pointer-events-none"
    >
      {/* Sun directional light + ambient */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 4, 8]} intensity={2.8} />
      <directionalLight position={[-8, -2, -4]} intensity={0.3} color="#38bdf8" />

      {/* Starfield */}
      <Stars radius={120} depth={50} count={3500} factor={4} saturation={0} fade speed={1} />

      <Suspense fallback={<FallbackGlobe progress={progress} reducedMotion={reducedMotion} />}>
        <EarthMesh progress={progress} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}
