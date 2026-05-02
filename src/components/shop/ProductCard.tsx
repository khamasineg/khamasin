'use client'

import Link from 'next/link'
import { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-taupe-light mb-3">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
        <div className="absolute top-3 left-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-ivory border border-ivory/40 px-2 py-1 bg-ink/20">
            {product.era}
          </span>
        </div>

        {/* Sold overlay */}
        {product.sold && (
          <div className="absolute inset-0 bg-parchment/70 flex items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              Sold
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/5 transition-colors duration-500" />
      </div>

      {/* Info */}
      <div>
        <p className="font-serif text-sm text-ink group-hover:text-sienna transition-colors leading-snug mb-1">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-widest text-taupe">
            {product.condition}
          </p>
          <p className="font-mono text-xs text-ink">
            {product.price.toLocaleString()} EGP
          </p>
        </div>
        {/* Sizes */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {product.sizes?.map((size) => (
            <span
              key={size}
              className="font-mono text-[8px] uppercase tracking-widest border border-taupe-light px-1.5 py-0.5 text-taupe"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}