import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import PageHeader from '@/components/layout/PageHeader'
import ShopArchive from '@/components/shop/ShopArchive'

export const metadata: Metadata = { title: 'Shop' }

// Re-fetched at most once a minute so stock changes surface without making
// every request hit the database.
export const revalidate = 60

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as unknown as Product[]
}

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <main className="relative px-6 md:px-[6vw] pt-40 pb-32">
      <PageHeader
        eyebrow="The Archive"
        title="Every piece, built for movement."
        lede="Unisex bottoms only — trousers, wide-leg, tailored shorts, palazzo, pleated and non-denim cargo. No denim, by design."
      />
      <ShopArchive products={products} />
    </main>
  )
}
