import Link from 'next/link'

// A drifting contour line standing in for the footer's top border — same
// motif as ContourWind, just one quiet line marking the edge instead of a
// hard rule. Skips the drift animation on mobile per the reduced-motion rule.
function FooterContour() {
  return (
    <div className="absolute top-0 left-0 right-0 h-px overflow-hidden pointer-events-none">
      <svg
        viewBox="0 0 1600 12"
        preserveAspectRatio="none"
        className="w-[200%] h-3 block md:motion-safe:animate-[contour-drift_140s_linear_infinite]"
      >
        <path
          d="M0 6 C 60 1, 120 11, 180 5 S 300 -1, 360 6 S 480 12, 540 4 S 660 -2, 720 6 L 800 5 C 860 0, 920 10, 980 5 S 1100 -1, 1160 6 S 1280 12, 1340 4 S 1460 -2, 1520 6 L 1600 5"
          fill="none"
          stroke="rgba(198,174,130,0.35)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

export default function Footer() {
  return (
    <footer
      className="relative px-6 py-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 pb-24 md:pb-6"
      style={{
        background: '#2A2521',
      }}
    >
      <FooterContour />
      {/* Logo */}
      <span className="font-display text-xl tracking-[0.14em]" style={{ color: '#FAF6EF' }}>
        KHAMSIN
      </span>

      {/* Links */}
      <ul className="flex flex-wrap items-center justify-center gap-6 list-none">
        {[
          { href: '/shop', label: 'Shop' },
          { href: '/collections', label: 'Collections' },
          { href: '/lookbook', label: 'Lookbook' },
          { href: '/about', label: 'About' },
        ].map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-mono text-[0.5rem] uppercase tracking-[0.2em] transition-colors"
              style={{ color: 'rgba(156,133,99,0.5)' }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Copyright */}
      <p
        className="font-mono text-[0.5rem] uppercase tracking-[0.15em]"
        style={{ color: 'rgba(156,133,99,0.3)' }}
      >
        © {new Date().getFullYear()} KHAMSIN. All Rights Reserved.
      </p>
    </footer>
  )
}