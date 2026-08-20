import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import ProductDetail from '@/components/shop/ProductDetail'

async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error || !data) return null
  return data as unknown as Product
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Not Found' }
  return {
    title: product.name,
    description: product.description ?? `${product.name} — ${product.landform}, ${product.price.toLocaleString()} EGP.`,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()
  return <ProductDetail product={product} />
}
