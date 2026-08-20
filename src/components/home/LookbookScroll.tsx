'use client'

import { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import FabricSwatch from '@/components/shop/FabricSwatch'
import { FW26 } from '@/lib/collection'
import WindDivider from '@/components/wind/WindDivider'
import { useIsMobile } from '@/hooks/useIsMobile'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const SPREADS = FW26

/**
 * Editorial lookbook choreography until the real shoot lands.
 * Desktop: pinned spreads with image scale + copy settle.
 * Mobile: simple reveals — no pin (CLAUDE.md §10).
 */
export default function LookbookScroll() {
  const root = useRef<HTMLElement>(null)
  const isMobile = useIsMobile()

  useGSAP(
    () => {
      if (!root.current) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      gsap.from('.lb-intro > *', {
        opacity: 0,
        y: 28,
        filter: 'blur(6px)',
        duration: 1.0,
        stagger: 0.1,
        ease: 'expo.out',
      })

      if (isMobile) {
        gsap.utils.toArray<HTMLElement>('.lb-spread').forEach((el) => {
          gsap.from(el.querySelectorAll('.lb-media, .lb-copy'), {
            opacity: 0,
            y: 24,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          })
        })

        gsap.from('.lb-close > *', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.lb-close', start: 'top 85%' },
        })
        return
      }

      gsap.utils.toArray<HTMLElement>('.lb-spread').forEach((el) => {
        const media = el.querySelector('.lb-media')
        const copy = el.querySelectorAll('.lb-copy > *')
        const contour = el.querySelector('.lb-contour path')

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: '+=120%',
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
          },
        })

        if (media) {
          gsap.set(media, { scale: 1.12, filter: 'blur(8px)' })
          tl.to(media, { scale: 1, filter: 'blur(0px)', ease: 'none', duration: 1 }, 0)
        }

        if (copy.length) {
          gsap.set(copy, { opacity: 0, y: 36 })
          tl.to(copy, { opacity: 1, y: 0, stagger: 0.08, ease: 'none', duration: 0.55 }, 0.25)
        }

        if (contour) {
          const path = contour as SVGPathElement
          const len = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 800
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
          tl.to(path, { strokeDashoffset: 0, ease: 'none', duration: 0.7 }, 0.15)
        }
      })

      const closePath = root.current.querySelector('.lb-close-contour path') as SVGPathElement | null
      if (closePath) {
        const len = typeof closePath.getTotalLength === 'function' ? closePath.getTotalLength() : 900
        gsap.set(closePath, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(closePath, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.lb-close', start: 'top 80%' },
        })
      }

      gsap.from('.lb-close-copy > *', {
        opacity: 0,
        y: 24,
        filter: 'blur(5px)',
        duration: 0.9,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.lb-close', start: 'top 78%' },
      })
    },
    { scope: root, dependencies: [isMobile] }
  )

  return (
    <main ref={root} className="relative">
      <section className="lb-intro min-h-[85dvh] flex flex-col justify-center px-6 md:px-[8vw] pt-36 pb-24">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] mb-5" style={{ color: '#B5673A' }}>
          Vol. 01 — FW26
        </p>
        <h1
          className="font-display text-ink mb-6"
          style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1.02 }}
        >
          Terrain in motion.
        </h1>
        <p className="text-base leading-relaxed mb-10" style={{ color: '#9C8563', maxWidth: '42ch' }}>
          The first issue is being shot — flat midday light, garments that move.
          Until then: four landforms, four cuts, the contour that carries them.
        </p>
        <WindDivider />
      </section>

      {SPREADS.map((spread, i) => {
        const reverse = i % 2 === 1
        return (
          <section
            key={spread.slug}
            className="lb-spread relative min-h-[100dvh] flex items-center px-6 md:px-[6vw] py-16 md:py-0"
          >
            <div
              className={`w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center ${
                reverse ? 'md:[direction:rtl]' : ''
              }`}
            >
              <div
                className={`lb-media relative aspect-[3/4] w-full overflow-hidden will-change-transform ${
                  reverse ? 'md:[direction:ltr]' : ''
                }`}
              >
                <FabricSwatch tone={spread.tone} />
                <svg
                  className="lb-contour absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 300 400"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M-10 300 C 50 260, 100 340, 160 290 S 250 250, 310 295"
                    fill="none"
                    stroke="#FAF6EF"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    opacity={0.55}
                  />
                </svg>
              </div>

              <div className={`lb-copy ${reverse ? 'md:[direction:ltr]' : ''}`}>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] mb-3" style={{ color: '#B5673A' }}>
                  {String(i + 1).padStart(2, '0')} — {spread.landform}
                </p>
                <h2
                  className="font-display text-ink mb-4"
                  style={{ fontWeight: 300, fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.1 }}
                >
                  {spread.name}
                </h2>
                <p className="text-base leading-relaxed mb-8" style={{ color: '#9C8563', maxWidth: '36ch' }}>
                  {spread.line}
                </p>
                <Link
                  href={`/shop/${spread.slug}`}
                  className="inline-flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-ink min-h-[44px] group/link"
                >
                  View piece
                  <span className="block w-8 h-px bg-sienna transition-transform duration-500 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </section>
        )
      })}

      <section className="lb-close px-6 md:px-[8vw] py-32 md:py-44 text-center">
        <div className="max-w-xl mx-auto">
          <svg
            className="lb-close-contour w-full h-6 mb-10"
            viewBox="0 0 600 24"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 12 C 80 2, 160 22, 240 10 S 400 0, 480 14 S 560 24, 600 12"
              fill="none"
              stroke="#C6AE82"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>

          <div className="lb-close-copy">
            <h2
              className="font-display text-ink mb-4"
              style={{ fontWeight: 300, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}
            >
              The shoot comes next.
            </h2>
            <p className="text-sm leading-relaxed mb-10" style={{ color: '#9C8563' }}>
              Raw plaster, sand-toned concrete, real desert light. No filter, no vignette.
            </p>
            <Link
              href="/shop"
              className="inline-block font-mono text-[0.68rem] uppercase tracking-[0.24em] px-8 py-4 min-h-[44px] bg-ink text-ivory hover:bg-sienna transition-colors duration-300"
            >
              Shop the cuts
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
