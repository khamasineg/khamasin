'use client'

import { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { FW26 } from '@/lib/collection'
import Media from '@/components/shop/Media'
import { useIsMobile } from '@/hooks/useIsMobile'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * SIGNATURE MOMENT — "The Landform System", travelled sideways.
 *
 * The lookbook pins one spread at a time and scrubs it in place. This does the
 * opposite: the section pins once and the whole terrain *travels horizontally*
 * past a fixed heading, so vertical scroll becomes lateral movement — a body
 * walking a dune field rather than pages turning.
 *
 * Panels are 74vw so the next landform is always half-visible at the right
 * edge, which is what makes it feel like a continuous field instead of four
 * discrete slides. Each panel's swatch counter-drifts slightly against the
 * travel for parallax depth.
 *
 * Mobile: no pin, no horizontal rig — a plain vertical stack with reveals
 * (CLAUDE.md §7/§10: complex animation off by default).
 */
export default function LandformScroll() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useGSAP(
    () => {
      if (!root.current || !track.current) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      if (isMobile) {
        gsap.from('.lf-panel', {
          opacity: 0,
          y: 40,
          duration: 1,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: track.current, start: 'top 82%' },
        })
        return
      }

      const el = track.current
      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth)

      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // Progress hairline fills as the field travels
      gsap.to('.lf-progress-fill', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => '+=' + distance(),
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })

      // Swatches counter-drift against the travel — parallax depth
      gsap.utils.toArray<HTMLElement>('.lf-media-inner').forEach((media) => {
        gsap.fromTo(
          media,
          { xPercent: -6 },
          {
            xPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: () => '+=' + distance(),
              scrub: 1.1,
              invalidateOnRefresh: true,
            },
          }
        )
      })

      return () => {
        tween.kill()
      }
    },
    { scope: root, dependencies: [isMobile] }
  )

  return (
    <section ref={root} className="relative z-10 overflow-hidden py-24 md:py-0 md:min-h-[100dvh] md:flex md:flex-col md:justify-center">
      {/* Fixed heading — the field moves past this */}
      <div className="px-6 md:px-[6vw] mb-10 md:mb-12">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] mb-4" style={{ color: '#B5673A' }}>
          The Landform System
        </p>
        <h2
          className="font-display text-ink"
          style={{ fontWeight: 300, fontSize: 'clamp(1.9rem, 4.4vw, 3.2rem)', lineHeight: 1.05 }}
        >
          Named for the ground it moves on.
        </h2>
      </div>

      {/* The travelling field */}
      <div
        ref={track}
        className="lf-track flex flex-col md:flex-row gap-px md:gap-0 px-6 md:px-0"
        style={{ background: undefined }}
      >
        {FW26.map((s, i) => (
          <article
            key={s.slug}
            className="lf-panel relative flex-shrink-0 w-full md:w-[74vw] lg:w-[56vw] md:pl-[6vw] mb-12 md:mb-0"
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
              {/* Media */}
              <div
                className="relative overflow-hidden flex-shrink-0 w-full md:w-[26vw]"
                style={{ aspectRatio: '3 / 4' }}
              >
                <div className="lf-media-inner absolute" style={{ inset: '-8%' }}>
                  <Media
                    src={`/images/styles/${s.slug}.jpg`}
                    alt={s.name}
                    tone={s.tone}
                    sizes="(max-width: 768px) 100vw, 30vw"
                  />
                </div>
              </div>

              {/* Copy */}
              <div className="md:pb-6 md:max-w-[24vw]">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[0.6rem] tracking-[0.26em]" style={{ color: '#B5673A' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.26em]" style={{ color: '#9C8563' }}>
                    {s.landform}
                  </span>
                </div>

                <h3
                  className="font-display text-ink mt-3"
                  style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)', lineHeight: 1.05 }}
                >
                  {s.name}
                </h3>

                <p className="mt-4 leading-relaxed text-[0.9rem]" style={{ color: '#9C8563', maxWidth: '34ch' }}>
                  {s.why}
                </p>

                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.26em] mt-6 pb-1 border-b transition-colors"
                  style={{ color: '#B5673A', borderColor: 'rgba(181,103,58,0.35)' }}
                >
                  View the cut
                  <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}

        {/* trailing gutter so the last panel can clear the right edge */}
        <div className="hidden md:block flex-shrink-0" style={{ width: '6vw' }} />
      </div>

      {/* Progress hairline — desktop only */}
      <div className="hidden md:block px-[6vw] mt-14">
        <div style={{ height: 1, background: 'rgba(156,133,99,0.3)', position: 'relative' }}>
          <div
            className="lf-progress-fill absolute inset-0 origin-left"
            style={{ background: '#B5673A', transform: 'scaleX(0)' }}
          />
        </div>
      </div>
    </section>
  )
}
