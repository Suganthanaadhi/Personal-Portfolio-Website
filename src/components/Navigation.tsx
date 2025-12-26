'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ThemeToggle from './ThemeToggle'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const tickingRef = useRef(false)
  const navRef = useRef<HTMLElement | null>(null)

  const menuItems = useMemo(() => ([
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#experience', label: 'Experience' },
  { href: '#achievements', label: 'Achievements' },
    { href: '#contact', label: 'Contact' },
  ]), [])

  useEffect(() => {
    // Cache section elements to avoid repeated DOM queries
    const sectionElements = new Map<string, HTMLElement>()
    const menuItems = [
      { href: '#home', label: 'Home' },
      { href: '#about', label: 'About' },
      { href: '#skills', label: 'Skills' },
      { href: '#projects', label: 'Projects' },
      { href: '#experience', label: 'Experience' },
      { href: '#achievements', label: 'Achievements' },
      { href: '#contact', label: 'Contact' },
    ]
    
    for (const item of menuItems) {
      const el = document.getElementById(item.href.slice(1))
      if (el) sectionElements.set(item.href.slice(1), el)
    }

    const update = () => {
      tickingRef.current = false
      setScrolled(window.scrollY > 50)

      const navHeight = navRef.current?.getBoundingClientRect().height ?? 0
      const triggerY = navHeight + Math.min(window.innerHeight * 0.35, 320)

      // Check if at bottom - optimized
      const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight
      if (window.innerHeight + window.scrollY >= docHeight - 10) {
        setActiveSection('contact')
        return
      }

      // Find active section - early exit optimization
      let current: string | undefined
      for (const [sectionId, el] of sectionElements) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= triggerY && rect.bottom >= triggerY) {
          current = sectionId
          break
        }
      }
      if (current) setActiveSection(current)
    }

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true
        requestAnimationFrame(update)
      }
    }
    const onResize = () => update()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const scrollToSection = (href: string) => {
    // Special case: home should smoothly scroll to top
    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setIsOpen(false)
      return
    }
    const element = document.getElementById(href.slice(1))
    if (element) {
      const navHeight = navRef.current?.getBoundingClientRect().height ?? 0
      const desiredTop = element.getBoundingClientRect().top + window.scrollY - navHeight - 8 // small gap under navbar
      const top = Math.max(0, desiredTop)
      window.scrollTo({ top, behavior: 'smooth' })
    }
    setIsOpen(false)
  }

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  return (
    <motion.nav
      suppressHydrationWarning
      ref={(n) => { navRef.current = n as HTMLElement | null }}
      initial={false}
      animate={ hydrated ? { y: 0 } : undefined }
      style={!hydrated ? { transform: 'translateY(0)' } : undefined}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-lg border-b border-gray-700/30' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left cluster: theme toggle + logo */}
          <div className="flex items-center gap-3 lg:gap-4 -ml-3">
            <ThemeToggle variant="inline" className="-ml-1" />
            {/* Logo */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#home')
              }}
              className="inline-flex items-baseline gap-3 font-poppins hover:[animation-duration:3s]"
              aria-label="G. v. Suganthan home"
            >
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-rolling-text">Suganthan</span>
            </a>
          </motion.div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-8">
              {menuItems.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(item.href)
                  }}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                    activeSection === item.href.slice(1)
                      ? 'text-neon-blue'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {item.label}
                  {activeSection === item.href.slice(1) && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple"
                      layoutId="activeIndicator"
                      initial={false}
                    />
                  )}
                </motion.a>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <motion.button
              suppressHydrationWarning
              onClick={() => scrollToSection('#contact')}
              className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium rounded-full hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Let&apos;s Talk
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <motion.button
              suppressHydrationWarning
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isOpen ? 1 : 0, 
          height: isOpen ? 'auto' : 0 
        }}
        transition={{ duration: 0.3 }}
        className="lg:hidden overflow-hidden bg-background/95 backdrop-blur-lg border-t border-gray-700/30"
      >
        <div className="px-4 py-6 space-y-4">
          {menuItems.map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(item.href)
              }}
              className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors duration-300 ${
                activeSection === item.href.slice(1)
                  ? 'text-neon-blue bg-neon-blue/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: isOpen ? 1 : 0, 
                x: isOpen ? 0 : -20 
              }}
              transition={{ delay: index * 0.1 }}
            >
              {item.label}
            </motion.a>
          ))}
          
          {/* Mobile CTA Button */}
          <motion.button
            suppressHydrationWarning
            onClick={() => scrollToSection('#contact')}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isOpen ? 1 : 0, 
              y: isOpen ? 0 : 20 
            }}
            transition={{ delay: menuItems.length * 0.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Let&apos;s Talk
          </motion.button>
        </div>
      </motion.div>
    </motion.nav>
  )
}

export default Navigation