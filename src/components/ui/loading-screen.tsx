'use client'
import { useEffect, useRef, useState } from 'react'

interface LoadingScreenProps {
  projectName?: string
  durationMs?: number
  onEnter?: () => void
}

export function LoadingScreen({
  projectName = "MIRAGE",
  durationMs = 5000,
  onEnter,
}: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 })
  const [progress, setProgress] = useState(0)
  const [loadingDone, setLoadingDone] = useState(false)
  const [exiting, setExiting] = useState(false)

  // Full-Screen Highly Active Saturated Vector Lines & Dynamic Particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX
      mousePos.current.y = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Dynamic, energetic vector particle
    class Particle {
      id: number
      x: number
      y: number
      vx: number
      vy: number
      size: number
      baseSize: number
      pulsePhase: number

      constructor(id: number) {
        this.id = id
        this.x = Math.random() * W
        this.y = Math.random() * H
        const speed = 1.4 + Math.random() * 1.8
        const angle = Math.random() * Math.PI * 2
        this.vx = Math.cos(angle) * speed
        this.vy = Math.sin(angle) * speed
        this.baseSize = 1.8 + Math.random() * 1.4
        this.size = this.baseSize
        this.pulsePhase = Math.random() * Math.PI * 2
      }

      update(time: number) {
        // Continuous organic harmonic steering to keep particles swirling actively
        this.vx += Math.sin(time * 0.02 + this.y * 0.006) * 0.12
        this.vy += Math.cos(time * 0.02 + this.x * 0.006) * 0.12

        // Mouse interactive energy & repulsion
        const mDist = Math.hypot(this.x - mousePos.current.x, this.y - mousePos.current.y)
        if (mDist < 160) {
          const force = (1 - mDist / 160) * 4.5
          const angle = Math.atan2(this.y - mousePos.current.y, this.x - mousePos.current.x)
          this.vx += Math.cos(angle + 0.25) * force
          this.vy += Math.sin(angle + 0.25) * force
        }

        // Velocity clamping for energetic, non-stagnant movement
        const currentSpeed = Math.hypot(this.vx, this.vy)
        if (currentSpeed > 3.8) {
          this.vx = (this.vx / currentSpeed) * 3.8
          this.vy = (this.vy / currentSpeed) * 3.8
        } else if (currentSpeed < 1.2) {
          this.vx = (this.vx / (currentSpeed || 1)) * 1.2
          this.vy = (this.vy / (currentSpeed || 1)) * 1.2
        }

        this.x += this.vx
        this.y += this.vy

        // Smooth wrap/bounce boundaries
        if (this.x < 0) {
          this.x = 0
          this.vx *= -1
        } else if (this.x > W) {
          this.x = W
          this.vx *= -1
        }
        if (this.y < 0) {
          this.y = 0
          this.vy *= -1
        } else if (this.y > H) {
          this.y = H
          this.vy *= -1
        }

        // Subtle breathing size
        this.size = this.baseSize + Math.sin(time * 0.06 + this.pulsePhase) * 0.4
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // High density across the entire screen
    const particleCount = Math.min(750, Math.max(340, Math.floor((W * H) / 2800)))
    const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => new Particle(i))

    // High-performance spatial hashing for vector line generation
    const maxLineDist = 115
    const maxLineDistSq = maxLineDist * maxLineDist
    const cellSize = maxLineDist

    let time = 0
    let animationId: number

    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)

      // 1. Bin particles into spatial hash grid
      const grid = new Map<number, Particle[]>()
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.update(time)
        const cx = Math.floor(p.x / cellSize)
        const cy = Math.floor(p.y / cellSize)
        const key = (cx << 16) | (cy & 0xffff)
        let cell = grid.get(key)
        if (!cell) {
          cell = []
          grid.set(key, cell)
        }
        cell.push(p)
      }

      // 2. Draw active vector lines connecting particles
      ctx.lineWidth = 0.8
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.draw(ctx)

        const cx = Math.floor(p.x / cellSize)
        const cy = Math.floor(p.y / cellSize)

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const key = ((cx + dx) << 16) | ((cy + dy) & 0xffff)
            const cell = grid.get(key)
            if (!cell) continue
            for (let j = 0; j < cell.length; j++) {
              const other = cell[j]
              if (other.id <= p.id) continue
              const distSq = (p.x - other.x) ** 2 + (p.y - other.y) ** 2
              if (distSq < maxLineDistSq) {
                const dist = Math.sqrt(distSq)
                const ratio = 1 - dist / maxLineDist
                // Rich, luminous vector filaments
                const alpha = Math.min(0.65, ratio * 0.6)
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
                ctx.beginPath()
                ctx.moveTo(p.x, p.y)
                ctx.lineTo(other.x, other.y)
                ctx.stroke()
              }
            }
          }
        }
      }

      time++
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Loading bar progress over durationMs
  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / durationMs) * 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(interval)
        setLoadingDone(true)
      }
    }, 16)
    return () => clearInterval(interval)
  }, [durationMs])

  const handleEnter = () => {
    setExiting(true)
    setTimeout(() => {
      onEnter?.()
    }, 600)
  }

  return (
    <div
      data-loading-screen="true"
      className={`loading-screen fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-600 cursor-default select-none overflow-hidden ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* ─── FULL-SCREEN HIGHLY ACTIVE VECTOR LINES CANVAS ─── */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* ─── CENTERPIECE: PURE FLOATING MIRAGE + LOADING BAR + SUMMONED BUTTON ─── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto pointer-events-auto">
        {/* Project Name emerging directly from the dynamic vector animation */}
        <h1 className="font-playfair italic font-extrabold sm:font-black text-6xl sm:text-8xl md:text-9xl tracking-[0.08em] sm:tracking-[0.14em] uppercase word-float text-white drop-shadow-[0_0_45px_rgba(255,255,255,0.9)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          {projectName}
        </h1>

        {/* Loading Bar Beneath MIRAGE */}
        {!loadingDone ? (
          <div className="w-72 sm:w-88 md:w-96 flex flex-col items-center gap-3 mt-10 transition-all duration-300">
            <div className="w-full h-[2.5px] bg-white/20 overflow-hidden rounded-full backdrop-blur-sm border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <div
                className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,1)] transition-[width] duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between w-full font-mono text-xs tracking-widest text-white/60">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/45">
                CALIBRATING INGRESS
              </span>
              <span className="text-white font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                {Math.floor(progress)}%
              </span>
            </div>
          </div>
        ) : (
          /* Summoned Enter Experience Button */
          <div className="mt-10 word-float">
            <button
              onClick={handleEnter}
              data-cursor="Enter"
              className="word-float font-mono text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase border border-white/60 bg-white/10 backdrop-blur-sm px-10 py-3.5 rounded-full text-white hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_40px_rgba(255,255,255,0.7)] active:scale-95 transition-all duration-300 light-glow cursor-pointer"
            >
              Enter Experience
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
