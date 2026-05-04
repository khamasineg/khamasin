import Hero from '@/components/home/Hero'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import EraCollections from '@/components/home/EraCollections'
import BrandStatement from '@/components/home/BrandStatement'
import LookbookTeaser from '@/components/home/LookbookTeaser'
import StatsBar from '@/components/home/StatsBar'

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <EraCollections />
      <BrandStatement />
      <LookbookTeaser />
      <StatsBar />
    </main>
  )
}