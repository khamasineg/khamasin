import { Suspense } from 'react'
import ShopGrid from '@/components/shop/ShopGrid'
import FilterBar from '@/components/shop/FilterBar'

export const metadata = {
  title: 'Shop — FYNDE',
  description: 'Browse the full FYNDE archive. Rare vintage and deadstock pieces from the 60s through the 90s.',
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-parchment">
      {/* Header */}
      <div className="px-6 pt-32 pb-8 md:px-16 md:pt-40">
        <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">
          The full archive
        </p>
        <h1 className="font-display text-5xl md:text-8xl tracking-wider text-ink uppercase">
          Shop
        </h1>
      </div>

      {/* Filter Bar */}
      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>

      {/* Product Grid */}
      <Suspense fallback={
        <div className="px-6 py-12 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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