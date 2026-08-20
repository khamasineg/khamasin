import type { Metadata } from 'next'
import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'

export const metadata: Metadata = { title: 'Collections' }

const CATEGORIES = [
  { slug: 'trouser', label: 'Trouser', note: 'The core silhouette — straight, considered, everyday.' },
  { slug: 'wide-leg', label: 'Wide-Leg', note: 'Dune-sea volume. Movement built into the cut.' },
  { slug: 'short', label: 'Short', note: 'Structured, rocky-plateau proportions.' },
  { slug: 'palazzo', label: 'Palazzo', note: 'The wind piece — full, fluid, ceremonial.' },
  { slug: 'cargo', label: 'Cargo', note: 'Non-denim utility, tonal not tactical.' },
  { slug: 'pleated', label: 'Pleated', note: 'Precision folds, salt-flat palette.' },
]

export default function CollectionsPage() {
  return (
    <main className="px-6 md:px-12 pt-28 pb-24 md:pt-36">
      <div className="mb-14 max-w-2xl">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-sienna mb-3">Collections</p>
        <h1 className="font-display italic text-ink mb-4" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
          By category, not by decade.
        </h1>
        <p className="font-body text-sm md:text-base" style={{ color: 'rgba(42,37,33,0.65)' }}>
          No era taxonomy here — KHAMSIN sorts by cut, the way the ground shapes a trouser.
        </p>
      </div>

      <Reveal from="up" stagger={0.06} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-taupe-light">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="group bg-parchment p-8 flex flex-col gap-3 hover:bg-ivory transition-colors"
          >
            <span className="font-display italic text-2xl text-ink group-hover:text-sienna transition-colors">{c.label}</span>
            <p className="font-body text-sm" style={{ color: 'rgba(42,37,33,0.6)' }}>{c.note}</p>
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-taupe mt-2 flex items-center gap-2">
              Shop {c.label}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </Reveal>
    </main>
  )
}
