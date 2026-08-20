import type { Metadata } from 'next'
import Reveal from '@/components/ui/Reveal'

export const metadata: Metadata = { title: 'Lookbook' }

// No location/editorial photography exists yet — CLAUDE.md §3's direction
// (flat midday desert light, garments in motion, no vignette) is a brief for
// a future shoot, not assets on hand. Honest holding page rather than stock
// imagery standing in for a shoot that hasn't happened.
export default function LookbookPage() {
  return (
    <main className="relative px-6 md:px-[6vw] pt-40 pb-32 min-h-[80vh] flex flex-col justify-center">
      <Reveal from="up" className="max-w-2xl">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] mb-5" style={{ color: '#B5673A' }}>
          Vol. 01 — FW26
        </p>
        <h1 className="font-display text-ink mb-6" style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', lineHeight: 1.05 }}>
          The first issue is being shot.
        </h1>
        <p className="text-base leading-relaxed" style={{ color: '#9C8563', maxWidth: '46ch' }}>
          Raw plaster, sand-toned concrete, real desert light — garments shown in motion, not standing
          still in a studio. No filter, no vignette. Check back once the wind has actually moved
          through frame.
        </p>
      </Reveal>
    </main>
  )
}
