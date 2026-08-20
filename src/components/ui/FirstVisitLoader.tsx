'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/**
 * FIRST VISIT — "Wind Reveal", built to hand off into the home hero.
 *
 * The previous version split the screen apart, which was its own separate
 * event — you watched a loader, then you watched a homepage. This one is
 * designed as the FIRST HALF OF THE HERO instead:
 *
 *  - The wordmark is set to the hero's exact type spec (Fraunces 300,
 *    clamp(3.5rem,12vw,10rem), 0.06em tracking) and sits in the hero's exact
 *    position — dead centre of the viewport.
 *  - Letters blow in from the right on a stagger, out of blur, in the
 *    direction the wind actually travels in the canvas behind. The hero's own
 *    letters rise vertically, so the two motions read as different gestures on
 *    the same object rather than a repeat.
 *  - Then the Bone field wipes away downward on a soft edge and the wordmark
 *    crossfades — and because the hero's settled wordmark is already sitting
 *    at that identical position underneath, the handoff looks like one
 *    continuous element rather than a screen being replaced.
 *
 * Dismissal is on setTimeout, never the GSAP timeline: rAF (and therefore
 * GSAP's ticker) is suspended in a background tab, and an onComplete-driven
 * exit would leave the overlay stuck forever with body scroll locked.
 */

const LETTERS = ['K', 'H', 'A', 'M', 'S', 'I', 'N']
const TOTAL_MS = 2500

export default function FirstVisitLoader() {
  const pathname = usePathname()
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (pathname.startsWith('/admin')) return
    if (sessionStorage.getItem('khamsin-entered')) return
    setActive(true)
    document.body.style.overflow = 'hidden'
  }, [pathname])

  useEffect(() => {
    if (!active) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => {
      document.body.style.overflow = ''
      sessionStorage.setItem('khamsin-entered', '1')
      setActive(false)
    }, reduce ? 400 : TOTAL_MS)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ''
    }
  }, [active])

  useGSAP(
    () => {
      if (!active || !root.current) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const tl = gsap.timeline()

      // 1 — letters carried in on the wind, left→right, out of blur
      tl.fromTo(
        '.wr-letter',
        { opacity: 0, x: 46, filter: 'blur(10px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.15, stagger: 0.07, ease: 'expo.out' }
      )
        // 2 — Clay hairline draws beneath, same as the hero's
        .fromTo('.wr-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.inOut' }, '-=0.7')
        .fromTo('.wr-tag', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.55')

        // 3 — the field falls away; wordmark crossfades into the hero's own
        .to('.wr-tag', { opacity: 0, duration: 0.3 }, '+=0.15')
        .to('.wr-veil', { yPercent: 100, duration: 0.95, ease: 'expo.inOut' }, '-=0.1')
        .to('.wr-mark', { opacity: 0, duration: 0.6, ease: 'power2.in' }, '<+=0.15')
    },
    { scope: root, dependencies: [active] }
  )

  if (!mounted || !active) return null

  return (
    <div ref={root} className="fixed inset-0 z-[9999] pointer-events-none" aria-hidden="true">
      {/* The Bone field that falls away */}
      <div
        className="wr-veil absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #FAF6EF 0%, #F1EAD9 55%, #EADFC8 100%)',
        }}
      />

      {/* Wordmark — hero type spec, hero position */}
      <div className="wr-mark absolute inset-0 flex flex-col items-center justify-center px-6">
        <div
          className="font-display flex"
          style={{ fontWeight: 300, fontSize: 'clamp(3.5rem, 12vw, 10rem)', letterSpacing: '0.06em', lineHeight: 0.95 }}
        >
          {LETTERS.map((l, i) => (
            <span key={i} className="wr-letter inline-block text-ink">
              {l}
            </span>
          ))}
        </div>

        <div
          className="wr-rule mt-2 origin-center"
          style={{ height: 1, width: 'min(340px, 58vw)', background: '#B5673A', opacity: 0.75 }}
        />

        <p
          className="wr-tag font-display italic mt-5"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', color: '#9C8563', letterSpacing: '0.02em' }}
        >
          Cut for the wind.
        </p>
      </div>
    </div>
  )
}
