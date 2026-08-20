'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const LETTERS = ['K', 'H', 'A', 'M', 'S', 'I', 'N']

export default function Hero() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      // Masked letter rise — each glyph sits in an overflow-hidden box and
      // travels up from below its own baseline. Long duration + heavy ease-out
      // keeps it editorial rather than bouncy.
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

      tl.from('.hero-letter', {
        yPercent: 118,
        duration: 1.5,
        stagger: 0.055,
      })
        .from('.hero-rule', { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, '-=0.95')
        .from('.hero-tagline', { opacity: 0, y: 14, filter: 'blur(6px)', duration: 1.1 }, '-=1.0')
        .from('.hero-meta', { opacity: 0, duration: 1.0, stagger: 0.12 }, '-=0.8')
        .from('.hero-cue', { opacity: 0, duration: 0.9 }, '-=0.6')
    },
    { scope: ref }
  )

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-6"
    >
      <div className="relative z-10 flex flex-col items-center">
        {/* Wordmark */}
        <h1
          className="font-display flex"
          style={{
            fontWeight: 300,
            fontSize: 'clamp(3.5rem, 12vw, 10rem)',
            letterSpacing: '0.06em',
            lineHeight: 0.95,
          }}
        >
          {LETTERS.map((letter, i) => (
            <span key={i} className="overflow-hidden inline-block" style={{ paddingBottom: '0.08em' }}>
              <span className="hero-letter inline-block text-ink">{letter}</span>
            </span>
          ))}
        </h1>

        {/* Clay hairline — the single warm accent */}
        <div
          className="hero-rule mt-2 origin-center"
          style={{ height: 1, width: 'min(340px, 58vw)', background: '#B5673A', opacity: 0.75 }}
        />

        <p
          className="hero-tagline font-display italic mt-5"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', color: '#9C8563', letterSpacing: '0.02em' }}
        >
          Cut for the wind.
        </p>

        {/* Editorial micro-detail — Cairo coordinates, from the prototype nav */}
        <div className="flex items-center gap-5 mt-10 flex-wrap justify-center">
          <span className="hero-meta font-mono text-[0.6rem] tracking-[0.24em] uppercase" style={{ color: 'rgba(156,133,99,0.85)' }}>
            N 30°02′ E 31°14′
          </span>
          <span className="hero-meta w-8 h-px" style={{ background: 'rgba(156,133,99,0.4)' }} />
          <span className="hero-meta font-mono text-[0.6rem] tracking-[0.24em] uppercase" style={{ color: 'rgba(156,133,99,0.85)' }}>
            Unisex Bottoms — FW26
          </span>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hero-cue absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="font-mono text-[0.6rem] tracking-[0.2em]" style={{ color: '#9C8563' }}>
          SCROLL
        </span>
        <span
          className="w-px h-9"
          style={{ background: '#9C8563', animation: 'pulse-line 2.4s ease-in-out infinite' }}
        />
      </div>
    </section>
  )
}
