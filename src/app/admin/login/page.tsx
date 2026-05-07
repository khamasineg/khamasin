'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Bebas+Neue&family=Instrument+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --parchment: #F0E9DF; --ivory: #FAF6F0; --ink: #1C1917;
    --sienna: #A8401A; --taupe: #BEB0A0; --taupe-light: #D9CFC4;
  }
  body { background: var(--parchment); color: var(--ink); font-family: 'Instrument Mono', monospace; min-height: 100vh; }
  .grain { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 180px; }
  .page { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
  .card { width: 100%; max-width: 380px; border: 1px solid var(--taupe-light); padding: 3rem 2.5rem; background: var(--ivory); position: relative; }
  .card::before { content: ''; position: absolute; top: 6px; left: 6px; right: -6px; bottom: -6px; border: 1px solid var(--taupe-light); z-index: -1; pointer-events: none; }
  .wordmark { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; letter-spacing: 0.12em; color: var(--ink); line-height: 1; margin-bottom: 0.35rem; }
  .access-label { font-family: 'Instrument Mono', monospace; font-size: 0.5rem; letter-spacing: 0.32em; text-transform: uppercase; color: var(--sienna); margin-bottom: 2.5rem; }
  .divider { width: 100%; height: 1px; background: var(--taupe-light); margin-bottom: 2.5rem; }
  .field-label { font-family: 'Instrument Mono', monospace; font-size: 0.48rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--taupe); display: block; margin-bottom: 0.75rem; }
  .input { width: 100%; background: var(--parchment); border: 1px solid var(--taupe-light); padding: 0.875rem 1rem; font-family: 'Instrument Mono', monospace; font-size: 0.75rem; color: var(--ink); outline: none; transition: border-color 0.2s; -webkit-appearance: none; border-radius: 0; }
  .input:focus { border-color: var(--ink); }
  .input::placeholder { color: var(--taupe); }
  .btn { width: 100%; margin-top: 1.25rem; background: var(--ink); color: var(--ivory); border: none; padding: 1rem; font-family: 'Instrument Mono', monospace; font-size: 0.55rem; letter-spacing: 0.28em; text-transform: uppercase; cursor: pointer; transition: background 0.2s, opacity 0.2s; min-height: 48px; border-radius: 0; }
  .btn:hover:not(:disabled) { background: var(--sienna); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .error-msg { margin-top: 1rem; font-family: 'Instrument Mono', monospace; font-size: 0.55rem; letter-spacing: 0.12em; color: var(--sienna); line-height: 1.6; }
  .sent-state { text-align: center; }
  .sent-icon { width: 40px; height: 40px; border: 1px solid var(--taupe-light); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
  .sent-icon span { color: var(--sienna); font-size: 1rem; }
  .sent-heading { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: 1.6rem; color: var(--ink); margin-bottom: 1rem; line-height: 1.2; }
  .sent-body { font-family: 'Instrument Mono', monospace; font-size: 0.55rem; letter-spacing: 0.1em; line-height: 1.9; color: var(--taupe); }
  .sent-email { color: var(--ink); display: block; margin-top: 0.5rem; }
  .corner-mark { position: absolute; top: 1.25rem; right: 1.25rem; font-family: 'Instrument Mono', monospace; font-size: 0.4rem; letter-spacing: 0.2em; color: var(--taupe-light); text-transform: uppercase; }
  .footer-note { margin-top: 2rem; font-family: 'Instrument Mono', monospace; font-size: 0.45rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--taupe-light); text-align: center; }
`

// This inner component uses useSearchParams — must be inside Suspense
function LoginForm() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState('')
  const searchParams        = useSearchParams()

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setError('This email is not authorized to access the admin panel.')
    }
    if (searchParams.get('error') === 'invalid_link') {
      setError('This link is invalid or has expired. Request a new one.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/admin/auth/callback` },
    })

    setLoading(false)
    if (authError) setError('Something went wrong. Please try again.')
    else setSent(true)
  }

  if (sent) return (
    <div className="sent-state">
      <div className="sent-icon"><span>✦</span></div>
      <p className="sent-heading">Check your inbox.</p>
      <p className="sent-body">
        A magic link has been sent to
        <span className="sent-email">{email}</span>
      </p>
      <p className="sent-body" style={{ marginTop: '1rem' }}>
        Click the link to sign in.<br />
        The link expires in 1 hour.
      </p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="email">Email address</label>
      <input
        id="email"
        type="email"
        className="input"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        autoComplete="email"
        autoFocus
      />
      <button type="submit" className="btn" disabled={loading || !email.trim()}>
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>
      {error && <p className="error-msg">{error}</p>}
    </form>
  )
}

// Outer page wraps LoginForm in Suspense — fixes the Next.js 14 build error
export default function AdminLoginPage() {
  return (
    <>
      <style>{STYLES}</style>
      <div className="grain" />
      <div className="page">
        <div className="card">
          <span className="corner-mark">&#x2715; Restricted</span>
          <div className="wordmark">FYNDE</div>
          <div className="access-label">Admin Access</div>
          <div className="divider" />
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="footer-note">FYNDE — Internal use only</p>
      </div>
    </>
  )
}