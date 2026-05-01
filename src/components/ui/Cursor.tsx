'use client'

import { useEffect, useRef } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function Cursor() {
  const isMobile = useIsMobile()
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isMobile) return

    let mouseX = 0
    let mouseY = 0
    let ringX = 0
    let ringY = 0
    let animationId: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`
      }
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`
      }

      animationId = requestAnimationFrame(animateRing)
    }

    const onMouseEnterLink = () => {
      if (ringRef.current) {
        ringRef.current.style.width = '48px'
        ringRef.current.style.height = '48px'
        ringRef.current.style.borderColor = 'var(--sienna)'
        ringRef.current.style.opacity = '1'
      }
    }

    const onMouseLeaveLink = () => {
      if (ringRef.current) {
        ringRef.current.style.width = '32px'
        ringRef.current.style.height = '32px'
        ringRef.current.style.borderColor = 'var(--sienna)'
        ringRef.current.style.opacity = '0.6'
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    animationId = requestAnimationFrame(animateRing)

    const links = document.querySelectorAll('a, button')
    links.forEach((el) => {
      el.addEventListener('mouseenter', onMouseEnterLink)
      el.addEventListener('mouseleave', onMouseLeaveLink)
    })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animationId)
      links.forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnterLink)
        el.removeEventListener('mouseleave', onMouseLeaveLink)
      })
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sienna"
        style={{ transition: 'transform 0.05s linear' }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9997] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sienna"
        style={{
          opacity: 0.6,
          transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease',
        }}
      />
    </>
  )
}