



// // app/layout.tsx
// import type { Metadata } from 'next'
// import { Analytics } from '@vercel/analytics/next'
// import './globals.css'
// import { RootLayoutClient } from './layout-client'
// import { Toaster } from 'sonner'
// import { ThemeProvider } from '@/components/theme-provider'
// import localFont from 'next/font/local';

// // Using locally hosted fonts to avoid build-time network fetches
// // Fonts located at app/public/fonts (already in repo)
// const ubuntuSans = localFont({
//   src: [
//     { path: './public/fonts/Ubuntu-Light.ttf', weight: '300', style: 'normal' },
//     { path: './public/fonts/Ubuntu-Italic.ttf', weight: '400', style: 'italic' },
//     { path: './public/fonts/Ubuntu-Regular.ttf', weight: '400', style: 'normal' },
//     { path: './public/fonts/Ubuntu-Medium.ttf', weight: '500', style: 'normal' },
//     { path: './public/fonts/Ubuntu-MediumItalic.ttf', weight: '500', style: 'italic' },
//     { path: './public/fonts/Ubuntu-Bold.ttf', weight: '700', style: 'normal' },
//     { path: './public/fonts/Ubuntu-BoldItalic.ttf', weight: '700', style: 'italic' },
//   ],
//   variable: '--font-sans',
//   display: 'swap',
// });

// export const metadata: Metadata = {
//   title: 'DropAPHI - Unified Communication Infrastructure',
//   description: 'DropAPHI: SMS, Email, OTP, and File Storage APIs for Users',
//   generator: 'sixthgrid',
//   icons: {
//     icon: [
//       {
//         url: '/icon-light-32x32.png',
//         media: '(prefers-color-scheme: light)',
//       },
//       {
//         url: '/icon-dark-32x32.png',
//         media: '(prefers-color-scheme: dark)',
//       },
//       {
//         url: '/icon.svg',
//         type: 'image/svg+xml',
//       },
//     ],
//     apple: '/apple-icon.png',
//   },
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html className={`${ubuntuSans.variable}`} suppressHydrationWarning>
//       <body className="antialiased">
//         <RootLayoutClient>
//           <ThemeProvider
//             attribute="class"
//             defaultTheme="system"
//             enableSystem
//             disableTransitionOnChange
//           >
//             {children}
//           </ThemeProvider>
//           <Toaster position='bottom-center' />
//         </RootLayoutClient>
//         <Analytics />
//       </body>
//     </html>
//   )
// }























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
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },

  openGraph: {
    title: 'DropAPHI - Unified Messaging API',
    description:
      'Replace Twilio, SendGrid, and Firebase with one API. Send Email, SMS, WhatsApp, verify users, and scale faster.',
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
    title: 'DropAPHI - Messaging API for Developers',
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