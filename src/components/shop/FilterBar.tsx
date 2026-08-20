'use client'

import { ProductCategory } from '@/types'

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'trouser', label: 'Trouser' },
  { value: 'short', label: 'Short' },
  { value: 'wide-leg', label: 'Wide-Leg' },
  { value: 'palazzo', label: 'Palazzo' },
  { value: 'cargo', label: 'Cargo' },
  { value: 'pleated', label: 'Pleated' },
]

export default function FilterBar({
  active,
  onChange,
}: {
  active: ProductCategory | 'all'
  onChange: (value: ProductCategory | 'all') => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-10" role="group" aria-label="Filter by category">
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          aria-pressed={active === c.value}
          className={`font-mono text-[0.58rem] uppercase tracking-[0.2em] px-4 py-2.5 min-h-[40px] border transition-colors ${
            active === c.value
              ? 'bg-ink text-ivory border-ink'
              : 'border-taupe-light text-ink hover:border-ink'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
