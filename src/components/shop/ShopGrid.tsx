'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import ProductGrid from './ProductGrid'

export default function ShopGrid() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const era = searchParams.get('era')
  const condition = searchParams.get('condition')

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)

      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (era) query = query.eq('era', era)
      if (condition) query = query.eq('condition', condition)

      const { data, error } = await query

      if (!error && data) setProducts(data)
      setLoading(false)
    }

    fetchProducts()
  }, [era, condition])

  if (loading) {
    return (
      <div className="px-6 py-12 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse border border-taupe-light">
              <div className="bg-taupe-light aspect-[3/4] w-full" />
              <div className="p-3 border-t border-taupe-light">
                <div className="h-2 bg-taupe-light rounded w-1/2 mb-2" />
                <div className="h-3 bg-taupe-light rounded w-2/3 mb-2" />
                <div className="h-2 bg-taupe-light rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
        <div className="w-12 h-12 border border-taupe-light flex items-center justify-center mb-6">
          <span className="font-mono text-sienna text-sm">✦</span>
        </div>
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-taupe mb-3">
          No pieces found
        </p>
        <p className="font-serif italic text-taupe text-sm">
          Try adjusting your filters
        </p>
      </div>
    )
  }

  return <ProductGrid products={products} />
}