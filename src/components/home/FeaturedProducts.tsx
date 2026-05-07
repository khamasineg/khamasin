'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import ProductCard from '@/components/shop/ProductCard'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchFeatured() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sold', false)
        .order('created_at', { ascending: false })
        .limit(8)

      if (!error && data) setProducts(data)
      setLoading(false)
    }
    fetchFeatured()
  }, [])

  // Update arrow states on scroll / resize
  const syncArrows = () => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    syncArrows()
    el.addEventListener('scroll', syncArrows, { passive: true })
    window.addEventListener('resize', syncArrows)
    return () => {
      el.removeEventListener('scroll', syncArrows)
      window.removeEventListener('resize', syncArrows)
    }
  }, [products])

  const scroll = (dir: 'prev' | 'next') => {
    const el = trackRef.current
    if (!el) return
    const cardW = el.firstElementChild?.clientWidth ?? 280
    el.scrollBy({ left: dir === 'next' ? cardW : -cardW, behavior: 'smooth' })
  }

  return (
    <section className="py-16 md:py-24 border-t border-taupe-light">

      {/* Header */}
      <div className="px-6 md:px-10 flex items-end justify-between mb-10">
        <h2
          className="font-serif font-light leading-[0.9]"
          style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}
        >
          Latest<br />
          <em className="italic text-sienna">Drops</em>
        </h2>

        <div className="flex items-center gap-4">
          {/* Arrows */}
          {!loading && products.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll('prev')}
                disabled={!canPrev}
                aria-label="Previous"
                style={{
                  width: 38, height: 38,
                  border: `1px solid ${canPrev ? '#A8401A' : 'rgba(28,25,23,0.15)'}`,
                  background: 'transparent',
                  color: canPrev ? '#A8401A' : 'rgba(28,25,23,0.3)',
                  cursor: canPrev ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  fontSize: 16,
                }}
              >
                ←
              </button>
              <button
                onClick={() => scroll('next')}
                disabled={!canNext}
                aria-label="Next"
                style={{
                  width: 38, height: 38,
                  border: `1px solid ${canNext ? '#A8401A' : 'rgba(28,25,23,0.15)'}`,
                  background: 'transparent',
                  color: canNext ? '#A8401A' : 'rgba(28,25,23,0.3)',
                  cursor: canNext ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  fontSize: 16,
                }}
              >
                →
              </button>
            </div>
          )}

          <Link
            href="/shop"
            className="hidden md:flex font-mono text-[0.55rem] uppercase tracking-[0.22em] text-taupe hover:text-sienna transition-colors items-center gap-2"
          >
            All pieces →
          </Link>
        </div>
      </div>

      {/* Carousel track */}
      {loading ? (
        <div className="px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-taupe-light aspect-[3/4] w-full mb-3" />
              <div className="h-3 bg-taupe-light rounded w-2/3 mb-2" />
              <div className="h-3 bg-taupe-light rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="font-mono text-xs uppercase tracking-widest text-taupe">
            No pieces available
          </p>
        </div>
      ) : (
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            gap: 0,
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
          }}
          className="md:px-10"
        >
          <style>{`.featured-track::-webkit-scrollbar{display:none}`}</style>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                flex: '0 0 calc(50vw - 32px)',
                scrollSnapAlign: 'start',
                borderRight: '1px solid rgba(209,196,183,0.5)',
              }}
              className="md:!flex-[0_0_calc(25vw_-_32px)]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Mobile view all */}
      <div className="mt-10 px-6 md:hidden">
        <Link
          href="/shop"
          className="flex items-center justify-center w-full border border-ink text-ink font-mono text-xs uppercase tracking-widest py-4 hover:bg-ink hover:text-ivory transition-colors min-h-[44px]"
        >
          View All Pieces
        </Link>
      </div>

    </section>
  )
}
