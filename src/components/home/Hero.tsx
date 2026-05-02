'use client'

import { useRef } from 'react'
import Link from 'next/link'

export default function Hero() {
  const imageRef = useRef<HTMLDivElement>(null)

  return (
    <section className="relative min-h-screen bg-parchment flex flex-col px-6 pt-24 pb-32 md:px-16 md:pt-32">

      {/* Top line — era label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">
          Est. 1960 — 1999
        </span>
        <span className="h-px flex-1 bg-taupe-light" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">
          One of one
        </span>
      </div>

      {/* Headline */}
      <div className="mb-6">
        <h1 className="font-display text-[clamp(64px,18vw,160px)] leading-none tracking-wider text-ink uppercase">
          RARE
        </h1>
        <h1 className="font-serif text-[clamp(48px,13vw,120px)] leading-none italic text-ink -mt-2 md:-mt-4">
          finds.
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mt-4">
          Beautifully worn. Carefully sourced. One of one.
        </p>
      </div>

      {/* Hero image */}
      <div
        ref={imageRef}
        className="relative w-full flex-1 min-h-[340px] md:min-h-[500px] rounded-sm overflow-hidden bg-taupe mb-8"
      >
       {/* Hero Image */}
<img
  src="/images/hero.jpg"
  alt="Marlboro Vintage Jacket — 1980s"
  className="absolute inset-0 w-full h-full object-cover"
/>

        {/* Era stamp */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-ivory border border-ivory/40 px-2 py-1">
            80s
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-ivory border border-ivory/40 px-2 py-1">
            Excellent
          </span>
        </div>

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent pointer-events-none" />
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
        <Link
          href="/shop"
          className="flex items-center justify-center bg-ink text-ivory font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-sienna transition-colors duration-300 min-h-[44px]"
        >
          Shop the Archive
        </Link>
        <Link
          href="/lookbook"
          className="flex items-center justify-center border border-ink text-ink font-mono text-xs uppercase tracking-widest px-8 py-4 hover:border-sienna hover:text-sienna transition-colors duration-300 min-h-[44px]"
        >
          View Lookbook
        </Link>
      </div>

      {/* Scroll hint — desktop only */}
      <div className="hidden md:flex items-center gap-3 mt-12">
        <span className="h-px w-8 bg-taupe" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">
          Scroll to explore
        </span>
      </div>

    </section>
  )
}