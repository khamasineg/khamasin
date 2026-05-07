import { Suspense } from 'react'
import ShopGrid from '@/components/shop/ShopGrid'
import FilterBar from '@/components/shop/FilterBar'

export const metadata = {
  title: 'Shop',
  description: 'Browse the full FYNDE archive. Rare vintage and deadstock pieces from the 60s through the 90s.',
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-parchment">

      {/* Header */}
      <div className="px-6 pt-32 pb-12 md:px-10 md:pt-40 border-b border-taupe-light">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-taupe mb-4 flex items-center gap-3">
          <span className="h-px w-6 bg-taupe-light inline-block" />
          The full archive
        </p>
        <h1
          className="font-serif font-light leading-[0.9] mb-4"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)' }}
        >
          The<br />
          <em className="italic text-sienna">Archive.</em>
        </h1>
        <p
          className="font-mono text-[0.6rem] leading-loose tracking-wide max-w-sm"
          style={{ color: 'rgba(28,25,23,0.5)' }}
        >
          Every piece sourced by hand. One of one. When it is gone, it is gone.
        </p>
      </div>

      {/* Filter Bar */}
      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>

      {/* Product Grid */}
      <Suspense fallback={
        <div className="px-6 py-12 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-taupe-light aspect-[3/4] w-full mb-3" />
                <div className="h-3 bg-taupe-light rounded w-2/3 mb-2" />
                <div className="h-3 bg-taupe-light rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      }>
        <ShopGrid />
      </Suspense>
    </main>
  )
}