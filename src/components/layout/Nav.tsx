'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useIsMobile } from '@/hooks/useIsMobile'
import BagButton from '@/components/cart/BagButton'
import { lockScroll, unlockScroll } from '@/lib/scrollLock'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const isMobile = useIsMobile(700)
  const [menuOpen, setMenuOpen] = useState(false)
  const { openCart } = useCart()
  const pathname = usePathname()

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    lockScroll()
    return () => unlockScroll()
  }, [menuOpen])

  const isActive = (path: string) => (path === '/' ? pathname === '/' : pathname.startsWith(path))

  return (
    <>
      {/*
        mix-blend-mode: difference (from the prototype) means the bar inverts
        against whatever scrolls beneath it — it stays legible over pale dunes
        and dark sections alike with no scroll listener and no colour swapping.
        Everything inside must therefore be authored in Bleached Bone.
      */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between"
        style={{ padding: '28px 5vw', mixBlendMode: 'difference' }}
      >
        <Link
          href="/"
          className="font-display"
          style={{ fontWeight: 400, fontSize: 20, letterSpacing: '0.28em', color: '#FAF6EF' }}
        >
          KHAMSIN
        </Link>

        {!isMobile && (
          <ul className="flex list-none" style={{ gap: 36 }}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-opacity hover:opacity-60"
                  style={{
                    color: '#FAF6EF',
                    fontSize: 13,
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                    opacity: isActive(link.href) ? 0.55 : 1,
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center" style={{ gap: 20 }}>
          {!isMobile && (
            <span className="font-mono" style={{ fontSize: 11, color: '#FAF6EF', letterSpacing: '0.05em', opacity: 0.8 }}>
              N 30°02′ E 31°14′
            </span>
          )}

          <span style={{ color: '#FAF6EF' }}>
            <BagButton onClick={openCart} compact={isMobile} />
          </span>

          {isMobile && (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="flex flex-col justify-center items-end"
              style={{ width: 24, height: 24, gap: 5 }}
            >
              <span style={{ display: 'block', height: 1, width: 22, background: '#FAF6EF', transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none', transition: 'transform .3s cubic-bezier(.76,0,.24,1)' }} />
              <span style={{ display: 'block', height: 1, width: 22, background: '#FAF6EF', opacity: menuOpen ? 0 : 1, transition: 'opacity .2s' }} />
              <span style={{ display: 'block', height: 1, width: 22, background: '#FAF6EF', transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none', transition: 'transform .3s cubic-bezier(.76,0,.24,1)' }} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu — deliberately outside the difference-blended bar */}
      {isMobile && (
        <div
          aria-hidden={!menuOpen}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            background: '#F1EAD9',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 2rem',
            paddingBottom: 'env(safe-area-inset-bottom)',
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? 'auto' : 'none',
            transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'opacity .4s cubic-bezier(.76,0,.24,1), transform .4s cubic-bezier(.76,0,.24,1)',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: '#B5673A' }} />

          <nav className="flex flex-col">
            <p className="font-mono" style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(156,133,99,0.6)', margin: '0 0 2rem' }}>
              Navigate
            </p>
            {[{ href: '/', label: 'Home' }, ...NAV_LINKS].map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display"
                style={{
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(2.2rem, 9vw, 3.2rem)',
                  color: isActive(link.href) ? '#B5673A' : '#2A2521',
                  lineHeight: 1.2,
                  borderBottom: i < NAV_LINKS.length ? '1px solid rgba(156,133,99,0.22)' : 'none',
                  paddingBottom: '0.5rem',
                  marginBottom: '0.5rem',
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateX(0)' : 'translateX(-14px)',
                  transition: `opacity .45s ${0.06 * i}s cubic-bezier(.22,1,.36,1), transform .45s ${0.06 * i}s cubic-bezier(.22,1,.36,1)`,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="font-mono mt-10" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(156,133,99,0.7)' }}>
            N 30°02′ E 31°14′ — CAIRO
          </p>
        </div>
      )}
    </>
  )
}
