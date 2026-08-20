'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Product } from '@/types'
import Media from '@/components/shop/Media'
import { TONE_CYCLE } from '@/lib/collection'

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL']

/**
 * "Field card" — an archive plate from a terrain survey, not a shop tile.
 *
 * Kept from the previous build: the vertical landform label up the left
 * gutter, the survey plate number, the borderless full-bleed photograph, and
 * the hover swap to live size availability.
 *
 * OPACITY / CONTRAST — every value here is deliberate, because the previous
 * version floated Bleached-Bone labels straight onto pale desert photography
 * with only a text-shadow holding them up, which is not a contrast mechanism.
 * Now:
 *   · 0.34 top scrim + 0.40 bottom scrim, both fading to fully transparent
 *     within ~30% of the plate. Dark enough to guarantee white text reads on
 *     a blown-out sand background, short enough that the garment itself is
 *     never dulled — the middle 40% of the image is completely untouched.
 *   · Labels sit at full opacity (1.0). They are information, so they are
 *     never faded; the scrim does the work instead.
 *   · Contour hairline 0 → 0.85 on hover (was 0 → 0.8 with a competing
 *     wrapper fade, which multiplied down to ~0.6 and read as washed out).
 *   · Sold-out veil 0.55, not 0.72 — enough to state the status, not so much
 *     that the garment becomes unreadable behind it.
 *   · The caption crossfade holds one shared row height so nothing reflows,
 *     and each side is a clean 0↔1 with no overlap murk.
 */
export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [hovered, setHovered] = useState(false)

  const variants = [...(product.product_variants ?? [])].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
  )
  const inStock = variants.filter((v) => v.stock_quantity > 0)
  const soldOut = variants.length > 0 && inStock.length === 0
  const tone = TONE_CYCLE[index % TONE_CYCLE.length]

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group relative block bg-parchment"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`${product.name} — ${soldOut ? 'sold out' : `EGP ${product.price.toLocaleString()}`}`}
    >
      {/* ── Image plate ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
        <div
          className="absolute inset-0 transition-transform duration-[1600ms] group-hover:scale-[1.055]"
          style={{
            transitionTimingFunction: 'cubic-bezier(.16,1,.3,1)',
            filter: soldOut ? 'saturate(0.4) contrast(0.97)' : undefined,
          }}
        >
          <Media
            src={product.images?.[0]}
            alt={product.name}
            tone={tone}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        {/* Contrast scrims — the only reason the white labels are legible.
            Both fade out well before the centre of the plate. */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{ height: '30%', background: 'linear-gradient(180deg, rgba(42,37,33,0.34) 0%, rgba(42,37,33,0) 100%)' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: '34%', background: 'linear-gradient(0deg, rgba(42,37,33,0.40) 0%, rgba(42,37,33,0) 100%)' }}
        />

        {/* Survey plate number */}
        <span
          className="absolute top-4 left-4 font-mono z-10"
          style={{ fontSize: '0.55rem', letterSpacing: '0.24em', color: '#FAF6EF' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Stock readout, top-right — quiet utility */}
        {!soldOut && inStock.length > 0 && inStock.length <= 2 && (
          <span
            className="absolute top-4 right-4 font-mono z-10 uppercase"
            style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: '#F1EAD9' }}
          >
            {inStock.length} {inStock.length === 1 ? 'size' : 'sizes'} left
          </span>
        )}

        {/* Landform running up the left gutter — the signature detail */}
        <span
          className="absolute left-4 bottom-4 font-mono uppercase z-10"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: '0.55rem',
            letterSpacing: '0.34em',
            color: '#FAF6EF',
          }}
        >
          {product.landform}
        </span>

        {/* Contour hairline traces across on hover */}
        <svg
          viewBox="0 0 300 400"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-500"
          style={{ opacity: hovered ? 0.85 : 0 }}
          aria-hidden="true"
        >
          <path
            d="M-10 298 C 46 264, 98 324, 154 290 S 260 248, 314 288"
            fill="none"
            stroke="#FAF6EF"
            strokeWidth="1"
            strokeLinecap="round"
            className="[stroke-dasharray:520] [stroke-dashoffset:520] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-[1200ms] ease-out"
          />
        </svg>

        {soldOut && (
          <>
            <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'rgba(42,37,33,0.55)' }} />
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: '0.56rem',
                  letterSpacing: '0.32em',
                  color: '#FAF6EF',
                  borderTop: '1px solid rgba(250,246,239,0.5)',
                  borderBottom: '1px solid rgba(250,246,239,0.5)',
                  padding: '0.5rem 0',
                }}
              >
                Sold Out
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Caption ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display italic text-ink leading-tight" style={{ fontWeight: 400, fontSize: '1.08rem' }}>
            {product.name}
          </h3>
          <span
            className="font-mono whitespace-nowrap"
            style={{ fontSize: '0.78rem', color: soldOut ? '#9C8563' : '#B5673A' }}
          >
            {product.price.toLocaleString()}
          </span>
        </div>

        {/* Clay rule draws across on hover */}
        <div className="relative mt-2.5 mb-2.5" style={{ height: 1, background: 'rgba(156,133,99,0.32)' }}>
          <div
            className="absolute inset-0 origin-left transition-transform duration-[900ms]"
            style={{
              background: '#B5673A',
              transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
              transitionTimingFunction: 'cubic-bezier(.16,1,.3,1)',
            }}
          />
        </div>

        {/* Fabric ↔ size availability. Shared row height so nothing reflows. */}
        <div className="relative" style={{ height: 16 }}>
          <p
            className="absolute inset-0 truncate transition-opacity duration-300"
            style={{ fontSize: '0.72rem', lineHeight: '16px', color: '#9C8563', opacity: hovered ? 0 : 1 }}
          >
            {product.fabric ?? product.category}
          </p>

          <div
            className="absolute inset-0 flex items-center gap-2.5 transition-opacity duration-300"
            style={{ opacity: hovered ? 1 : 0 }}
            aria-hidden={!hovered}
          >
            {variants.length === 0 ? (
              <span className="font-mono" style={{ fontSize: '0.66rem', letterSpacing: '0.18em', color: '#9C8563' }}>
                —
              </span>
            ) : (
              variants.map((v) => {
                const out = v.stock_quantity <= 0
                return (
                  <span
                    key={v.id}
                    className="font-mono uppercase"
                    style={{
                      fontSize: '0.64rem',
                      letterSpacing: '0.12em',
                      lineHeight: '16px',
                      color: out ? 'rgba(156,133,99,0.6)' : '#2A2521',
                      textDecoration: out ? 'line-through' : 'none',
                    }}
                  >
                    {v.size}
                  </span>
                )
              })
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
