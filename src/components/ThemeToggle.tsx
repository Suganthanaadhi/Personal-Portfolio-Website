"use client"
import { useTheme } from '@/providers/ThemeProvider'
import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  variant?: 'floating' | 'inline'
  className?: string
}

const ThemeToggle = ({ variant = 'inline', className = '' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  // Geometry per variant
  const shape = variant === 'floating'
    ? 'fixed left-4 bottom-20 z-40'
    : 'relative'
  // Unified minimal style for both states
  const buttonClasses = `${shape} group inline-flex items-center justify-center rounded-full p-2.5 md:p-3
    border border-white/15 hover:border-white/35 bg-[var(--background)]/90 backdrop-blur-sm
    transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/60
    focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:scale-[0.95] motion-reduce:transition-none`

  const labelMap: Record<string,string> = {
    neon: 'Switch to dark theme',
    dark: 'Switch to neon theme',
  }

  return (
    <motion.button
      aria-label={labelMap[theme] || 'Change theme'}
      onClick={toggleTheme}
      initial={false}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.90 }}
      className={`${buttonClasses} ${className}`}
      data-theme-toggle-state={theme}
    >
      {/* Minimal version: removed sheen / glow for simplicity */}
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'neon' && (
          <motion.span key="sparkle" initial={{ opacity: 0, scale: .85 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.85 }} transition={{ duration:.16 }} className="flex">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[var(--accent-primary)]" />
          </motion.span>
        )}
        {theme === 'dark' && (
          <motion.span key="moon" initial={{ opacity:0, scale:.85 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.85 }} transition={{ duration:.16 }} className="flex">
            <Moon className="w-5 h-5 md:w-6 md:h-6 text-[var(--accent-primary)]" />
          </motion.span>
        )}
      </AnimatePresence>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full ring-0 group-focus-visible:ring-1 ring-inset ring-white/10" />
    </motion.button>
  )
}

export default ThemeToggle