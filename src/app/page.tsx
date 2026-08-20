import Hero from '@/components/home/Hero'
import Manifesto from '@/components/home/Manifesto'
import LandformScroll from '@/components/home/LandformScroll'
import Collection from '@/components/home/Collection'
import Newsletter from '@/components/home/Newsletter'

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Manifesto />
      <LandformScroll />
      <Collection />
      <Newsletter />
    </main>
  )
}
