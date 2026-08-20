'use client'

/**
 * Procedural fabric/terrain swatch — stands in for product photography until
 * the real shoot exists (CLAUDE.md §3 photography direction is a brief for a
 * future shoot, not assets on hand).
 *
 * Extends the prototype's two-stop gradients into four stacked layers so the
 * result reads as woven cloth catching raking light rather than a flat CSS
 * gradient:
 *   1. base   — the garment tone, on a diagonal
 *   2. light  — a large off-centre radial, the highlight
 *   3. shadow — an opposing radial that gives the fold its weight
 *   4. weave  — repeating hairlines at a slight angle = fabric grain
 * A contour hairline sits on top, tying every card back to the wind motif.
 */

export type SwatchTone = {
  base: string[]
  lightAt: string
  shadowAt: string
}

export const TONES: Record<string, SwatchTone> = {
  erg: { base: ['#E4D7BC', '#B79A6C', '#8A7150'], lightAt: '30% 20%', shadowAt: '85% 90%' },
  hamada: { base: ['#D8C9A8', '#A67C52', '#5C4A38'], lightAt: '70% 26%', shadowAt: '15% 85%' },
  sabkha: { base: ['#F4EDDC', '#D3C4A2', '#9C8563'], lightAt: '40% 60%', shadowAt: '90% 15%' },
  khamsin: { base: ['#C9AE82', '#9C8563', '#3E332B'], lightAt: '60% 18%', shadowAt: '20% 92%' },
}

export default function FabricSwatch({
  tone,
  className = '',
}: {
  tone: SwatchTone
  className?: string
}) {
  const [a, b, c] = tone.base

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 1 — base garment tone */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${a} 0%, ${b} 55%, ${c} 100%)` }}
      />
      {/* 2 — raking light */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 80% 60% at ${tone.lightAt}, rgba(250,246,239,0.55), transparent 62%)` }}
      />
      {/* 3 — opposing shadow, gives the fold weight */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 70% 55% at ${tone.shadowAt}, rgba(42,37,33,0.34), transparent 60%)` }}
      />
      {/* 4 — woven grain */}
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(102deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 0.5px, transparent 0.5px, transparent 3px)',
        }}
      />
      {/* contour hairline — the motif, on every card */}
      <svg viewBox="0 0 300 400" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <path
          d="M-10 296 C 44 262, 96 322, 152 288 S 258 246, 312 286"
          fill="none"
          stroke="#FAF6EF"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M-10 322 C 50 294, 100 346, 158 316 S 262 280, 312 314"
          fill="none"
          stroke="#2A2521"
          strokeWidth="0.75"
          strokeLinecap="round"
          opacity="0.14"
        />
      </svg>
    </div>
  )
}
