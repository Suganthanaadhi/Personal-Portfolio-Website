'use client'

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export type MotionMode = 'auto' | 'reduced' | 'full'

type MotionContextValue = {
  mode: MotionMode
  setMode: (mode: MotionMode) => void
  reduceMotion: boolean
}

export const MotionContext = createContext<MotionContextValue | undefined>(undefined)

const STORAGE_KEY = 'motion-preference'

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const systemPrefersReducedRaw = useReducedMotion()
  const [mode, setMode] = useState<MotionMode>('auto')

  useEffect(() => {
    try {
      const saved = (localStorage.getItem(STORAGE_KEY) as MotionMode | null)
      if (saved === 'auto' || saved === 'reduced' || saved === 'full') {
        setMode(saved)
      }
    } catch {}
  }, [])

  const persist = useCallback((next: MotionMode) => {
    setMode(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }, [])

  const reduceMotion = useMemo<boolean>(() => {
    const systemPrefersReduced = Boolean(systemPrefersReducedRaw)
    if (mode === 'auto') return systemPrefersReduced
    if (mode === 'reduced') return true
    return false // full motion
  }, [mode, systemPrefersReducedRaw])

  const value = useMemo(() => ({ mode, setMode: persist, reduceMotion }), [mode, persist, reduceMotion])

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  )
}
