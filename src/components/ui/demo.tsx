import React from "react";
import Image from "next/image";
import { ShieldAlert, Zap, Radio, Activity } from "lucide-react";
import { GradientTracing } from "@/components/ui/gradient-tracing";

const Demo = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-[#09090b] text-[#f5efff] rounded-2xl border border-white/10 shadow-2xl space-y-6">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#2EB9DF]">
        <Zap className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-editorial text-lg font-medium text-white tracking-wide">
          Ballistic Pulse Vector
        </h3>
        <p className="text-xs text-zinc-400 font-mono">
          High-visibility dynamic gradient beam telemetry
        </p>
      </div>
    </div>

    {/* Primary SVG Tracing Path with distinct stroke width */}
    <div className="relative overflow-hidden rounded-xl bg-black/40 border border-white/5 p-4 flex items-center justify-center">
      <GradientTracing
        width={340}
        height={120}
        baseColor="rgba(255, 255, 255, 0.15)"
        gradientColors={["#2EB9DF", "#00d2ff", "#9E00FF"]}
        animationDuration={2.2}
        strokeWidth={3.5}
        path="M10,60 C90,10 250,110 330,60"
      />
    </div>

    {/* Showcase card with Unsplash imagery and telemetry overlay */}
    <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-white/10 group">
      <div className="relative h-36 w-full">
        <Image
          src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
          alt="Cyber Intelligence Network"
          fill
          className="object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
      </div>
      <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-mono text-cyan-400">
        <Activity className="w-3.5 h-3.5 animate-pulse" />
        <span>ACTIVE TELEMETRY</span>
      </div>
      <div className="p-4 relative">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
          <span>VECTOR: INTERCONTINENTAL</span>
          <span className="text-[#9E00FF]">STATUS: INTERCEPTED</span>
        </div>
        <GradientTracing
          width={280}
          height={40}
          baseColor="rgba(255, 255, 255, 0.12)"
          gradientColors={["#2EB9DF", "#2EB9DF", "#9E00FF"]}
          animationDuration={1.8}
          strokeWidth={3}
          path="M0,20 L280,20"
        />
      </div>
    </div>
  </div>
);

export { Demo };
export default Demo;
