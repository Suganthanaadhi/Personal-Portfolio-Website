import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Optional: dynamic import not needed for fetch (Node 18+ provides global fetch)

// Basic rate limiting (in-memory) – resets on server restart
const WINDOW_MS = 60_000 // 1 minute
const MAX_PER_WINDOW = 5
const recentIPs: Record<string, { count: number; first: number }> = {}

function rateLimit(ip: string) {
  const now = Date.now()
  const rec = recentIPs[ip] || { count: 0, first: now }
  if (now - rec.first > WINDOW_MS) {
    rec.count = 0
    rec.first = now
  }
  rec.count++
  recentIPs[ip] = rec
  return rec.count <= MAX_PER_WINDOW
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!rateLimit(ip)) {
      return NextResponse.json({ ok: false, error: 'Too many requests. Please wait a minute.' }, { status: 429 })
    }

  const body = await req.json().catch(() => null as any)
  const { name = '', email = '', phone = '', message = '', honey = '' } = body || {}

    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    }

    // Honeypot field: if filled, treat as spam silently succeed
    if (honey) {
      return NextResponse.json({ ok: true, spam: true, provider: 'discard' })
    }

    // Validation
    const errors: string[] = []
    if (!trimmed.name || trimmed.name.length < 2) errors.push('Name must be at least 2 characters.')
    if (!trimmed.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed.email)) errors.push('Enter a valid email address.')
    if (!trimmed.message || trimmed.message.length < 8) errors.push('Message must be at least 8 characters.')
    // Phone now fully optional; no server-side validation to avoid user friction.
    if (trimmed.message.length > 3000) errors.push('Message is too long (max 3000 characters).')
    if (errors.length) {
      return NextResponse.json({ ok: false, errors, fieldErrors: {
        name: errors.find(e => e.toLowerCase().includes('name')) || null,
        email: errors.find(e => e.toLowerCase().includes('email')) || null,
  // phone intentionally omitted from validation mapping (optional)
        message: errors.find(e => e.toLowerCase().includes('message')) || null,
      } }, { status: 400 })
    }

    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '0', 10)
    const secure = process.env.SMTP_SECURE === 'true'
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const to = process.env.CONTACT_TO_EMAIL || 'suganthanaadhi@gmail.com'
    const from = process.env.CONTACT_FROM_EMAIL || user || 'noreply@example.com'

    const smtpConfigured = !!(host && port && user && pass)

    const debug = process.env.CONTACT_DEBUG === 'true'
    if (debug) console.log('[contact api] smtpConfigured=', smtpConfigured)

    // Prepare email content early so Resend (which may run before SMTP) has access
    const mailSubject = `Portfolio Contact: ${trimmed.name} <${trimmed.email}>`
    const textBody = [
      `Name: ${trimmed.name}`,
      `Email: ${trimmed.email}`,
      `Phone: ${trimmed.phone || 'N/A'}`,
      `IP: ${ip}`,
      '',
      trimmed.message,
    ].join('\n')

  const htmlBody = `<!DOCTYPE html><html><body style="font-family:system-ui,Segoe UI,Arial,sans-serif;line-height:1.5;color:#111;padding:16px">\n<h2 style="margin:0 0 12px">New Portfolio Message</h2>\n<p><strong>Name:</strong> ${escapeHtml(trimmed.name)}</p>\n<p><strong>Email:</strong> ${escapeHtml(trimmed.email)}</p>\n<p><strong>Phone:</strong> ${escapeHtml(trimmed.phone || 'N/A')}</p>\n<p><strong>IP:</strong> ${escapeHtml(ip)}</p>\n<hr style="margin:20px 0"/>\n<p style="white-space:pre-wrap">${escapeHtml(trimmed.message)}</p>\n</body></html>`

    async function sendViaResend() {
      const resendKey = process.env.RESEND_API_KEY
      if (!resendKey) return { ok: false as const, reason: 'RESEND_NOT_CONFIGURED' }
      const resendTimeoutMs = parseInt(process.env.RESEND_TIMEOUT_MS || '8000', 10)
      const resendRetries = Math.max(0, Math.min(5, parseInt(process.env.RESEND_RETRIES || '2', 10)))

      for (let attempt = 0; attempt <= resendRetries; attempt++) {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), resendTimeoutMs)
        const started = Date.now()
        try {
          if (debug) console.log(`[contact api] attempting resend (attempt ${attempt + 1}/${resendRetries + 1})`)
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Portfolio <onboarding@resend.dev>',
              to: [to],
              subject: mailSubject,
              text: textBody,
              html: htmlBody,
              reply_to: trimmed.email,
            }),
            signal: controller.signal,
          })
          clearTimeout(timeout)
          if (resendRes.ok) {
            const payload = await resendRes.json().catch(() => null)
            if (debug) console.log('[contact api] resend success', payload?.id, `in ${Date.now() - started}ms`)
            return { ok: true as const, provider: 'resend' as const }
          }
          const errText = await resendRes.text().catch(() => '')
          if (debug) console.error('[contact api] resend error', resendRes.status, errText.slice(0, 300))
          // 5xx might be transient – retry; 4xx (except 408) usually permanent
          if (resendRes.status >= 500 && attempt < resendRetries) continue
          return { ok: false as const, reason: 'RESEND_HTTP_' + resendRes.status }
        } catch (e: any) {
          clearTimeout(timeout)
          const aborted = e?.name === 'AbortError'
          const causeCode = (e?.cause?.code || e?.code || '') as string
          let reason: string
            = aborted ? 'RESEND_TIMEOUT'
            : causeCode === 'UND_ERR_CONNECT_TIMEOUT' ? 'RESEND_CONNECT_TIMEOUT'
            : causeCode ? ('RESEND_NET_' + causeCode)
            : 'RESEND_EXCEPTION'
          if (debug) console.error('[contact api] resend exception', reason, e)
          // Retry on network / timeout if attempts remain
          if (attempt < resendRetries && /TIMEOUT|NET_|RESEND_EXCEPTION/.test(reason)) continue
          return { ok: false as const, reason }
        }
      }
      return { ok: false as const, reason: 'RESEND_UNKNOWN' }
    }

    // If SMTP not configured, attempt Resend directly
    if (!smtpConfigured) {
      const resendAttempt = await sendViaResend()
      if (resendAttempt.ok) {
        return NextResponse.json({ ok: true, provider: resendAttempt.provider })
      }
      return NextResponse.json({ ok: false, error: 'No email provider configured (need SMTP_* or RESEND_API_KEY)', code: 'NO_PROVIDER', details: resendAttempt.reason }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })

    let sent = false
    try {
      await transporter.sendMail({
        to,
        from,
        replyTo: trimmed.email,
        subject: mailSubject,
        text: textBody,
        html: htmlBody,
      })
      sent = true
      if (debug) console.log('[contact api] smtp success')
      return NextResponse.json({ ok: true, provider: 'smtp' })
    } catch (smtpErr: any) {
      if (debug) console.error('[contact api] smtp failure', smtpErr?.code, smtpErr?.response)
      // Try Resend fallback if configured
      const resendAttempt = await sendViaResend()
      if (resendAttempt.ok) {
        return NextResponse.json({ ok: true, provider: resendAttempt.provider, fallback: 'smtp_failed' })
      }
      return NextResponse.json({ ok: false, error: 'Delivery failed (SMTP + fallback)', code: smtpErr?.code || 'SMTP_ERROR', details: resendAttempt.reason }, { status: 502 })
    }
  } catch (err: any) {
    console.error('[contact api] fatal error', err)
    return NextResponse.json({ ok: false, error: 'Internal error', code: 'FATAL' }, { status: 500 })
  }
}

export const runtime = 'nodejs'

// Simple HTML escape utility
function escapeHtml(input: string) {
  return input.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] as string))
}