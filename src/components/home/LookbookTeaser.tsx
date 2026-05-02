import Link from 'next/link'

export default function LookbookTeaser() {
  return (
    <section className="px-6 py-16 md:px-16 md:py-24 bg-parchment border-t border-taupe-light">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">
            Editorial
          </p>
          <h2 className="font-display text-4xl md:text-6xl tracking-wider text-ink uppercase">
            Lookbook
          </h2>
        </div>
        <Link
          href="/lookbook"
          className="hidden md:flex font-mono text-xs uppercase tracking-widest text-ink hover:text-sienna transition-colors border-b border-ink hover:border-sienna pb-1"
        >
          View All
        </Link>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {/* Large left image */}
        <div className="col-span-2 md:col-span-2 relative aspect-[4/3] bg-taupe-light overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[9px] uppercase tracking-widest text-taupe">
              Editorial 01
            </span>
          </div>
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500" />
        </div>

        {/* Right column — two stacked */}
        <div className="col-span-2 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
          <div className="relative aspect-square md:aspect-[3/4] bg-taupe-light overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[9px] uppercase tracking-widest text-taupe">
                Editorial 02
              </span>
            </div>
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500" />
          </div>
          <div className="relative aspect-square md:aspect-[3/4] bg-taupe-light overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[9px] uppercase tracking-widest text-taupe">
                Editorial 03
              </span>
            </div>
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500" />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 md:mt-10">
        <Link
          href="/lookbook"
          className="flex items-center justify-center w-full md:w-auto md:inline-flex border border-ink text-ink font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-ink hover:text-ivory transition-colors duration-300 min-h-[44px]"
        >
          Enter the Lookbook
        </Link>
      </div>

    </section>
  )
}