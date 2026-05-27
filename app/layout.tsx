import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const dynamic = 'force-dynamic'

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    default: 'Lokro — Servicios locales a tu alcance',
    template: '%s | Lokro',
  },
  description:
    'Encuentra fontaneros, electricistas, tutores y más cerca de ti. Reserva en minutos con garantía de calidad.',
  keywords: ['servicios locales', 'fontanero', 'electricista', 'tutor', 'marketplace'],
  authors: [{ name: 'Lokro' }],
  openGraph: {
    title: 'Lokro — Servicios locales a tu alcance',
    description:
      'Encuentra fontaneros, electricistas, tutores y más cerca de ti.',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Lokro',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Lokro — Servicios locales a tu alcance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lokro — Servicios locales a tu alcance',
    description:
      'Encuentra fontaneros, electricistas, tutores y más cerca de ti.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/og-image.png`],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${plusJakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
