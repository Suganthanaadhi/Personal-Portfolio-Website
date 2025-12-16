"use client"
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'neon' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('neon')
  const [mounted, setMounted] = useState(false)

  // On mount, read stored preference (if any) without causing mismatch (only runs client side)
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('theme') as Theme | null) : null
    if (stored && ['neon','dark'].includes(stored)) {
      setTheme(stored)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.remove('theme-neon', 'theme-dark')
    document.documentElement.classList.add(`theme-${theme}`)
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])
  const toggleTheme = () => setTheme(t => (t === 'neon' ? 'dark' : 'neon'))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {/* Avoid rendering children until mounted to prevent hydration mismatch on theme-dependent UI */}
      {mounted ? children : null}
    </ThemeContext.Provider>
  )
}