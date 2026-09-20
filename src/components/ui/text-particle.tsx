"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;
}

export type TextLineItem = string | { text: string; italic?: boolean; underline?: boolean; color?: string };

export interface TextParticleAnimationProps {
  text?: string;
  lines?: TextLineItem[];
  textAlign?: "left" | "center" | "right";
  lineHeightMultiplier?: number;
  fontSize?: number;
  fontFamily?: string;
  particleSize?: number;
  particleColor?: string;
  particleDensity?: number;
  backgroundColor?: string;
  className?: string;
}

export function TextParticle({
  text = "",
  lines,
  textAlign = "center",
  lineHeightMultiplier = 1.05,
  fontSize = 110,
  fontFamily = '"Cormorant Garamond", Georgia, serif',
  particleSize = 2.4,
  particleColor = "#f5efff",
  particleDensity = 3,
  backgroundColor = "transparent",
  className = "",
}: TextParticleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const animationRef = useRef<number | null>(null);

  // Parse lines
  const parsedLines: { text: string; italic?: boolean; underline?: boolean; color?: string }[] = lines
    ? lines.map((item) => (typeof item === "string" ? { text: item } : item))
    : text.includes("\n")
    ? text.split("\n").map((t) => ({ text: t }))
    : [{ text }];

  // Initialize canvas and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const handleResize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0 || h === 0) return;

      canvas.width = w;
      canvas.height = h;
      initText();
    };

    const initText = () => {
      if (!ctx || canvas.width === 0 || canvas.height === 0) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Auto-scale font size if viewport width is narrow
      const maxLineLen = Math.max(...parsedLines.map((l) => l.text.length), 1);
      const availWidth = textAlign === "left" ? canvas.width * 0.98 : canvas.width * 0.92;
      const autoFontSize = Math.min(
        fontSize,
        Math.max(28, availWidth / (maxLineLen * 0.58))
      );

      ctx.textBaseline = "middle";
      ctx.textAlign = textAlign;

      const lineHeight = autoFontSize * lineHeightMultiplier;
      const totalTextH = (parsedLines.length - 1) * lineHeight;
      const startY = (canvas.height - totalTextH) / 2;
      const x = textAlign === "left" ? 4 : textAlign === "right" ? canvas.width - 4 : canvas.width / 2;

      parsedLines.forEach((lineItem, i) => {
        const isItalic = Boolean(lineItem.italic);
        ctx.font = `${isItalic ? "italic " : ""}300 ${autoFontSize}px ${fontFamily}`;
        ctx.fillStyle = "black";
        ctx.fillText(lineItem.text, x, startY + i * lineHeight);

        if (lineItem.underline) {
          const metrics = ctx.measureText(lineItem.text);
          const textW = metrics.width;
          const lineY = startY + i * lineHeight + autoFontSize * 0.44;
          const startX = textAlign === "left" ? x : textAlign === "right" ? x - textW : x - textW / 2;
          ctx.beginPath();
          ctx.lineWidth = Math.max(3, autoFontSize * 0.035);
          ctx.strokeStyle = "black";
          ctx.moveTo(startX, lineY);
          ctx.lineTo(startX + textW, lineY);
          ctx.stroke();
        }
      });

      const textCoordinates = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
      const newParticles: Particle[] = [];

      for (let py = 0; py < textCoordinates.height; py += particleDensity) {
        for (let px = 0; px < textCoordinates.width; px += particleDensity) {
          const index = (py * textCoordinates.width + px) * 4;
          const alpha = textCoordinates.data[index + 3];

          if (alpha > 128) {
            newParticles.push({
              x: px,
              y: py,
              size: particleSize,
              baseX: px,
              baseY: py,
              density: Math.random() * 30 + 1,
              color: particleColor,
            });
          }
        }
      }

      setParticles(newParticles);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    text,
    JSON.stringify(parsedLines),
    textAlign,
    lineHeightMultiplier,
    fontSize,
    fontFamily,
    particleSize,
    particleColor,
    particleDensity,
  ]);

  // Animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hasMouse = mx !== null && my !== null;

      ctx.fillStyle = particleColor;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let forceDirectionX = 0;
        let forceDirectionY = 0;

        if (hasMouse) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 8100) {
            const distance = Math.sqrt(distSq);
            forceDirectionX = (dx / distance) * 4;
            forceDirectionY = (dy / distance) * 4;
          }
        }

        const moveX = forceDirectionX + (p.baseX - p.x) * 0.08;
        const moveY = forceDirectionY + (p.baseY - p.y) * 0.08;

        p.x += moveX;
        p.y += moveY;

        ctx.fillRect(
          p.x - p.size * 0.5,
          p.y - p.size * 0.5,
          p.size,
          p.size
        );
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, backgroundColor, particleColor]);

  // Mouse interaction without triggering React component re-renders
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: null, y: null };
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}

export default TextParticle;
