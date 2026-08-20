import Hero from '@/components/home/Hero'
import Manifesto from '@/components/home/Manifesto'
import Collection from '@/components/home/Collection'
import Newsletter from '@/components/home/Newsletter'

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Manifesto />
      <Collection />
      <Newsletter />
    </main>
  )
}
