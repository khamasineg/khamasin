'use client'

import Image from 'next/image'
import { CartItem as CartItemType } from '@/types'
import { useCart } from '@/hooks/useCart'

export default function CartItem({ item }: { item: CartItemType }) {
  const { removeItem, setQuantity } = useCart()
  const variant = item.product.product_variants?.find((v) => v.id === item.variantId)
  const maxStock = variant?.stock_quantity ?? item.quantity

  return (
    <div className="flex gap-4 py-4 border-b border-taupe-light">
      <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-taupe-light">
        {item.product.images?.[0] ? (
          <Image src={item.product.images[0]} alt={item.product.name} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[8px] uppercase tracking-widest text-taupe">No image</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="font-serif text-sm text-ink leading-snug mb-1">{item.product.name}</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-taupe">Size: {item.size}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs text-ink">{item.product.price.toLocaleString()} EGP</p>
            <div className="flex items-center border border-taupe-light">
              <button
                onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                aria-label="Decrease quantity"
                className="w-7 h-7 flex items-center justify-center font-mono text-xs text-ink hover:text-sienna transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center font-mono text-[10px] text-ink">{item.quantity}</span>
              <button
                onClick={() => item.quantity < maxStock && setQuantity(item.variantId, item.quantity + 1)}
                disabled={item.quantity >= maxStock}
                aria-label="Increase quantity"
                className="w-7 h-7 flex items-center justify-center font-mono text-xs text-ink hover:text-sienna transition-colors disabled:opacity-30 disabled:hover:text-ink"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={() => removeItem(item.variantId)}
            className="font-mono text-[9px] uppercase tracking-widest text-taupe hover:text-sienna transition-colors min-h-[44px] min-w-[44px] flex items-center justify-end"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
