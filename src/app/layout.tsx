import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import Grain from '@/components/ui/Grain'
import Cursor from '@/components/ui/Cursor'
import Ticker from '@/components/ui/Ticker'

export const metadata: Metadata = {
  title: 'FYNDE — Rare finds, beautifully worn.',
  description: 'Curated vintage & deadstock clothing from the 60s through the 90s. Every piece authenticated, every piece one-of-one.',
  keywords: 'vintage clothing, deadstock, rare vintage, 60s 70s 80s 90s fashion, curated vintage',
  openGraph: {
    title: 'FYNDE — Rare finds, beautifully worn.',
    description: 'Curated vintage & deadstock clothing from the 60s through the 90s.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-parchment text-ink">
        <Grain />
        <Cursor />
        <Ticker />
        <Nav />
        <PageTransition>
          {children}
        </PageTransition>
        <Footer />
      </body>
    </html>
  )
}