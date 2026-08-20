import type { Metadata } from 'next'
import Reveal from '@/components/ui/Reveal'

export const metadata: Metadata = { title: 'Account' }

// No auth flow is defined yet in CLAUDE.md (Supabase Auth is named in the
// stack but not specced) — this is an honest placeholder, not a fabricated
// sign-in system.
export default function AccountPage() {
  return (
    <main className="px-6 md:px-12 pt-28 pb-24 md:pt-36 min-h-[70vh] flex flex-col justify-center">
      <Reveal from="up" className="max-w-md">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-sienna mb-4">Account</p>
        <h1 className="font-display italic text-ink mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Sign-in is being built.
        </h1>
        <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(42,37,33,0.65)' }}>
          Order history and wishlists will live here once accounts are wired up. For now, order
          confirmations go straight to your email.
        </p>
      </Reveal>
    </main>
  )
}
