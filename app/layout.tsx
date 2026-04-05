import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Crimson_Pro, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { getSettings } from '@/app/actions/settings-actions'
import { buildThemeCss } from '@/lib/themes'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson-pro',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MF Digital Studio - QR Menü',
  description: 'MF Digital Studio tarafından restoran ve kafeler için geliştirilen premium QR menü çözümü',
  generator: 'v0.app',
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings()
  const themeCss = buildThemeCss(settings.theme, settings.borderRadius, settings.fontFamily)

  return (
    <html lang="tr" className={`${GeistSans.variable} ${dmSans.variable} ${crimsonPro.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
