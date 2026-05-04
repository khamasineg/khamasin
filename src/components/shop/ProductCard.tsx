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
  
    // If only one size, add directly
    if (product.sizes?.length === 1) {
      addItem(product, product.sizes[0])
      setAdded(true)
      openCart()
      setTimeout(() => setAdded(false), 2000)
      return
    }
  
    // If multiple sizes, go to product page to select
    window.location.href = `/shop/${product.slug}`
  }

  return (
<Link href={`/shop/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-taupe-light">
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
        {/* Hover overlay */}
{!product.sold && (
  <div
    className="absolute inset-0 z-10 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    style={{
      background: 'linear-gradient(to top, rgba(28,25,23,0.75) 0%, transparent 55%)',
    }}
  >
    <button
      onClick={handleAddToCart}
      className="relative w-full overflow-hidden font-mono text-[0.55rem] uppercase tracking-[0.2em] border border-ivory py-3 transition-colors duration-200 group/btn"
      style={{
        color: added ? '#1C1917' : '#FAF6F0',
        background: added ? '#FAF6F0' : 'transparent',
      }}
    >
      {/* Sienna slide-in background */}
      {!added && (
        <span
          className="absolute inset-0 bg-ivory -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"
          style={{ transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)' }}
        />
      )}
      <span
        className="relative z-10 transition-colors duration-200"
        style={{ color: added ? '#1C1917' : undefined }}
      >
        {added
          ? '✦ Added to Bag'
          : product.sizes?.length === 1
          ? `Add to Bag — ${product.sizes[0]}`
          : 'View & Select Size →'}
      </span>
    </button>
  </div>
)}
      </div>

      {/* Info */}
      <div className="p-3 border-t border-taupe-light">
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.25em] text-sienna block mb-1">
          {product.era} · {product.brand} · {product.sizes?.join(', ')}
        </span>
        <p className="font-serif text-sm text-ink group-hover:text-sienna transition-colors leading-snug mb-2">
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