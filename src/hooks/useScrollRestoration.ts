'use client'

import { useEffect, useRef } from 'react'

const scrollPositions = new Map<string, number>()

export function useScrollRestoration() {
  const pathRef = useRef<string>('')

  useEffect(() => {
    // Save scroll position before unload
    const handleBeforeUnload = () => {
      if (typeof window !== 'undefined') {
        scrollPositions.set(pathRef.current, window.scrollY)
      }
    }

    // Restore scroll position on mount
    const savedScroll = scrollPositions.get(pathRef.current)
    if (savedScroll !== undefined && typeof window !== 'undefined') {
      // Use setTimeout to allow DOM to settle before scrolling
      setTimeout(() => {
        window.scrollTo(0, savedScroll)
      }, 0)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return { pathRef }
}
