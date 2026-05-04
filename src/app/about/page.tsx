import Link from 'next/link'

export const metadata = {
  title: 'About — FYNDE',
  description: 'The story behind FYNDE — rare vintage and deadstock clothing from the 60s through the 90s.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-parchment">

      {/* Header */}
      <div className="px-6 pt-32 pb-12 md:px-10 md:pt-40 border-b border-taupe-light">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-taupe mb-4 flex items-center gap-3">
          <span className="h-px w-6 bg-taupe-light inline-block" />
          The story
        </p>
        <h1
          className="font-serif font-light leading-[0.9] mb-4"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)' }}
        >
          About<br />
          <em className="italic text-sienna">FYNDE.</em>
        </h1>
        <p
          className="font-mono text-[0.6rem] leading-loose tracking-wide max-w-sm"
          style={{ color: 'rgba(28,25,23,0.5)' }}
        >
          Born from a simple obsession — the feeling of finding something rare.
        </p>
      </div>

      {/* Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-taupe-light">
        <div className="px-6 py-16 md:px-10 md:py-24 border-r border-taupe-light">
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sienna mb-6 flex items-center gap-3">
            <span className="h-px w-6 bg-sienna inline-block" />
            Our origin
          </p>
          <div className="flex flex-col gap-6">
            <p className="font-serif text-base text-ink leading-relaxed">
              FYNDE was born from a simple obsession — the feeling of finding something rare, something with a life already lived, something nobody else has.
            </p>
            <p className="font-serif text-base text-ink leading-relaxed">
              We source from markets, estates, and private collections. Every piece is hand-picked — not for trend, but for character. The worn leather, the faded print, the deadstock tag still intact.
            </p>
            <p className="font-serif text-base text-ink leading-relaxed">
              FYNDE is not a fast fashion alternative. It is the opposite of that. We carry one of each. When it is gone, it is gone. That is the point.
            </p>
          </div>
        </div>

        {/* Image placeholder */}
        <div
          className="relative min-h-[400px] md:min-h-0 flex items-center justify-center"
          style={{ background: '#D9CFC4' }}
        >
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.22em]" style={{ color: 'rgba(28,25,23,0.3)' }}>
            Editorial image
          </span>
        </div>
      </div>

      {/* Values */}
      <div className="px-6 py-16 md:px-10 md:py-24 border-b border-taupe-light">
        <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sienna mb-12 flex items-center gap-3">
          <span className="h-px w-6 bg-sienna inline-block" />
          What we stand for
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-taupe-light">
          {[
            {
              title: 'Curation',
              body: 'Every piece is chosen by hand. We would rather carry ten extraordinary pieces than a hundred ordinary ones.',
            },
            {
              title: 'Rarity',
              body: 'One of one. When a piece sells, it is gone forever. That scarcity is not a marketing trick — it is the nature of vintage.',
            },
            {
              title: 'Character',
              body: 'We are drawn to pieces with history. The patina, the wear, the imperfection — these are features, not flaws.',
            },
          ].map((value, i) => (
            <div
              key={value.title}
              className="py-10 px-6 md:px-8 border-b md:border-b-0 md:border-r border-taupe-light last:border-0"
            >
              <h3
                className="font-serif font-light text-ink leading-none mb-4"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                {value.title}
              </h3>
              <p
                className="font-mono text-[0.58rem] leading-loose"
                style={{ color: 'rgba(28,25,23,0.5)' }}
              >
                {value.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-16 md:px-10 md:py-24 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <h2
          className="font-serif font-light text-ink leading-[0.9]"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
        >
          Ready to find<br />
          <em className="italic text-sienna">something rare?</em>
        </h2>
        <Link
          href="/shop"
          className="relative overflow-hidden bg-ink text-ivory font-mono text-[0.58rem] uppercase tracking-[0.22em] px-8 py-4 min-h-[44px] flex items-center justify-center group whitespace-nowrap"
        >
          <span
            className="absolute inset-0 bg-sienna -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
            style={{ transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)' }}
          />
          <span className="relative z-10">Shop the Archive</span>
        </Link>
      </div>

    </main>
  )
}