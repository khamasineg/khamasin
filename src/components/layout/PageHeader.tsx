'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/**
 * The single masthead used by every interior page, so Shop / Collections /
 * About / Cart don't each invent their own type scale.
 *
 * Matches the hero's language deliberately:
 *  - eyebrow in Space Mono, wide tracking, Clay
 *  - headline in Fraunces 300 (upright — italic is reserved for product names
 *    and accent phrases, exactly as the prototype uses it)
 *  - a Clay hairline that draws out from the left
 *  - lede capped at ~46ch for a readable measure
 */
export default function PageHeader({
  eyebrow,
  title,
  lede,
  className = '',
}: {
  eyebrow: string
  title: string
  lede?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.ph-eyebrow', { opacity: 0, y: 12, duration: 0.9 })
        .from('.ph-title', { opacity: 0, y: 26, filter: 'blur(6px)', duration: 1.2 }, '-=0.65')
        .from('.ph-rule', { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, '-=0.85')
        .from('.ph-lede', { opacity: 0, y: 14, duration: 0.9 }, '-=0.8')
    },
    { scope: ref }
  )

  return (
    <div ref={ref} className={`max-w-3xl ${className}`}>
      <p className="ph-eyebrow font-mono text-[0.62rem] uppercase tracking-[0.3em]" style={{ color: '#B5673A' }}>
        {eyebrow}
      </p>

      <h1
        className="ph-title font-display text-ink mt-5"
        style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', lineHeight: 1.05, letterSpacing: '0.01em' }}
      >
        {title}
      </h1>

      <div
        className="ph-rule mt-6 origin-left"
        style={{ height: 1, width: 120, background: '#B5673A', opacity: 0.7 }}
      />

      {lede && (
        <p className="ph-lede mt-6 leading-relaxed" style={{ color: '#9C8563', maxWidth: '46ch' }}>
          {lede}
        </p>
      )}
    </div>
  )
}
