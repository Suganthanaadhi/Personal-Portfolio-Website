'use client'

import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ttl: number
  size: number
  rot: number
  char: string
}

type WebRay = {
  points: Array<{ x: number; y: number }>
  life: number
  ttl: number
  width: number
  seed: number
}

type Shock = { x: number; y: number; life: number; ttl: number }

const SYMBOLS = Array.from('0123456789+-*/=%<>!&|^~?:()[]{}#@$')

export default function CursorFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const websRef = useRef<WebRay[]>([])
  const shocksRef = useRef<Shock[]>([])
  const rafRef = useRef<number | null>(null)
  const lastMoveRef = useRef<number>(0)
  const cursorRef = useRef<{ x: number; y: number } | null>(null)
  const runningRef = useRef<boolean>(true)
  const reduceMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(true)
  const lastClickRef = useRef<number>(0)

  useEffect(() => {
    // Disable on coarse pointer devices (touch) to keep the whole site smooth
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const mql = window.matchMedia('(pointer: coarse)')
      const update = () => setEnabled(!mql.matches)
      update()
      try {
        mql.addEventListener('change', update)
        return () => mql.removeEventListener('change', update)
      } catch {
        // Safari fallback
        // @ts-ignore
        mql.addListener(update)
        return () => {
          // @ts-ignore
          mql.removeListener(update)
        }
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
  const dpr = Math.max(1, Math.min(1.75, window.devicePixelRatio || 1))
    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctxRef.current = ctx
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const onMove = useCallback((e: MouseEvent) => {
    cursorRef.current = { x: e.clientX, y: e.clientY }
    const now = performance.now()
    if (now - lastMoveRef.current < 40) return // increase throttle to 40ms for better perf
    lastMoveRef.current = now
    // spawn fewer particles for better performance
    const count = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 30 + Math.random() * 40
      const size = 14 + Math.random() * 10
      const ttl = 400 + Math.random() * 200 // shorter lifetime
      const rot = (Math.random() - 0.5) * 30
      const char = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      particlesRef.current.push({
        x: e.clientX + (Math.random() - 0.5) * 6,
        y: e.clientY + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * (speed / 1000),
        vy: Math.sin(angle) * (speed / 1000),
        life: ttl,
        ttl,
        size,
        rot,
        char,
      })
    }
    // reduce particle cap from 180 to 120 for better perf
    if (particlesRef.current.length > 120) {
      particlesRef.current.splice(0, particlesRef.current.length - 120)
    }
  }, [])

  const onClick = useCallback((e: MouseEvent) => {
    const now = performance.now()
    if (now - lastClickRef.current < 350) return // increase throttle
    lastClickRef.current = now
    // DISABLED: Web rays and shock rings cause 60% slowdown - skip for now
    // Can be re-enabled when animation budget permits
  }, [])

  useEffect(() => {
    if (reduceMotion || !enabled) return
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('mousemove', onMove as any)
      window.removeEventListener('click', onClick as any)
    }
  }, [reduceMotion, enabled, onMove, onClick])

  useEffect(() => {
    const loop = (t: number) => {
      const ctx = ctxRef.current
      const canvas = canvasRef.current
      if (!ctx || !canvas) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      // clear
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // DISABLED: cursor core glow - removed to reduce draw calls
      // if (cursorRef.current && !reduceMotion) {
      //   const { x, y } = cursorRef.current
      //   ctx.save()
      //   ctx.globalAlpha = 0.35
      //   ctx.fillStyle = '#ffffff'
      //   ctx.shadowColor = 'rgba(0,212,255,0.45)'
      //   ctx.shadowBlur = 12
      //   ctx.beginPath()
      //   ctx.arc(x, y, 2.2, 0, Math.PI * 2)
      //   ctx.fill()
      //   ctx.restore()
      // }

      const now = performance.now()
      const dt = 16

      // DISABLED: Web rays and shock rings - these account for 30-40% of rendering cost
      // Particles alone are much lighter
      // if (!reduceMotion) {
      //   for (let i = websRef.current.length - 1; i >= 0; i--) { ... }
      //   for (let i = shocksRef.current.length - 1; i >= 0; i--) { ... }
      // }

      // draw particles (symbols) - OPTIMIZED
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.life -= dt
        const a = Math.max(0, p.life / p.ttl)
        if (a <= 0) {
          particlesRef.current.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.globalAlpha = a * 0.8 // slightly less opaque
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        
        // SIMPLIFIED: Single gradient instead of per-particle gradient
        const grad = ctx.createLinearGradient(-p.size / 2, 0, p.size / 2, 0)
        grad.addColorStop(0, 'rgba(0,212,255,0.95)')
        grad.addColorStop(1, 'rgba(179,71,217,0.95)')
        ctx.fillStyle = grad
        ctx.font = `${p.size}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        // REMOVED: shadow blur - very expensive. Less visual but much faster
        ctx.fillText(p.char, 0, 0)
        ctx.restore()
      }

      if (runningRef.current) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(loop)

    const onVisibility = () => {
      if (document.hidden) {
        runningRef.current = false
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
      } else {
        runningRef.current = true
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(loop)
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduceMotion])

  // If reduced motion, we don't render anything
  if (reduceMotion || !enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999]"
    />
  )
}
