'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Loader() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  const [visible, setVisible] = useState(!isAdmin)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Never show the loader on admin routes
    if (isAdmin) { setVisible(false); return }

    // Start exit after 2.4 seconds
    const exitTimer = setTimeout(() => {
      setExiting(true)
    }, 2400)

    // Remove from DOM after exit animation
    const removeTimer = setTimeout(() => {
      setVisible(false)
    }, 3300)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [isAdmin])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-ink flex flex-col items-center justify-center transition-transform duration-900 ease-in-out ${
        exiting ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{
        transitionDuration: '900ms',
        transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
      }}
    >
      {/* Letters */}
      <div className="flex gap-[0.05em]">
        {['K', 'H', 'A', 'M', 'S', 'I', 'N'].map((letter, i) => (
          <span
            key={letter}
            className="font-display text-parchment leading-none"
            style={{
              fontSize: 'clamp(3.4rem, 11vw, 8.5rem)',
              opacity: 0,
              transform: 'translateY(60px)',
              animation: `letterIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              animationDelay: `${0.1 + i * 0.1}s`,
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
          width: 0,
          marginTop: '0.6rem',
          animation: 'ruleGrow 0.8s ease 0.7s forwards',
        }}
      />

      {/* Tagline */}
      <p
  className="font-mono uppercase tracking-[0.35em] mt-3"
  style={{
    fontSize: '0.58rem',
    opacity: 0,
    color: '#9C8563',
    animation: 'fadeIn 0.6s ease 0.9s forwards',
  }}
>
  Cut for the wind
</p>
    </div>
  )
}