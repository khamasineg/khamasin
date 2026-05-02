'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'

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
    <section className="px-6 py-16 md:px-16 md:py-24 bg-parchment">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">
            Fresh to the archive
          </p>
          <h2 className="font-display text-4xl md:text-6xl tracking-wider text-ink uppercase">
            New Arrivals
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:flex font-mono text-xs uppercase tracking-widest text-ink hover:text-sienna transition-colors border-b border-ink hover:border-sienna pb-1"
        >
          View All
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
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group block"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-taupe-light mb-3">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-taupe">
                      No image
                    </span>
                  </div>
                )}

                {/* Era stamp */}
                <div className="absolute top-3 left-3">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-ivory border border-ivory/40 px-2 py-1 bg-ink/20">
                    {product.era}
                  </span>
                </div>

                {/* Sold overlay */}
                {product.sold && (
                  <div className="absolute inset-0 bg-parchment/70 flex items-center justify-center">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
                      Sold
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <p className="font-serif text-sm text-ink group-hover:text-sienna transition-colors leading-snug mb-1">
                  {product.name}
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-taupe uppercase tracking-widest">
                    {product.condition}
                  </p>
                  <p className="font-mono text-xs text-ink">
                    {product.price.toLocaleString()} EGP
                  </p>
                </div>
              </div>
            </Link>
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