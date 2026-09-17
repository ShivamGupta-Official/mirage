import type { Metadata } from 'next';
import { WovenLightHero } from '@/components/studio/woven-light-hero';

export const metadata: Metadata = {
  title: 'Woven by Light | MIRAGE Interactive Tapestry',
  description: 'An interactive 3D tapestry of light and motion crafted with Three.js and code, emulating the unidirectional optical fiber weave of the MIRAGE security enclave.',
};

export default function WeavePage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <WovenLightHero
        headline="Woven by Light"
        subtitle="An interactive tapestry of light and motion, crafted with code and creativity. Emulating 50,000 high-speed optical photons traversing the unidirectional MIRAGE sensor enclave."
        ctaText="Enter Live SOC Console"
        ctaHref="/dashboard"
        showNav={true}
      />
    </main>
  );
}
