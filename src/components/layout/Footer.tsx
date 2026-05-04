'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-taupe bg-parchment px-6 py-12 pb-24 md:pb-12 md:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Top */}
        <div className="mb-12 flex flex-col items-center gap-8 md:flex-row md:justify-between md:items-start">
          {/* Brand */}
          <div>
            <p className="font-display text-4xl tracking-widest text-ink">
              FYNDE
            </p>
            <p className="mt-2 font-serif text-sm italic text-taupe">
              Rare finds, beautifully worn.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-taupe">
                Shop
              </p>
              <Link href="/shop" className="font-mono text-xs text-ink hover:text-sienna transition-colors">
                All Pieces
              </Link>
              <Link href="/collections/60s" className="font-mono text-xs text-ink hover:text-sienna transition-colors">
                The 60s
              </Link>
              <Link href="/collections/70s" className="font-mono text-xs text-ink hover:text-sienna transition-colors">
                The 70s
              </Link>
              <Link href="/collections/80s" className="font-mono text-xs text-ink hover:text-sienna transition-colors">
                The 80s
              </Link>
              <Link href="/collections/90s" className="font-mono text-xs text-ink hover:text-sienna transition-colors">
                The 90s
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-taupe">
                Brand
              </p>
              <Link href="/about" className="font-mono text-xs text-ink hover:text-sienna transition-colors">
                About
              </Link>
              <Link href="/lookbook" className="font-mono text-xs text-ink hover:text-sienna transition-colors">
                Lookbook
              </Link>
              <Link href="/account" className="font-mono text-xs text-ink hover:text-sienna transition-colors">
                Account
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-2 border-t border-taupe-light pt-6 md:flex-row md:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-taupe">
            © {new Date().getFullYear()} FYNDE. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-taupe">
            Cairo, Egypt
          </p>
        </div>
      </div>
    </footer>
  )
}