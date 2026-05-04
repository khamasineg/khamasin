'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import ProductCard from '@/components/shop/ProductCard'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sold', false)
        .order('created_at', { ascending: false })
        .limit(4)

      if (!error && data) setProducts(data)
      setLoading(false)
    }

    fetchFeatured()
  }, [])

  return (
    <section className="px-6 py-16 md:px-10 md:py-24 border-t border-taupe-light">

      {/* Header */}
      <div className="flex items-end justify-between mb-12">
        <h2
          className="font-serif font-light leading-[0.9]"
          style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}
        >
          Latest<br />
          <em className="italic text-sienna">Drops</em>
        </h2>
        <Link
          href="/shop"
          className="hidden md:flex font-mono text-[0.55rem] uppercase tracking-[0.22em] text-taupe hover:text-sienna transition-colors items-center gap-2 mb-2"
        >
          All pieces →
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile view all */}
      <div className="mt-8 md:hidden">
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