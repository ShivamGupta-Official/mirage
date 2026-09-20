"use client";

import { TextParticle } from "@/components/ui/text-particle";

const settings = {
  text: "Particle",
  particleDensity: 4,
  particleSize: 2,
  particleColor: "#888888",
  fontSize: 180,
};

export default function Demo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <div className="h-screen w-screen">
      <TextParticle
        text={s.text}
        particleDensity={s.particleDensity}
        particleSize={s.particleSize}
        particleColor={s.particleColor}
        fontSize={s.fontSize}
      />
    </div>
  );
}
