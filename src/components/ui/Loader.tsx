'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Deliberately restrained. CLAUDE.md §10 specs "contour lines draw themselves
 * in, forming the wordmark", and that's what this does — but it runs ONCE per
 * session and is capped at ~1.4s, because a full loader on every navigation is
 * one of the most reliable ways to make a site feel cheap. The hero's own
 * letter reveal is the entrance moment; this just covers first paint.
 */
export default function Loader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    if (sessionStorage.getItem('khamsin-loaded')) return

    setVisible(true)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const exitAt = reduce ? 200 : 1050
    const doneAt = reduce ? 500 : 1750

    const t1 = setTimeout(() => setExiting(true), exitAt)
    const t2 = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('khamsin-loaded', '1')
    }, doneAt)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: '#F1EAD9',
        transform: exiting ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 700ms cubic-bezier(.76,0,.24,1)',
      }}
    >
      <svg width="min(60vw, 380px)" height="34" viewBox="0 0 600 34" fill="none" aria-hidden="true">
        <path
          d="M0 20 C 46 8, 92 30, 138 18 S 232 4, 278 20 S 372 32, 418 16 S 512 4, 560 18 L 600 14"
          stroke="#C6AE82"
          strokeWidth="1.25"
          strokeLinecap="round"
          style={{ strokeDasharray: 900, strokeDashoffset: 900, animation: 'contour-trace .85s cubic-bezier(.65,0,.35,1) forwards' }}
        />
        <path
          d="M0 14 C 50 26, 96 6, 142 16 S 236 28, 282 14 S 376 4, 422 16 S 516 28, 562 12 L 600 18"
          stroke="#B5673A"
          strokeWidth="1"
          strokeLinecap="round"
          style={{ strokeDasharray: 900, strokeDashoffset: 900, animation: 'contour-trace .85s cubic-bezier(.65,0,.35,1) .12s forwards' }}
        />
      </svg>

      <div
        className="font-display mt-4"
        style={{
          fontWeight: 300,
          fontSize: 'clamp(1.1rem, 2.4vw, 1.5rem)',
          letterSpacing: '0.3em',
          color: '#2A2521',
          opacity: 0,
          animation: 'fade-in .6s ease .5s forwards',
        }}
      >
        KHAMSIN
      </div>
    </div>
  )
}
