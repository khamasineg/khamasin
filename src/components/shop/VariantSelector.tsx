'use client'

import { ProductVariant } from '@/types'

// Size + stock-aware — sold-out sizes are shown, not hidden, and are
// clearly struck through rather than silently unselectable (CLAUDE.md §7:
// "a size selector that clearly shows sold-out sizes").
export default function VariantSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: ProductVariant[]
  selected: string | null
  onSelect: (size: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const outOfStock = variant.stock_quantity <= 0
        return (
          <button
            key={variant.id}
            onClick={() => !outOfStock && onSelect(variant.size)}
            disabled={outOfStock}
            aria-pressed={selected === variant.size}
            className={`font-mono text-xs uppercase tracking-widest px-4 py-3 min-w-[44px] min-h-[44px] border transition-colors ${
              outOfStock
                ? 'border-taupe-light text-taupe-light cursor-not-allowed line-through'
                : selected === variant.size
                ? 'bg-ink text-ivory border-ink'
                : 'border-taupe-light text-ink hover:border-ink'
            }`}
          >
            {variant.size}
          </button>
        )
      })}
    </div>
  )
}
