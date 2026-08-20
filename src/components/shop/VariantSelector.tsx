'use client'

import { ProductVariant } from '@/types'
import ContourTrace from '@/components/wind/ContourTrace'

// Size + stock-aware — sold-out sizes are shown, not hidden, and are
// clearly struck through rather than silently unselectable (CLAUDE.md §7).
// Selected size gets a clay contour underline draw — precision, not a filled pill.
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
    <div className="flex flex-wrap gap-3">
      {variants.map((variant) => {
        const outOfStock = variant.stock_quantity <= 0
        const isSelected = selected === variant.size

        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => !outOfStock && onSelect(variant.size)}
            disabled={outOfStock}
            aria-pressed={isSelected}
            className={`group relative font-mono text-xs uppercase tracking-widest px-4 py-3 min-w-[52px] min-h-[44px] border transition-[color,border-color] duration-300 ${
              outOfStock
                ? 'border-taupe-light text-taupe-light cursor-not-allowed line-through'
                : isSelected
                ? 'border-ink text-ink'
                : 'border-taupe-light text-ink hover:border-ink'
            }`}
          >
            <span className="relative z-[1]">{variant.size}</span>

            {!outOfStock && (
              <span
                className="pointer-events-none absolute left-2 right-2 bottom-1.5 h-[6px] overflow-hidden"
                aria-hidden="true"
              >
                <ContourTrace
                  key={isSelected ? `sel-${variant.size}` : `idle-${variant.size}`}
                  d="M0 3 C 8 0.5, 16 5.5, 24 3 S 40 0.5, 48 3 S 64 5.5, 72 3 L 80 3"
                  viewBox="0 0 80 6"
                  color={isSelected ? '#B5673A' : '#C6AE82'}
                  strokeWidth={1.15}
                  dashLength={120}
                  duration={0.55}
                  className="w-full h-full"
                  trigger={isSelected ? 'mount' : 'group-hover'}
                />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
