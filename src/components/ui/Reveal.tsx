'use client'

import { useRef, ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useIsMobile } from '@/hooks/useIsMobile'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// The shared entrance for scrolled-into-view content, site-wide. Children
// drift in and sharpen out of a slight blur — like settling out of blown
// sand — rather than a generic fade-up. Animates `el.children` (direct
// children of the wrapper), staggered.
export default function Reveal({
  children,
  from = 'left',
  stagger = 0.08,
  delay = 0,
  as = 'div',
  className = '',
}: {
  children: React.ReactNode
  from?: 'left' | 'right' | 'up'
  stagger?: number
  delay?: number
  as?: ElementType
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useGSAP(
    () => {
      if (!ref.current || isMobile) return

      const x = from === 'left' ? -28 : from === 'right' ? 28 : 0
      const y = from === 'up' ? 30 : 0

      gsap.from(ref.current.children, {
        opacity: 0,
        x,
        y,
        filter: 'blur(6px)',
        duration: 0.9,
        delay,
        stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    },
    { scope: ref, dependencies: [isMobile, from, stagger, delay] }
  )

  const Tag = as
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
