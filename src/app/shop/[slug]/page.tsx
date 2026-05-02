import { supabase } from '@/lib/supabase'
import ProductDetail from '@/components/shop/ProductDetail'
import { notFound } from 'next/navigation'

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