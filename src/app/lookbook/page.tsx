import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Lookbook — FYNDE',
  description: 'Editorial looks from the FYNDE archive.',
}

export const revalidate = 60

export default async function LookbookPage() {
  const { data: items } = await supabase
    .from('lookbook')
    .select('*')
    .eq('published', true)
    .order('order_index', { ascending: true })

  return (
    <main className="min-h-screen bg-parchment">

      {/* Header */}
      <div className="px-6 pt-32 pb-12 md:px-10 md:pt-40 border-b border-taupe-light">
        <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">
          Editorial
        </p>
        <h1
          className="font-serif font-light leading-[0.9] mb-4"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)' }}
        >
          Look<em className="italic text-sienna">book.</em>
        </h1>
        <p className="font-serif text-base italic text-taupe max-w-xl leading-relaxed">
          Rare pieces, styled simply. The archive, worn.
        </p>
      </div>

      {/* Content */}
      {!items || items.length === 0 ? (
        <div className="px-6 py-32 md:px-10 flex flex-col items-center justify-center text-center">
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
      ) : (
        <div className="px-6 py-12 md:px-10 md:py-16">
          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`group relative overflow-hidden bg-taupe-light ${
                  i === 0 ? 'col-span-2 md:col-span-2 aspect-[4/3]' :
                  i % 5 === 3 ? 'col-span-2 md:col-span-1 aspect-square' :
                  'col-span-1 aspect-[3/4]'
                }`}
              >
                <img
                  src={item.image_url}
                  alt={item.title || 'FYNDE Lookbook'}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Hover overlay */}
                {(item.title || item.description) && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4"
                    style={{
                      background: 'linear-gradient(to top, rgba(28,25,23,0.8) 0%, transparent 60%)',
                    }}
                  >
                    {item.title && (
                      <p className="font-serif italic text-ivory text-sm leading-snug mb-1">
                        {item.title}
                      </p>
                    )}
                    {item.description && (
                      <p className="font-mono text-[9px] uppercase tracking-widest text-ivory/60">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Tags */}
                {item.tags?.length > 0 && (
                  <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
                    {item.tags.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="font-mono text-[8px] uppercase tracking-widest text-ivory bg-sienna px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}