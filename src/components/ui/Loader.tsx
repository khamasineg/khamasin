'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useIsMobile } from '@/hooks/useIsMobile'

const LETTERS = ['K', 'H', 'A', 'M', 'S', 'I', 'N']

// A contour line sweeping across, tracing the wordmark into being — the
// loader's desktop wow-moment per CLAUDE.md §10 ("contour lines draw
// themselves in, forming the wordmark"). Two wavy strokes, hand-tuned to a
// dune profile, drawn with the classic stroke-dasharray/-dashoffset trick
// (dasharray set comfortably above the path's true length, so no
// getTotalLength() measurement or SSR gymnastics needed).
function ContourTrace() {
  return (
    <svg
      viewBox="0 0 600 40"
      preserveAspectRatio="none"
      style={{ width: 'min(70vw, 520px)', height: 28, display: 'block', margin: '0 auto 0.75rem' }}
    >
      <path
        d="M0 26 C 40 10, 80 34, 130 20 S 220 4, 270 22 S 360 36, 410 18 S 500 4, 560 20 L 600 16"
        fill="none"
        stroke="#C6AE82"
        strokeWidth="1.25"
        strokeLinecap="round"
        style={{
          strokeDasharray: 900,
          strokeDashoffset: 900,
          animation: 'contour-trace 0.9s cubic-bezier(0.65, 0, 0.35, 1) 0.1s forwards',
        }}
      />
      <path
        d="M0 14 C 50 28, 90 6, 140 16 S 230 30, 280 14 S 370 2, 420 16 S 510 30, 560 12 L 600 20"
        fill="none"
        stroke="#9C8563"
        strokeWidth="1"
        strokeLinecap="round"
        style={{
          strokeDasharray: 900,
          strokeDashoffset: 900,
          animation: 'contour-trace 0.9s cubic-bezier(0.65, 0, 0.35, 1) 0.22s forwards',
        }}
      />
    </svg>
  )
}

export default function Loader() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isMobile = useIsMobile()

  const [visible, setVisible] = useState(!isAdmin)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Never show the loader on admin routes
    if (isAdmin) { setVisible(false); return }

    // Mobile: capped at 1.5s total, no stagger (CLAUDE.md §7/§10). Desktop:
    // the fuller contour-trace + staggered-letters sequence gets room to play out.
    const exitAt = isMobile ? 950 : 1900
    const removeAt = isMobile ? 1500 : 2700

    const exitTimer = setTimeout(() => setExiting(true), exitAt)
    const removeTimer = setTimeout(() => setVisible(false), removeAt)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [isAdmin, isMobile])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-ink flex flex-col items-center justify-center transition-transform ease-in-out ${
        exiting ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{
        transitionDuration: '900ms',
        transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
      }}
    >
      {/* Contour trace — desktop only; mobile skips straight to the wordmark (instant, not staggered) */}
      {!isMobile && <ContourTrace />}

      {/* Letters — traced into place following the line on desktop, instant on mobile */}
      <div className="flex gap-[0.05em]">
        {LETTERS.map((letter, i) => (
          <span
            key={letter}
            className="font-display text-parchment leading-none"
            style={{
              fontSize: 'clamp(3.4rem, 11vw, 8.5rem)',
              opacity: isMobile ? 1 : 0,
              transform: isMobile ? 'none' : 'translateY(24px)',
              animation: isMobile ? 'none' : `letterIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              animationDelay: isMobile ? '0s' : `${0.55 + i * 0.055}s`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Clay rule */}
      <div
        style={{
          height: '1px',
          background: '#B5673A',
          width: isMobile ? 'min(320px, 55vw)' : 0,
          marginTop: '0.6rem',
          animation: isMobile ? 'none' : 'ruleGrow 0.6s ease 1.1s forwards',
        }}
      />

      {/* Tagline */}
      <p
        className="font-mono uppercase tracking-[0.35em] mt-3"
        style={{
          fontSize: '0.58rem',
          opacity: isMobile ? 1 : 0,
          color: '#9C8563',
          animation: isMobile ? 'none' : 'fadeIn 0.5s ease 1.3s forwards',
        }}
      >
        Cut for the wind
      </p>
    </div>
  )
}
