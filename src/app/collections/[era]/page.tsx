import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/shop/ProductCard'

const eraDetails: Record<string, { label: string; description: string; years: string }> = {
  '60s': {
    label: 'The Sixties 60s',
    description: 'Mod cuts, bold prints, the birth of youth culture. A decade that rewrote the rules of dress.',
    years: '1960 — 1969',
  },
  '70s': {
    label: 'The Seventies 70s',
    description: 'Flared silhouettes, earthy tones, free spirit energy. Fashion as self-expression at its peak.',
    years: '1970 — 1979',
  },
  '80s': {
    label: 'The Eighties 80s',
    description: 'Power shoulders, deadstock sportswear, collector-grade pieces. A decade of excess and identity.',
    years: '1980 — 1989',
  },
  '90s': {
    label: 'The Nineties 90s',
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

export default async function EraPage({ params }: { params: { era: string } }) {
  const era = eraDetails[params.era]
  if (!era) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('era', params.era)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-parchment">
      {/* Header */}
      <div className="px-6 pt-32 pb-12 md:px-16 md:pt-40 border-b border-taupe-light">
        <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">
          {era.years}
        </p>
        <h1 className="font-display text-5xl md:text-8xl tracking-wider text-ink uppercase mb-4">
          {era.label}
        </h1>
        <p className="font-serif text-base italic text-taupe max-w-xl leading-relaxed">
          {era.description}
        </p>
      </div>

      {/* Products */}
      <div className="px-6 py-12 md:px-16">
        {!products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <p className="font-mono text-xs uppercase tracking-widest text-taupe">
              No pieces available
            </p>
            <p className="font-serif text-sm italic text-taupe">
              Check back soon — new finds added weekly
            </p>
          </div>
        ) : (
          <>
            <p className="font-mono text-[9px] uppercase tracking-widest text-taupe mb-6">
              {products.length} {products.length === 1 ? 'piece' : 'pieces'} from this era
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}