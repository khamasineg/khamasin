'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { supabase } from '@/lib/supabase'
import { Product, ProductCategory } from '@/types'
import { FW26 } from '@/lib/collection'
import ProductCard from '@/components/shop/ProductCard'
import Media from '@/components/shop/Media'
import PageHeader from '@/components/layout/PageHeader'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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

  const preview = FW26.filter((s) => s.category === category)
  const showPreview = !loading && products.length === 0 && preview.length > 0

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from('.cat-card', {
        opacity: 0,
        y: 44,
        duration: 1.1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.cat-list', start: 'top 86%' },
      })
    },
    { dependencies: [loading, products.length] }
  )

  const label = LABELS[category] ?? category

  return (
    <main className="relative px-6 md:px-[6vw] pt-40 pb-32">
      <PageHeader eyebrow="Collections" title={label} />

      <div className="mt-16">
        {loading ? (
          <div className="grid gap-px" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', background: 'rgba(156,133,99,0.4)' }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-parchment animate-pulse">
                <div className="bg-taupe-light/50 aspect-[3/4] w-full" />
                <div className="p-5">
                  <div className="h-3 bg-taupe-light/50 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-taupe-light/50 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="cat-list grid gap-px" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', background: 'rgba(156,133,99,0.5)' }}>
            {products.map((product, i) => (
              <div key={product.id} className="cat-card bg-parchment">
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        ) : showPreview ? (
          <>
            <div className="cat-list grid gap-px" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', background: 'rgba(156,133,99,0.5)' }}>
              {preview.map((style) => (
                <Link key={style.slug} href="/lookbook" className="cat-card group block bg-parchment overflow-hidden">
                  <div className="relative h-[340px] overflow-hidden">
                    <div
                      className="absolute inset-0 transition-transform duration-[1400ms] group-hover:scale-[1.045]"
                      style={{ transitionTimingFunction: 'cubic-bezier(.16,1,.3,1)' }}
                    >
                      <Media
                        src={`/images/styles/${style.slug}.jpg`}
                        alt={style.name}
                        tone={style.tone}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  </div>
                  <div className="px-5 pt-6 pb-7">
                    <span className="font-mono text-[0.55rem] uppercase tracking-[0.24em]" style={{ color: '#B5673A' }}>
                      {style.landform}
                    </span>
                    <div className="font-display italic text-ink mt-1.5" style={{ fontSize: '1.25rem' }}>
                      {style.name}
                    </div>
                    <div className="font-mono text-[0.8rem] mt-3" style={{ color: '#B5673A' }}>
                      EGP {style.price.toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mt-12 text-center" style={{ color: '#9C8563' }}>
              FW26 preview
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <p className="font-display text-ink" style={{ fontWeight: 300, fontSize: '1.7rem' }}>
              Nothing in this cut yet.
            </p>
            <Link
              href="/shop"
              className="font-mono text-[0.6rem] uppercase tracking-[0.24em] mt-2 border-b pb-1 transition-colors"
              style={{ color: '#B5673A', borderColor: 'rgba(181,103,58,0.4)' }}
            >
              View the full archive →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
