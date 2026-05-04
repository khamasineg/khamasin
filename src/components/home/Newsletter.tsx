'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')

    const { error } = await supabase
      .from('subscribers')
      .insert({ email })

    if (error) {
      if (error.code === '23505') {
        setStatus('success') // already subscribed
      } else {
        setStatus('error')
      }
    } else {
      setStatus('success')
    }
  }

  return (
    <section
      className="relative overflow-hidden px-6 py-24 md:px-10 md:py-32 text-center border-t border-taupe-light"
      style={{ background: '#1C1917' }}
    >
      {/* Ghost FYNDE background text */}
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display whitespace-nowrap pointer-events-none select-none"
        style={{
          fontSize: 'clamp(8rem, 22vw, 20rem)',
          color: 'rgba(255,255,255,0.025)',
          lineHeight: 1,
        }}
      >
        FYNDE
      </span>

      {/* Kicker */}
      <div className="relative z-10 flex items-center justify-center gap-4 mb-6">
        <span className="h-px w-6 bg-sienna" />
        <p className="font-mono text-[0.52rem] uppercase tracking-[0.32em] text-sienna">
          Join the Hunt
        </p>
        <span className="h-px w-6 bg-sienna" />
      </div>

      {/* Headline */}
      <h2
        className="relative z-10 font-serif font-light text-parchment leading-[0.95] mb-3"
        style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
      >
        First to the<br />
        <em className="italic text-sienna">Fynde.</em>
      </h2>

      <p className="relative z-10 font-mono text-[0.6rem] tracking-[0.1em] mb-12"
        style={{ color: 'rgba(190,176,160,0.6)' }}>
        New drops every week. Be first in line.
      </p>

      {/* Form */}
      {status === 'success' ? (
        <div className="relative z-10 flex flex-col items-center gap-3">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-sienna">
            You're in the archive.
          </span>
          <p className="font-serif italic text-parchment text-sm" style={{ color: 'rgba(190,176,160,0.6)' }}>
            We'll let you know when something rare drops.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex flex-col md:flex-row max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 font-mono text-[0.65rem] tracking-wide px-5 py-4 outline-none min-h-[44px]"
            style={{
              background: 'rgba(240,233,223,0.06)',
              border: '1px solid rgba(240,233,223,0.15)',
              borderRight: 'none',
              color: '#FAF6F0',
            }}
            onFocus={(e) => e.target.style.borderColor = '#A8401A'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(240,233,223,0.15)'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="font-mono text-[0.55rem] uppercase tracking-[0.22em] px-6 py-4 min-h-[44px] whitespace-nowrap transition-colors"
            style={{
              background: '#A8401A',
              color: '#FAF6F0',
              border: '1px solid #A8401A',
            }}
          >
            {status === 'loading' ? 'Joining...' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="relative z-10 font-mono text-[0.5rem] uppercase tracking-widest mt-4"
          style={{ color: 'rgba(190,176,160,0.5)' }}>
          Something went wrong. Please try again.
        </p>
      )}

    </section>
  )
}