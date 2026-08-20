'use client'

import Link from 'next/link'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart()
  const [added, setAdded] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const touchStartX = useRef<number>(0)
  const router = useRouter()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.sold) return

    if (product.sizes?.length === 1) {
      addItem(product, product.sizes[0])
      setAdded(true)
      openCart()
      setTimeout(() => setAdded(false), 2000)
      return
    }

    router.push(`/shop/${product.slug}`)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.sold) return

    if (product.sizes?.length === 1) {
      addItem(product, product.sizes[0])
      router.push('/checkout')
    } else {
      router.push(`/shop/${product.slug}`)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    const total = product.images?.length ?? 1
    if (Math.abs(diff) > 40) {
      if (diff > 0) setImgIdx(i => Math.min(i + 1, total - 1))
      else setImgIdx(i => Math.max(i - 1, 0))
    }
  }

  const cardContent = (
    <>
      {/* Image */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-taupe-light"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {product.images?.[imgIdx] ? (
          <img
            src={product.images[imgIdx]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            style={{
              transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
              filter: product.sold ? 'grayscale(0.4)' : 'none',
            }}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[9px] uppercase tracking-widest text-taupe">
              No image
            </span>
          </div>
        )}

        {/* Image dots — only when multiple images and not sold */}
        {!product.sold && (product.images?.length ?? 0) > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
            {product.images.map((_, i) => (
              <span
                key={i}
                style={{
                  width: imgIdx === i ? 14 : 5,
                  height: 5,
                  background: imgIdx === i ? '#A8401A' : 'rgba(250,246,240,0.7)',
                  display: 'inline-block',
                  transition: 'width 0.2s ease, background 0.2s',
                }}
              />
            ))}
          </div>
        )}

        {/* Sold overlay */}
        {product.sold && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{ background: 'rgba(28,25,23,0.75)' }}
          >
            <span
              className="font-display text-parchment tracking-widest mb-2"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
            >
              SOLD
            </span>
            <span className="h-px w-8 bg-sienna mb-2" />
            <span className="font-mono text-[0.45rem] uppercase tracking-[0.25em] text-taupe-light">
              This piece found its home
            </span>
          </div>
        )}

        {/* Hover overlay — available only */}
        {!product.sold && (
          <div
            className="absolute inset-0 z-10 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to top, rgba(28,25,23,0.75) 0%, transparent 55%)',
            }}
          >
            <button
              onClick={handleAddToCart}
              className="relative w-full overflow-hidden font-mono text-[0.55rem] uppercase tracking-[0.2em] py-3 border group/btn"
              style={{
                borderColor: added ? '#A8401A' : '#FAF6F0',
                background: added ? '#A8401A' : 'transparent',
                color: '#FAF6F0',
              }}
            >
              {!added && (
                <span
                  className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"
                  style={{
                    background: '#FAF6F0',
                    transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
                  }}
                />
              )}
              <span className="relative z-10 text-ivory group-hover/btn:text-ink transition-colors duration-300">
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
      <div className="p-3 border-t border-taupe-light flex flex-col">
        <span
          className="font-mono text-[0.5rem] uppercase tracking-[0.25em] block mb-1"
          style={{ color: product.sold ? '#BEB0A0' : '#A8401A' }}
        >
          {product.era} · {product.brand} · {product.sold ? 'Sold' : product.sizes?.join(', ')}
        </span>
        <p
          className="font-serif text-sm leading-snug mb-2 transition-colors"
          style={{ color: product.sold ? '#BEB0A0' : '#1C1917' }}
        >
          {product.name}
        </p>
        <div className="flex items-center justify-between mb-3">
          <p
            className="font-mono text-xs"
            style={{ color: product.sold ? '#BEB0A0' : '#1C1917' }}
          >
            {product.sold ? '—' : `${product.price.toLocaleString()} EGP`}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-taupe">
            {product.sold ? 'Unavailable' : product.condition}
          </p>
        </div>

        {/* Buy Now / Sold button */}
        {product.sold ? (
          <div
            className="w-full font-mono text-[0.5rem] uppercase tracking-[0.22em] py-2.5 text-center border border-taupe-light mb-1"
            style={{ color: '#BEB0A0' }}
          >
            Sold — Gone Forever
          </div>
        ) : (
          <button
            onClick={handleBuyNow}
            className="relative w-full overflow-hidden font-mono text-[0.5rem] uppercase tracking-[0.22em] py-2.5 border border-ink group/buy mb-1"
            style={{ color: '#1C1917' }}
          >
            <span
              className="absolute inset-0 -translate-x-full group-hover/buy:translate-x-0 transition-transform duration-300 bg-sienna"
              style={{ transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)' }}
            />
            <span className="relative z-10 group-hover/buy:text-ivory transition-colors duration-300">
              {product.sizes?.length === 1 ? 'Buy Now →' : 'Shop Now →'}
            </span>
          </button>
        )}
      </div>
    </>
  )

  if (product.sold) {
    return (
      <div className="block cursor-default">
        {cardContent}
      </div>
    )
  }

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      {cardContent}
    </Link>
  )
}