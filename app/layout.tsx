// import type { Metadata } from 'next'
// import { Geist, Geist_Mono } from 'next/font/google'
// import { Analytics } from '@vercel/analytics/next'
// import './globals.css'
// import { RootLayoutClient } from './layout-client'
// import { Toaster } from 'sonner'
// import { ThemeProvider } from '@/components/theme-provider'

// const _geist = Geist({ subsets: ["latin"] });
// const _geistMono = Geist_Mono({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: 'Drop APHI - Unified Communication Infrastructure',
//   description: 'Drop APHI: SMS, Email, OTP, and File Storage APIs for Users',
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
//     <html lang="en">
//       <body className="font-sans antialiased">
//         <RootLayoutClient>
//          <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           {children}
//         </ThemeProvider>
//           <Toaster position='bottom-center'  />
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
import localFont from 'next/font/local';

// Using locally hosted fonts to avoid build-time network fetches
// Fonts located at app/public/fonts (already in repo)
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
});

export const metadata: Metadata = {
  title: 'Drop APHI - Unified Communication Infrastructure',
  description: 'Drop APHI: SMS, Email, OTP, and File Storage APIs for Users',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${ubuntuSans.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <RootLayoutClient>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster position='bottom-center' />
        </RootLayoutClient>
        <Analytics />
      </body>
    </html>
  )
}