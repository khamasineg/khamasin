import Link from 'next/link'

export const metadata = {
  title: 'Lookbook — FYNDE',
  description: 'Editorial looks from the FYNDE archive. Rare vintage and deadstock clothing styled for the modern collector.',
}

export default function LookbookPage() {
  return (
    <main className="min-h-screen bg-parchment">

      {/* Header */}
      <div className="px-6 pt-32 pb-12 md:px-16 md:pt-40 border-b border-taupe-light">
        <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">
          Editorial
        </p>
        <h1 className="font-display text-5xl md:text-8xl tracking-wider text-ink uppercase mb-4">
          Lookbook
        </h1>
        <p className="font-serif text-base italic text-taupe max-w-xl leading-relaxed">
          Rare pieces, styled simply. The archive, worn.
        </p>
      </div>

      {/* Coming soon state */}
      <div className="px-6 py-32 md:px-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 border border-taupe-light flex items-center justify-center mb-8">
          <span className="font-mono text-xl text-sienna">✦</span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-4">
          Coming soon
        </p>
        <p className="font-serif text-xl italic text-ink max-w-md leading-relaxed mb-12">
          Our first editorial is being put together. Check back soon.
        </p>
        <Link
          href="/shop"
          className="flex items-center justify-center border border-ink text-ink font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-ink hover:text-ivory transition-colors duration-300 min-h-[44px]"
        >
          Shop the Archive
        </Link>
      </div>

    </main>
  )
}