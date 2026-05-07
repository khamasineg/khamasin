'use client'

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

  const handleSignOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
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
      padding: '0 1.5rem',
      gap: '0',
    }}>
      {/* Wordmark */}
      <span style={{
        fontFamily: "'Courier New', monospace",
        fontSize: '13px',
        letterSpacing: '0.28em',
        color: '#FAF6F0',
        marginRight: '2rem',
        flexShrink: 0,
      }}>
        FYNDE
      </span>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, height: '100%' }}>
        {NAV_LINKS.map(link => {
          const isActive = link.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(link.href)
          return (
            <a
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem',
                fontFamily: "'Courier New', monospace",
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: isActive ? '#FAF6F0' : 'rgba(190,176,160,0.55)',
                textDecoration: 'none',
                borderBottom: isActive ? '2px solid #A8401A' : '2px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = '#FAF6F0'
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(190,176,160,0.55)'
              }}
            >
              {link.label}
            </a>
          )
        })}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '9px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(190,176,160,0.45)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0 0.5rem',
          transition: 'color 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#A8401A')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(190,176,160,0.45)')}
      >
        Sign out
      </button>
    </nav>
  )
}
