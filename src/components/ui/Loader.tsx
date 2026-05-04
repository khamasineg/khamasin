'use client'

import { useEffect, useState } from 'react'

export default function Loader() {
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
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
  }, [])

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
        {['F', 'Y', 'N', 'D', 'E'].map((letter, i) => (
          <span
            key={letter}
            className="font-display text-parchment leading-none"
            style={{
              fontSize: 'clamp(5rem, 16vw, 13rem)',
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

      {/* Sienna rule */}
      <div
        style={{
          height: '1px',
          background: '#A8401A',
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
    color: '#BEB0A0',
    animation: 'fadeIn 0.6s ease 0.9s forwards',
  }}
>
  Rare Vintage Wear — Est. 2025
</p>
    </div>
  )
}