'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Bebas+Neue&family=Instrument+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --parchment: #F0E9DF; --ivory: #FAF6F0; --ink: #1C1917;
    --sienna: #A8401A; --taupe: #BEB0A0; --taupe-light: #D9CFC4;
  }
  .grain { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 180px; }
  .page { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
  .card { width: 100%; max-width: 380px; border: 1px solid rgba(240,233,223,0.12); padding: 3rem 2.5rem; background: #232120; position: relative; }
  .card::before { content: ''; position: absolute; top: 6px; left: 6px; right: -6px; bottom: -6px; border: 1px solid rgba(240,233,223,0.06); z-index: -1; pointer-events: none; }
  .wordmark { font-family: 'Bebas Neue', sans-serif; font-size: 2.8rem; letter-spacing: 0.12em; color: #F0E9DF; line-height: 1; margin-bottom: 0.35rem; }
  .access-label { font-family: 'Instrument Mono', monospace; font-size: 0.5rem; letter-spacing: 0.32em; text-transform: uppercase; color: var(--sienna); margin-bottom: 2.5rem; }
  .divider { width: 100%; height: 1px; background: rgba(240,233,223,0.1); margin-bottom: 2.5rem; }
  .field-label { font-family: 'Instrument Mono', monospace; font-size: 0.48rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--taupe); display: block; margin-bottom: 0.75rem; }
  .input { width: 100%; background: #1C1917; border: 1px solid rgba(240,233,223,0.12); padding: 0.875rem 1rem; font-family: 'Instrument Mono', monospace; font-size: 0.75rem; color: #F0E9DF; outline: none; transition: border-color 0.2s; -webkit-appearance: none; border-radius: 0; }
  .input:focus { border-color: rgba(240,233,223,0.4); }
  .input::placeholder { color: rgba(190,176,160,0.4); }
  .btn { width: 100%; margin-top: 1.25rem; background: #A8401A; color: #FAF6F0; border: none; padding: 1rem; font-family: 'Instrument Mono', monospace; font-size: 0.55rem; letter-spacing: 0.28em; text-transform: uppercase; cursor: pointer; transition: background 0.2s, opacity 0.2s; min-height: 48px; border-radius: 0; }
  .btn:hover:not(:disabled) { background: #C4521F; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .error-msg { margin-top: 1rem; font-family: 'Instrument Mono', monospace; font-size: 0.55rem; letter-spacing: 0.12em; color: var(--sienna); line-height: 1.6; }
  .corner-mark { position: absolute; top: 1.25rem; right: 1.25rem; font-family: 'Instrument Mono', monospace; font-size: 0.4rem; letter-spacing: 0.2em; color: rgba(190,176,160,0.3); text-transform: uppercase; }
  .footer-note { margin-top: 2rem; font-family: 'Instrument Mono', monospace; font-size: 0.45rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(190,176,160,0.25); text-align: center; }
`

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin/orders')
      } else {
        const data = await res.json()
        setError(data.error ?? 'Incorrect password')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              autoFocus
            />
            <button type="submit" className="btn" disabled={loading || !password.trim()}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
            {error && <p className="error-msg">{error}</p>}
          </form>
        </div>
        <p className="footer-note">FYNDE — Internal use only</p>
      </div>
    </>
  )
}
