'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/coupons', label: 'Coupons' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Lock scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSignOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const currentPage = NAV_LINKS.find(l => isActive(l.href))?.label ?? 'Admin'

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 600,
        height: '48px',
        background: '#111',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
      }}>
        {/* Wordmark */}
        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '12px',
          letterSpacing: '0.28em',
          color: '#FAF6F0',
          flexShrink: 0,
          marginRight: '1.5rem',
        }}>
          FYNDE
        </span>

        {/* Desktop links */}
        {!isMobile && (
          <>
            <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, height: '100%' }}>
              {NAV_LINKS.map(link => {
                const active = isActive(link.href)
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 0.9rem',
                      fontFamily: "'Courier New', monospace",
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: active ? '#FAF6F0' : 'rgba(190,176,160,0.5)',
                      textDecoration: 'none',
                      borderBottom: active ? '2px solid #A8401A' : '2px solid transparent',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#FAF6F0' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(190,176,160,0.5)' }}
                  >
                    {link.label}
                  </a>
                )
              })}
            </div>
            <button
              onClick={handleSignOut}
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '9px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(190,176,160,0.4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 0.5rem',
                transition: 'color 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#A8401A')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(190,176,160,0.4)')}
            >
              Sign out
            </button>
          </>
        )}

        {/* Mobile — current page name + hamburger */}
        {isMobile && (
          <>
            <span style={{
              flex: 1,
              fontFamily: "'Courier New', monospace",
              fontSize: '9px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(190,176,160,0.7)',
            }}>
              {currentPage}
            </span>
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle admin menu"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 0.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                alignItems: 'flex-end',
                width: '32px',
                height: '32px',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{
                display: 'block', height: '1.5px', background: '#FAF6F0',
                width: '18px',
                transform: mobileOpen ? 'translateY(5.5px) rotate(45deg)' : 'none',
                transition: 'transform 0.25s ease',
              }} />
              <span style={{
                display: 'block', height: '1.5px', background: '#FAF6F0',
                width: '14px',
                opacity: mobileOpen ? 0 : 1,
                transition: 'opacity 0.15s',
              }} />
              <span style={{
                display: 'block', height: '1.5px', background: '#FAF6F0',
                width: '18px',
                transform: mobileOpen ? 'translateY(-5.5px) rotate(-45deg)' : 'none',
                transition: 'transform 0.25s ease',
              }} />
            </button>
          </>
        )}
      </nav>

      {/* Mobile menu dropdown */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            top: '48px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 590,
            background: '#0D0B09',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1.5rem',
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? 'auto' : 'none',
            transform: mobileOpen ? 'translateY(0)' : 'translateY(-8px)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
        >
          {NAV_LINKS.map((link, i) => {
            const active = isActive(link.href)
            return (
              <a
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '2rem',
                  color: active ? '#A8401A' : '#FAF6F0',
                  textDecoration: 'none',
                  padding: '0.7rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? 'translateX(0)' : 'translateX(-12px)',
                  transition: `opacity 0.3s ${0.05 * i}s ease, transform 0.3s ${0.05 * i}s ease, color 0.15s`,
                }}
              >
                {link.label}
              </a>
            )
          })}

          <button
            onClick={handleSignOut}
            style={{
              marginTop: 'auto',
              fontFamily: "'Courier New', monospace",
              fontSize: '9px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(190,176,160,0.4)',
              background: 'none',
              border: '1px solid rgba(190,176,160,0.15)',
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'color 0.15s',
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </>
  )
}
