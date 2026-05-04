'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

export default function Nav() {
  const [isMobile, setIsMobile] = useState(false)
  const { itemCount, openCart } = useCart()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return (
    <>
      {/* Desktop Nav */}
      {!isMobile && (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 mix-blend-multiply">
          {/* Left links */}
          <div className="flex gap-8">
            <Link
              href="/shop"
              className="font-mono text-xs uppercase tracking-widest text-ink hover:text-sienna transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/collections"
              className="font-mono text-xs uppercase tracking-widest text-ink hover:text-sienna transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/lookbook"
              className="font-mono text-xs uppercase tracking-widest text-ink hover:text-sienna transition-colors"
            >
              Lookbook
            </Link>
          </div>

          {/* Center logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-display text-2xl tracking-widest text-ink hover:text-sienna transition-colors"
          >
            FYNDE
          </Link>

          {/* Right links */}
          <div className="flex gap-8 items-center">
            <Link
              href="/about"
              className="font-mono text-xs uppercase tracking-widest text-ink hover:text-sienna transition-colors"
            >
              About
            </Link>
            <Link
              href="/account"
              className="font-mono text-xs uppercase tracking-widest text-ink hover:text-sienna transition-colors"
            >
              Account
            </Link>
            <button
              onClick={openCart}
              className="font-mono text-xs uppercase tracking-widest text-ink hover:text-sienna transition-colors"
            >
              Cart {itemCount > 0 && `(${itemCount})`}
            </button>
          </div>
        </nav>
      )}
{/* Mobile Top Header */}
{isMobile && (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-parchment border-b border-taupe-light" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>    <Link href="/" className="font-display text-xl tracking-widest text-ink">
      FYNDE
    </Link>
    <button
      onClick={openCart}
      className="font-mono text-[10px] uppercase tracking-widest text-ink min-w-[44px] min-h-[44px] flex items-center justify-end"
    >
      Cart {itemCount > 0 && `(${itemCount})`}
    </button>
  </div>
)}
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-taupe bg-parchment px-4 py-3">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              Home
            </span>
          </Link>
          <Link
            href="/shop"
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              Shop
            </span>
          </Link>
          <Link
            href="/collections"
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              Collections
            </span>
          </Link>
          <Link
            href="/lookbook"
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              Lookbook
            </span>
          </Link>
          <button
            onClick={openCart}
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              Cart {itemCount > 0 && `(${itemCount})`}
            </span>
          </button>
        </nav>
      )}
    </>
  )
}