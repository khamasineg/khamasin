import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import Ticker from '@/components/ui/Ticker'
import CartDrawer from '@/components/cart/CartDrawer'
import Loader from '@/components/ui/Loader'
import SmoothScroll from '@/components/ui/SmoothScroll'
import ContourWind from '@/components/ui/ContourWind'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.khamsin.com'),
  title: {
    default: 'KHAMSIN — Cut for the wind.',
    template: '%s — KHAMSIN',
  },
  description: 'Unisex trousers, wide-leg pants, and tailored shorts in the tonal language of the desert. No denim, no noise. Based in Cairo, Egypt.',
  keywords: [
    'khamsin trousers',
    'wide-leg pants egypt',
    'unisex trousers egypt',
    'tailored shorts egypt',
    'desert-inspired clothing',
    'contemporary trousers cairo',
    'premium bottoms egypt',
    'palazzo pants egypt',
    'بناطيل مصر',
    'ملابس صحراوية',
  ],
  authors: [{ name: 'KHAMSIN' }],
  creator: 'KHAMSIN',
  publisher: 'KHAMSIN',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.khamsin.com',
    siteName: 'KHAMSIN',
    title: 'KHAMSIN — Cut for the wind.',
    description: 'Unisex trousers, wide-leg pants, and tailored shorts in the tonal language of the desert. No denim, no noise. Based in Cairo, Egypt.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KHAMSIN — Cut for the wind',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KHAMSIN — Cut for the wind.',
    description: 'Unisex trousers, wide-leg pants, and tailored shorts in the tonal language of the desert.',
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap"
          as="style"
        />
      </head>
      <body className="bg-parchment text-ink">
        <Loader />
        <ContourWind />
        <SmoothScroll />
        <Ticker />
        <Nav />
        <CartDrawer />
        <div>
          <PageTransition>
            {children}
          </PageTransition>
        </div>
        <Footer />
      </body>
    </html>
  )
}