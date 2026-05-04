import Link from 'next/link'

const eras = [
  {
    decade: '60s',
    label: 'Mod & Psychedelic',
    slug: '60s',
    image: '/images/era-60s.jpg',
  },
  {
    decade: '70s',
    label: 'Boho & Disco',
    slug: '70s',
    image: '/images/era-70s.jpg',
  },
  {
    decade: '80s',
    label: 'Power & New Wave',
    slug: '80s',
    image: '/images/era-80s.jpg',
  },
  {
    decade: '90s',
    label: 'Grunge & Minimal',
    slug: '90s',
    image: '/images/era-90s.png',
  },
]

export default function EraCollections() {
  return (
    <section className="px-6 py-16 md:px-10 md:py-24 border-t border-taupe-light">

      {/* Header */}
      <div className="flex items-end justify-between mb-12">
        <h2 className="font-serif font-light leading-[0.9]"
          style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}>
          Shop by<br />
          <em className="italic text-sienna">Era</em>
        </h2>
        <Link
          href="/shop"
          className="hidden md:flex font-mono text-[0.55rem] uppercase tracking-[0.22em] text-taupe hover:text-sienna transition-colors items-center gap-2 mb-2"
        >
          All collections →
        </Link>
      </div>

      {/* Era grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ gap: '1px', background: '#D9CFC4' }}
      >
        {eras.map((era) => (
          <Link
            key={era.slug}
            href={`/collections/${era.slug}`}
            className="group relative bg-parchment hover:bg-ivory transition-colors duration-300 overflow-hidden flex flex-col justify-between p-6 md:p-8 min-h-[220px] md:min-h-[280px]"
          >
            {/* Background image */}
            <img
              src={era.image}
              alt={era.label}
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
              loading="lazy"
            />

            {/* Ghost decade number */}
            <span
              className="absolute right-[-0.5rem] bottom-[-1rem] font-display leading-none pointer-events-none select-none transition-colors duration-400"
              style={{
                fontSize: 'clamp(6rem, 12vw, 10rem)',
                color: 'rgba(28,25,23,0.04)',
              }}
            >
              {era.decade}
            </span>

            {/* Content */}
            <div className="relative z-10">
              <span className="font-display text-5xl md:text-6xl text-ink leading-none block mb-1 tracking-wide">
                {era.decade}
              </span>
              <span className="font-serif italic text-taupe text-sm md:text-base">
                {era.label}
              </span>
            </div>

            {/* Arrow */}
            <div className="relative z-10 flex items-center justify-between mt-8">
              <span className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sienna">
                Explore
              </span>
              <span className="text-taupe-light group-hover:text-sienna group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200">
                ↗
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile view all */}
      <div className="mt-6 md:hidden">
        <Link
          href="/shop"
          className="flex items-center justify-center w-full border border-ink text-ink font-mono text-xs uppercase tracking-widest py-4 hover:bg-ink hover:text-ivory transition-colors min-h-[44px]"
        >
          All Collections
        </Link>
      </div>

    </section>
  )
}