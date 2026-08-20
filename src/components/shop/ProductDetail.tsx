'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import VariantSelector from './VariantSelector'
import ProductGallery from './ProductGallery'
import SizeChart from './SizeChart'
import { TONE_CYCLE } from '@/lib/collection'

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [chartOpen, setChartOpen] = useState(false)
  const { addItem, openCart } = useCart()

  const order = ['XS', 'S', 'M', 'L', 'XL']
  const variants = [...(product.product_variants ?? [])].sort(
    (a, b) => order.indexOf(a.size) - order.indexOf(b.size)
  )
  const inStock = variants.filter((v) => v.stock_quantity > 0)
  const soldOut = variants.length > 0 && inStock.length === 0
  const selectedVariant = variants.find((v) => v.size === selectedSize) ?? null
  const low = selectedVariant && selectedVariant.stock_quantity > 0 && selectedVariant.stock_quantity <= 3

  const handleAdd = () => {
    if (!selectedVariant || selectedVariant.stock_quantity <= 0) return
    addItem(product, selectedVariant)
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="relative px-6 md:px-[6vw] pt-32 md:pt-40 pb-32">
      {/* Breadcrumb — survey path */}
      <div className="flex items-center gap-2 mb-8 font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9C8563' }}>
        <Link href="/shop" className="transition-colors hover:text-sienna">Archive</Link>
        <span>/</span>
        <Link href={`/collections/${product.category}`} className="transition-colors hover:text-sienna">{product.category}</Link>
        <span>/</span>
        <span style={{ color: '#B5673A' }}>{product.landform}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-10 md:gap-16 lg:gap-24 items-start">
        {/* ── Gallery: sticky so the copy scrolls alongside it ─────────── */}
        <div className="md:sticky md:top-28">
          <ProductGallery
            images={product.images ?? []}
            alt={product.name}
            tone={TONE_CYCLE[0]}
            soldOut={soldOut}
          />
        </div>

        {/* ── Copy column ─────────────────────────────────────────────── */}
        <div className="flex flex-col">
          <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B5673A' }}>
            {product.landform}
          </span>

          <h1
            className="font-display italic text-ink mt-4"
            style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.05 }}
          >
            {product.name}
          </h1>

          <p className="font-mono mt-5" style={{ fontSize: '1.05rem', color: '#2A2521' }}>
            EGP {product.price.toLocaleString()}
          </p>

          {product.description && (
            <p className="mt-7 leading-relaxed" style={{ color: '#9C8563', maxWidth: '46ch', fontSize: '0.95rem' }}>
              {product.description}
            </p>
          )}

          <div className="mt-9" style={{ height: 1, background: 'rgba(156,133,99,0.4)' }} />

          {/* Sizes */}
          <div className="mt-9">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.26em', textTransform: 'uppercase', color: '#9C8563' }}>
                Size
              </span>
              <button
                type="button"
                onClick={() => setChartOpen(true)}
                className="font-mono border-b pb-0.5 transition-colors hover:text-ink"
                style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B5673A', borderColor: 'rgba(181,103,58,0.4)' }}
              >
                Size &amp; fit
              </button>
            </div>

            {variants.length > 0 ? (
              <>
                <VariantSelector variants={variants} selected={selectedSize} onSelect={setSelectedSize} />
                {low && (
                  <p className="font-mono mt-3" style={{ fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B5673A' }}>
                    Only {selectedVariant!.stock_quantity} left in {selectedVariant!.size}
                  </p>
                )}
              </>
            ) : (
              <p className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C8563' }}>
                Sizing to be confirmed
              </p>
            )}
          </div>

          {/* Add to bag */}
          <div className="mt-8">
            {soldOut ? (
              <div
                className="w-full text-center font-mono"
                style={{ fontSize: '0.6rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9C8563', border: '1px solid rgba(156,133,99,0.45)', padding: '1.05rem 0' }}
              >
                Sold out — restock to be announced
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={!selectedVariant}
                className="w-full font-mono transition-colors duration-500"
                style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  padding: '1.05rem 0',
                  minHeight: 44,
                  cursor: selectedVariant ? 'pointer' : 'not-allowed',
                  background: added ? '#B5673A' : selectedVariant ? '#2A2521' : 'transparent',
                  color: added || selectedVariant ? '#FAF6EF' : '#9C8563',
                  border: selectedVariant || added ? '1px solid transparent' : '1px solid rgba(156,133,99,0.45)',
                }}
              >
                {added ? 'Added to bag' : selectedVariant ? 'Add to bag' : 'Select a size'}
              </button>
            )}
          </div>

          {/* Story */}
          {product.story && (
            <div className="mt-12">
              <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.26em', textTransform: 'uppercase', color: '#9C8563' }}>
                Why {product.landform}
              </span>
              <p className="font-display italic text-ink mt-4 leading-relaxed" style={{ fontSize: '1.05rem', maxWidth: '44ch' }}>
                {product.story}
              </p>
            </div>
          )}

          {/* Spec table */}
          <div className="mt-12">
            <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.26em', textTransform: 'uppercase', color: '#9C8563' }}>
              Specification
            </span>
            <dl className="mt-4">
              {[
                ['Category', product.category],
                ['Fabric', product.fabric],
                ['Collection', product.collection],
                ['Landform', product.landform],
              ]
                .filter(([, v]) => Boolean(v))
                .map(([k, v]) => (
                  <div
                    key={k as string}
                    className="flex justify-between items-baseline py-3"
                    style={{ borderBottom: '1px solid rgba(156,133,99,0.28)' }}
                  >
                    <dt className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C8563' }}>
                      {k}
                    </dt>
                    <dd className="font-mono" style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2A2521' }}>
                      {v}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        </div>
      </div>

      <SizeChart
        category={product.category}
        selectedSize={selectedSize}
        open={chartOpen}
        onClose={() => setChartOpen(false)}
      />
    </div>
  )
}
