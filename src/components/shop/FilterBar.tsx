'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const eras = ['All', '60s', '70s', '80s', '90s']
const conditions = ['All', 'Excellent', 'Good', 'Fair']

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeEra = searchParams.get('era') || 'All'
  const activeCondition = searchParams.get('condition') || 'All'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'All') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="px-6 md:px-16 py-4 border-t border-b border-taupe-light overflow-x-auto">
      <div className="flex items-center gap-6 min-w-max md:min-w-0">

        {/* Era filters */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-taupe">
            Era
          </span>
          <div className="flex gap-2">
            {eras.map((era) => (
              <button
                key={era}
                onClick={() => updateFilter('era', era)}
                className={`font-mono text-[9px] uppercase tracking-widest px-3 py-2 min-h-[44px] transition-colors ${
                  activeEra === era
                    ? 'bg-ink text-ivory'
                    : 'text-ink hover:text-sienna'
                }`}
              >
                {era}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-taupe-light" />

        {/* Condition filters */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-taupe">
            Condition
          </span>
          <div className="flex gap-2">
            {conditions.map((condition) => (
              <button
                key={condition}
                onClick={() => updateFilter('condition', condition)}
                className={`font-mono text-[9px] uppercase tracking-widest px-3 py-2 min-h-[44px] transition-colors ${
                  activeCondition === condition
                    ? 'bg-ink text-ivory'
                    : 'text-ink hover:text-sienna'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}