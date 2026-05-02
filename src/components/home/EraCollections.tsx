import Link from 'next/link'

const eras = [
    {
      decade: '60s',
      label: 'The Sixties',
      description: 'Mod cuts, bold prints, the birth of youth culture.',
      slug: '60s',
      image: '/images/era-60s.jpg',
    },
    {
      decade: '70s',
      label: 'The Seventies',
      description: 'Flared silhouettes, earthy tones, free spirit energy.',
      slug: '70s',
      image: '/images/era-70s.jpg',
    },
    {
      decade: '80s',
      label: 'The Eighties',
      description: 'Power shoulders, deadstock sportswear, collector grades.',
      slug: '80s',
      image: '/images/era-80s.jpg',
    },
    {
      decade: '90s',
      label: 'The Nineties',
      description: 'Grunge, workwear, the last era of true deadstock.',
      slug: '90s',
      image: '/images/era-90s.png',
    },
  ]

export default function EraCollections() {
  return (
    <section className="px-6 py-16 md:px-16 md:py-24 bg-ivory border-t border-taupe-light">

      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">
          Browse by decade
        </p>
        <h2 className="font-display text-4xl md:text-6xl tracking-wider text-ink uppercase">
          The Archive
        </h2>
      </div>

      {/* Era grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {eras.map((era) => (
          <Link
            key={era.slug}
            href={`/collections/${era.slug}`}
            className="group relative aspect-[3/4] bg-taupe-light overflow-hidden flex flex-col justify-end p-4 hover:bg-taupe transition-colors duration-500"
          >{/* Background image */}
          <img
            src={era.image}
            alt={era.label}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
            loading="lazy"
          />
            {/* Large decade number */}
            <span className="absolute top-4 left-4 font-display text-[80px] md:text-[100px] leading-none text-ink/10 group-hover:text-ink/20 transition-colors duration-500 select-none">
              {era.decade}
            </span>

            {/* Bottom content */}
            <div className="relative z-10">
              <p className="font-display text-2xl tracking-wider text-ink uppercase mb-1">
                {era.label}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-taupe leading-relaxed">
                {era.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-px w-4 bg-sienna" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-sienna">
                  Explore
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </section>
  )
}