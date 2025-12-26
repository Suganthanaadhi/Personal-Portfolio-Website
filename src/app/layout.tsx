import type { Metadata, Viewport } from 'next'
import AIAssistant from '../components/AIAssistant'
import CursorFX from '../components/CursorFX'
import { MotionProvider } from '../providers/MotionProvider'
import { ThemeProvider } from '../providers/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Suganthanaadhi | Web Developer & Designer',
  description: 'Portfolio of Suganthanaadhi – building realistic, performant, and visually engaging web experiences with Next.js, React, and modern UI engineering.',
  keywords: 'Suganthanaadhi, web developer, UI engineer, front-end developer, React, Next.js, portfolio, performance, accessibility',
  authors: [{ name: 'Suganthanaadhi', url: 'mailto:suganthanaadhi@gmail.com' }],
  openGraph: {
    title: 'Suganthanaadhi | Web Developer & Designer',
    description: 'Real-world ready web applications and immersive UI engineering.',
    type: 'website',
    locale: 'en_IN',
    url: 'https://example.com', // TODO: replace with real domain
  },
  metadataBase: new URL('https://example.com'), // TODO: replace with real domain
  icons: {
    icon: '/Personal-Portfolio-Website/favicon.svg',
    shortcut: '/Personal-Portfolio-Website/favicon.svg',
    apple: '/Personal-Portfolio-Website/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light', // Performance: allow browser to optimize rendering
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning style={{scrollBehavior: 'smooth'}}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://api.huggingface.co https://huggingface.co; img-src 'self' data:" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-inter bg-background text-foreground antialiased" suppressHydrationWarning style={{WebkitFontSmoothing: 'antialiased', textRendering: 'optimizeLegibility'}}>
        <ThemeProvider>
          <MotionProvider>
            {children}
            <AIAssistant />
            <CursorFX />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}