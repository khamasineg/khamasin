'use client'

import { useState, useRef } from 'react'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import VariantSelector from './VariantSelector'

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCart()
  const touchStartX = useRef<number>(0)

  const variants = product.product_variants ?? []
  const inStockVariants = variants.filter((v) => v.stock_quantity > 0)
  const soldOut = variants.length > 0 && inStockVariants.length === 0
  const selectedVariant = variants.find((v) => v.size === selectedSize) ?? null

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    const total = product.images?.length ?? 1
    if (Math.abs(diff) > 40) {
      if (diff > 0) setSelectedImage((i) => Math.min(i + 1, total - 1))
      else setSelectedImage((i) => Math.max(i - 1, 0))
    }
  }

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock_quantity <= 0) return
    addItem(product, selectedVariant)
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="px-6 pt-28 pb-24 md:px-16 md:pt-36">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div
            className="relative aspect-[3/4] w-full overflow-hidden bg-taupe-light"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[9px] uppercase tracking-widest text-taupe">No image</span>
              </div>
            )}

            {product.images?.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`Go to image ${i + 1}`}
                    style={{
                      width: selectedImage === i ? 18 : 6,
                      height: 6,
                      background: selectedImage === i ? '#B5673A' : 'rgba(250,246,239,0.7)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'width 0.25s ease, background 0.2s',
                    }}
                  />
                ))}
              </div>
            )}

            {soldOut && (
              <div className="absolute inset-0 bg-parchment/70 flex items-center justify-center z-10">
                <span className="font-mono text-xs uppercase tracking-widest text-ink">Sold Out</span>
              </div>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative flex-shrink-0 w-16 h-20 overflow-hidden border transition-colors ${
                    selectedImage === i ? 'border-sienna' : 'border-taupe-light hover:border-taupe'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">{product.landform}</p>

          <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight mb-4">{product.name}</h1>

          <p className="font-mono text-xl text-ink mb-8">{product.price.toLocaleString()} EGP</p>

          <div className="h-px bg-taupe-light mb-8" />

          {!soldOut && variants.length > 0 && (
            <div className="mb-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-3">Select Size</p>
              <VariantSelector variants={variants} selected={selectedSize} onSelect={setSelectedSize} />
            </div>
          )}

          {!soldOut ? (
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              className={`w-full font-mono text-xs uppercase tracking-widest py-4 min-h-[44px] transition-colors mb-4 ${
                !selectedVariant
                  ? 'bg-taupe-light text-taupe cursor-not-allowed'
                  : added
                  ? 'bg-sienna text-ivory'
                  : 'bg-ink text-ivory hover:bg-sienna'
              }`}
            >
              {added ? 'Added to Cart' : !selectedVariant ? 'Select a Size' : 'Add to Cart'}
            </button>
          ) : (
            <div className="w-full font-mono text-xs uppercase tracking-widest py-4 text-center border border-taupe-light text-taupe mb-4">
              Sold Out
            </div>
          )}

          <div className="h-px bg-taupe-light mb-8" />

          {product.story && (
            <div className="mb-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-3">The Story</p>
              <p className="font-serif text-base text-ink leading-relaxed italic">{product.story}</p>
            </div>
          )}

          {product.description && (
            <div className="mb-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-3">Description</p>
              <p className="font-body text-sm text-ink leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-1">Details</p>
            <div className="flex justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">Category</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink">{product.category}</span>
            </div>
            {product.fabric && (
              <div className="flex justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">Fabric</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink">{product.fabric}</span>
              </div>
            )}
            {product.collection && (
              <div className="flex justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">Collection</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink">{product.collection}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
