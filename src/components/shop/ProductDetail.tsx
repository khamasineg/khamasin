'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCart()

  const handleAddToCart = () => {
    if (!selectedSize) return
    addItem(product, selectedSize)
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="px-6 pt-32 pb-24 md:px-16 md:pt-40">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">

        {/* Left — Images */}
        <div className="flex flex-col gap-3">
          {/* Main image */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-taupe-light">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[9px] uppercase tracking-widest text-taupe">
                  No image
                </span>
              </div>
            )}

            {/* Era stamp */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-ivory border border-ivory/40 px-2 py-1 bg-ink/20">
                {product.era}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-ivory border border-ivory/40 px-2 py-1 bg-ink/20">
                {product.condition}
              </span>
            </div>

            {/* Prev / Next arrows — only when multiple images */}
            {product.images?.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(i => (i - 1 + product.images.length) % product.images.length)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
                  style={{
                    width: 36, height: 36,
                    background: 'rgba(250,246,240,0.9)',
                    border: '1px solid rgba(28,25,23,0.15)',
                    color: '#1C1917',
                    fontSize: 16,
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  ←
                </button>
                <button
                  onClick={() => setSelectedImage(i => (i + 1) % product.images.length)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
                  style={{
                    width: 36, height: 36,
                    background: 'rgba(250,246,240,0.9)',
                    border: '1px solid rgba(28,25,23,0.15)',
                    color: '#1C1917',
                    fontSize: 16,
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  →
                </button>

                {/* Dot indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      aria-label={`Go to image ${i + 1}`}
                      style={{
                        width: selectedImage === i ? 18 : 6,
                        height: 6,
                        background: selectedImage === i ? '#A8401A' : 'rgba(250,246,240,0.7)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'width 0.25s ease, background 0.2s',
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Sold overlay */}
            {product.sold && (
              <div className="absolute inset-0 bg-parchment/70 flex items-center justify-center z-10">
                <span className="font-mono text-xs uppercase tracking-widest text-ink">
                  Sold
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative flex-shrink-0 w-16 h-20 overflow-hidden border transition-colors ${
                    selectedImage === i
                      ? 'border-sienna'
                      : 'border-taupe-light hover:border-taupe'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Info */}
        <div className="flex flex-col">
          {/* Brand */}
          {product.brand && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <p className="font-mono text-xl text-ink mb-8">
            {product.price.toLocaleString()} EGP
          </p>

          {/* Divider */}
          <div className="h-px bg-taupe-light mb-8" />

          {/* Size selector */}
          {!product.sold && (
            <div className="mb-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-3">
                Select Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`font-mono text-xs uppercase tracking-widest px-4 py-3 min-w-[44px] min-h-[44px] border transition-colors ${
                      selectedSize === size
                        ? 'bg-ink text-ivory border-ink'
                        : 'border-taupe-light text-ink hover:border-ink'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          {!product.sold ? (
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`w-full font-mono text-xs uppercase tracking-widest py-4 min-h-[44px] transition-colors mb-4 ${
                !selectedSize
                  ? 'bg-taupe-light text-taupe cursor-not-allowed'
                  : added
                  ? 'bg-sienna text-ivory'
                  : 'bg-ink text-ivory hover:bg-sienna'
              }`}
            >
              {added ? 'Added to Cart' : !selectedSize ? 'Select a Size' : 'Add to Cart'}
            </button>
          ) : (
            <div className="w-full font-mono text-xs uppercase tracking-widest py-4 text-center border border-taupe-light text-taupe mb-4">
              Sold
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-taupe-light mb-8" />

          {/* Story */}
          {product.story && (
            <div className="mb-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-3">
                The Story
              </p>
              <p className="font-serif text-base text-ink leading-relaxed italic">
                {product.story}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-1">
              Details
            </p>
            <div className="flex justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">Era</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink">{product.era}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">Condition</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink">{product.condition}</span>
            </div>
            {product.brand && (
              <div className="flex justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">Brand</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink">{product.brand}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">Collection</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink">{product.collection}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}