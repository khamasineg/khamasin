'use client'

import Link from 'next/link'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import { useState } from 'react'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.sold) return
    const defaultSize = product.sizes?.[0]
    if (!defaultSize) return
    addItem(product, defaultSize)
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Link href={`/shop/${product.slug}`} className="group block">

      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-taupe-light mb-3">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)' }}
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
        <div className="absolute top-3 left-3 z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-ivory bg-sienna px-2 py-1">
            {product.era}
          </span>
        </div>

        {/* Sold overlay */}
        {product.sold && (
          <div className="absolute inset-0 bg-parchment/70 flex items-center justify-center z-10">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              Sold
            </span>
          </div>
        )}

        {/* Hover overlay — slides up */}
        {!product.sold && (
          <div
            className="absolute inset-0 z-10 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            style={{
              background: 'linear-gradient(to top, rgba(28,25,23,0.75) 0%, transparent 55%)',
            }}
          >
            <button
              onClick={handleAddToCart}
              className="w-full font-mono text-[0.55rem] uppercase tracking-[0.2em] border py-3 transition-colors duration-200"
              style={{
                color: added ? '#1C1917' : '#FAF6F0',
                background: added ? '#FAF6F0' : 'transparent',
                borderColor: '#FAF6F0',
              }}
            >
              {added ? 'Added to Bag' : product.sizes?.length === 1
                ? `Add to Bag — ${product.sizes[0]}`
                : 'Select Size'}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.25em] text-sienna block mb-1">
          {product.era} · {product.brand} · {product.sizes?.join(', ')}
        </span>
        <p className="font-serif text-sm text-ink group-hover:text-sienna transition-colors leading-snug mb-1">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-ink">
            {product.price.toLocaleString()} EGP
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-taupe">
            {product.condition}
          </p>
        </div>
      </div>
    </Link>
  )
}