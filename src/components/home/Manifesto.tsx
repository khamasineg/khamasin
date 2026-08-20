'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Copy is the founder's, from the prototype — sharper than anything written
// from the brief alone, so it's kept verbatim.
const LINE_1 = ['No', 'denim.']
const LINE_2 = ['No', 'noise.']
const LINE_3 = ['Bottoms', 'built', 'the', 'way', 'the', 'desert', 'builds', 'a', 'dune', '—']
const LINE_4 = ['by', 'wind,', 'over', 'time,', 'into', 'a', 'shape', 'that', 'moves.']

const PILLARS = ['Stillness', 'Terrain', 'Movement', 'Precision']

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      // Words rise out of blur as the line scrolls in — the same "settling out
      // of blown sand" idea as the wind field, applied to type.
      gsap.from('.mf-word', {
        opacity: 0,
        yPercent: 60,
        filter: 'blur(5px)',
        duration: 1.0,
        stagger: 0.028,
        ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 72%' },
      })

      gsap.from('.mf-pillar', {
        opacity: 0,
        y: 18,
        duration: 0.9,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.mf-pillars', start: 'top 88%' },
      })

      gsap.from('.mf-pillars', {
        scaleX: 0.82,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.mf-pillars', start: 'top 88%' },
      })
    },
    { scope: ref }
  )

  const renderLine = (words: string[], accent = false) => (
    <span className="block">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span
            className="mf-word inline-block"
            style={{ fontStyle: accent ? 'italic' : 'normal', color: accent ? '#B5673A' : undefined }}
          >
            {word}
            {' '}
          </span>
        </span>
      ))}
    </span>
  )

  return (
    <section ref={ref} className="relative z-10 px-6 md:px-[8vw] py-32 md:py-44 max-w-5xl mx-auto text-center">
      <p
        className="font-display text-ink"
        style={{ fontWeight: 300, fontSize: 'clamp(1.5rem, 3.4vw, 2.4rem)', lineHeight: 1.4 }}
      >
        {renderLine(LINE_1)}
        {renderLine(LINE_2, true)}
        {renderLine(LINE_3)}
        {renderLine(LINE_4)}
      </p>

      <div
        className="mf-pillars flex flex-wrap justify-center mt-20"
        style={{ borderTop: '1px solid rgba(156,133,99,0.55)', borderBottom: '1px solid rgba(156,133,99,0.55)' }}
      >
        {PILLARS.map((word, i) => (
          <div
            key={word}
            className="mf-pillar flex-1 min-w-[150px] py-7 px-3 text-center"
            style={{ borderLeft: i === 0 ? 'none' : '1px solid rgba(156,133,99,0.55)' }}
          >
            <div className="font-mono text-[0.62rem] tracking-[0.18em] uppercase" style={{ color: '#9C8563' }}>
              Pillar
            </div>
            <div className="font-display text-ink mt-2" style={{ fontSize: '1.2rem' }}>
              {word}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
