import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['trouser', 'short', 'wide-leg', 'palazzo', 'cargo', 'pleated']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.khamsin.com'

  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at')
    .eq('active', true)

  const productUrls = (products ?? []).map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    lastModified: new Date(product.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryUrls = CATEGORIES.map((category) => ({
    url: `${baseUrl}/collections/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...categoryUrls,
    { url: `${baseUrl}/lookbook`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ...productUrls,
  ]
}
