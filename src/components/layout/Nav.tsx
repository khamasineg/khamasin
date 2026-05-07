'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/hooks/useCart'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, openCart } = useCart()
  const pathname = usePathname()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll while menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* ─── Desktop Nav ─────────────────────────────────────────────────── */}
      {!isMobile && (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-6 mix-blend-multiply">
          {/* Left links */}
          <div className="flex gap-8 items-center">
            {NAV_LINKS.slice(0, 2).map((link) => (
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
            {NAV_LINKS.slice(2, 4).map((link) => (
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

      {/* ─── Mobile Top Bar — static (scrolls with page, not fixed) ─────── */}
      {isMobile && (
        <header
          className="relative z-50 flex items-center justify-between bg-parchment border-b border-taupe-light"
          style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: 'max(0.9rem, env(safe-area-inset-top))', paddingBottom: '0.9rem' }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="min-w-[44px] min-h-[44px] flex items-center justify-start"
          >
            <span style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '20px' }}>
              <span
                style={{
                  display: 'block', height: '1.5px', background: '#1C1917', width: '100%',
                  transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
                  transition: 'transform 0.3s cubic-bezier(0.76,0,0.24,1)',
                }}
              />
              <span
                style={{
                  display: 'block', height: '1.5px', background: '#1C1917', width: '100%',
                  opacity: menuOpen ? 0 : 1,
                  transition: 'opacity 0.2s',
                }}
              />
              <span
                style={{
                  display: 'block', height: '1.5px', background: '#1C1917', width: '100%',
                  transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
                  transition: 'transform 0.3s cubic-bezier(0.76,0,0.24,1)',
                }}
              />
            </span>
          </button>

          {/* Centered logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-display text-xl tracking-widest text-ink">
            FYNDE
          </Link>

          {/* Bag button */}
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="min-w-[44px] min-h-[44px] flex items-center justify-end gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {itemCount > 0 && (
              <span className="font-mono text-[10px] text-ink">{itemCount}</span>
            )}
          </button>
        </header>
      )}

      {/* ─── Mobile Hamburger Menu Overlay ────────────────────────────────── */}
      {isMobile && (
        <div
          aria-hidden={!menuOpen}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: '#1C1917',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            paddingBottom: 'env(safe-area-inset-bottom)',
            // Animate in/out
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? 'auto' : 'none',
            transform: menuOpen ? 'translateY(0)' : 'translateY(-12px)',
            transition: 'opacity 0.35s cubic-bezier(0.76,0,0.24,1), transform 0.35s cubic-bezier(0.76,0,0.24,1)',
          }}
        >
          {/* Sienna rule top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#A8401A' }} />

          {/* Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(190,176,160,0.35)', margin: '0 0 2rem' }}>
              Navigate
            </p>
            {[{ href: '/', label: 'Home' }, ...NAV_LINKS].map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(2.4rem, 10vw, 3.5rem)',
                  color: isActive(link.href) ? '#A8401A' : '#FAF6F0',
                  textDecoration: 'none',
                  lineHeight: 1.15,
                  display: 'block',
                  borderBottom: i < NAV_LINKS.length ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  paddingBottom: '0.6rem',
                  marginBottom: '0.6rem',
                  // Staggered reveal
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateX(0)' : 'translateX(-16px)',
                  transition: `opacity 0.4s ${0.07 * i}s cubic-bezier(0.22,1,0.36,1), transform 0.4s ${0.07 * i}s cubic-bezier(0.22,1,0.36,1), color 0.2s`,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Bottom — bag + social */}
          <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => { setMenuOpen(false); openCart() }}
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '10px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#FAF6F0',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.6rem 1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Bag {itemCount > 0 && `(${itemCount})`}
            </button>

            <p style={{ fontFamily: "'Courier New', monospace", fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(190,176,160,0.3)', margin: 0 }}>
              Cairo, Egypt
            </p>
          </div>
        </div>
      )}
    </>
  )
}
