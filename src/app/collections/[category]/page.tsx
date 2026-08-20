'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product, ProductCategory } from '@/types'
import ProductCard from '@/components/shop/ProductCard'
import Reveal from '@/components/ui/Reveal'

const LABELS: Record<string, string> = {
  trouser: 'Trouser',
  short: 'Short',
  'wide-leg': 'Wide-Leg',
  palazzo: 'Palazzo',
  cargo: 'Cargo',
  pleated: 'Pleated',
}

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as ProductCategory
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('active', true)
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (!error && data) setProducts(data as unknown as Product[])
      setLoading(false)
    }
    fetchProducts()
  }, [category])

  const label = LABELS[category] ?? category

  return (
    <main className="px-6 md:px-12 pt-28 pb-24 md:pt-36">
      <div className="mb-10">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-sienna mb-3">Collections</p>
        <h1 className="font-display italic text-ink" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
          {label}
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-taupe-light aspect-[3/4] w-full mb-3" />
              <div className="h-3 bg-taupe-light rounded w-2/3 mb-2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
          <p className="font-display italic text-2xl text-ink">Nothing here yet.</p>
          <p className="font-mono text-xs uppercase tracking-widest text-taupe">This category is still being cut.</p>
        </div>
      ) : (
        <Reveal from="up" stagger={0.06} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </Reveal>
      )}
    </main>
  )
}
