import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Account' }

// No auth flow is specced in CLAUDE.md yet — honest placeholder, not a
// fabricated sign-in system.
export default function AccountPage() {
  return (
    <main className="relative px-6 md:px-[6vw] pt-40 pb-32 min-h-[70vh] flex flex-col justify-center">
      <PageHeader
        eyebrow="Account"
        title="Sign-in is being built."
        lede="Order history and wishlists will live here once accounts are wired up. For now, order confirmations go straight to your email."
      />
    </main>
  )
}
