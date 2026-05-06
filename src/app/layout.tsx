import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import Grain from '@/components/ui/Grain'
import Cursor from '@/components/ui/Cursor'
import Ticker from '@/components/ui/Ticker'
import CartDrawer from '@/components/cart/CartDrawer'
import Loader from '@/components/ui/Loader'
import SmoothScroll from '@/components/ui/SmoothScroll'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.fyndethevintage.com'),
  title: {
    default: 'FYNDE — Rare finds, beautifully worn.',
    template: '%s — FYNDE',
  },
  description: 'Curated vintage & deadstock clothing from the 60s through the 90s. One of one pieces, carefully sourced. Based in Cairo, Egypt.',
  keywords: [
    'vintage clothing egypt',
    'deadstock cairo',
    'rare vintage wear',
    'vintage fashion egypt',
    '60s 70s 80s 90s vintage',
    'curated vintage cairo',
    'one of one vintage',
    'vintage deadstock egypt',
    'فينتاج مصر',
    'ملابس فينتاج',
  ],
  authors: [{ name: 'FYNDE' }],
  creator: 'FYNDE',
  publisher: 'FYNDE',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'www.fyndethevintage.com',
    siteName: 'FYNDE',
    title: 'FYNDE — Rare finds, beautifully worn.',
    description: 'Curated vintage & deadstock clothing from the 60s through the 90s. One of one pieces, carefully sourced. Based in Cairo, Egypt.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FYNDE — Rare vintage wear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FYNDE — Rare finds, beautifully worn.',
    description: 'Curated vintage & deadstock clothing from the 60s through the 90s. One of one pieces, carefully sourced.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon.png',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          as="style"
        />
      </head>
      <body className="bg-parchment text-ink">
        <Loader />
        <Grain />
        <Cursor />
        <SmoothScroll />
        <Ticker />
        <Nav />
        <CartDrawer />
        <div className="pt-[88px] md:pt-0">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
        <Footer />
      </body>
    </html>
  )
}