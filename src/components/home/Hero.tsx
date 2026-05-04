'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function Hero() {
  const parallaxRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!parallaxRef.current) return
      const x = (e.clientX / window.innerWidth - 0.5) * 18
      const y = (e.clientY / window.innerHeight - 0.5) * 10
      parallaxRef.current.style.transform = `translate(${x}px, ${y}px)`
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile])

  return (
    <section className="min-h-screen flex flex-col md:grid md:grid-cols-[5fr_7fr] overflow-hidden">

      {/* Left panel */}
      <div className="flex flex-col justify-end px-6 pt-32 pb-12 md:px-12 md:pt-40 md:pb-16 relative z-10">

        {/* Era labels — desktop only */}
        <div className="hidden md:flex flex-col gap-5 absolute left-0 top-1/2 -translate-y-1/2 pl-3 opacity-40">
          {['60s', '70s', '80s', '90s'].map((era) => (
            <span
              key={era}
              className="font-mono text-ink text-[0.48rem] tracking-[0.3em] uppercase"
              style={{ writingMode: 'vertical-rl' }}
            >
              {era}
            </span>
          ))}
        </div>

        {/* Live dot + stamp */}
        <div className="flex items-center gap-3 mb-8">
          <span
            className="w-1.5 h-1.5 rounded-full bg-sienna"
            style={{ animation: 'pulse 2s ease infinite' }}
          />
          <span className="font-mono text-sienna text-[0.55rem] uppercase tracking-[0.3em]">
            New drops live now
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-8">
          <span
            className="font-serif italic font-light text-ink block leading-[0.92]"
            style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)' }}
          >
            Every piece
          </span>
          <span
            className="font-display text-ink block leading-[0.85] tracking-wide"
            style={{ fontSize: 'clamp(4rem, 10vw, 9rem)' }}
          >
            a rare<br />fynde.
          </span>
        </h1>

        {/* Body */}
        <p
          className="font-mono text-[0.65rem] leading-loose tracking-wide mb-10 max-w-[260px] border-l-2 border-taupe-light pl-4"
          style={{ color: 'rgba(28,25,23,0.5)' }}
        >
          Curated vintage & deadstock clothing from the 60s through the 90s. One-of-one. Yours to discover.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-6 flex-wrap">
          <Link
            href="/shop"
            className="relative overflow-hidden bg-ink text-ivory font-mono text-[0.58rem] uppercase tracking-[0.22em] px-8 py-4 min-h-[44px] flex items-center group"
          >
            <span
              className="absolute inset-0 bg-sienna -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
              style={{ transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)' }}
            />
            <span className="relative z-10">Start the Hunt</span>
          </Link>
          <Link
            href="/lookbook"
            className="font-mono text-[0.58rem] uppercase tracking-[0.2em] flex items-center gap-2 group"
            style={{ color: 'rgba(28,25,23,0.5)' }}
          >
            View Lookbook
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      {/* Right panel — image */}
      <div className="relative overflow-hidden bg-taupe-light min-h-[50vh] md:min-h-0">
        <div
          ref={parallaxRef}
          className="absolute inset-[-5%] transition-transform duration-100 linear"
        >
          <img
            src="/images/hero.jpg"
            alt="FYNDE — Rare vintage wear"
            className="w-full h-full object-cover"
            style={{ filter: 'sepia(0.12) contrast(1.04)' }}
          />
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(240,233,223,0.15) 0%, transparent 60%), linear-gradient(to bottom, rgba(28,25,23,0.06) 0%, transparent 40%)',
          }}
        />

        {/* Vol label */}
        <span
          className="hidden md:block absolute top-8 right-8 font-mono text-[0.5rem] uppercase tracking-[0.25em] z-10"
          style={{ color: 'rgba(28,25,23,0.5)', writingMode: 'vertical-rl' }}
        >
          Vol. 01 — 2025
        </span>

        {/* Era + condition stamp */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.28em] text-ivory bg-sienna px-3 py-1.5">
            Now Available
          </span>
        </div>

        {/* Ticker inside hero on desktop */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-sienna overflow-hidden py-2 hidden md:block">
          <div
            className="whitespace-nowrap font-mono text-[0.55rem] uppercase tracking-[0.22em] text-ivory"
            style={{ animation: 'ticker 28s linear infinite', display: 'inline-block' }}
          >
            Rare Finds, Beautifully Worn &nbsp;·&nbsp; One of One &nbsp;·&nbsp; Free Shipping Over 500 EGP &nbsp;·&nbsp; New Drops Every Week &nbsp;·&nbsp; Carefully Sourced &nbsp;·&nbsp; Rare Finds, Beautifully Worn &nbsp;·&nbsp; One of One &nbsp;·&nbsp; Free Shipping Over 500 EGP &nbsp;·&nbsp; New Drops Every Week &nbsp;·&nbsp; Carefully Sourced &nbsp;·&nbsp;
          </div>
        </div>
      </div>

    </section>
  )
}