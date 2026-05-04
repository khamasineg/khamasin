import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="px-6 py-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 border-t pb-24 md:pb-6"
      style={{
        background: '#1C1917',
        borderColor: 'rgba(240,233,223,0.06)',
      }}
    >
      {/* Logo */}
      <span className="font-display text-xl tracking-[0.14em]" style={{ color: '#FAF6F0' }}>
        FYNDE
      </span>

      {/* Links */}
      <ul className="flex flex-wrap items-center justify-center gap-6 list-none">
        {[
          { href: '/shop', label: 'Shop' },
          { href: '/collections/60s', label: 'Collections' },
          { href: '/lookbook', label: 'Lookbook' },
          { href: '/about', label: 'About' },
        ].map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-mono text-[0.5rem] uppercase tracking-[0.2em] transition-colors"
              style={{ color: 'rgba(190,176,160,0.5)' }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Copyright */}
      <p
        className="font-mono text-[0.5rem] uppercase tracking-[0.15em]"
        style={{ color: 'rgba(190,176,160,0.3)' }}
      >
        © {new Date().getFullYear()} FYNDE. All Rights Reserved.
      </p>
    </footer>
  )
}