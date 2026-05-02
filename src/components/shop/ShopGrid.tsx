'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import ProductCard from './ProductCard'

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
      <div className="px-6 py-12 md:px-16">
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
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-taupe mb-4">
          No pieces found
        </p>
        <p className="font-serif text-sm italic text-taupe">
          Try adjusting your filters
        </p>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 md:px-16 md:py-12">
      {/* Count */}
      <p className="font-mono text-[9px] uppercase tracking-widest text-taupe mb-6">
        {products.length} {products.length === 1 ? 'piece' : 'pieces'} found
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}