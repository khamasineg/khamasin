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

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`
        dotRef.current.style.top = `${mouseY}px`
      }
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12

      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`
        ringRef.current.style.top = `${ringY}px`
      }

      requestAnimationFrame(animateRing)
    }

    const onMouseEnterLink = () => {
      if (dotRef.current) {
        dotRef.current.style.width = '48px'
        dotRef.current.style.height = '48px'
        dotRef.current.style.opacity = '0.2'
      }
      if (ringRef.current) {
        ringRef.current.style.width = '10px'
        ringRef.current.style.height = '10px'
        ringRef.current.style.opacity = '0'
      }
    }

    const onMouseLeaveLink = () => {
      if (dotRef.current) {
        dotRef.current.style.width = '10px'
        dotRef.current.style.height = '10px'
        dotRef.current.style.opacity = '1'
      }
      if (ringRef.current) {
        ringRef.current.style.width = '38px'
        ringRef.current.style.height = '38px'
        ringRef.current.style.opacity = '0.35'
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    const animId = requestAnimationFrame(animateRing)

    const links = document.querySelectorAll('a, button')
    links.forEach((el) => {
      el.addEventListener('mouseenter', onMouseEnterLink)
      el.addEventListener('mouseleave', onMouseLeaveLink)
    })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animId)
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
        className="pointer-events-none fixed z-[9998] rounded-full bg-sienna"
        style={{
          width: '10px',
          height: '10px',
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease',
          top: 0,
          left: 0,
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed z-[9997] rounded-full border border-ink"
        style={{
          width: '38px',
          height: '38px',
          transform: 'translate(-50%, -50%)',
          opacity: 0.35,
          transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease',
          top: 0,
          left: 0,
        }}
      />
    </>
  )
}