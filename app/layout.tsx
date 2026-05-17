// app/layout.tsx
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { RootLayoutClient } from './layout-client'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import localFont from 'next/font/local'

// Local font setup
const ubuntuSans = localFont({
  src: [
    { path: './public/fonts/Ubuntu-Light.ttf', weight: '300', style: 'normal' },
    { path: './public/fonts/Ubuntu-Italic.ttf', weight: '400', style: 'italic' },
    { path: './public/fonts/Ubuntu-Regular.ttf', weight: '400', style: 'normal' },
    { path: './public/fonts/Ubuntu-Medium.ttf', weight: '500', style: 'normal' },
    { path: './public/fonts/Ubuntu-MediumItalic.ttf', weight: '500', style: 'italic' },
    { path: './public/fonts/Ubuntu-Bold.ttf', weight: '700', style: 'normal' },
    { path: './public/fonts/Ubuntu-BoldItalic.ttf', weight: '700', style: 'italic' },
  ],
  variable: '--font-sans',
  display: 'swap',
})

// ✅ SEO + Metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://dropaphi.xyz'),

  title: {
    default: 'DropAPHI - Replace Twilio, SendGrid & Firebase with One API',
    template: '%s | DropAPHI',
  },

  description:
    'DropAPHI is a unified API platform that replaces Twilio, SendGrid, Firebase, AWS, and OTP services. Send emails, SMS, WhatsApp, verify users, store files, and scale — all from one integration.',

  keywords: [
    'twilio alternative',
    'sendgrid alternative',
    'firebase alternative',
    'email api',
    'sms api',
    'whatsapp api',
    'otp api',
    'file storage api',
    'communication api',
    'developer messaging platform',
  ],

  authors: [{ name: 'Goldick' }],
  creator: 'Goldick',
  publisher: 'DropAPHI',
  generator: 'sixthgrid',

  icons: {
    icon: [
      {
        url: '/image/drop-logo.png',
        media: '(prefers-color-scheme: light)',
        type: 'image/png',
      },
      {
        url: '/image/drop-logo.png',
        media: '(prefers-color-scheme: dark)',
        type: 'image/png',
      },
      {
        url: '/image/drop-logo.png',
        type: 'image/png',
      },
    ],
    apple: '/image/drop-logo.png',
  },

  openGraph: {
    title: 'DropAPHI - A Unified infrastructure Platform ',
    description:
      'A unified infrastructure platform that replaces five separate vendors with a single API..',
    url: 'https://dropaphi.xyz',
    siteName: 'DropAPHI',
    images: [
      {
        url: '/image/drop-logo.jpg', // MUST exist in /public
        width: 1200,
        height: 630,
        alt: 'DropAPHI Messaging API',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'DropAPHI - A Unified infrastructure Platform ',
    description:
      'Send Email, SMS, WhatsApp, OTP, and manage storage with one simple API.',
    images: ['/image/drop-logo.jpg'],
  },

  robots: {
    index: true,
    follow: true,
  },

  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={ubuntuSans.variable} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <RootLayoutClient>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </RootLayoutClient>
        <Analytics />
      </body>
    </html>
  )
}