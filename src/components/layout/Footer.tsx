import Link from 'next/link'

const LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about', label: 'About' },
]

// Centred and transparent, per the prototype — the wind field carries through
// underneath rather than the footer sitting on its own slab of colour.
export default function Footer() {
  return (
    <footer className="relative z-10 text-center" style={{ padding: '100px 6vw 40px' }}>
      <div className="font-display text-ink" style={{ fontSize: 15, letterSpacing: '0.3em' }}>
        KHAMSIN
      </div>

      <div className="font-mono" style={{ fontSize: 11, color: '#9C8563', marginTop: 14, letterSpacing: '0.05em' }}>
        CAIRO — EST. 2026 — NO DENIM. NO NOISE.
      </div>

      <ul className="flex justify-center list-none" style={{ gap: 24, marginTop: 24 }}>
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="transition-opacity hover:opacity-60"
              style={{ color: '#9C8563', fontSize: 12 }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="font-mono" style={{ fontSize: 10, color: 'rgba(156,133,99,0.5)', marginTop: 40, letterSpacing: '0.05em' }}>
        © {new Date().getFullYear()} KHAMSIN
      </div>
    </footer>
  )
}
