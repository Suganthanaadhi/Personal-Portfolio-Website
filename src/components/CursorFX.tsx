'use client'

import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

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

  useEffect(() => {
    if (reduceMotion || !enabled) return
    const onMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY }
      const now = performance.now()
  if (now - lastMoveRef.current < 28) return // throttle slightly more for smoothness
      lastMoveRef.current = now
  // spawn a few particles near the cursor
  const count = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 30 + Math.random() * 40
  const size = 14 + Math.random() * 10
        const ttl = 600 + Math.random() * 400
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
      // cap particle count to keep perf steady on all pages
      if (particlesRef.current.length > 180) {
        particlesRef.current.splice(0, particlesRef.current.length - 180)
      }
    }
    const onClick = (e: MouseEvent) => {
      // throttle click bursts a bit for subtlety
      const now = performance.now()
      if (now - lastClickRef.current < 220) return
      lastClickRef.current = now
      // spawn a softer web burst
      const rays = 4 + Math.floor(Math.random() * 2) // reduce rays
      const pointsForRay = 2 + Math.floor(Math.random() * 2) // fewer segments
      const ttl = 200 + Math.random() * 140 // shorter life
      const width = 0.8 + Math.random() * 0.5 // thinner
      for (let r = 0; r < rays; r++) {
        const baseAngle = (2 * Math.PI * r) / rays + Math.random() * 0.35
        let x = e.clientX
        let y = e.clientY
        const pts: Array<{ x: number; y: number }> = [{ x, y }]
        for (let s = 0; s < pointsForRay; s++) {
          const segLen = 48 + Math.random() * 80 // shorter segments
          const jitter = (Math.random() - 0.5) * (Math.PI / 4) // less jagged
          const a = baseAngle + jitter + Math.sin((s + r) * 1.2) * 0.12
          x += Math.cos(a) * segLen
          y += Math.sin(a) * segLen
          pts.push({ x, y })
        }
        websRef.current.push({ points: pts, life: ttl, ttl, width, seed: Math.random() * 1000 })
      }
      shocksRef.current.push({ x: e.clientX, y: e.clientY, life: 320, ttl: 320 }) // smaller/shorter ring
      // cap arrays to avoid too many items
      if (websRef.current.length > 18) websRef.current.splice(0, websRef.current.length - 18)
      if (shocksRef.current.length > 6) shocksRef.current.splice(0, shocksRef.current.length - 6)
      // loop will resume on visibilitychange if needed
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('mousemove', onMove as any)
      window.removeEventListener('click', onClick as any)
    }
  }, [reduceMotion, enabled])

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

      // draw cursor core (subtle)
      if (cursorRef.current && !reduceMotion) {
        const { x, y } = cursorRef.current
        ctx.save()
        ctx.globalAlpha = 0.35
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = 'rgba(0,212,255,0.45)'
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      const now = performance.now()
      const dt = 16 // approx ms per frame for velocity in px/ms

      // draw webs (lightning/web lines)
      if (!reduceMotion) {
        for (let i = websRef.current.length - 1; i >= 0; i--) {
          const web = websRef.current[i]
          const alpha = Math.max(0, web.life / web.ttl)
          const flicker = 0.75 + Math.sin((now + web.seed) * 0.018) * 0.25 // slightly steadier
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = alpha * 0.85 * flicker // overall lower intensity
          // draw with taper: thicker near origin, thinner at end
          const segs = web.points
          for (let s = 0; s < segs.length - 1; s++) {
            const p0 = segs[s]
            const p1 = segs[s + 1]
            const t = s / (segs.length - 1)
            const w = web.width * (1.5 - t) // slightly less width
            // pass 1: violet
            ctx.lineWidth = w
            ctx.strokeStyle = 'rgba(179,71,217,0.38)'
            ctx.shadowColor = 'rgba(179,71,217,0.5)'
            ctx.shadowBlur = 10
            ctx.beginPath()
            ctx.moveTo(p0.x, p0.y)
            ctx.lineTo(p1.x, p1.y)
            ctx.stroke()
            // pass 2: cyan
            ctx.lineWidth = w * 0.85
            ctx.strokeStyle = 'rgba(0,212,255,0.36)'
            ctx.shadowColor = 'rgba(0,212,255,0.5)'
            ctx.shadowBlur = 9
            ctx.beginPath()
            ctx.moveTo(p0.x, p0.y)
            ctx.lineTo(p1.x, p1.y)
            ctx.stroke()
          }
          ctx.restore()
          web.life -= 16
          if (web.life <= 0) websRef.current.splice(i, 1)
        }
        // shock rings
        for (let i = shocksRef.current.length - 1; i >= 0; i--) {
          const s = shocksRef.current[i]
          const a = Math.max(0, s.life / s.ttl)
          const r = (1 - a) * 110 + 16 // smaller radius
          ctx.save()
          ctx.globalCompositeOperation = 'lighter'
          ctx.globalAlpha = a * 0.5
          ctx.lineWidth = 1.6
          ctx.strokeStyle = 'rgba(0,212,255,0.34)'
          ctx.shadowColor = 'rgba(0,212,255,0.5)'
          ctx.shadowBlur = 9
          ctx.beginPath()
          ctx.arc(s.x, s.y, r, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
          s.life -= 16
          if (s.life <= 0) shocksRef.current.splice(i, 1)
        }
      }

      // draw particles (symbols)
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
        ctx.globalAlpha = a
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        const grad = ctx.createLinearGradient(-p.size / 2, 0, p.size / 2, 0)
        grad.addColorStop(0, 'rgba(0,212,255,0.95)')
        grad.addColorStop(1, 'rgba(179,71,217,0.95)')
        ctx.fillStyle = grad
        ctx.font = `${p.size}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,212,255,0.75)'
  ctx.shadowBlur = 14
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

    // Pause rAF when tab is hidden; resume when visible
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
