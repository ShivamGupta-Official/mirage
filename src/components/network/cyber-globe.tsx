'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import {
  Shield,
  Activity,
  AlertTriangle,
  Crosshair,
  RotateCw,
  Compass,
  Globe,
  Radio,
  Zap,
  Play,
  Pause,
  Layers,
} from 'lucide-react';
import type { Alert, Host, ThreatEventDisplay } from '@/types';
import {
  predictLocationFromIp,
  generateDynamicHorizonThreat,
  PRIMARY_DEFENSE_TARGET,
  type DynamicThreatEvent,
  type GeoLocation,
} from '@/lib/geo-intel';

export interface ThreatNode {
  id: string;
  ip: string;
  label: string;
  location: string;
  lat: number;
  lon: number;
  role: 'attacker' | 'c2' | 'target' | 'internal_compromised' | 'gateway';
  riskScore: number;
  threatType?: string;
  packetRate?: number;
  bandwidthGbps?: number;
  country?: string;
  city?: string;
  asn?: string;
  mlConfidence?: number;
}

const DEFAULT_TARGET_NODE: ThreatNode = {
  id: 'node-target-enclave',
  ip: '10.0.0.10',
  label: 'Primary Protected Enclave (Diode Rx)',
  location: 'New Delhi, India [AS-NTRO-ENCLAVE]',
  lat: 28.6139,
  lon: 77.2090,
  role: 'target',
  riskScore: 12.0,
  packetRate: 1250,
  bandwidthGbps: 1.0,
  country: 'India',
  city: 'New Delhi',
  asn: 'AS-NTRO-ENCLAVE',
  mlConfidence: 100,
};

interface CyberGlobeProps {
  alerts?: Alert[];
  hosts?: Host[];
  threatStream?: ThreatEventDisplay[];
  activeScenario?: string | null;
  className?: string;
  /** Strip HUD overlays for lightweight landing page embed */
  compact?: boolean;
}

// Convert Lat/Lon to 3D Cartesian Vector on sphere of radius R
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate procedural Earth textures (Night lights, Oceans, Grid)
function createProceduralEarthTextures() {
  const width = 1024;
  const height = 512;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Deep navy ocean background
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
  oceanGradient.addColorStop(0, '#040b18');
  oceanGradient.addColorStop(0.5, '#061326');
  oceanGradient.addColorStop(1, '#030812');
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, width, height);

  // Ocean bathymetry grid lines
  ctx.strokeStyle = 'rgba(59, 158, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Procedural continental landmasses with neon cyber edge glow
  ctx.fillStyle = 'rgba(14, 34, 61, 0.95)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.2;

  // Render major landmasses
  const drawContinent = (points: [number, number][]) => {
    ctx.beginPath();
    points.forEach(([lon, lat], i) => {
      const px = ((lon + 180) / 360) * width;
      const py = ((90 - lat) / 180) * height;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // North America
  drawContinent([
    [-165, 70], [-140, 68], [-100, 72], [-75, 62], [-55, 48], [-70, 42],
    [-80, 25], [-95, 18], [-105, 22], [-122, 38], [-130, 50], [-165, 60]
  ]);
  // South America
  drawContinent([
    [-80, 10], [-50, -5], [-35, -10], [-40, -22], [-55, -35], [-68, -52],
    [-75, -45], [-72, -20], [-80, -2]
  ]);
  // Eurasia
  drawContinent([
    [-10, 36], [0, 42], [15, 38], [30, 40], [40, 30], [60, 25], [75, 10],
    [85, 20], [100, 15], [120, 25], [130, 35], [140, 45], [170, 65],
    [130, 72], [80, 75], [40, 70], [25, 71], [10, 60], [-5, 50]
  ]);
  // Africa
  drawContinent([
    [-15, 30], [10, 36], [30, 32], [50, 12], [42, -10], [30, -32],
    [20, -34], [12, -20], [8, 5], [-15, 15]
  ]);
  // Australia
  drawContinent([
    [115, -20], [130, -12], [145, -15], [152, -28], [140, -38], [118, -35], [112, -25]
  ]);

  // City cluster cyber lights
  ctx.fillStyle = '#60a5fa';
  const majorCities: [number, number][] = [
    [-77.03, 38.90], [-122.41, 37.77], [-0.12, 51.50], [8.68, 50.11],
    [37.61, 55.75], [77.20, 28.61], [72.87, 19.07], [116.40, 39.90],
    [139.69, 35.68], [126.97, 37.56], [103.81, 1.35], [151.20, -33.86],
    [-46.63, -23.55], [4.90, 52.36]
  ];
  majorCities.forEach(([lon, lat]) => {
    const px = ((lon + 180) / 360) * width;
    const py = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function CyberGlobe({
  alerts = [],
  hosts = [],
  threatStream = [],
  activeScenario,
  className,
  compact = false,
}: CyberGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [liveStreamActive, setLiveStreamActive] = useState<boolean>(true);
  const [dynamicThreats, setDynamicThreats] = useState<DynamicThreatEvent[]>([]);
  const [selectedNode, setSelectedNode] = useState<ThreatNode>(DEFAULT_TARGET_NODE);

  // Poll dynamic NetScout Horizon threats periodically when live streaming is on
  useEffect(() => {
    let isMounted = true;

    // Fetch initial batch
    const fetchThreats = async () => {
      try {
        const res = await fetch('/api/horizon/threats?count=6');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.threats) {
            setDynamicThreats(data.threats);
            if (data.threats.length > 0) {
              const top = data.threats[0];
              setSelectedNode({
                id: top.id,
                ip: top.srcIp,
                label: `${top.threatType} (${top.srcLocation.city})`,
                location: `${top.srcLocation.city}, ${top.srcLocation.country} [${top.srcLocation.asn}]`,
                lat: top.srcLocation.lat,
                lon: top.srcLocation.lon,
                role: top.threatType === 'C2_BEACON' ? 'c2' : 'attacker',
                riskScore: top.riskScore,
                threatType: top.threatType,
                packetRate: top.packetRateKpps * 1000,
                bandwidthGbps: top.bandwidthGbps,
                country: top.srcLocation.country,
                city: top.srcLocation.city,
                asn: top.srcLocation.asn,
                mlConfidence: top.mlConfidence,
              });
            }
          }
        }
      } catch {
        // Fallback local dynamic synthesis
        if (isMounted) {
          const localEvents = [
            generateDynamicHorizonThreat(),
            generateDynamicHorizonThreat(),
            generateDynamicHorizonThreat(),
            generateDynamicHorizonThreat(),
          ];
          setDynamicThreats(localEvents);
        }
      }
    };

    fetchThreats();

    // Set streaming interval (every 4 seconds)
    const interval = setInterval(() => {
      if (!liveStreamActive) return;
      // Add a fresh dynamic threat to the front
      const freshThreat = generateDynamicHorizonThreat();
      setDynamicThreats((prev) => [freshThreat, ...prev.slice(0, 7)]);
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [liveStreamActive]);

  // Combine static target enclave, live Horizon threats, and incoming threatStream into active nodes
  const threatNodes: ThreatNode[] = useMemo(() => {
    const nodes: ThreatNode[] = [DEFAULT_TARGET_NODE];

    // Add dynamic NetScout Horizon threats
    dynamicThreats.forEach((threat) => {
      nodes.push({
        id: threat.id,
        ip: threat.srcIp,
        label: `${threat.threatType} · ${threat.srcLocation.city}`,
        location: `${threat.srcLocation.city}, ${threat.srcLocation.country} (${threat.srcLocation.asn})`,
        lat: threat.srcLocation.lat,
        lon: threat.srcLocation.lon,
        role: threat.threatType === 'C2_BEACON' ? 'c2' : 'attacker',
        riskScore: threat.riskScore,
        threatType: threat.threatType,
        packetRate: threat.packetRateKpps * 1000,
        bandwidthGbps: threat.bandwidthGbps,
        country: threat.srcLocation.country,
        city: threat.srcLocation.city,
        asn: threat.srcLocation.asn,
        mlConfidence: threat.mlConfidence,
      });
    });

    // Add incoming threatStream / activeScenario nodes if any exist
    if (threatStream.length > 0) {
      threatStream.slice(0, 3).forEach((t) => {
        if (t.srcIp && !nodes.some((n) => n.ip === t.srcIp)) {
          const pred = predictLocationFromIp(t.srcIp);
          nodes.push({
            id: `stream-${t.id}`,
            ip: t.srcIp,
            label: `${t.threatType || 'ACTIVE_THREAT'} (${pred.city})`,
            location: `${pred.city}, ${pred.country} [${pred.asn}]`,
            lat: pred.lat,
            lon: pred.lon,
            role: t.threatType === 'C2_BEACON' ? 'c2' : 'attacker',
            riskScore: 92.5,
            threatType: t.threatType,
            packetRate: 5400,
            bandwidthGbps: 14.8,
            country: pred.country,
            city: pred.city,
            asn: pred.asn,
            mlConfidence: 97.4,
          });
        }
      });
    }

    return nodes;
  }, [dynamicThreats, threatStream]);

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 14);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0f1c30, 2.0);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xd4e7ff, 2.5);
    sunLight.position.set(20, 10, 15);
    scene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x2288ff, 3.5);
    blueRimLight.position.set(-15, 8, -12);
    scene.add(blueRimLight);

    // Earth Sphere
    const globeRadius = 4.8;
    const earthGeometry = new THREE.SphereGeometry(globeRadius, 48, 48);
    const earthTexture = createProceduralEarthTextures();

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.60,
      metalness: 0.25,
      emissive: new THREE.Color(0x051325),
      emissiveIntensity: 0.65,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    // Atmosphere Glow
    const atmosphereGeom = new THREE.SphereGeometry(globeRadius * 1.15, 32, 32);
    const atmosphereMat = new THREE.ShaderMaterial({
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
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0) * intensity * 0.9;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeom, atmosphereMat);
    scene.add(atmosphereMesh);

    // Orbital Rings
    const orbitalGroup = new THREE.Group();
    [
      { radius: globeRadius * 1.35, rotX: 0.35, rotZ: 0.25, color: 0x3b9eff },
      { radius: globeRadius * 1.50, rotX: -0.60, rotZ: 0.50, color: 0x4ade80 },
      { radius: globeRadius * 1.25, rotX: 0.85, rotZ: -0.40, color: 0xf59e0b },
    ].forEach(({ radius, rotX, rotZ, color }) => {
      const ringGeom = new THREE.BufferGeometry();
      const segments = 96;
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      ringGeom.setFromPoints(pts);
      const ringMat = new THREE.LineDashedMaterial({
        color,
        dashSize: 0.4,
        gapSize: 0.2,
        transparent: true,
        opacity: 0.25,
      });
      const ringMesh = new THREE.Line(ringGeom, ringMat);
      ringMesh.computeLineDistances();
      ringMesh.rotation.x = rotX;
      ringMesh.rotation.z = rotZ;
      orbitalGroup.add(ringMesh);
    });
    scene.add(orbitalGroup);

    // 3D Threat Pins & Pulsing Shockwaves
    const pinGroup = new THREE.Group();
    const shockwaveMeshes: { mesh: THREE.Mesh; scale: number; maxScale: number }[] = [];

    threatNodes.forEach((node) => {
      const pos = latLonToVector3(node.lat, node.lon, globeRadius * 1.01);
      const isTarget = node.role === 'target';
      const isAttacker = node.role === 'attacker';
      const nodeColor = isTarget
        ? 0x38bdf8
        : isAttacker
        ? 0xef4444
        : node.role === 'c2'
        ? 0xa855f7
        : 0xf59e0b;

      // Pin Head
      const headGeom = new THREE.SphereGeometry(isTarget ? 0.20 : 0.15, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({ color: nodeColor });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.copy(pos);
      pinGroup.add(head);

      // Pin Stem
      const normal = pos.clone().normalize();
      const stemGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: nodeColor, transparent: true, opacity: 0.85 });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.17)));
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      pinGroup.add(stem);

      // Expanding Radar Shockwave
      const ringGeom = new THREE.RingGeometry(0.1, 0.18, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const shockwave = new THREE.Mesh(ringGeom, ringMat);
      shockwave.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.02)));
      shockwave.lookAt(pos.clone().add(normal));
      pinGroup.add(shockwave);

      shockwaveMeshes.push({ mesh: shockwave, scale: 1, maxScale: isTarget ? 4.5 : 3.2 });
    });
    earthMesh.add(pinGroup);

    // Ballistic Attack Trajectory Arcs with Laser Particles
    const arcGroup = new THREE.Group();
    const targetNode = threatNodes.find((n) => n.role === 'target') || DEFAULT_TARGET_NODE;
    const targetVec = latLonToVector3(targetNode.lat, targetNode.lon, globeRadius);

    interface AttackArcData {
      curve: THREE.QuadraticBezierCurve3;
      pulseMeshes: THREE.Mesh[];
      color: number;
    }
    const attackArcs: AttackArcData[] = [];

    threatNodes
      .filter((n) => n.role !== 'target')
      .forEach((srcNode) => {
        const srcVec = latLonToVector3(srcNode.lat, srcNode.lon, globeRadius);
        const midPoint = srcVec.clone().add(targetVec).multiplyScalar(0.5);
        const distance = srcVec.distanceTo(targetVec);
        const altitude = globeRadius * (1.18 + distance * 0.09);
        midPoint.normalize().multiplyScalar(altitude);

        const curve = new THREE.QuadraticBezierCurve3(srcVec, midPoint, targetVec);
        const points = curve.getPoints(64);
        const arcGeom = new THREE.BufferGeometry().setFromPoints(points);

        const arcColor =
          srcNode.role === 'attacker'
            ? 0xef4444
            : srcNode.role === 'c2'
            ? 0xa855f7
            : 0xf59e0b;

        const arcMat = new THREE.LineBasicMaterial({
          color: arcColor,
          transparent: true,
          opacity: 0.70,
        });
        const arcLine = new THREE.Line(arcGeom, arcMat);
        arcGroup.add(arcLine);

        // Traveling pulse photon laser heads
        const pulseCount = 2;
        const pulseMeshes: THREE.Mesh[] = [];
        for (let p = 0; p < pulseCount; p++) {
          const pulseGeom = new THREE.SphereGeometry(0.12, 12, 12);
          const pulseMat = new THREE.MeshBasicMaterial({
            color: arcColor,
            transparent: true,
            opacity: 0.95,
          });
          const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
          arcGroup.add(pulseMesh);
          pulseMeshes.push(pulseMesh);
        }

        attackArcs.push({ curve, pulseMeshes, color: arcColor });
      });
    earthMesh.add(arcGroup);

    // Interactive Drag Orbit Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const rotationVelocity = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      rotationVelocity.y = deltaX * 0.005;
      rotationVelocity.x = deltaY * 0.005;
      earthMesh.rotation.y += rotationVelocity.y;
      earthMesh.rotation.x += rotationVelocity.x;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous auto-rotation when not dragging
      if (autoRotate && !isDragging) {
        earthMesh.rotation.y += 0.0022;
      }
      orbitalGroup.rotation.y -= 0.0010;

      // Animate shockwaves
      shockwaveMeshes.forEach((item) => {
        item.scale += 0.035;
        if (item.scale > item.maxScale) {
          item.scale = 1.0;
        }
        item.mesh.scale.set(item.scale, item.scale, item.scale);
        const mat = item.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.9 - (item.scale / item.maxScale) * 0.9);
      });

      // Animate traveling attack pulses along arcs
      attackArcs.forEach(({ curve, pulseMeshes }, arcIdx) => {
        pulseMeshes.forEach((pulse, pIdx) => {
          const t = (elapsedTime * 0.50 + pIdx * 0.5 + arcIdx * 0.20) % 1.0;
          const pos = curve.getPoint(t);
          pulse.position.copy(pos);
          pulse.scale.setScalar(0.9 + Math.sin(t * Math.PI) * 0.7);
        });
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [threatNodes, autoRotate]);

  return (
    <div className={`relative rounded-2xl overflow-hidden glass border border-white/10 ${className || 'h-[640px]'}`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {!compact && (
        <>
          {/* Top-Left NetScout Horizon Telemetry Header */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={18} className="text-cyan-400 animate-pulse" />
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-cyan-300 uppercase">
                NETSCOUT CYBER THREAT HORIZON
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                DYNAMIC GEOLOCATION
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-widest text-white uppercase font-sans">
              GLOBAL ATTACK TRAJECTORY MAP
            </h2>
            <div className="text-xs text-white/50 font-mono flex items-center gap-3 mt-1">
              <span>TARGET ENCLAVE: 28.61° N · 77.20° E (NEW DELHI)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Shield size={12} />
                HARDWARE DIODE ISOLATED
              </span>
            </div>
          </div>

          {/* Sci-Fi Corner Brackets */}
          <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-cyan-400/40 pointer-events-none" />
          <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-cyan-400/40 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-cyan-400/40 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-cyan-400/40 pointer-events-none" />

          {/* Stream Telemetry Left Card */}
          <div className="absolute top-24 left-4 z-10 max-w-[280px] p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 space-y-3 font-mono">
            <div className="flex items-center justify-between text-[10px] text-white/50 pb-2 border-b border-white/10">
              <span className="font-bold text-white tracking-widest flex items-center gap-1.5">
                <Radio size={12} className="text-red-400 animate-pulse" /> LIVE STREAM
              </span>
              <button
                onClick={() => setLiveStreamActive((prev) => !prev)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                  liveStreamActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {liveStreamActive ? 'STREAMING' : 'PAUSED'}
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="text-[10px] text-white/40 uppercase">ACTIVE CONCURRENT CONDUITS</div>
              <div className="text-xl font-black text-red-400 flex items-center gap-2">
                <span>{threatNodes.length - 1} ATTACK ORIGINS</span>
              </div>
              <p className="text-[11px] text-white/60 font-sans leading-relaxed">
                Autonomous ML model predicts attack vector & resolves geographic origin from telemetry features.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[10px]">
              <div>
                <span className="text-white/40 block">BALLISTIC ARCS</span>
                <span className="text-cyan-300 font-bold text-sm">{threatNodes.length - 1} Lasers</span>
              </div>
              <div>
                <span className="text-white/40 block">AVG ML CONFIDENCE</span>
                <span className="text-emerald-400 font-bold text-sm">96.8%</span>
              </div>
            </div>
          </div>

          {/* Attack Origin Country / City Feed (Right Side) */}
          <div className="absolute top-4 right-4 z-10 w-80 max-h-[520px] overflow-y-auto space-y-2 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-white/70 px-1 pb-1 border-b border-white/10">
              <span className="flex items-center gap-1.5 text-red-400">
                <Crosshair size={13} /> PREDICTED ATTACK ORIGINS
              </span>
              <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                <Zap size={11} /> {dynamicThreats.length} ACTIVE
              </span>
            </div>

            {threatNodes
              .filter((n) => n.role !== 'target')
              .map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isCritical = node.riskScore >= 80;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white font-mono text-xs flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCritical ? 'bg-red-400 animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                        {node.city || node.ip}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          isCritical
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        Risk {Math.round(node.riskScore)}
                      </span>
                    </div>

                    <div className="text-[11px] text-white/70 font-sans truncate">
                      {node.country} · {node.asn || 'AS-TRANSIT'}
                    </div>

                    <div className="text-[10px] text-white/40 mt-1 flex justify-between items-center">
                      <span className="text-cyan-400 font-bold">{node.threatType || 'DDOS'}</span>
                      <span>
                        {node.bandwidthGbps ? `${node.bandwidthGbps} Gbps` : `${Math.round((node.packetRate || 0) / 1000)} kpps`}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Bottom Selected Node Inspection HUD */}
          {selectedNode && (
            <div className="absolute bottom-4 left-4 right-4 z-10 p-3.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Compass size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">
                      {selectedNode.city ? `${selectedNode.city}, ${selectedNode.country}` : selectedNode.ip}
                    </span>
                    <span className="text-cyan-400 font-bold text-[11px]">[{selectedNode.ip}]</span>
                  </div>
                  <div className="text-white/60 text-[11px] mt-0.5 flex items-center gap-2">
                    <span>Carrier: {selectedNode.asn || selectedNode.location}</span>
                    <span>·</span>
                    <span className="text-emerald-400">Targeting: Protected DC (10.0.0.10)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 flex-wrap">
                <div className="text-right">
                  <span className="text-white/40 text-[10px] block">PREDICTED LOCATION</span>
                  <span className="text-white font-bold">
                    {selectedNode.lat.toFixed(2)}°, {selectedNode.lon.toFixed(2)}°
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-white/40 text-[10px] block">ML CONFIDENCE</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {selectedNode.mlConfidence ? `${selectedNode.mlConfidence}%` : '96.2%'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-white/40 text-[10px] block">BANDWIDTH / RATE</span>
                  <span className="text-cyan-300 font-bold text-sm">
                    {selectedNode.bandwidthGbps ? `${selectedNode.bandwidthGbps} Gbps` : '12.4 Gbps'}
                  </span>
                </div>
                <button
                  onClick={() => setAutoRotate((prev) => !prev)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-sans text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RotateCw size={13} className={autoRotate ? 'animate-spin' : ''} />
                  {autoRotate ? 'Orbiting' : 'Paused'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
