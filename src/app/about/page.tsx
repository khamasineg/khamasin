'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import PageHeader from '@/components/layout/PageHeader'
import WindDivider from '@/components/wind/WindDivider'
import Media from '@/components/shop/Media'
import { FW26 } from '@/lib/collection'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const PILLARS = [
  { n: '01', name: 'Stillness', body: 'Calm, uncluttered, editorial restraint.' },
  { n: '02', name: 'Terrain', body: 'Real desert geology, not cliché.' },
  { n: '03', name: 'Movement', body: 'Fit designed around how a body moves.' },
  { n: '04', name: 'Precision', body: 'Considered tailoring, not resort wear.' },
]

const WHY: Record<string, string> = {
  Erg: 'A dune-sea is wide, shifting, wind-carved — the wide-leg cut moves the same way.',
  Hamada: 'A rocky plateau holds its shape under pressure — the structured short does too.',
  Sabkha: 'A salt flat is the palest terrain in the desert — the palest tone in the range.',
  Khamsin: 'Named for the wind itself — the palazzo cut, full and moving.',
}

export default function AboutPage() {
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.from('.ab-quote', {
      opacity: 0,
      y: 30,
      filter: 'blur(6px)',
      duration: 1.3,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.ab-quote', start: 'top 82%' },
    })
    gsap.from('.ab-land', {
      opacity: 0,
      y: 46,
      duration: 1.1,
      stagger: 0.09,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.ab-lands', start: 'top 84%' },
    })
    gsap.from('.ab-pillar', {
      opacity: 0,
      y: 22,
      duration: 0.95,
      stagger: 0.09,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.ab-pillars', start: 'top 88%' },
    })
  })

  return (
    <main className="relative">
      <section className="px-6 md:px-[6vw] pt-40 pb-24">
        <PageHeader
          eyebrow="The Name"
          title="Khamsin — the hot, dry wind"
          lede="It blows across Egypt and the Arabian desert every spring. The site's signature motion is wind-based because of this — not as decoration, but as the actual subject."
        />
      </section>

      <div className="px-6 md:px-[6vw]"><WindDivider /></div>

      {/* Pull quote */}
      <section className="px-6 md:px-[6vw] py-28 md:py-36">
        <p
          className="ab-quote font-display text-ink max-w-4xl mx-auto text-center"
          style={{ fontWeight: 300, fontSize: 'clamp(1.5rem, 3.4vw, 2.6rem)', lineHeight: 1.35 }}
        >
          KHAMSIN makes the bottom half of your wardrobe as considered as{' '}
          <em className="italic" style={{ color: '#B5673A' }}>the top half usually is.</em>
        </p>
      </section>

      <div className="px-6 md:px-[6vw]"><WindDivider /></div>

      {/* Landform system — visual, not a text list */}
      <section className="px-6 md:px-[6vw] py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] mb-4" style={{ color: '#B5673A' }}>
            The Landform System
          </p>
          <h2 className="font-display text-ink" style={{ fontWeight: 300, fontSize: 'clamp(1.9rem, 4vw, 3rem)', lineHeight: 1.08 }}>
            Every style is named after real terrain.
          </h2>
        </div>

        <div
          className="ab-lands grid gap-px"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', background: 'rgba(156,133,99,0.5)' }}
        >
          {FW26.map((s) => (
            <div key={s.slug} className="ab-land bg-parchment">
              <div className="relative h-[190px] overflow-hidden">
                <Media
                  src={`/images/styles/${s.slug}.jpg`}
                  alt={s.name}
                  tone={s.tone}
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
              </div>
              <div className="p-6">
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.26em]" style={{ color: '#B5673A' }}>
                  {s.landform}
                </span>
                <div className="font-display italic text-ink mt-1.5" style={{ fontSize: '1.15rem' }}>
                  {s.name}
                </div>
                <p className="text-[0.82rem] mt-2.5 leading-relaxed" style={{ color: '#9C8563' }}>
                  {WHY[s.landform]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="px-6 md:px-[6vw]"><WindDivider /></div>

      {/* Pillars */}
      <section className="px-6 md:px-[6vw] py-24 md:py-32">
        <div
          className="ab-pillars flex flex-wrap"
          style={{ borderTop: '1px solid rgba(156,133,99,0.55)', borderBottom: '1px solid rgba(156,133,99,0.55)' }}
        >
          {PILLARS.map((p, i) => (
            <div
              key={p.n}
              className="ab-pillar flex-1 min-w-[170px] py-9 px-5"
              style={{ borderLeft: i === 0 ? 'none' : '1px solid rgba(156,133,99,0.55)' }}
            >
              <span className="font-mono text-[0.58rem] tracking-[0.26em]" style={{ color: '#B5673A' }}>{p.n}</span>
              <h3 className="font-display text-ink mt-2.5" style={{ fontSize: '1.25rem' }}>{p.name}</h3>
              <p className="text-[0.82rem] mt-2 leading-relaxed" style={{ color: '#9C8563' }}>{p.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
