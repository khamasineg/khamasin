import Link from 'next/link'

export const metadata = {
  title: 'Collections',
  description: 'Browse FYNDE by era — rare vintage and deadstock from the 60s through the 90s.',
}

const eras = [
  {
    decade: '60s',
    label: 'The Sixties',
    sub: 'Mod & Psychedelic',
    description: 'Mod cuts, bold prints, the birth of youth culture. A decade that rewrote the rules of dress.',
    years: '1960 — 1969',
    slug: '60s',
    image: '/images/era-60s.jpg',
  },
  {
    decade: '70s',
    label: 'The Seventies',
    sub: 'Boho & Disco',
    description: 'Flared silhouettes, earthy tones, free spirit energy. Fashion as self-expression at its peak.',
    years: '1970 — 1979',
    slug: '70s',
    image: '/images/era-70s.jpg',
  },
  {
    decade: '80s',
    label: 'The Eighties',
    sub: 'Power & New Wave',
    description: 'Power shoulders, deadstock sportswear, collector-grade pieces. A decade of excess and identity.',
    years: '1980 — 1989',
    slug: '80s',
    image: '/images/era-80s.jpg',
  },
  {
    decade: '90s',
    label: 'The Nineties',
    sub: 'Grunge & Minimal',
    description: 'Grunge, workwear, the last era of true deadstock. Raw, minimal, and endlessly referenced.',
    years: '1990 — 1999',
    slug: '90s',
    image: '/images/era-90s.png',
  },
]

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-parchment">

      {/* Header */}
      <div className="px-6 pt-32 pb-12 md:px-10 md:pt-40 border-b border-taupe-light">
        <p className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-taupe mb-4 flex items-center gap-3">
          <span className="h-px w-6 bg-taupe-light inline-block" />
          Browse by decade
        </p>
        <h1
          className="font-serif font-light leading-[0.9] mb-4"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)' }}
        >
          The<br />
          <em className="italic text-sienna">Collections.</em>
        </h1>
        <p
          className="font-mono text-[0.6rem] leading-loose tracking-wide max-w-sm"
          style={{ color: 'rgba(28,25,23,0.5)' }}
        >
          Four decades. Four distinct worlds. Every piece sourced by hand.
        </p>
      </div>

      {/* Era grid */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {eras.map((era, i) => (
          <Link
            key={era.slug}
            href={`/collections/${era.slug}`}
            className="group relative overflow-hidden border-b border-r border-taupe-light min-h-[50vh] flex flex-col justify-between p-8 md:p-12"
            style={{
              borderRight: i % 2 === 0 ? '1px solid #D9CFC4' : 'none',
            }}
          >
            {/* Background image */}
            <img
              src={era.image}
              alt={era.label}
              className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-700"
              loading="lazy"
            />

            {/* Ghost decade */}
            <span
              className="absolute right-4 bottom-4 font-display leading-none pointer-events-none select-none"
              style={{
                fontSize: 'clamp(8rem, 15vw, 14rem)',
                color: 'rgba(28,25,23,0.04)',
              }}
            >
              {era.decade}
            </span>

            {/* Top — years */}
            <div className="relative z-10">
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.3em] text-taupe">
                {era.years}
              </p>
            </div>

            {/* Bottom — content */}
            <div className="relative z-10">
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sienna mb-3">
                {era.sub}
              </p>
              <h2
                className="font-serif font-light text-ink leading-[0.9] mb-4"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
              >
                {era.label}
              </h2>
              <p
                className="font-mono text-[0.58rem] leading-loose max-w-xs mb-6"
                style={{ color: 'rgba(28,25,23,0.5)' }}
              >
                {era.description}
              </p>
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-sienna" />
                <span className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sienna group-hover:translate-x-1 transition-transform duration-200">
                  Explore →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </main>
  )
}