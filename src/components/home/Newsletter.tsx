'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Reveal from '@/components/ui/Reveal'
import WindDivider from '@/components/wind/WindDivider'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    const { error } = await supabase.from('subscribers').insert({ email: email.trim() })
    if (error && error.code !== '23505') {
      // 23505 = unique violation (already subscribed) — treat as success, not an error
      setStatus('error')
      return
    }
    setStatus('done')
    setEmail('')
  }

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-[6vw]">
      <div className="absolute top-0 left-6 right-6 md:left-[6vw] md:right-[6vw]">
        <WindDivider />
      </div>
      <Reveal from="up" className="max-w-xl mx-auto text-center">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] mb-5" style={{ color: '#B5673A' }}>
          Before Launch
        </p>
        <h2
          className="font-display text-ink mb-7"
          style={{ fontWeight: 300, fontSize: 'clamp(1.7rem, 3.6vw, 2.5rem)', lineHeight: 1.15 }}
        >
          Hear it first, when the wind picks up.
        </h2>

        {status === 'done' ? (
          <p className="font-mono text-xs uppercase tracking-widest text-sienna">On the list. Cut for the wind.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 bg-transparent border border-taupe-light px-4 py-3 min-h-[44px] font-mono text-sm text-ink placeholder:text-taupe focus:outline-none focus:border-sienna transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-ink text-ivory font-mono text-[0.6rem] uppercase tracking-[0.24em] px-7 py-3 min-h-[44px] hover:bg-sienna transition-colors duration-500 disabled:opacity-60"
            >
              {status === 'loading' ? 'Joining…' : 'Notify Me'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-sienna mt-3">
            Something went wrong — try again in a moment.
          </p>
        )}
      </Reveal>
    </section>
  )
}
