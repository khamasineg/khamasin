import { notFound } from 'next/navigation'
import EraGrid from '@/components/shop/EraGrid'
import Link from 'next/link'

export const revalidate = 60
const eraDetails: Record<string, { label: string; sub: string; description: string; years: string }> = {
  '60s': {
    label: 'The Sixties',
    sub: 'Mod & Psychedelic',
    description: 'Mod cuts, bold prints, the birth of youth culture. A decade that rewrote the rules of dress.',
    years: '1960 — 1969',
  },
  '70s': {
    label: 'The Seventies',
    sub: 'Boho & Disco',
    description: 'Flared silhouettes, earthy tones, free spirit energy. Fashion as self-expression at its peak.',
    years: '1970 — 1979',
  },
  '80s': {
    label: 'The Eighties',
    sub: 'Power & New Wave',
    description: 'Power shoulders, deadstock sportswear, collector-grade pieces. A decade of excess and identity.',
    years: '1980 — 1989',
  },
  '90s': {
    label: 'The Nineties',
    sub: 'Grunge & Minimal',
    description: 'Grunge, workwear, the last era of true deadstock. Raw, minimal, and endlessly referenced.',
    years: '1990 — 1999',
  },
}

export async function generateMetadata({ params }: { params: { era: string } }) {
  const era = eraDetails[params.era]
  if (!era) return {}
  return {
    title: `${era.label} — FYNDE`,
    description: era.description,
  }
}

export default function EraPage({ params }: { params: { era: string } }) {
  const era = eraDetails[params.era]
  if (!era) notFound()

  return (
    <main className="min-h-screen bg-parchment">

      {/* Header */}
      <div className="px-6 pt-32 pb-12 md:px-10 md:pt-40 border-b border-taupe-light">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-taupe mb-4 flex items-center gap-3">
          <span className="h-px w-6 bg-taupe-light inline-block" />
          {era.years}
        </p>
        <h1
          className="font-serif font-light leading-[0.9] mb-4"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)' }}
        >
          {era.label.split(' ')[0]}<br />
          <em className="italic text-sienna">
            {era.label.split(' ').slice(1).join(' ')}.
          </em>
        </h1>
        <p
          className="font-mono text-[0.6rem] leading-loose tracking-wide max-w-sm mb-6"
          style={{ color: 'rgba(28,25,23,0.5)' }}
        >
          {era.description}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/collections"
            className="font-mono text-[0.5rem] uppercase tracking-[0.22em] flex items-center gap-2 transition-colors hover:text-sienna"
            style={{ color: 'rgba(28,25,23,0.4)' }}
          >
            ← All Collections
          </Link>
          <span className="h-px w-4 bg-taupe-light" />
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sienna">
            {era.sub}
          </span>
        </div>
      </div>

      {/* Products */}
      <EraGrid era={params.era} />

    </main>
  )
}