import { createServerSupabase } from '@/lib/supabase-server'
import ProductDetail from '@/components/shop/ProductDetail'
import { notFound } from 'next/navigation'

// Always render on request — never serve a cached version.
// Product images/prices can be edited from admin at any time.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase()
  const { data: product } = await supabase
    .from('products')
    .select('name, era, brand, condition, price')
    .eq('slug', params.slug)
    .single()

  if (!product) return {}

  return {
    title: `${product.name} — FYNDE`,
    description: `${product.era} · ${product.brand} · ${product.condition} — ${product.price.toLocaleString()} EGP. One of one vintage piece, available now at FYNDE.`,
  }
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  // Fresh client per request — bypasses Next.js data cache entirely
  const supabase = createServerSupabase()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !product) notFound()

  return (
    <main className="min-h-screen bg-parchment">
      <ProductDetail product={product} />
    </main>
  )
}
