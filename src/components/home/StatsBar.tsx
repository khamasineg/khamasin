'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  { display: '60s–90s', label: 'Eras Covered', countTo: null },
  { display: '1 of 1', label: 'Every Single Piece', countTo: null },
  { display: '189', label: 'Pieces Fynded', countTo: 189 },
  { display: '∞', label: 'Pieces to Discover', countTo: 9999 },
]

function StatItem({
  display,
  label,
  countTo,
  index,
}: {
  display: string
  label: string
  countTo: number | null
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !countTo) return
    let current = 0
    const step = Math.ceil(countTo / 50)
    const timer = setInterval(() => {
      current = Math.min(current + step, countTo)
      setCount(current)
      if (current >= countTo) clearInterval(timer)
    }, 28)
    return () => clearInterval(timer)
  }, [visible, countTo])

  return (
    <div
      ref={ref}
      className="px-6 py-8 md:px-8 md:py-10 border-r border-taupe-light last:border-r-0"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
      }}
    >
      <span className="font-display text-4xl md:text-5xl text-ink block leading-none mb-2 tracking-wide">
      {countTo
  ? count >= countTo
    ? countTo === 9999
      ? <span style={{ fontFamily: 'serif', fontSize: '1.2em', lineHeight: 1 }}>∞</span>
      : count
    : count
  : display}      </span>
      <span className="font-mono text-[0.52rem] uppercase tracking-[0.22em] text-taupe">
        {label}
      </span>
    </div>
  )
}

export default function StatsBar() {
  return (
    <div className="border-t border-b border-taupe-light grid grid-cols-2 md:grid-cols-4">
      {stats.map((stat, i) => (
        <StatItem
          key={stat.label}
          display={stat.display}
          label={stat.label}
          countTo={stat.countTo}
          index={i}
        />
      ))}
    </div>
  )
}