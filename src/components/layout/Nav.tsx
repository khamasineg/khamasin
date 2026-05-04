'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/hooks/useCart'

export default function Nav() {
  const [isMobile, setIsMobile] = useState(false)
  const { itemCount, openCart } = useCart()
  const pathname = usePathname()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/collections', label: 'Collections' },
    { href: '/lookbook', label: 'Lookbook' },
    { href: '/about', label: 'About' },
  ]

  return (
    <>
      {/* Desktop Nav */}
      {!isMobile && (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-6 mix-blend-multiply">
          {/* Left links */}
          <div className="flex gap-8 items-center">
            {navLinks.slice(0,2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-mono text-[0.58rem] uppercase tracking-[0.22em] transition-colors"
                style={{ color: isActive(link.href) ? '#A8401A' : 'rgba(28,25,23,0.5)' }}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 h-px bg-sienna transition-all duration-300"
                  style={{ width: isActive(link.href) ? '100%' : '0%' }}
                />
              </Link>
            ))}
          </div>

          {/* Center logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-display text-2xl tracking-[0.14em] text-ink hover:text-sienna transition-colors duration-300"
          >
            FYNDE
          </Link>

          {/* Right links */}
          <div className="flex gap-8 items-center">
            {navLinks.slice(2,4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-mono text-[0.58rem] uppercase tracking-[0.22em] transition-colors"
                style={{ color: isActive(link.href) ? '#A8401A' : 'rgba(28,25,23,0.5)' }}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 h-px bg-sienna transition-all duration-300"
                  style={{ width: isActive(link.href) ? '100%' : '0%' }}
                />
              </Link>
            ))}
            <button
  onClick={openCart}
  className="font-mono text-[0.58rem] uppercase tracking-[0.22em] border border-ink px-4 py-2 hover:bg-sienna hover:border-sienna hover:text-ivory transition-colors duration-300 flex items-center gap-2"
  style={{ color: '#1C1917' }}
>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
  {itemCount > 0 ? `Bag (${itemCount})` : 'Bag'}
</button>
          </div>
        </nav>
      )}

      {/* Mobile Top Header */}
      {isMobile && (
        <div
          id="mobile-header"
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 bg-parchment border-b border-taupe-light"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: '1rem' }}
        >
          <Link href="/" className="font-display text-xl tracking-widest text-ink">
            FYNDE
          </Link>
          <button
            onClick={openCart}
            className="font-mono text-[10px] uppercase tracking-widest text-ink min-w-[44px] min-h-[44px] flex items-center justify-end"
          >
            Bag {itemCount > 0 && `(${itemCount})`}
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-taupe bg-parchment px-4"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))', paddingTop: '0.75rem' }}
        >
          {[
            { href: '/', label: 'Home' },
            { href: '/shop', label: 'Shop' },
            { href: '/collections', label: 'Collection' },
            { href: '/lookbook', label: 'Lookbook' },
            { href: '/about', label: 'About' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center relative"
            >
              {isActive(link.href) && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sienna" />
              )}
              <span
                className="font-mono text-[10px] uppercase tracking-widest transition-colors"
                style={{ color: isActive(link.href) ? '#A8401A' : '#1C1917' }}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </>
  )
}