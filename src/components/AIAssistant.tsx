"use client"

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, Send, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type Msg = { id: string; role: 'user' | 'assistant'; content: string }

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState<'openrouter' | 'openai' | 'local' | null>(null)
  const [showLocalNotice, setShowLocalNotice] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([{
    id: 'hello', role: 'assistant', content: "Hi! I’m your portfolio assistant. Ask me about my projects, skills, or how to get in touch."
  }])
  const reduce = useReducedMotion()
  const listRef = useRef<HTMLDivElement>(null)
  const promptChips: { label: string; target?: string; text: string }[] = [
    { label: 'Go to About', target: 'about', text: 'Go to About' },
    { label: 'Show my projects', target: 'projects', text: 'Show my projects' },
    { label: 'Go to Skills', target: 'skills', text: 'Go to Skills' },
    { label: 'Go to Education', target: 'experience', text: 'Go to Education' },
    { label: 'What skills do you use?', target: 'skills', text: 'What skills do you use?' },
    { label: 'Tell me about your experience', target: 'experience', text: 'Tell me about your experience' },
    { label: 'Scroll to contact', target: 'contact', text: 'Scroll to contact' },
  ]

  // Scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduce ? 'auto' : 'smooth' })
  }, [messages, reduce])

  // Load conversation from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-assistant:conversation')
      const savedProvider = localStorage.getItem('ai-assistant:provider') as typeof provider | null
      const dismissed = localStorage.getItem('ai-assistant:localNotice:dismissed') === '1'
      if (saved) {
        const parsed = JSON.parse(saved) as Msg[]
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed)
        }
      }
      if (savedProvider === 'openai' || savedProvider === 'openrouter' || savedProvider === 'local') {
        setProvider(savedProvider)
        if (savedProvider === 'local' && !dismissed) setShowLocalNotice(true)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist conversation on updates
  useEffect(() => {
    try {
      localStorage.setItem('ai-assistant:conversation', JSON.stringify(messages))
      if (provider) localStorage.setItem('ai-assistant:provider', provider)
      const dismissed = localStorage.getItem('ai-assistant:localNotice:dismissed') === '1'
      if (provider === 'local' && !dismissed) setShowLocalNotice(true)
    } catch {}
  }, [messages, provider])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return false
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    ;(el as HTMLElement).focus?.()
    return true
  }

  const handleLocalCommand = (text: string): boolean => {
    const t = text.toLowerCase()
    const scrollTo = (id: string) => scrollToSection(id)
    // Friendly greeting without API
    if (/^(hi|hii+|hello|hey|hiya|yo|hola|namaste|bonjour|hallo|sup|good\s+(morning|afternoon|evening))\b/.test(t)) {
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Hey! I’m here—want me to jump to a section? Try “show projects”, “go to skills”, or “scroll to contact”.' }])
      return true
    }
    // Provider debug command
    if (t.trim() === '/provider') {
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: `Provider: ${provider ?? 'unknown'}` }])
      return true
    }
    if (/(show|go to|open|scroll).*project/.test(t)) {
      scrollTo('projects')
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Jumping to Projects…' }])
      return true
    }
    if (/(show|go to|open|scroll).*skill/.test(t)) {
      scrollTo('skills')
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Here are the Skills.' }])
      return true
    }
    if (/(show|go to|open|scroll).*contact/.test(t)) {
      scrollTo('contact')
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Opening Contact…' }])
      return true
    }
    if (/(show|go to|open|scroll).*about/.test(t) || (/about/.test(t) && /(show|go|open|scroll)/.test(t))) {
      scrollTo('about')
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Scrolling to About…' }])
      return true
    }
    if (/(show|go to|open|scroll).*experience/.test(t)) {
      scrollTo('experience')
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Opening Experience…' }])
      return true
    }
    if (/(show|go to|open|scroll).*education/.test(t)) {
      scrollTo('experience')
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Opening Education…' }])
      return true
    }
    return false
  }

  const send = async (overrideText?: string, navTargetId?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    // If a chip provided a navigation target, defer scrolling until after we show a response
    if (!navTargetId) {
      // Handle local shortcuts first (no API call)
      if (handleLocalCommand(text)) {
        return
      }
    }
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.concat(userMsg) }),
      })
      const data = await res.json()
      const reply: Msg = { id: crypto.randomUUID(), role: 'assistant', content: String(data?.reply ?? 'Sorry, no response.') }
      if (data?.provider) setProvider(data.provider)
      setMessages(m => [...m, reply])
    } catch (e: any) {
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: `Error: ${e?.message || 'network'}` }])
    } finally {
      setLoading(false)
      // Navigate after reply if a chip requested it
      if (navTargetId) {
        const id = navTargetId
        if (scrollToSection(id)) {
          const label = id.charAt(0).toUpperCase() + id.slice(1)
          setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: `Navigated to ${label}.` }])
        }
      }
    }
  }

  const variants = useMemo(() => ({
    panel: {
      hidden: { opacity: 0, y: 16, scale: reduce ? 1 : 0.98 },
      visible: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 16, scale: reduce ? 1 : 0.98 },
    },
  }), [reduce])

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] sm:bottom-8 sm:right-8">
      {/* Toggle button */}
      <motion.button
        suppressHydrationWarning
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        whileHover={reduce ? undefined : { scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(o => !o)}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants.panel}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-auto absolute bottom-16 right-0 w-[92vw] max-w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-white">AI Assistant</div>
                {provider && (
                  <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                    {provider === 'openrouter' ? 'OpenRouter' : provider === 'openai' ? 'OpenAI' : 'Local'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-[10px] uppercase tracking-wide text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                  onClick={() => {
                    setMessages([{ id: 'hello', role: 'assistant', content: 'Hi! I’m your portfolio assistant. Ask me about my projects, skills, or how to get in touch.' }])
                    setProvider(null)
                    setShowLocalNotice(false)
                    try {
                      localStorage.removeItem('ai-assistant:conversation')
                      localStorage.removeItem('ai-assistant:provider')
                      localStorage.removeItem('ai-assistant:localNotice:dismissed')
                    } catch {}
                  }}
                >
                  Clear
                </button>
                <button aria-label="Close" className="rounded-md p-1 text-white/70 hover:text-white" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Local provider notice */}
            {showLocalNotice && provider === 'local' && (
              <div className="px-4 py-2 bg-amber-500/10 text-amber-200 text-xs border-b border-amber-400/20" role="status" aria-live="polite">
                <div className="flex items-center justify-between gap-2">
                  <span>Answering from offline portfolio data</span>
                  <button
                    type="button"
                    className="rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200 hover:text-amber-100 hover:bg-amber-400/10 border border-amber-400/20"
                    onClick={() => {
                      setShowLocalNotice(false)
                      try { localStorage.setItem('ai-assistant:localNotice:dismissed', '1') } catch {}
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto px-3 py-3 space-y-2">
              {messages.map(m => (
                <div key={m.id} className={`${m.role === 'user' ? 'justify-end' : 'justify-start'} flex`}>
                  <div className={`${m.role === 'user' ? 'bg-neon-purple/20 text-white' : 'bg-white/10 text-white/90'} max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed backdrop-blur-sm border border-white/10`}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white/80 max-w-[80%] rounded-2xl px-3 py-2 text-sm border border-white/10">Thinking…</div>
                </div>
              )}
            </div>
            {/* Suggested prompts */}
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {promptChips.map(({ label, target, text }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { void send(text, target) }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:text-white hover:bg-white/10"
                >
                  {label}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2 border-t border-white/10 p-3"
              onSubmit={(e) => { e.preventDefault(); send() }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about projects, skills, contact…"
                className="flex-1 rounded-xl bg-white/10 text-white placeholder:text-white/50 px-3 py-2 text-sm outline-none border border-white/10 focus:border-neon-blue/50"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-neon-blue/80 hover:bg-neon-blue text-white px-3 py-2 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
