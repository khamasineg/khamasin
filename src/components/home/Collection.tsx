'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import FabricSwatch, { TONES, SwatchTone } from '@/components/shop/FabricSwatch'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Styles, copy and pricing are the founder's, from the prototype. These render
// until the Supabase catalog is seeded, at which point real rows take over.
const PROTOTYPE_STYLES = [
  { slug: 'erg-trouser', name: 'The Erg Trouser', desc: 'Wide through the leg, tapered at the ankle. Mid-weight tencel twill.', price: 2400, tone: TONES.erg },
  { slug: 'hamada-short', name: 'The Hamada Short', desc: 'Structured, high-rise, tailored short in brushed cotton gabardine.', price: 1650, tone: TONES.hamada },
  { slug: 'sabkha-pant', name: 'The Sabkha Pant', desc: 'Tone-on-tone, palest piece in the collection. Fluid crepe, pleated front.', price: 2150, tone: TONES.sabkha },
  { slug: 'khamsin-wrap', name: 'The Khamsin Wrap', desc: 'The wind piece. Palazzo-cut, unstructured, moves with the body.', price: 2600, tone: TONES.khamsin },
]

const TONE_CYCLE: SwatchTone[] = [TONES.erg, TONES.hamada, TONES.sabkha, TONES.khamsin]

type Card = {
  slug: string
  name: string
  desc: string
  price: number
  tone: SwatchTone
  image?: string
}

export default function Collection() {
  const ref = useRef<HTMLElement>(null)
  const [cards, setCards] = useState<Card[]>(PROTOTYPE_STYLES)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(8)

      if (!error && data && data.length > 0) {
        const live = (data as unknown as Product[]).map((p, i) => ({
          slug: p.slug,
          name: p.name,
          desc: p.description ?? p.fabric ?? '',
          price: p.price,
          tone: TONE_CYCLE[i % TONE_CYCLE.length],
          image: p.images?.[0],
        }))
        setCards(live)
        setIsLive(true)
      }
    }
    load()
  }, [])

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      gsap.from('.col-head > *', {
        opacity: 0,
        y: 22,
        duration: 1.0,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.col-head', start: 'top 85%' },
      })

      // Cards clip upward into place — a wipe, not a fade, so it reads as
      // material arriving rather than UI appearing.
      gsap.from('.col-card', {
        opacity: 0,
        y: 46,
        duration: 1.15,
        stagger: 0.09,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.col-grid', start: 'top 82%' },
      })
    },
    { scope: ref, dependencies: [cards.length] }
  )

  return (
    <section ref={ref} id="collection" className="relative z-10 px-6 md:px-[6vw] py-24 md:py-32">
      <div className="col-head flex justify-between items-end mb-12 flex-wrap gap-4">
        <h2 className="font-display text-ink" style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          The Collection
        </h2>
        <span className="font-mono text-[0.7rem] tracking-[0.12em]" style={{ color: '#9C8563' }}>
          {String(cards.length).padStart(2, '0')} STYLES — FW26
        </span>
      </div>

      {/* 1px dune gaps read as hairline rules between cards (prototype detail) */}
      <div
        className="col-grid grid gap-px"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          background: 'rgba(156,133,99,0.55)',
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.slug}
            href={isLive ? `/shop/${card.slug}` : '/shop'}
            className="col-card group relative block bg-parchment overflow-hidden"
          >
            <div className="relative h-[340px] overflow-hidden">
              <div className="absolute inset-0 transition-transform duration-[1400ms] group-hover:scale-[1.045]"
                   style={{ transitionTimingFunction: 'cubic-bezier(.16,1,.3,1)' }}>
                {card.image ? (
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <FabricSwatch tone={card.tone} />
                )}
              </div>
            </div>

            <div className="px-5 pt-6 pb-7">
              <div className="font-display italic text-ink" style={{ fontSize: '1.25rem' }}>
                {card.name}
              </div>
              {card.desc && (
                <p className="text-[0.82rem] mt-1.5 leading-relaxed" style={{ color: '#9C8563' }}>
                  {card.desc}
                </p>
              )}
              <div className="font-mono text-[0.8rem] mt-3.5" style={{ color: '#B5673A' }}>
                EGP {card.price.toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!isLive && (
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mt-10 text-center" style={{ color: '#9C8563' }}>
          Prototype styles — live catalog takes over once the collection is seeded
        </p>
      )}
    </section>
  )
}
