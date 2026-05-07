import { supabase } from '@/lib/supabase'
import ProductDetail from '@/components/shop/ProductDetail'
import { notFound } from 'next/navigation'

// Always fetch fresh product data — never serve a cached version
// (product images/prices can be edited from the admin at any time)
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
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
