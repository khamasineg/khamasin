'use client'

import { useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Product, ProductCategory } from '@/types'
import { FW26 } from '@/lib/collection'
import ProductCard from './ProductCard'
import Media from './Media'
import FilterBar from './FilterBar'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Client half of the archive: filtering + reveal choreography only.
 *
 * The products themselves are fetched on the server and passed in, so the
 * catalogue exists in the initial HTML — a storefront whose product grid is
 * invisible to crawlers and empty on first paint is a real problem, and
 * client-side fetching caused exactly that.
 */
export default function ShopArchive({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')

  const isLive = products.length > 0
  const liveFiltered = category === 'all' ? products : products.filter((p) => p.category === category)
  const previewFiltered = category === 'all' ? FW26 : FW26.filter((s) => s.category === category)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from('.shop-card', {
        opacity: 0,
        y: 44,
        duration: 1.1,
        stagger: 0.07,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.shop-grid', start: 'top 88%' },
      })
    },
    { dependencies: [category, isLive] }
  )

  const gridStyle = {
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    background: 'rgba(156,133,99,0.5)',
  }

  return (
    <>
      <div className="mt-14">
        <FilterBar active={category} onChange={setCategory} />
      </div>

      {isLive ? (
        liveFiltered.length === 0 ? (
          <EmptyFilter />
        ) : (
          <div className="shop-grid grid gap-px" style={gridStyle}>
            {liveFiltered.map((product, i) => (
              <div key={product.id} className="shop-card bg-parchment">
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        )
      ) : previewFiltered.length === 0 ? (
        <EmptyFilter />
      ) : (
        <>
          <div className="shop-grid grid gap-px" style={gridStyle}>
            {previewFiltered.map((style) => (
              <Link key={style.slug} href="/lookbook" className="shop-card group relative block bg-parchment overflow-hidden">
                <div className="relative overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
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
                <div className="px-4 pt-4 pb-5">
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.24em]" style={{ color: '#B5673A' }}>
                    {style.landform}
                  </span>
                  <div className="font-display italic text-ink mt-1.5" style={{ fontSize: '1.08rem' }}>
                    {style.name}
                  </div>
                  <div className="font-mono text-[0.78rem] mt-3" style={{ color: '#B5673A' }}>
                    {style.price.toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mt-12 text-center" style={{ color: '#9C8563' }}>
            FW26 preview — sizes and stock open when the collection is seeded
          </p>
        </>
      )}
    </>
  )
}

function EmptyFilter() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
      <p className="font-display text-ink" style={{ fontWeight: 300, fontSize: '1.6rem' }}>
        Nothing in this cut yet.
      </p>
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em]" style={{ color: '#9C8563' }}>
        Try another category
      </p>
    </div>
  )
}
