import { NextResponse } from 'next/server'

export async function GET() {
  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS)
  const resendConfigured = !!process.env.RESEND_API_KEY
  const emailjsConfigured = !!(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY && process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID && process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID)
  return NextResponse.json({
    ok: true,
    providers: {
      smtp: smtpConfigured,
      resend: resendConfigured,
      emailjs: emailjsConfigured,
    },
    any: smtpConfigured || resendConfigured || emailjsConfigured,
  })
}

export const runtime = 'nodejs'