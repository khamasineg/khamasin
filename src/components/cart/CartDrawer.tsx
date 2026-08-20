'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import CartItem from './CartItem'
import { useIsMobile } from '@/hooks/useIsMobile'
import { lockScroll, unlockScroll } from '@/lib/scrollLock'

/**
 * The bag drawer, on-theme rather than a generic slide-out panel.
 *
 * - Bone field, Clay hairline along the leading edge, Sand rules between rows
 *   — same material language as the rest of the site.
 * - Desktop slides from the right; mobile rises from the bottom as a sheet.
 * - Header carries the count as survey-style metadata, not a badge.
 * - Empty state gets direction rather than a shrug (CLAUDE.md §4).
 */
export default function CartDrawer() {
  const { items, isOpen, closeCart, total, itemCount } = useCart()
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isOpen) return
    lockScroll()
    return () => unlockScroll()
  }, [isOpen])

  // Escape closes — expected of any modal surface
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[100]"
        onClick={closeCart}
        style={{ background: 'rgba(42,37,33,0.42)', backdropFilter: 'blur(3px)', animation: 'veil-in 400ms ease forwards' }}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Bag"
        className="fixed z-[101] flex flex-col"
        style={{
          background: '#F1EAD9',
          animation: `${isMobile ? 'drawer-in-mobile' : 'drawer-in'} 560ms cubic-bezier(.16,1,.3,1) forwards`,
          ...(isMobile
            ? { left: 0, right: 0, bottom: 0, maxHeight: '88dvh' }
            : { top: 0, right: 0, height: '100dvh', width: 420 }),
        }}
      >
        {/* Clay hairline on the leading edge */}
        <div
          style={
            isMobile
              ? { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: '#B5673A' }
              : { position: 'absolute', top: 0, bottom: 0, left: 0, width: 1, background: '#B5673A' }
          }
        />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-7 pb-5">
          <div>
            <h2 className="font-display text-ink" style={{ fontWeight: 300, fontSize: '1.6rem', lineHeight: 1 }}>
              The Bag
            </h2>
            <p className="font-mono mt-2" style={{ fontSize: '0.58rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9C8563' }}>
              {String(itemCount).padStart(2, '0')} {itemCount === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close bag"
            className="font-mono transition-colors hover:text-sienna"
            style={{ fontSize: '0.58rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#2A2521', minHeight: 44, minWidth: 44, textAlign: 'right' }}
          >
            Close
          </button>
        </div>

        <div style={{ height: 1, background: 'rgba(156,133,99,0.45)', marginInline: '1.5rem' }} />

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-5 text-center">
              <svg width="30" height="30" viewBox="0 0 20 20" fill="none" stroke="#9C8563" strokeWidth="0.85" aria-hidden="true">
                <path d="M3.2 6.2h13.6L15.9 18H4.1L3.2 6.2Z" strokeLinejoin="round" />
                <path d="M7.1 6.2V4.6a2.9 2.9 0 0 1 5.8 0v1.6" strokeLinecap="round" />
              </svg>
              <p className="font-display italic text-ink" style={{ fontSize: '1.15rem' }}>
                Nothing in the bag yet.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="font-mono border-b pb-1 transition-colors"
                style={{ fontSize: '0.58rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#B5673A', borderColor: 'rgba(181,103,58,0.4)' }}
              >
                Browse the archive →
              </Link>
            </div>
          ) : (
            items.map((item) => <CartItem key={item.variantId} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 pt-5 pb-7" style={{ borderTop: '1px solid rgba(156,133,99,0.45)' }}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-mono" style={{ fontSize: '0.58rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9C8563' }}>
                Subtotal
              </span>
              <span className="font-mono text-ink" style={{ fontSize: '1.05rem' }}>
                EGP {total().toLocaleString()}
              </span>
            </div>
            <p className="font-mono mb-5" style={{ fontSize: '0.52rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(156,133,99,0.85)' }}>
              Shipping calculated at checkout
            </p>

            <button
              onClick={() => { closeCart(); router.push('/cart') }}
              className="w-full font-mono text-ivory bg-ink transition-colors duration-500 hover:bg-sienna"
              style={{ fontSize: '0.6rem', letterSpacing: '0.24em', textTransform: 'uppercase', padding: '1.05rem 0', minHeight: 44 }}
            >
              Review &amp; Ship
            </button>

            <button
              onClick={closeCart}
              className="w-full font-mono mt-3 transition-colors hover:text-sienna"
              style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C8563', minHeight: 44 }}
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
