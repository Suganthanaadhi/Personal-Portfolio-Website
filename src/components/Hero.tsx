'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

const Hero = () => {
  const [currentRole, setCurrentRole] = useState(0)
  // Memoize roles to avoid unstable references in effects
  const roles = useMemo(() => ['Web Developer', 'UI/UX Designer', 'Data Scientist'], [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [roles.length])

  // Generate animated keyword particles only on the client to keep SSR deterministic
  type KeywordParticle = {
    id: number
    text: string
    x: number
    y: number
    scale: number
    delay: number
    duration: number
    hue: number
    angle: number
  }
  const [kwParticles, setKwParticles] = useState<KeywordParticle[]>([])
  // Operator particles (small operator symbols reacting strongly to parallax)
  type OperatorParticle = {
    id: number
    text: string
    x: number
    y: number
    scale: number
    delay: number
    duration: number
    hue: number
    angle: number
  }
  const [opParticles, setOpParticles] = useState<OperatorParticle[]>([])
  type Edge = { id: string; x1: number; y1: number; x2: number; y2: number; base: number; delay: number; duration: number }
  const edges = useMemo<Edge[]>(() => {
    if (!kwParticles || kwParticles.length === 0) return []
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    const maxPerNode = 2
    const maxDist = vw < 480 ? 9 : vw < 1024 ? 8.5 : 7.5 // in percentage units
    const rand = (min: number, max: number) => min + Math.random() * (max - min)
    const added = new Set<string>()
    const res: Edge[] = []
    for (let i = 0; i < kwParticles.length; i++) {
      const a = kwParticles[i]
      const candidates: { j: number; d: number }[] = []
      for (let j = i + 1; j < kwParticles.length; j++) {
        const b = kwParticles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d <= maxDist) candidates.push({ j, d })
      }
      candidates.sort((c1, c2) => c1.d - c2.d)
      let used = 0
      for (const c of candidates) {
        if (used >= maxPerNode) break
        // Skip some edges to avoid clutter
        if (Math.random() < 0.3) continue
        const key = `${i}-${c.j}`
        if (added.has(key)) continue
        added.add(key)
        const b = kwParticles[c.j]
        res.push({
          id: key,
          x1: a.x,
          y1: a.y,
          x2: b.x,
          y2: b.y,
          base: rand(0.08, 0.16),
          delay: rand(0, 2.5),
          duration: rand(3.5, 6.5),
        })
        used++
      }
    }
    return res
  }, [kwParticles])
  // Star field
  type Star = { id: number; x: number; y: number; size: number; delay: number; duration: number; base: number }
  type Dot = { id: number; x: number; y: number; size: number; delay: number; duration: number; base: number }
  const [stars, setStars] = useState<Star[]>([])
  const [dots, setDots] = useState<Dot[]>([])
  // Ultra-light dust layer using box-shadow clones
  const [dustShadow, setDustShadow] = useState<string>('')
  // Subtle parallax
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const [active, setActive] = useState(true)
  const sectionRef = useRef<HTMLElement | null>(null)
  const reduceMotion = useReducedMotion()
  // UI state for enhanced scroll button interactions
  const [hovered, setHovered] = useState(false)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [isRippling, setIsRippling] = useState(false)

  const techWords = useMemo(
    () => [
      // Short, recognizable tokens for a "star-like" feel
      // Python
      'def', 'for', 'if', 'elif', 'else', 'try', 'with', 'await', 'async', 'yield', 'pass', 'break', 'return',
      // Java
      'class', 'new', 'void', 'int', 'try', 'catch', 'final', 'static', 'enum',
      // HTML tags
      '<div>', '<span>', '<a>', '<p>', '<ul>', '<li>', '<h1>', '<img>', '<form>', '<nav>',
      // JS/TS
      'const', 'let', 'var', 'type', 'enum', 'null', 'void', 'this', 'new', '=>',
      // React
      'props', 'state', 'ref', 'memo', '<>', '</>',
      // Next
      'fetch', 'cache', 'edge',
      // Tailwind
      'grid', 'flex', 'gap-2', 'px-4', 'py-2', 'rounded'
    ],
    []
  )
  const symbolTokens = useMemo(
    () => [
      '()', '{}', '[]', '</>', '&&', '||', '++', '--', '!==', '===', '=>', '->', '::', '/* */', '//', '#!', '@', '#', '$', '%'
    ],
    []
  )

  useEffect(() => {
    // We use the exact requested set of keywords without repetition
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    // Desired count (responsive, denser fill). We’ll mix techWords + symbolTokens and allow tasteful repeats.
    const desired = vw < 480 ? 24 : vw < 1024 ? 36 : 54
    const pool: string[] = []
    // Build a pool by repeating tech words and adding symbol tokens for variety
    const repeats = vw < 480 ? 2 : vw < 1024 ? 2 : 3
    for (let r = 0; r < repeats; r++) pool.push(...techWords)
    pool.push(...symbolTokens)
    // Shuffle pool and take desired
    const words = [...pool]
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[words[i], words[j]] = [words[j], words[i]]
    }
    const chosen = words.slice(0, desired)
    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    // Simple min-distance placement to spread words across the viewport area
    type Pt = { x: number; y: number }
    const points: Pt[] = []
    const minDist = vw < 480 ? 9 : 8 // percentage units; a bit tighter to fit more
    // Grid-jitter seeding across the viewport to cover empties uniformly
    const cols = vw < 480 ? 5 : vw < 1024 ? 7 : 9
    const rows = vw < 480 ? 8 : vw < 1024 ? 9 : 10
    const xStep = 100 / (cols + 1)
    const yStep = 100 / (rows + 1)
    const jitter = vw < 480 ? 3.5 : vw < 1024 ? 3 : 2.5
    const isInCenterHole = (p: Pt) => {
      const dx = p.x - 50
      const dy = p.y - 36
      const centerDist = Math.sqrt(dx * dx + dy * dy)
      return centerDist < 16
    }
    const tooClose = (p: Pt) => points.some((q) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2 < minDist * minDist)
    for (let r = 1; r <= rows && points.length < chosen.length; r++) {
      for (let c = 1; c <= cols && points.length < chosen.length; c++) {
        const p = {
          x: Math.min(96, Math.max(4, c * xStep + rand(-jitter, jitter))),
          y: Math.min(92, Math.max(8, r * yStep + rand(-jitter, jitter))),
        }
        if (isInCenterHole(p)) continue
        if (!tooClose(p)) points.push(p)
      }
    }
    // If still short, fill using rejection sampling
    const maxTries = 120
    const place = (): Pt => {
      let tries = 0
      while (tries++ < maxTries) {
        const p = { x: rand(4, 96), y: rand(8, 92) }
        if (isInCenterHole(p)) continue
        if (!tooClose(p)) return p
      }
      return { x: rand(4, 96), y: rand(8, 92) }
    }

    const generated: KeywordParticle[] = chosen.map((text, i) => {
      const p = place()
      points.push(p)
      return {
        id: i,
        text,
        x: p.x,
        y: p.y,
        scale: rand(0.9, 1.1),
        delay: rand(0, 2.5),
        duration: rand(6, 10),
        hue: rand(-8, 8),
        angle: rand(-20, 20),
      }
    })

    setKwParticles(generated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Operator particle generation (depends on kwParticles to avoid overlap)
  useEffect(() => {
    if (!kwParticles || kwParticles.length === 0) return
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    const desired = vw < 480 ? 12 : vw < 1024 ? 16 : 22
    const pool = [...symbolTokens]
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const chosen = pool.slice(0, desired)
    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    type Pt = { x: number; y: number }
    const points: Pt[] = []
    const minToKw = vw < 480 ? 7.5 : 7 // keep operators away from keywords to avoid crowding
    const minToOp = vw < 480 ? 7 : 6
    const maxTries = 100
    const inCenter = (p: Pt) => Math.hypot(p.x - 50, p.y - 36) < 15
    const place = (): Pt => {
      let tries = 0
      while (tries++ < maxTries) {
        const p = { x: rand(4, 96), y: rand(8, 92) }
        if (inCenter(p)) continue
        // spacing to keywords
        let ok = true
        for (const k of kwParticles) {
          const d2 = (p.x - k.x) ** 2 + (p.y - k.y) ** 2
          if (d2 < minToKw * minToKw) { ok = false; break }
        }
        if (!ok) continue
        // spacing to existing ops
        for (const q of points) {
          const d2 = (p.x - q.x) ** 2 + (p.y - q.y) ** 2
          if (d2 < minToOp * minToOp) { ok = false; break }
        }
        if (!ok) continue
        return p
      }
      return { x: rand(4, 96), y: rand(8, 92) }
    }

    const generated: OperatorParticle[] = chosen.map((text, i) => {
      const p = place()
      points.push(p)
      return {
        id: i,
        text,
        x: p.x,
        y: p.y,
        scale: rand(0.85, 1),
        delay: rand(0, 2),
        duration: rand(4, 7),
        hue: rand(-10, 10),
        angle: rand(-25, 25),
      }
    })
    setOpParticles(generated)
  }, [kwParticles, symbolTokens])

  // Star and dot field generation with non-overlap
  useEffect(() => {
    if (!kwParticles || kwParticles.length === 0) return
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    // Densities per breakpoint
    const dotCount = vw < 480 ? 40 : vw < 1024 ? 60 : 80
    const starCount = vw < 480 ? 90 : vw < 1024 ? 130 : 180
    // Distances in percentage units
    const centerHole = 14
    const bounds = { xMin: 3, xMax: 97, yMin: 6, yMax: 94 }
    const d2 = (ax: number, ay: number, bx: number, by: number) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by)
    const tooNearKw = (x: number, y: number, min: number) => kwParticles.some((k) => d2(x, y, k.x, k.y) < min * min)
    const tooNearList = (x: number, y: number, list: { x: number; y: number }[], min: number) => list.some((p) => d2(x, y, p.x, p.y) < min * min)
    const inCenter = (x: number, y: number) => Math.hypot(x - 50, y - 36) < centerHole

    const placedDots: Dot[] = []
    const placedStars: Star[] = []

    // Place dots first (tiny, subtle)
    const dotMinDot = 1.2
    const dotMinKw = 3.5
    const maxTries = 800
    for (let i = 0; i < dotCount; i++) {
      let tries = 0
      let placed = false
      while (tries++ < maxTries && !placed) {
        const x = rand(bounds.xMin, bounds.xMax)
        const y = rand(bounds.yMin, bounds.yMax)
        if (inCenter(x, y)) continue
        if (tooNearKw(x, y, dotMinKw)) continue
        if (tooNearList(x, y, placedDots, dotMinDot)) continue
        placedDots.push({
          id: i,
          x,
          y,
          size: rand(1.4, 2.2),
          delay: rand(0, 2),
          duration: rand(2.2, 3.6),
          base: rand(0.2, 0.6),
        })
        placed = true
      }
      if (!placed) break
    }

    // Place stars (slightly larger, glowing) avoiding dots and keywords
    const starMinStar = 1.8
    const starMinDot = 1.4
    const starMinKw = 5
    for (let i = 0; i < starCount; i++) {
      let tries = 0
      let placed = false
      while (tries++ < maxTries && !placed) {
        const x = rand(bounds.xMin, bounds.xMax)
        const y = rand(bounds.yMin, bounds.yMax)
        if (inCenter(x, y)) continue
        if (tooNearKw(x, y, starMinKw)) continue
        if (tooNearList(x, y, placedStars, starMinStar)) continue
        if (tooNearList(x, y, placedDots, starMinDot)) continue
        placedStars.push({
          id: i,
          x,
          y,
          size: rand(2.2, 3.4),
          delay: rand(0, 3),
          duration: rand(2.8, 5.5),
          base: rand(0.15, 0.55),
        })
        placed = true
      }
      if (!placed) break
    }

    setDots(placedDots)
    setStars(placedStars)
  }, [kwParticles])

  // Dust layer box-shadow (single node, hundreds of points)
  useEffect(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    const count = vw < 480 ? 180 : vw < 1024 ? 260 : 360
    const points: string[] = []
    for (let i = 0; i < count; i++) {
      const x = Math.round(Math.random() * vw)
      const y = Math.round(Math.random() * vh)
      const a = 0.05 + Math.random() * 0.07
      points.push(`${x}px ${y}px rgba(255,255,255,${a.toFixed(3)})`)
    }
    setDustShadow(points.join(', '))
  }, [])

  // Hide the scroll indicator after the user starts scrolling
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setActive(entry.isIntersecting)
      },
      { root: null, threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      // Only show when at the very top of the page
      setShowScrollHint(window.scrollY === 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient"
      onMouseMove={(e) => {
        if (reduceMotion) return
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const nx = (e.clientX - rect.left) / rect.width - 0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => setParallax({ x: nx, y: ny }))
      }}
      onMouseLeave={() => {
        if (reduceMotion) return
        setParallax({ x: 0, y: 0 })
      }}
    >
      {/* Star field (behind) */}
      <div
        className="absolute inset-0 overflow-hidden select-none z-[1]"
        aria-hidden
        style={{
          transform: reduceMotion || !active ? undefined : `translate3d(${parallax.x * 6}px, ${parallax.y * 6}px, 0)`,
          willChange: 'transform',
        }}
      >
        {/* Dust stars via box-shadow (ultra-lightweight) */}
        {dustShadow && (
          <span
            aria-hidden
            className="absolute top-0 left-0 w-[1px] h-[1px]"
            style={{
              boxShadow: dustShadow,
              opacity: 0.9,
              filter: 'drop-shadow(0 0 2px rgba(0,212,255,0.12))',
              transform: reduceMotion ? undefined : `translate3d(${parallax.x * 3}px, ${parallax.y * 3}px, 0)`,
            }}
          />
        )}
          {/* Non-overlapping dots (behind stars) */}
          {dots.map((d) => (
            <motion.span
              key={`d-${d.id}`}
              className="absolute rounded-full"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: `${d.size}px`,
                height: `${d.size}px`,
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.18) 55%, transparent 75%), radial-gradient(circle, rgba(0,212,255,0.6) 0%, transparent 70%)',
                filter: 'drop-shadow(0 0 5px rgba(0,212,255,0.35)) drop-shadow(0 0 6px rgba(179,71,217,0.25))',
              }}
              animate={reduceMotion ? { opacity: d.base } : { opacity: [d.base, 1, d.base] }}
              transition={reduceMotion ? undefined : { duration: d.duration, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
            />
          ))}
        {stars.map((s) => (
          <motion.span
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.12) 50%, transparent 66%), radial-gradient(circle, rgba(179,71,217,0.38) 0%, transparent 70%), radial-gradient(circle, rgba(0,212,255,0.38) 0%, transparent 75%)',
                filter: 'drop-shadow(0 0 12px rgba(179,71,217,0.35)) drop-shadow(0 0 10px rgba(0,212,255,0.35))',
            }}
            animate={
              reduceMotion || !active
                ? undefined
                : { opacity: [s.base, 1, s.base], scale: [1, 1.22, 1], filter: ['blur(0px)', 'blur(0.6px)', 'blur(0px)'] }
            }
            transition={reduceMotion ? undefined : { duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Animated Programming Keywords Background */}
      <div
        className="absolute inset-0 overflow-hidden select-none z-[2]"
        aria-hidden
        style={{
          WebkitMaskImage:
            'radial-gradient(36% 28% at 50% 38%, transparent 0 48%, black 60%)',
          maskImage:
            'radial-gradient(36% 28% at 50% 38%, transparent 0 48%, black 60%)',
          transform: reduceMotion || !active ? undefined : `translate3d(${parallax.x * 10}px, ${parallax.y * 10}px, 0)`,
          willChange: 'transform',
        }}
      >
        {/* Constellation lines (subtle, masked, below ops/keywords) */}
        {edges.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {edges.map((e) => (
              <motion.line
                key={e.id}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="rgba(0,212,255,0.14)"
                strokeWidth={0.15}
                vectorEffect="non-scaling-stroke"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0,212,255,0.15))' }}
                animate={reduceMotion || !active ? { opacity: e.base } : { opacity: [e.base, e.base * 1.6, e.base] }}
                transition={reduceMotion ? undefined : { duration: e.duration, repeat: Infinity, delay: e.delay, ease: 'easeInOut' }}
              />
            ))}
          </svg>
        )}
        {/* Operator symbols reacting to parallax (below keywords) */}
        {opParticles.map((p) => (
          <motion.span
            key={`op-${p.id}`}
            className="absolute font-mono tracking-wide text-[9px] sm:text-[10px] md:text-xs text-white/70 whitespace-nowrap pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              filter: `drop-shadow(0 0 8px rgba(0,212,255,0.22)) drop-shadow(0 0 6px rgba(179,71,217,0.2)) hue-rotate(${p.hue}deg)`,
              transform: `translate(-50%, -50%) scale(${p.scale}) rotate(${p.angle}deg)`,
              backgroundImage: 'linear-gradient(90deg, rgba(0,212,255,0.85), rgba(179,71,217,0.85))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
            animate={
              reduceMotion || !active
                ? undefined
                : {
                    x: [-8, 0, 8, 0, -8],
                    y: [0, -10, 0, 10, 0],
                    opacity: [0.25, 0.95, 0.5, 0.95, 0.25],
                    rotate: [p.angle - 3, p.angle, p.angle + 3, p.angle],
                  }
            }
            transition={reduceMotion ? undefined : { duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          >
            {p.text}
          </motion.span>
        ))}
        {kwParticles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute font-mono tracking-wide text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-white/70 whitespace-nowrap pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              filter: `drop-shadow(0 0 10px rgba(179,71,217,0.22)) drop-shadow(0 0 8px rgba(0,212,255,0.18)) hue-rotate(${p.hue}deg)`,
              transform: `translate(-50%, -50%) scale(${p.scale}) rotate(${p.angle}deg)`,
              backgroundImage: 'linear-gradient(90deg, rgba(0,212,255,0.85), rgba(179,71,217,0.85), rgba(255,10,120,0.85))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
            animate={
              reduceMotion || !active
                ? undefined
                : {
                    x: [-6, 0, 6, 0, -6],
                    y: [0, -8, 0, 8, 0],
                  opacity: [0.2, 0.92, 0.45, 0.92, 0.2],
                  rotate: [p.angle - 2, p.angle, p.angle + 2, p.angle],
                  scale: [p.scale, p.scale * 1.04, p.scale],
                  }
            }
            transition={reduceMotion ? undefined : { duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          >
            {p.text}
          </motion.span>
        ))}
        {/* Subtle vignette to keep keywords away from edges */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,transparent,transparent,rgba(0,0,0,0.35))]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Main Heading */}
          <motion.h1
            className="text-4xl sm:text-6xl lg:text-8xl font-extrabold font-poppins tracking-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          >
            <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
            G v Suganthan
            </span>
          </motion.h1>

          {/* Animated Role */}
          <motion.div
            className="text-xl sm:text-2xl lg:text-4xl text-gray-300 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-white">I&apos;m a </span>
            <motion.span
              key={currentRole}
              className="text-neon-blue font-semibold"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {roles[currentRole]}
            </motion.span>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          >
            Crafting digital experiences that blend creativity with functionality. 
            Passionate about modern web technologies and user-centered design.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          >
            <motion.button
              suppressHydrationWarning
              aria-label="View Projects"
              className="px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold rounded-full hover:shadow-2xl transition-all duration-300 glass border-2 border-transparent hover:border-neon-blue group focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="flex items-center gap-2">
                View Projects
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={reduceMotion ? undefined : { x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </span>
            </motion.button>

            <motion.button
              suppressHydrationWarning
              aria-label="Contact Me"
              className="px-8 py-4 border-2 border-neon-purple text-neon-purple font-semibold rounded-full hover:bg-neon-purple hover:text-white transition-all duration-300 glass focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Me
            </motion.button>
          </motion.div>

          {/* Scroll Indicator under CTAs */}
          <AnimatePresence>
            {showScrollHint && (
              <motion.button
                suppressHydrationWarning
                key="scroll-indicator"
                initial={{ opacity: 0, y: 8 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                onClick={() => {
                  // tap ripple feedback
                  if (!reduceMotion) {
                    setIsRippling(true)
                    setTimeout(() => setIsRippling(false), 500)
                  }
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                }}
                aria-label="Scroll to About"
                className="group mx-auto mt-6 relative inline-flex h-12 w-12 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                whileHover={reduceMotion ? undefined : { scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => {
                  setHovered(false)
                  setCursor({ x: 0, y: 0 })
                }}
                onMouseMove={(e) => {
                  if (reduceMotion) return
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  const x = (e.clientX - rect.left) / rect.width - 0.5 // -0.5..0.5
                  const y = (e.clientY - rect.top) / rect.height - 0.5
                  setCursor({ x, y })
                }}
              >
                {/* (Aura and outer ring removed per request) */}

                {/* inner glass, magnetic hover */}
                <motion.span
                  className="relative inline-flex h-full w-full items-center justify-center rounded-full border border-transparent bg-white/5 backdrop-blur-md"
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          x: cursor.x * 4,
                          y: cursor.y * 4,
                          rotate: cursor.x * 3,
                        }
                  }
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                >
                  {/* hover sheen removed per user request */}

                  {/* Ripple on tap */}
                  <AnimatePresence>
                    {!reduceMotion && isRippling && (
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-full border border-white/30"
                        initial={{ opacity: 0.25, scale: 0.2 }}
                        animate={{ opacity: 0, scale: 1.6 }}
                        exit={{ opacity: 0, scale: 1.6 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Chevron */}
                  {reduceMotion ? (
                    <span aria-hidden className="flex items-center justify-center">
                      <ChevronDown className="h-5 w-5 text-white/90" />
                    </span>
                  ) : (
                    <motion.span
                      aria-hidden
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex items-center justify-center"
                    >
                      <ChevronDown className="h-5 w-5 text-white/90" />
                    </motion.span>
                  )}
                </motion.span>
                <span className="sr-only">Scroll to About</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/10 pointer-events-none z-0" />
    </section>
  )
}

export default Hero