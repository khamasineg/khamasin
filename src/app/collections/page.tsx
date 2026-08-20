'use client'

import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { TONES } from '@/components/shop/FabricSwatch'
import Media from '@/components/shop/Media'
import PageHeader from '@/components/layout/PageHeader'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const CATEGORIES = [
  { slug: 'trouser', label: 'Trouser', note: 'The core silhouette — straight, considered, everyday.', tone: TONES.erg },
  { slug: 'wide-leg', label: 'Wide-Leg', note: 'Dune-sea volume. Movement built into the cut.', tone: TONES.khamsin },
  { slug: 'short', label: 'Short', note: 'Structured, rocky-plateau proportions.', tone: TONES.hamada },
  { slug: 'palazzo', label: 'Palazzo', note: 'The wind piece — full, fluid, ceremonial.', tone: TONES.sabkha },
  { slug: 'cargo', label: 'Cargo', note: 'Non-denim utility, tonal not tactical.', tone: TONES.hamada },
  { slug: 'pleated', label: 'Pleated', note: 'Precision folds, salt-flat palette.', tone: TONES.sabkha },
]

export default function CollectionsPage() {
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('.cat-tile', {
      opacity: 0,
      y: 48,
      duration: 1.15,
      stagger: 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.cat-grid', start: 'top 85%' },
    })
  })

  return (
    <main className="relative px-6 md:px-[6vw] pt-40 pb-32">
      <PageHeader
        eyebrow="Collections"
        title="By category, not by decade."
        lede="No era taxonomy here — KHAMSIN sorts by cut, the way the ground shapes a trouser."
      />

      <div
        className="cat-grid grid gap-px mt-16"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', background: 'rgba(156,133,99,0.5)' }}
      >
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="cat-tile group block bg-parchment"
          >
            {/* Photography reads at full strength — no dimming, no scrim.
                Text sits below rather than over it, so nothing has to be
                washed out to stay legible. */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
              <div
                className="absolute inset-0 transition-transform duration-[1600ms] group-hover:scale-[1.05]"
                style={{ transitionTimingFunction: 'cubic-bezier(.16,1,.3,1)' }}
              >
                <Media
                  src={`/images/collections/${c.slug}.jpg`}
                  alt={c.label}
                  tone={c.tone}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Contour hairline — the motif, drawn on hover */}
              <svg
                viewBox="0 0 300 400"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                aria-hidden="true"
              >
                <path
                  d="M-10 300 C 44 266, 96 326, 152 292 S 258 250, 312 290"
                  fill="none"
                  stroke="#FAF6EF"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.75"
                  className="[stroke-dasharray:520] [stroke-dashoffset:520] group-hover:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-[1100ms] ease-out"
                />
              </svg>
            </div>

            <div className="px-6 pt-6 pb-8">
              <span
                className="font-display text-ink transition-colors duration-500 group-hover:text-sienna block"
                style={{ fontWeight: 300, fontSize: 'clamp(1.5rem, 2.4vw, 1.95rem)', lineHeight: 1.1 }}
              >
                {c.label}
              </span>
              <p className="text-[0.84rem] mt-2.5 leading-relaxed" style={{ color: '#9C8563', maxWidth: '34ch' }}>
                {c.note}
              </p>
              <span
                className="font-mono text-[0.58rem] uppercase tracking-[0.24em] mt-5 flex items-center gap-2"
                style={{ color: '#B5673A' }}
              >
                Shop {c.label}
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
