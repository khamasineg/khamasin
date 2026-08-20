import type { Metadata } from 'next'
import LookbookScroll from '@/components/home/LookbookScroll'

export const metadata: Metadata = { title: 'Lookbook' }

export default function LookbookPage() {
  return <LookbookScroll />
}
