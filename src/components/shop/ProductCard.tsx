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

  const variants = product.product_variants ?? []
  const inStockVariants = variants.filter((v) => v.stock_quantity > 0)
  const soldOut = variants.length > 0 && inStockVariants.length === 0
  const singleVariant = inStockVariants.length === 1 ? inStockVariants[0] : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (soldOut) return

    if (singleVariant) {
      addItem(product, singleVariant)
      setAdded(true)
      openCart()
      setTimeout(() => setAdded(false), 2000)
      return
    }

    router.push(`/shop/${product.slug}`)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    const total = product.images?.length ?? 1
    if (Math.abs(diff) > 40) {
      if (diff > 0) setImgIdx((i) => Math.min(i + 1, total - 1))
      else setImgIdx((i) => Math.max(i - 1, 0))
    }
  }

  const sizeLabel = inStockVariants.length > 0
    ? inStockVariants.map((v) => v.size).join(', ')
    : null

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
              filter: soldOut ? 'grayscale(0.4)' : 'none',
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

        {/* Contour-line trace on hover (CLAUDE.md §10: "product hover: subtle contour-line trace") */}
        {!soldOut && (
          <svg
            viewBox="0 0 300 400"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          >
            <path
              d="M-10 320 C 40 280, 90 340, 150 300 S 260 260, 310 300"
              fill="none"
              stroke="#FAF6EF"
              strokeWidth="1"
              strokeLinecap="round"
              className="[stroke-dasharray:500] [stroke-dashoffset:500] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
        )}

        {/* Image dots — only when multiple images and in stock */}
        {!soldOut && (product.images?.length ?? 0) > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
            {product.images.map((_, i) => (
              <span
                key={i}
                style={{
                  width: imgIdx === i ? 14 : 5,
                  height: 5,
                  background: imgIdx === i ? '#B5673A' : 'rgba(250,246,239,0.7)',
                  display: 'inline-block',
                  transition: 'width 0.2s ease, background 0.2s',
                }}
              />
            ))}
          </div>
        )}

        {/* Sold out overlay */}
        {soldOut && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{ background: 'rgba(42,37,33,0.75)' }}
          >
            <span
              className="font-display text-parchment tracking-widest mb-2"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}
            >
              Sold Out
            </span>
            <span className="h-px w-8 bg-sienna mb-2" />
            <span className="font-mono text-[0.45rem] uppercase tracking-[0.25em] text-taupe-light">
              Notify me when it restocks
            </span>
          </div>
        )}

        {/* Hover overlay — available only */}
        {!soldOut && (
          <div
            className="absolute inset-0 z-10 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to top, rgba(42,37,33,0.75) 0%, transparent 55%)',
            }}
          >
            <button
              onClick={handleAddToCart}
              className="relative w-full overflow-hidden font-mono text-[0.55rem] uppercase tracking-[0.2em] py-3 border group/btn"
              style={{
                borderColor: added ? '#B5673A' : '#FAF6EF',
                background: added ? '#B5673A' : 'transparent',
                color: '#FAF6EF',
              }}
            >
              {!added && (
                <span
                  className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"
                  style={{
                    background: '#FAF6EF',
                    transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
                  }}
                />
              )}
              <span className="relative z-10 text-ivory group-hover/btn:text-ink transition-colors duration-300">
                {added
                  ? '✦ Added to Bag'
                  : singleVariant
                  ? `Add to Bag — ${singleVariant.size}`
                  : 'Select Size →'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 border-t border-taupe-light flex flex-col">
        <span
          className="font-mono text-[0.5rem] uppercase tracking-[0.25em] block mb-1"
          style={{ color: soldOut ? '#9C8563' : '#B5673A' }}
        >
          {product.landform} · {soldOut ? 'Sold out' : sizeLabel ?? '—'}
        </span>
        <p
          className="font-serif text-sm leading-snug mb-2 transition-colors"
          style={{ color: soldOut ? '#9C8563' : '#2A2521' }}
        >
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <p
            className="font-mono text-xs"
            style={{ color: soldOut ? '#9C8563' : '#2A2521' }}
          >
            {product.price.toLocaleString()} EGP
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-taupe">
            {product.category}
          </p>
        </div>
      </div>
    </>
  )

  if (soldOut) {
    return <div className="block cursor-default">{cardContent}</div>
  }

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      {cardContent}
    </Link>
  )
}
