'use client'

import { contact as contactData } from '@/data/contact'
import emailjs from 'emailjs-com'
import { AnimatePresence, motion } from 'framer-motion'
import { Github, Instagram, Linkedin, Mail, MapPin, Phone, Send, Twitter } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    honey: '' // honeypot field (should stay empty)
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'validation'>('idle')
  const [provider, setProvider] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string; message?: string }>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [providerStatus, setProviderStatus] = useState<{ smtp: boolean; resend: boolean; emailjs: boolean } | null>(null)
  const [noProvider, setNoProvider] = useState(false)
  const [touched, setTouched] = useState<{ name: boolean; email: boolean; message: boolean }>({ name: false, email: false, message: false })

  const nameRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const messageRef = useRef<HTMLTextAreaElement | null>(null)

  // Provider status check removed - using static export without API routes

  const validateAll = (data = formData) => {
    const errs: { name?: string; email?: string; phone?: string; message?: string } = {}
    const n = data.name.trim()
    const e = data.email.trim()
    const m = data.message.trim()
    if (!n || n.length < 2) errs.name = 'Name must be at least 2 characters.'
    if (!e || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) errs.email = 'Enter a valid email address.'
    if (!m || m.length < 8) errs.message = 'Message must be at least 8 characters.'
    else if (m.length > 3000) errs.message = 'Message too long (max 3000).' 
    return errs
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const updated = { ...formData, [name]: value }
    setFormData(updated)
    // real-time validation for touched fields
    if (name === 'name' || name === 'email' || name === 'message') {
      if (touched[name as keyof typeof touched]) {
        const errs = validateAll(updated)
        setFieldErrors(prev => ({ ...prev, [name]: (errs as any)[name] }))
      }
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    if (name === 'name' || name === 'email' || name === 'message') {
      setTouched(prev => ({ ...prev, [name]: true }))
      const errs = validateAll()
      setFieldErrors(prev => ({ ...prev, [name]: (errs as any)[name] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFieldErrors({})
    setGeneralError(null)

    // Final full validation
    const clientErrs = validateAll()
    if (Object.keys(clientErrs).length) {
      setFieldErrors(clientErrs)
      setIsSubmitting(false)
      setSubmitStatus('validation')
      // focus first invalid
      if (clientErrs.name) nameRef.current?.focus()
      else if (clientErrs.email) emailRef.current?.focus()
      else if (clientErrs.message) messageRef.current?.focus()
      return
    }

    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID

    if (!publicKey || !serviceId || !templateId) {
      console.warn('[Contact] Missing EmailJS environment variables.')
    }

    try {
      let delivered = false
      // Prefer server route for reliability
      if (!formData.honey) {
        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              message: formData.message,
              honey: formData.honey,
            })
          })
          const data = await res.json().catch(() => null)
          if (res.ok && data?.ok) {
            delivered = true
            setProvider(data.provider || 'smtp')
          } else if (res.status === 400 && data) {
            const newFieldErrors = {
              name: data.fieldErrors?.name || undefined,
              email: data.fieldErrors?.email || undefined,
              // phone intentionally ignored for validation now
              message: data.fieldErrors?.message || undefined,
            }
            setFieldErrors(newFieldErrors)
            // Only show a small guidance message if needed (avoid generic failure banner)
            if (!Object.values(newFieldErrors).every(v => !!v)) {
              setGeneralError(data.errors?.[0] || 'Please correct the highlighted fields.')
            }
            // Do NOT fallback to EmailJS on validation failure
            delivered = false
            throw new Error('validation')
          } else if (res.status >= 500) {
            if (data?.code === 'NO_PROVIDER') {
              setNoProvider(true)
              setGeneralError('Email delivery not configured yet. Configure Resend (recommended) or SMTP. Falling back to client if possible.')
            } else {
              setGeneralError(data?.error ? `${data.error}${data.code ? ' (' + data.code + ')' : ''}` : 'Server error. Attempting fallback delivery...')
            }
            if (data?.code) setProvider(data.code)
          }
        } catch (err: any) {
          if (err.message === 'validation') {
            // stop further processing
          } else {
            // proceed to fallback
          }
        }
      }

      if (!delivered) {
        if (publicKey && serviceId && templateId) {
          emailjs.init(publicKey)
          const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            from_phone: formData.phone || 'N/A',
            message: formData.message,
            to_email: contactData.email,
          }
          await emailjs.send(serviceId, templateId, templateParams)
          delivered = true
          setProvider(prev => prev || 'emailjs')
        } else {
          await new Promise(r => setTimeout(r, 800))
        }
      }

  setSubmitStatus(delivered ? 'success' : (submitStatus === 'validation' ? 'validation' : 'error'))
      if (delivered) {
        setFormData({ name: '', email: '', phone: '', message: '', honey: '' })
        setFieldErrors({})
        setGeneralError(null)
        setTouched({ name: false, email: false, message: false })
      }
    } catch (error) {
      console.error('[Contact] Email send failed', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus('idle'), 5000)
    }
  }

  const contactInfo = [
    contactData.email && { icon: Mail, label: 'Email', value: contactData.email, href: `mailto:${contactData.email}` },
    contactData.phone && { icon: Phone, label: 'Phone', value: contactData.phone, href: `tel:${contactData.phone.replace(/[^+\d]/g,'')}` },
    contactData.location && { icon: MapPin, label: 'Location', value: contactData.location, href: '#' },
  ].filter(Boolean) as Array<{ icon: any; label: string; value: string; href: string }>

  const socialLinks = [
    contactData.socials?.github && { icon: Github, label: 'GitHub', href: contactData.socials.github, color: 'hover:text-gray-400' },
    contactData.socials?.linkedin && { icon: Linkedin, label: 'LinkedIn', href: contactData.socials.linkedin, color: 'hover:text-blue-400' },
    contactData.socials?.twitter && { icon: Twitter, label: 'Twitter', href: contactData.socials.twitter, color: 'hover:text-blue-300' },
    contactData.socials?.instagram && { icon: Instagram, label: 'Instagram', href: contactData.socials.instagram, color: 'hover:text-pink-400' },
  ].filter(Boolean) as Array<{ icon: any; label: string; href: string; color: string }>

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-gray-900/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold font-poppins mb-6">
            Get In{' '}
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Have a project in mind or want to collaborate? I&apos;d love to hear from you. 
            Let&apos;s create something amazing together!
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start"
        >
          {/* Contact Information */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-white">
                Let&apos;s Start a Conversation
              </h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                Whether you have a question about my work, want to discuss a potential 
                project, or just want to say hello, I&apos;m always excited to connect with 
                fellow developers and potential collaborators.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              {contactInfo.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 p-4 glass rounded-xl border border-gray-700/50 hover:border-neon-blue/50 transition-all duration-300 group"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                  >
                    <div className="p-3 bg-neon-blue/10 rounded-lg group-hover:bg-neon-blue/20 transition-colors duration-300">
                      <IconComponent className="w-5 h-5 text-neon-blue" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{item.label}</p>
                      <p className="text-white font-medium">{item.value}</p>
                    </div>
                  </motion.a>
                )
              })}
            </div>

            {/* Social Media */}
            <motion.div variants={itemVariants} className="pt-8">
              <h4 className="text-lg font-semibold mb-4 text-white">Follow Me</h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 glass rounded-lg border border-gray-700/50 hover:border-neon-blue/50 text-gray-400 ${social.color} transition-all duration-300`}
                      whileHover={{ 
                        scale: 1.1,
                        y: -2,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot field (hidden from users) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  name="honey"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.honey}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                  Full Name
                </label>
                <motion.input
                  suppressHydrationWarning
                  type="text"
                  id="name"
                  name="name"
                  ref={nameRef}
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:ring-1 focus:outline-none transition-all duration-300 text-white placeholder-gray-500 
                  ${fieldErrors.name && touched.name ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/40' : ''}
                  ${!fieldErrors.name && touched.name && formData.name.trim() ? 'border-green-500/60 focus:border-green-500 focus:ring-green-500/30' : ''}
                  ${!touched.name ? 'border-gray-700/50 focus:border-neon-blue focus:ring-neon-blue' : ''}`}
                  placeholder="Enter your full name"
                  whileFocus={{ scale: 1.02 }}
                />
                <AnimatePresence initial={false} mode="wait">
                  {fieldErrors.name && (
                    <motion.p
                      id="name-error"
                      className="mt-2 text-sm text-red-400"
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      {fieldErrors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <motion.input
                  suppressHydrationWarning
                  type="email"
                  id="email"
                  name="email"
                  ref={emailRef}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:ring-1 focus:outline-none transition-all duration-300 text-white placeholder-gray-500 
                  ${fieldErrors.email && touched.email ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/40' : ''}
                  ${!fieldErrors.email && touched.email && formData.email.trim() ? 'border-green-500/60 focus:border-green-500 focus:ring-green-500/30' : ''}
                  ${!touched.email ? 'border-gray-700/50 focus:border-neon-blue focus:ring-neon-blue' : ''}`}
                  placeholder="Enter your email address"
                  whileFocus={{ scale: 1.02 }}
                />
                <AnimatePresence initial={false} mode="wait">
                  {fieldErrors.email && (
                    <motion.p
                      id="email-error"
                      className="mt-2 text-sm text-red-400"
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      {fieldErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
                  Phone (optional)
                </label>
                <motion.input
                  suppressHydrationWarning
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg focus:border-neon-blue focus:ring-1 focus:ring-neon-blue focus:outline-none transition-all duration-300 text-white placeholder-gray-500"
                  placeholder="Enter your phone number"
                  whileFocus={{ scale: 1.02 }}
                />
                {/* Phone has no validation errors now */}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">
                  Message
                </label>
                <motion.textarea
                  suppressHydrationWarning
                  id="message"
                  name="message"
                  ref={messageRef}
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={6}
                  required
                  aria-invalid={!!fieldErrors.message}
                  aria-describedby={fieldErrors.message ? 'message-error' : 'message-help'}
                  className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg focus:ring-1 focus:outline-none transition-all duration-300 text-white placeholder-gray-500 resize-none
                  ${fieldErrors.message && touched.message ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/40' : ''}
                  ${!fieldErrors.message && touched.message && formData.message.trim() ? 'border-green-500/60 focus:border-green-500 focus:ring-green-500/30' : ''}
                  ${!touched.message ? 'border-gray-700/50 focus:border-neon-blue focus:ring-neon-blue' : ''}`}
                  placeholder="Tell me about your project or just say hello..."
                  whileFocus={{ scale: 1.02 }}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <AnimatePresence initial={false} mode="wait">
                    {fieldErrors.message ? (
                      <motion.p
                        key="msg-error"
                        id="message-error"
                        className="text-red-400"
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                      >
                        {fieldErrors.message}
                      </motion.p>
                    ) : (
                      <motion.p
                        key="msg-help"
                        id="message-help"
                        className="text-gray-500"
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.15 }}
                      >
                        Min 8 chars • Max 3000
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className={`ml-auto ${formData.message.length > 3000 ? 'text-red-400' : 'text-gray-500'}`}>{formData.message.length}/3000</p>
                </div>
              </div>

              <motion.button
                suppressHydrationWarning
                type="submit"
                disabled={isSubmitting || Object.keys(validateAll()).length > 0}
                className="w-full py-4 px-6 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </motion.button>

              {/* General Error */}
              <AnimatePresence mode="wait">
                {generalError && (submitStatus === 'error' || submitStatus === 'validation') && !noProvider && (
                  <motion.div
                    key="general-error"
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center"
                  >
                    {generalError}{provider ? ` [${provider}]` : ''}
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {noProvider && (
                  <motion.div
                    key="no-provider"
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.25 }}
                    className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm space-y-2"
                  >
                    <p><strong>Email not fully configured.</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-left">
                      <li>Add RESEND_API_KEY to .env.local (quickest).</li>
                      <li>Or configure SMTP_* variables.</li>
                      <li>Or add EmailJS public keys for client fallback.</li>
                    </ol>
                    {providerStatus && (
                      <p className="text-xs opacity-80">Detected: SMTP {providerStatus.smtp ? '✅' : '❌'} | Resend {providerStatus.resend ? '✅' : '❌'} | EmailJS {providerStatus.emailjs ? '✅' : '❌'}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-center"
                >
                  Message sent successfully via {provider || 'server'}! I&apos;ll get back to you soon.
                </motion.div>
              )}
              
              {submitStatus === 'error' && !generalError && !noProvider && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center"
                >
                  Something went wrong. Please try again later.
                </motion.div>
              )}
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-20 pt-8 border-t border-gray-700/30 text-center"
      >
        <p className="text-gray-400">
          © {new Date().getFullYear()} Suganthanaadhi. Built with{' '}
          <span className="text-neon-blue">Next.js</span>,{' '}
          <span className="text-neon-purple">Tailwind CSS</span>, and{' '}
          <span className="text-neon-pink">Framer Motion</span>. All rights reserved.
        </p>
      </motion.footer>
    </section>
  )
}

export default Contact