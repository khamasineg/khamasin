import type { Metadata } from 'next'
import Reveal from '@/components/ui/Reveal'
import WindDivider from '@/components/wind/WindDivider'

export const metadata: Metadata = { title: 'About' }

const LANDFORMS = [
  { name: 'Erg', cut: 'The Erg Trouser', why: 'A dune-sea is wide, shifting, wind-carved — the wide-leg cut moves the same way.' },
  { name: 'Hamada', cut: 'The Hamada Short', why: 'A rocky plateau holds its shape under pressure — the structured short does too.' },
  { name: 'Sabkha', cut: 'The Sabkha Pant', why: 'A salt flat is the palest terrain in the desert — the palest tone in the range.' },
  { name: 'Khamsin', cut: 'The Khamsin Wrap', why: 'Named for the wind itself — the palazzo cut, full and moving.' },
]

export default function AboutPage() {
  return (
    <main>
      <section className="px-6 md:px-12 pt-28 pb-20 md:pt-40 md:pb-28">
        <Reveal from="left" className="max-w-3xl">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-sienna mb-4">The Name</p>
          <h1 className="font-display italic text-ink mb-6" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.8rem)' }}>
            Khamsin — the hot, dry wind
          </h1>
          <p className="font-body text-base md:text-lg leading-relaxed" style={{ color: 'rgba(42,37,33,0.72)' }}>
            It blows across Egypt and the Arabian desert every spring. The site&rsquo;s signature motion is
            wind-based because of this — not as decoration, but as the actual subject.
          </p>
        </Reveal>
      </section>

      <div className="px-6 md:px-12"><WindDivider /></div>

      <section className="px-6 md:px-12 py-20 md:py-28">
        <Reveal from="up" className="max-w-3xl">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-sienna mb-4">The Brief</p>
          <p className="font-display italic text-ink leading-tight mb-6" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)' }}>
            KHAMSIN makes the bottom half of your wardrobe as considered as the top half usually is.
          </p>
          <p className="font-body text-base leading-relaxed" style={{ color: 'rgba(42,37,33,0.68)' }}>
            No denim, no noise — just trousers built for movement, in the tonal language of the desert.
            Unisex bottoms only: trousers, wide-leg pants, tailored shorts, palazzo, pleated pants,
            non-denim cargo. Denim is deliberately excluded.
          </p>
        </Reveal>
      </section>

      <div className="px-6 md:px-12"><WindDivider /></div>

      <section className="px-6 md:px-12 py-20 md:py-28">
        <Reveal from="up" className="mb-12 max-w-2xl">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-sienna mb-4">The Landform System</p>
          <h2 className="font-display italic text-ink" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
            Every style is named after real terrain.
          </h2>
        </Reveal>

        <Reveal from="left" stagger={0.1} className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-taupe-light">
          {LANDFORMS.map((l) => (
            <div key={l.name} className="bg-parchment p-8 flex flex-col gap-2">
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-sienna">{l.name}</span>
              <p className="font-display italic text-xl text-ink">{l.cut}</p>
              <p className="font-body text-sm" style={{ color: 'rgba(42,37,33,0.62)' }}>{l.why}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <div className="px-6 md:px-12"><WindDivider /></div>

      <section className="px-6 md:px-12 py-20 md:py-28">
        <Reveal from="up" className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-4xl">
          {[
            { n: '01', name: 'Stillness', body: 'Calm, uncluttered, editorial restraint.' },
            { n: '02', name: 'Terrain', body: 'Real desert geology, not cliché.' },
            { n: '03', name: 'Movement', body: 'Fit designed around how a body moves.' },
            { n: '04', name: 'Precision', body: 'Considered tailoring, not resort wear.' },
          ].map((p) => (
            <div key={p.n} className="flex flex-col gap-2">
              <span className="font-mono text-[0.58rem] tracking-[0.28em] text-sienna">{p.n}</span>
              <h3 className="font-display text-xl text-ink italic">{p.name}</h3>
              <p className="font-body text-sm" style={{ color: 'rgba(42,37,33,0.6)' }}>{p.body}</p>
            </div>
          ))}
        </Reveal>
      </section>
    </main>
  )
}
