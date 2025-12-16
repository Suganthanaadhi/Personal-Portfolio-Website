'use client'

import { useContext, useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import { MotionContext, MotionMode } from '../providers/MotionProvider'

export function useMotionPreference(): {
  reduceMotion: boolean
  mode: MotionMode
  setMode: (mode: MotionMode) => void
} {
  const ctx = useContext(MotionContext)
  const systemReduced = useReducedMotion()

  return useMemo(() => {
    if (ctx) return ctx
    // Fallback if provider isn't mounted yet
    return {
      reduceMotion: Boolean(systemReduced),
      mode: 'auto' as const,
      setMode: () => {},
    }
  }, [ctx, systemReduced])
}
