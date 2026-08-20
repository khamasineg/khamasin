'use client'

import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/hooks/useCart'

/**
 * The bag control. Icon + live count that reacts when something is added.
 *
 * The icon is drawn to the same rules as the rest of the site: 1px stroke,
 * square shoulders, no fill — a flat-pack tote seen head-on, not a rounded
 * shopping-basket glyph. `currentColor` throughout so it inherits the nav's
 * mix-blend-difference treatment and stays legible over any section.
 *
 * On increment the count pops and the bag gives a short nudge, so adding to
 * cart is acknowledged in the nav even when the drawer is closed.
 */
export default function BagButton({
  onClick,
  compact = false,
}: {
  onClick: () => void
  compact?: boolean
}) {
  const { itemCount } = useCart()
  const prev = useRef(itemCount)
  const [bump, setBump] = useState(false)

  useEffect(() => {
    if (itemCount > prev.current) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 520)
      prev.current = itemCount
      return () => clearTimeout(t)
    }
    prev.current = itemCount
  }, [itemCount])

  return (
    <button
      onClick={onClick}
      aria-label={itemCount > 0 ? `Open bag, ${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Open bag'}
      className="relative flex items-center gap-2 transition-opacity hover:opacity-60"
      style={{ minWidth: 44, minHeight: 44, justifyContent: compact ? 'flex-end' : 'center' }}
    >
      <span
        className="relative inline-flex"
        style={{ animation: bump ? 'bag-nudge 520ms cubic-bezier(.22,1,.36,1)' : undefined }}
      >
        <svg
          width={compact ? 19 : 17}
          height={compact ? 19 : 17}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          aria-hidden="true"
        >
          {/* flat tote — square shoulders, straight handle */}
          <path d="M3.2 6.2h13.6L15.9 18H4.1L3.2 6.2Z" strokeLinejoin="round" />
          <path d="M7.1 6.2V4.6a2.9 2.9 0 0 1 5.8 0v1.6" strokeLinecap="round" />
        </svg>

        {itemCount > 0 && (
          <span
            key={itemCount}
            className="absolute font-mono flex items-center justify-center"
            style={{
              top: -5,
              right: -7,
              minWidth: 15,
              height: 15,
              paddingInline: 3,
              fontSize: 9,
              lineHeight: 1,
              letterSpacing: '0.02em',
              color: '#FAF6EF',
              background: '#B5673A',
              animation: 'count-pop 420ms cubic-bezier(.22,1,.36,1)',
            }}
          >
            {itemCount}
          </span>
        )}
      </span>

      {!compact && (
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
          BAG
        </span>
      )}
    </button>
  )
}
