'use client'

import { CartItem as CartItemType } from '@/types'
import { useCart } from '@/hooks/useCart'

export default function CartItem({ item }: { item: CartItemType }) {
  const { removeItem } = useCart()

  return (
    <div className="flex gap-4 py-4 border-b border-taupe-light">
      {/* Image */}
      <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-taupe-light">
        {item.product.images?.[0] ? (
          <img
            src={item.product.images[0]}
            alt={item.product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[8px] uppercase tracking-widest text-taupe">
              No image
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="font-serif text-sm text-ink leading-snug mb-1">
            {item.product.name}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-taupe">
            Size: {item.size}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-ink">
            {item.product.price.toLocaleString()} EGP
          </p>
          <button
            onClick={() => removeItem(item.product.id, item.size)}
            className="font-mono text-[9px] uppercase tracking-widest text-taupe hover:text-sienna transition-colors min-h-[44px] min-w-[44px] flex items-center justify-end"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}