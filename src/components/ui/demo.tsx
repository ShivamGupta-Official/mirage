'use client'

import * as React from "react"
import { useState } from "react"
import { Entropy } from "@/components/ui/entropy"
import { LoadingScreen } from "@/components/ui/loading-screen"

export function EntropyDemo() {
  return (
    <div className="flex flex-col items-center justify-center bg-black text-white min-h-screen w-full p-8">
      <div className="flex flex-col items-center">
        <Entropy className="rounded-lg border border-white/10" />
        <div className="mt-6 text-center">
          <div className="space-y-4 font-mono text-[14px] leading-relaxed">
            <p className="italic text-gray-400/80 tracking-wide">
              &ldquo;Order and chaos dance &mdash;
              <span className="opacity-70">digital poetry in motion.&rdquo;</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoadingScreenDemo() {
  const [entered, setEntered] = useState(false)

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {!entered && (
        <LoadingScreen
          projectName="MIRAGE"
          durationMs={5000}
          onEnter={() => setEntered(true)}
        />
      )}
      {entered && (
        <div className="flex items-center justify-center min-h-screen">
          {/* Main site / globe landing page renders here */}
        </div>
      )}
    </div>
  )
}

export { EntropyDemo as default }
