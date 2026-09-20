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
  /** 0 -> 1 scroll progress for perspective camera zoom */
  scrollProgress?: number;
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

  // Seamless studio dark ocean background
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
  oceanGradient.addColorStop(0, '#06060a');
  oceanGradient.addColorStop(0.5, '#0a0a14');
  oceanGradient.addColorStop(1, '#06060a');
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle bathymetry grid lines
  ctx.strokeStyle = 'rgba(245, 239, 255, 0.04)';
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

  // Procedural continental landmasses with refined studio lavender/cyan edges
  ctx.fillStyle = 'rgba(18, 17, 29, 0.96)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
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
  ctx.fillStyle = '#f5efff';
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
    ctx.arc(px, py, 2.0, 0, Math.PI * 2);
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
  scrollProgress,
}: CyberGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const autoRotateRef = useRef<boolean>(true);
  const [liveStreamActive, setLiveStreamActive] = useState<boolean>(true);

  const scrollProgressRef = useRef<number>(scrollProgress ?? 0);
  useEffect(() => {
    scrollProgressRef.current = scrollProgress ?? 0;
  }, [scrollProgress]);

  // Live user location detection (IP + Browser Geolocation)
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
    city: string;
    country: string;
    isDetected: boolean;
  }>({
    lat: 28.6139,
    lon: 77.2090,
    city: 'Detecting Location...',
    country: 'Sovereign Enclave',
    isDetected: false,
  });

  const lastRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const focusingUserRef = useRef<boolean>(true);
  const targetRotationRef = useRef<{ x: number; y: number }>({
    x: 0.17,
    y: -((77.2090 + 90) * Math.PI) / 180,
  });

  // Automatically detect user's live physical location
  useEffect(() => {
    let active = true;

    const setLocation = (lat: number, lon: number, city: string, country: string) => {
      if (!active) return;
      setUserLocation({
        lat,
        lon,
        city,
        country,
        isDetected: true,
      });
      const targetY = -((lon + 90) * Math.PI) / 180;
      const targetX = Math.max(-0.35, Math.min(0.35, (lat * Math.PI) / 180 * 0.35));
      targetRotationRef.current = { x: targetX, y: targetY };
      focusingUserRef.current = true;
    };

    // 1. Rapid IP Geolocation (instant, no user prompt required)
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          setLocation(data.latitude, data.longitude, data.city || 'Local Area', data.country_name || 'Enclave');
        }
      })
      .catch(() => {
        // Fallback silently if offline or blocked
      });

    // 2. High precision browser Geolocation API
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!active) return;
          setLocation(
            pos.coords.latitude,
            pos.coords.longitude,
            'Live Client Node',
            'Sovereign Enclave'
          );
        },
        () => {
          // IP fallback remains active if geolocation prompt is ignored/declined
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    }

    return () => {
      active = false;
    };
  }, []);

  const hoverToUserLocation = useCallback(() => {
    const targetY = -((userLocation.lon + 90) * Math.PI) / 180;
    const targetX = Math.max(-0.35, Math.min(0.35, (userLocation.lat * Math.PI) / 180 * 0.35));
    targetRotationRef.current = { x: targetX, y: targetY };
    focusingUserRef.current = true;
  }, [userLocation.lat, userLocation.lon]);

  const [dynamicThreats, setDynamicThreats] = useState<DynamicThreatEvent[]>(() => [
    generateDynamicHorizonThreat(),
    generateDynamicHorizonThreat(),
    generateDynamicHorizonThreat(),
    generateDynamicHorizonThreat(),
  ]);
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

  // Combine user's live enclave target, live Horizon threats, and incoming threatStream into active nodes
  const threatNodes: ThreatNode[] = useMemo(() => {
    const userTargetNode: ThreatNode = {
      id: 'node-target-enclave',
      ip: '127.0.0.1 (YOU)',
      label: `PRIMARY DEFENSE ENCLAVE (${userLocation.city})`,
      location: `${userLocation.city}, ${userLocation.country}`,
      lat: userLocation.lat,
      lon: userLocation.lon,
      role: 'target',
      riskScore: 8.0,
      threatType: 'SOVEREIGN ENCLAVE',
      packetRate: 1450,
      bandwidthGbps: 1.2,
      country: userLocation.country,
      city: userLocation.city,
      asn: 'AS-OPTICAL-DIODE',
      mlConfidence: 100,
    };

    const nodes: ThreatNode[] = [userTargetNode];

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
  }, [userLocation, dynamicThreats, threatStream]);

  // Only create the 3D scene ONCE when threats first arrive (avoids re-creating every 4s)
  const hasAttackers = threatNodes.length > 1;

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    if (!hasAttackers) return; // Wait for initial threat data

    const container = containerRef.current;
    if (!container) return;

    const getW = () => container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
    const getH = () => container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 800);

    const width = getW();
    const height = getH();

    // Scene & Camera - Centered at Y = 0 (Starts small at z=18.5 in dead center of free space)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18.5);

    // WebGL Renderer with full transparent background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setClearColor(0x000000, 0);

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const domElem = renderer.domElement;

    // Lighting — matching olivierlarose/3d-earth-scroll
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
    sunLight.position.set(16, 2, -4);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-14, 6, -10);
    scene.add(rimLight);

    // 3D Earth Sphere — olivierlarose/3d-earth-scroll textures
    const globeRadius = 4.8;
    const earthGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);

    const textureLoader = new THREE.TextureLoader();
    const colorMap = textureLoader.load('/assets/color.jpg');
    colorMap.colorSpace = THREE.SRGBColorSpace;
    const normalMap = textureLoader.load('/assets/normal.png');
    const aoMap = textureLoader.load('/assets/occlusion.jpg');

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap,
      aoMap: aoMap,
      roughness: 0.75,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    // Smooth orientation continuation
    earthMesh.rotation.y = lastRotationRef.current.y || targetRotationRef.current.y;
    earthMesh.rotation.x = lastRotationRef.current.x || targetRotationRef.current.x;
    scene.add(earthMesh);

    // Atmosphere Glow
    const atmosphereGeom = new THREE.SphereGeometry(globeRadius * 1.15, 24, 24);
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

    // Orbital Rings — Elegant celestial cyan & soft indigo
    const orbitalGroup = new THREE.Group();
    [
      { radius: globeRadius * 1.35, rotX: 0.35, rotZ: 0.25, color: 0x38bdf8 },
      { radius: globeRadius * 1.50, rotX: -0.60, rotZ: 0.50, color: 0x818cf8 },
      { radius: globeRadius * 1.25, rotX: 0.85, rotZ: -0.40, color: 0x0ea5e9 },
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
      const headGeom = new THREE.SphereGeometry(isTarget ? 0.22 : 0.15, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({ color: nodeColor });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.copy(pos);
      pinGroup.add(head);

      // Pin Stem
      const normal = pos.clone().normalize();
      const stemHeight = isTarget ? 0.80 : 0.45;
      const stemEnd = pos.clone().add(normal.clone().multiplyScalar(stemHeight));
      const stemGeom = new THREE.BufferGeometry().setFromPoints([pos, stemEnd]);
      const stemMat = new THREE.LineBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: isTarget ? 0.90 : 0.65,
      });
      const stem = new THREE.Line(stemGeom, stemMat);
      pinGroup.add(stem);

      // Pin Top Beacon
      const tipGeom = new THREE.SphereGeometry(isTarget ? 0.09 : 0.05, 12, 12);
      const tipMat = new THREE.MeshBasicMaterial({ color: isTarget ? 0xe0f2fe : nodeColor });
      const tip = new THREE.Mesh(tipGeom, tipMat);
      tip.position.copy(stemEnd);
      pinGroup.add(tip);

      // Expanding concentric surface radar shockwaves
      const waveCount = isTarget ? 2 : 1;
      for (let w = 0; w < waveCount; w++) {
        const shockwaveGeom = new THREE.RingGeometry(0.18, 0.36, 32);
        const shockwaveMat = new THREE.MeshBasicMaterial({
          color: nodeColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isTarget ? 0.55 : 0.75,
        });
        const shockwave = new THREE.Mesh(shockwaveGeom, shockwaveMat);
        shockwave.position.copy(pos.clone().multiplyScalar(1.004));
        shockwave.lookAt(pos.clone().multiplyScalar(2));
        pinGroup.add(shockwave);

        shockwaveMeshes.push({
          mesh: shockwave,
          scale: 1.0 + w * 1.5,
          maxScale: isTarget ? 4.2 : 3.0,
        });
      }
    });
    earthMesh.add(pinGroup);

    // Ballistic Attack Trajectory Arcs with Laser Particles
    const arcGroup = new THREE.Group();
    const targetNode = threatNodes.find((n) => n.role === 'target') || threatNodes[0];
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
        const points = curve.getPoints(48);
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
      focusingUserRef.current = false;
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

    // Scroll rotation & wheel zoom (olivierlarose/3d-earth-scroll behavior)
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let scrollDelta = 0;
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      scrollDelta = (currentScrollY - lastScrollY) * 0.0025;
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(9, Math.min(26, camera.position.z + e.deltaY * 0.012));
    };

    domElem.addEventListener('pointerdown', onPointerDown);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Helper for shortest rotational path interpolation
    const shortestAngleDiff = (target: number, current: number): number => {
      const twoPi = Math.PI * 2;
      let diff = (target - current) % twoPi;
      if (diff < -Math.PI) diff += twoPi;
      if (diff > Math.PI) diff -= twoPi;
      return diff;
    };

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();
    let currentScrollRotation = (scrollProgressRef.current ?? 0) * (Math.PI * 4.0);
    let targetScrollRotation = currentScrollRotation;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Dynamic scroll-driven rotation: rotates smoothly around its axis across 4-5 pages
      if (scrollProgressRef.current !== undefined) {
        const p = Math.min(1, Math.max(0, scrollProgressRef.current));
        targetScrollRotation = p * (Math.PI * 4.0);
      }
      const scrollRotDelta = (targetScrollRotation - currentScrollRotation) * 0.12;
      currentScrollRotation += scrollRotDelta;

      if (Math.abs(scrollRotDelta) > 0.0001) {
        // Rotate earth directly in sync with scroll animation
        focusingUserRef.current = false;
        earthMesh.rotation.y += scrollRotDelta;
      } else if (!isDragging) {
        // Smooth hover towards user's live physical location when idle
        if (focusingUserRef.current) {
          const diffY = shortestAngleDiff(targetRotationRef.current.y, earthMesh.rotation.y);
          const diffX = targetRotationRef.current.x - earthMesh.rotation.x;
          earthMesh.rotation.y += diffY * 0.045;
          earthMesh.rotation.x += diffX * 0.045;

          if (Math.abs(diffY) < 0.002 && Math.abs(diffX) < 0.002) {
            focusingUserRef.current = false;
          }
        } else if (autoRotateRef.current) {
          earthMesh.rotation.y += 0.0016;
        }
      }

      // Responsive Continuous Zoom: Earth expands with EACH scroll from small (z=18.0) to full max zoom (z=4.85)
      if (scrollProgressRef.current !== undefined) {
        const p = Math.min(1, Math.max(0, scrollProgressRef.current));
        // Direct continuous zoom without plateaus — expands visibly with each scroll
        const targetZ = 18.0 - Math.pow(p, 0.90) * 13.15; // 18.0 -> 4.85
        camera.position.z += (targetZ - camera.position.z) * 0.14;

        // Subtle dynamic 3D latitude tilt during scroll
        const targetTiltX = 0.16 + Math.sin(p * Math.PI) * 0.12;
        earthMesh.rotation.x += (targetTiltX - earthMesh.rotation.x) * 0.06;
      }

      // Remember rotation state
      lastRotationRef.current.y = earthMesh.rotation.y;
      lastRotationRef.current.x = earthMesh.rotation.x;

      orbitalGroup.rotation.y += scrollRotDelta * 0.4 - 0.0010;

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
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', onScroll);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (container && domElem && container.contains(domElem)) {
        container.removeChild(domElem);
      }
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation.lat, userLocation.lon, hasAttackers]);

  return (
    <div className={`relative overflow-hidden bg-transparent ${className || 'h-[640px]'}`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {!compact && (
        <>
          {/* Top-Left NetScout Horizon Telemetry Header - Minimal, Clean */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={14} className="text-[#f5efff]/70 animate-pulse" />
              <span className="font-mono text-[9px] font-medium tracking-[0.2em] text-[#f5efff]/60 uppercase">
                NETSCOUT THREAT HORIZON
              </span>
              <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-editorial font-light tracking-wide text-[#f5efff] uppercase">
              GLOBAL ATTACK TRAJECTORY
            </h2>
            <div className="text-[10px] text-[#f5efff]/45 font-mono flex items-center gap-2 mt-0.5">
              <span>ENCLAVE: 28.61° N · 77.20° E</span>
              <span>·</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Shield size={10} />
                OPTICAL DIODE ISOLATED
              </span>
            </div>
          </div>

          {/* Floating Controls & Stream Status (Top Left underneath header) */}
          <div className="absolute top-20 left-4 z-10 flex items-center gap-2">
            <button
              onClick={() => setLiveStreamActive((prev) => !prev)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border backdrop-blur-md transition-colors flex items-center gap-1.5 ${
                liveStreamActive
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/20'
              }`}
            >
              <Radio size={10} className={liveStreamActive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'} />
              <span>{liveStreamActive ? `${threatNodes.length - 1} Attacks Streaming` : 'Stream Paused'}</span>
            </button>
            <button
              onClick={() => setAutoRotate((prev) => { const next = !prev; autoRotateRef.current = next; return next; })}
              className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border border-[#f5efff]/10 bg-[#0c0b16]/70 backdrop-blur-md text-[#f5efff]/70 hover:text-[#f5efff] hover:bg-[#0c0b16]/90 transition-colors flex items-center gap-1.5"
            >
              <RotateCw size={10} className={autoRotate ? 'animate-spin' : ''} />
              <span>{autoRotate ? 'Rotating' : 'Static'}</span>
            </button>
          </div>

          {/* Attack Origin Country / City Feed (Right Side) */}
          <div className="absolute top-4 right-4 z-10 w-64 max-h-[420px] overflow-y-auto space-y-1.5 p-2.5 rounded-xl bg-[#0c0b16]/80 backdrop-blur-xl border border-[#f5efff]/[0.06] font-mono text-xs shadow-2xl no-scrollbar">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#f5efff]/70 px-1 pb-2 border-b border-[#f5efff]/[0.08]">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Crosshair size={13} /> PREDICTED ATTACK ORIGINS
              </span>
              <span className="text-[10px] text-[#f5efff]/50 px-2 py-0.5 rounded-full bg-[#f5efff]/5 border border-[#f5efff]/10 flex items-center gap-1">
                <Zap size={10} className="text-emerald-400" /> {dynamicThreats.length} ACTIVE
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
                    className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#f5efff]/10 border-[#f5efff]/30 shadow-[0_0_20px_rgba(245,239,255,0.08)]'
                        : 'bg-[#f5efff]/[0.02] border-[#f5efff]/[0.06] hover:bg-[#f5efff]/[0.06] hover:border-[#f5efff]/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#f5efff] font-mono text-xs flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCritical ? 'bg-rose-400 animate-pulse shadow-[0_0_6px_#f43f5e]' : 'bg-amber-400'
                          }`}
                        />
                        {node.city || node.ip}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                        }`}
                      >
                        Risk {Math.round(node.riskScore)}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#f5efff]/60 font-sans truncate">
                      {node.country} · {node.asn || 'AS-TRANSIT'}
                    </div>

                    <div className="text-[10px] text-[#f5efff]/40 mt-1 flex justify-between items-center font-mono">
                      <span className="text-[#f5efff]/80 font-medium">{node.threatType || 'DDOS'}</span>
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
            <div className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-xl bg-[#0c0b16]/85 backdrop-blur-xl border border-[#f5efff]/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#f5efff]/5 border border-[#f5efff]/10 text-[#f5efff]/80">
                  <Compass size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#f5efff] font-editorial text-lg sm:text-xl font-light">
                      {selectedNode.city ? `${selectedNode.city}, ${selectedNode.country}` : selectedNode.ip}
                    </span>
                    <span className="text-[#f5efff]/60 font-mono text-[11px]">[{selectedNode.ip}]</span>
                  </div>
                  <div className="text-[#f5efff]/50 text-[11px] mt-0.5 flex items-center gap-2 font-mono">
                    <span>Carrier: {selectedNode.asn || selectedNode.location}</span>
                    <span>·</span>
                    <span className="text-emerald-400">Targeting: Protected Enclave (10.0.0.10)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-right">
                  <span className="text-[#f5efff]/40 text-[10px] block uppercase tracking-wider">PREDICTED LOCATION</span>
                  <span className="text-[#f5efff] font-mono font-medium">
                    {selectedNode.lat.toFixed(2)}°, {selectedNode.lon.toFixed(2)}°
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#f5efff]/40 text-[10px] block uppercase tracking-wider">ML CONFIDENCE</span>
                  <span className="text-emerald-400 font-editorial text-lg">
                    {selectedNode.mlConfidence ? `${selectedNode.mlConfidence}%` : '96.2%'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#f5efff]/40 text-[10px] block uppercase tracking-wider">BANDWIDTH / RATE</span>
                  <span className="text-[#f5efff] font-editorial text-lg">
                    {selectedNode.bandwidthGbps ? `${selectedNode.bandwidthGbps} Gbps` : '12.4 Gbps'}
                  </span>
                </div>
                <button
                  onClick={() => setAutoRotate((prev) => { const next = !prev; autoRotateRef.current = next; return next; })}
                  className="px-3.5 py-1.5 rounded-full border border-[#f5efff]/15 bg-[#f5efff]/5 hover:bg-[#f5efff]/10 text-[#f5efff] text-xs font-mono flex items-center gap-2 transition-all duration-300"
                >
                  <RotateCw size={12} className={autoRotate ? 'animate-spin' : ''} />
                  <span>{autoRotate ? 'Orbiting' : 'Paused'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Floating Live User Enclave Telemetry — Only in full dashboard view */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3 py-1.5 font-mono text-[11px] text-[#f5efff]/75 pointer-events-auto select-none">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="truncate max-w-[210px] sm:max-w-none">
              <span className="text-[#f5efff]/40 mr-1.5 uppercase tracking-wider text-[9px]">YOUR DEFENSE NODE:</span>
              <strong className="text-white font-medium">{userLocation.city}, {userLocation.country}</strong>
            </span>
            <span className="text-[#f5efff]/20">·</span>
            <button
              onClick={hoverToUserLocation}
              className="text-cyan-400 hover:text-cyan-300 font-medium tracking-wide flex items-center gap-1 transition-colors cursor-pointer text-[10px] uppercase hover:underline"
              title="Center globe on your physical location"
            >
              <Crosshair size={11} className="text-cyan-400" />
              <span>Orient to Me</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
