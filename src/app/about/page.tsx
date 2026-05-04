import Link from 'next/link'

export const metadata = {
  title: 'About — FYNDE',
  description: 'The story behind FYNDE — rare vintage and deadstock clothing from the 60s through the 90s.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-parchment">

      {/* Hero */}
      <div className="px-6 pt-32 pb-16 md:px-16 md:pt-40 border-b border-taupe-light">
        <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">
          The story
        </p>
        <h1 className="font-display text-5xl md:text-8xl tracking-wider text-ink uppercase mb-6">
          About
        </h1>
        <p className="font-serif text-xl italic text-ink max-w-2xl leading-relaxed">
          FYNDE was born from a simple obsession — the feeling of finding something rare, something with a life already lived, something nobody else has.
        </p>
      </div>

      {/* Story */}
      <div className="px-6 py-16 md:px-16 md:py-24 max-w-3xl">
        <div className="flex flex-col gap-8">
          <p className="font-serif text-base text-ink leading-relaxed">
            We source from markets, estates, and private collections across Egypt and beyond. Every piece is hand-picked — not for trend, but for character. The worn leather, the faded print, the deadstock tag still intact. These are the details that matter.
          </p>
          <p className="font-serif text-base text-ink leading-relaxed">
            FYNDE is not a fast fashion alternative. It is the opposite of that. We carry one of each. When it is gone, it is gone. That is the point.
          </p>
          <p className="font-serif text-base text-ink leading-relaxed">
            We believe the best dressed people are not following trends — they are finding things. That is what we are here for.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="px-6 md:px-16">
        <div className="h-px bg-taupe-light" />
      </div>

      {/* Values */}
      <div className="px-6 py-16 md:px-16 md:py-24">
        <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-10">
          What we stand for
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="font-display text-2xl tracking-wider text-ink uppercase mb-3">
              Curation
            </p>
            <p className="font-serif text-sm text-taupe leading-relaxed">
              Every piece is chosen by hand. We would rather carry ten extraordinary pieces than a hundred ordinary ones.
            </p>
          </div>
          <div>
            <p className="font-display text-2xl tracking-wider text-ink uppercase mb-3">
              Rarity
            </p>
            <p className="font-serif text-sm text-taupe leading-relaxed">
              One of one. When a piece sells, it is gone forever. That scarcity is not a marketing trick — it is the nature of vintage.
            </p>
          </div>
          <div>
            <p className="font-display text-2xl tracking-wider text-ink uppercase mb-3">
              Character
            </p>
            <p className="font-serif text-sm text-taupe leading-relaxed">
              We are drawn to pieces with history. The patina, the wear, the imperfection — these are features, not flaws.
            </p>
          </div>
        </div>
      </div>

      {/* Full width image */}
<div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-taupe overflow-hidden">
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
    <span className="font-mono text-[10px] uppercase tracking-widest text-ivory opacity-60">
      Editorial image
    </span>
    <span className="font-mono text-[10px] uppercase tracking-widest text-ivory opacity-40">
      1600 × 700
    </span>
  </div>
  {/* Vignette */}
  <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent pointer-events-none" />
</div>

{/* Values */}

      {/* CTA */}
      <div className="px-6 py-16 md:px-16 md:py-24 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <p className="font-display text-3xl md:text-5xl tracking-wider text-ink uppercase">
            Ready to find something rare?
          </p>
        </div>
        <Link
          href="/shop"
          className="flex items-center justify-center bg-ink text-ivory font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-sienna transition-colors duration-300 min-h-[44px] whitespace-nowrap"
        >
          Shop the Archive
        </Link>
      </div>

    </main>
  )
}