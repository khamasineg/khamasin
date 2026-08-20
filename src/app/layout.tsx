import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import CartDrawer from '@/components/cart/CartDrawer'
import Loader from '@/components/ui/Loader'
import SmoothScroll from '@/components/ui/SmoothScroll'
import WindField from '@/components/wind/WindField'
import Grain from '@/components/ui/Grain'

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
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.khamsin.com',
    siteName: 'KHAMSIN',
    title: 'KHAMSIN — Cut for the wind.',
    description: 'Unisex trousers, wide-leg pants, and tailored shorts in the tonal language of the desert. No denim, no noise. Based in Cairo, Egypt.',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'KHAMSIN — Cut for the wind' }],
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
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // Icons are auto-generated from app/icon.tsx and app/apple-icon.tsx —
  // no manual icons block needed.
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="bg-parchment text-ink">
        {/* Signature wind field — fixed behind everything at z-0 */}
        <WindField />
        <Loader />
        <SmoothScroll />
        <Nav />
        <CartDrawer />
        <div className="relative z-10">
          <PageTransition>{children}</PageTransition>
        </div>
        <Footer />
        {/* Grain sits above content, below nav — see component for the
            CLAUDE.md §10 conflict note. */}
        <Grain />
      </body>
    </html>
  )
}
