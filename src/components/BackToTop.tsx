"use client"
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BackToTopProps {
  threshold?: number // pixels scrolled before showing
  size?: number       // diameter of the circular button (px)
}

const BackToTop: React.FC<BackToTopProps> = ({ threshold = 600, size = 46 }) => {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1 scroll progress

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const docHeight = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight
      const p = docHeight > 0 ? Math.min(1, scrolled / docHeight) : 0
      setProgress(p)
      setVisible(scrolled > threshold)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const stroke = 4
  const radius = (size / 2) - stroke - 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="back-to-top-wrapper"
          initial={{ opacity: 0, scale: 0.6, x: -30, y: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, x: -30, y: 30 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed left-3 bottom-6 z-40"
          style={{ width: size, height: size }}
        >
          {/* Halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-blue/15 via-neon-purple/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <button
            onClick={scrollTop}
            aria-label="Back to top"
            className="group relative w-full h-full rounded-full border border-gray-700/50 bg-gray-900/70 backdrop-blur-xl text-gray-300 hover:text-white hover:border-neon-blue/60 hover:bg-gray-800/80 shadow-lg shadow-black/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/60"
          >
            <ArrowUp className="w-4 h-4 md:w-5 md:h-5 absolute inset-0 m-auto group-hover:animate-pulse" />
            {/* Progress ring */}
            <svg className="absolute inset-0" width={size} height={size}>
              <circle
                cx={size/2}
                cy={size/2}
                r={radius}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={stroke}
                fill="none"
              />
              <motion.circle
                cx={size/2}
                cy={size/2}
                r={radius}
                stroke="url(#bt-gradient)"
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                initial={false}
                animate={{ strokeDashoffset: offset }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
              <defs>
                <linearGradient id="bt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-neon-blue, #3b82f6)" />
                  <stop offset="100%" stopColor="var(--color-neon-purple, #8b5cf6)" />
                </linearGradient>
              </defs>
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BackToTop