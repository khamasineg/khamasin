'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Coupon = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  active: boolean
  usage_count: number
  max_uses: number | null
  expires_at: string | null
  created_at: string
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isExpired(expires_at: string | null) {
  if (!expires_at) return false
  return new Date(expires_at) < new Date()
}

const EMPTY_FORM = { code: '', type: 'percentage' as 'percentage' | 'fixed', value: '', max_uses: '', expires_at: '' }

export default function AdminCouponsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/coupons')
    if (res.status === 401) { router.push('/admin/login'); return }
    const { coupons: data } = await res.json()
    setCoupons(data ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.value) { setFormError('Code and value are required'); return }
    if (Number(form.value) <= 0) { setFormError('Value must be greater than 0'); return }
    if (form.type === 'percentage' && Number(form.value) > 100) { setFormError('Percentage cannot exceed 100'); return }

    setFormLoading(true)
    setFormError('')
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          expires_at: form.expires_at || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error ?? 'Failed to create'); return }
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch { setFormError('Something went wrong') }
    setFormLoading(false)
  }

  const handleToggle = async (coupon: Coupon) => {
    setTogglingId(coupon.id)
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
      })
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c))
    } catch { /* ignore */ }
    setTogglingId(null)
  }

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return }
    setDeletingId(id)
    setConfirmDelete(null)
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' })
      setCoupons(prev => prev.filter(c => c.id !== id))
    } catch { /* ignore */ }
    setDeletingId(null)
  }

  const s: Record<string, React.CSSProperties> = {
    root: { display: 'flex', flexDirection: 'column', minHeight: '100%' },
    sticky: {
      position: 'sticky', top: '48px', zIndex: 40,
      background: '#1C1917', borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '1rem 2rem',
    },
    body: { flex: 1, padding: '0 2rem 4rem' },
    label: { fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: 'rgba(190,176,160,0.5)' },
    mono: { fontFamily: "'Courier New', monospace" },
    input: {
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
      color: '#FAF6F0', padding: '0.5rem 0.75rem', outline: 'none',
      fontFamily: "'Courier New', monospace", fontSize: '12px', width: '100%',
      boxSizing: 'border-box' as const,
    },
    selectInput: {
      background: '#2A2521', border: '1px solid rgba(255,255,255,0.12)',
      color: '#FAF6F0', padding: '0.5rem 0.75rem', outline: 'none',
      fontFamily: "'Courier New', monospace", fontSize: '12px', width: '100%',
      boxSizing: 'border-box' as const, cursor: 'pointer',
    },
  }

  const activeCount = coupons.filter(c => c.active && !isExpired(c.expires_at)).length

  return (
    <div style={s.root}>
      {/* Sticky header */}
      <div style={s.sticky}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 'normal', fontStyle: 'italic', color: '#FAF6F0', margin: 0 }}>
              Coupons
            </h1>
            <p style={{ ...s.label, fontSize: '8px', margin: '2px 0 0' }}>
              {activeCount} active · {coupons.length} total
            </p>
          </div>
          <button
            onClick={() => { setShowForm(v => !v); setFormError('') }}
            style={{
              fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.18em',
              textTransform: 'uppercase', padding: '0.5rem 1.25rem', cursor: 'pointer',
              background: showForm ? 'rgba(255,255,255,0.06)' : '#A8401A',
              color: '#FAF6F0', border: 'none', transition: 'background 0.15s',
            }}
          >
            {showForm ? '✕ Cancel' : '+ New Coupon'}
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} style={{
            background: '#2A2521', border: '1px solid rgba(255,255,255,0.09)',
            padding: '1.5rem', marginTop: '1.5rem', marginBottom: '2rem',
          }}>
            <p style={{ ...s.label, color: '#A8401A', marginBottom: '1.25rem' }}>
              ✦ New Coupon
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ ...s.label, marginBottom: '0.4rem', fontSize: '8px' }}>Code *</p>
                <input
                  style={s.input}
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  maxLength={30}
                />
              </div>
              <div>
                <p style={{ ...s.label, marginBottom: '0.4rem', fontSize: '8px' }}>Type *</p>
                <select
                  style={s.selectInput}
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (EGP)</option>
                </select>
              </div>
              <div>
                <p style={{ ...s.label, marginBottom: '0.4rem', fontSize: '8px' }}>
                  Value * {form.type === 'percentage' ? '(%)' : '(EGP)'}
                </p>
                <input
                  style={s.input}
                  type="number"
                  min={1}
                  max={form.type === 'percentage' ? 100 : undefined}
                  value={form.value}
                  onChange={e => setForm({ ...form, value: e.target.value })}
                  placeholder={form.type === 'percentage' ? '20' : '100'}
                />
              </div>
              <div>
                <p style={{ ...s.label, marginBottom: '0.4rem', fontSize: '8px' }}>Max uses (optional)</p>
                <input
                  style={s.input}
                  type="number"
                  min={1}
                  value={form.max_uses}
                  onChange={e => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <p style={{ ...s.label, marginBottom: '0.4rem', fontSize: '8px' }}>Expires at (optional)</p>
                <input
                  style={s.input}
                  type="date"
                  value={form.expires_at}
                  onChange={e => setForm({ ...form, expires_at: e.target.value })}
                />
              </div>
            </div>
            {formError && (
              <p style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#A8401A', marginBottom: '0.75rem' }}>
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={formLoading}
              style={{
                fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.2em',
                textTransform: 'uppercase', padding: '0.6rem 1.5rem', cursor: formLoading ? 'not-allowed' : 'pointer',
                background: '#A8401A', color: '#FAF6F0', border: 'none',
                opacity: formLoading ? 0.6 : 1,
              }}
            >
              {formLoading ? 'Creating…' : 'Create Coupon'}
            </button>
          </form>
        )}

        {/* Coupon list */}
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <p style={s.label}>Loading coupons…</p>
          </div>
        ) : coupons.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(190,176,160,0.4)', margin: 0 }}>
              No coupons yet.
            </p>
            <p style={{ ...s.label, marginTop: '0.5rem' }}>Create your first coupon above.</p>
          </div>
        ) : (
          <div style={{ marginTop: '1.5rem' }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '160px 80px 80px 70px 90px 90px 90px 100px',
              padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.03)',
            }}>
              {['Code', 'Type', 'Value', 'Uses', 'Max uses', 'Expires', 'Status', ''].map(h => (
                <span key={h} style={{ ...s.label, fontSize: '7px' }}>{h}</span>
              ))}
            </div>

            {coupons.map((c, i) => {
              const expired = isExpired(c.expires_at)
              const usedUp = c.max_uses !== null && c.usage_count >= c.max_uses
              const effectivelyActive = c.active && !expired && !usedUp

              return (
                <div
                  key={c.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '160px 80px 80px 70px 90px 90px 90px 100px',
                    padding: '0.85rem 1rem', alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    transition: 'background 0.1s',
                    opacity: (!effectivelyActive) ? 0.6 : 1,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,64,26,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)')}
                >
                  {/* Code */}
                  <p style={{ ...s.mono, fontSize: '13px', letterSpacing: '0.12em', color: '#FAF6F0', margin: 0 }}>
                    {c.code}
                  </p>

                  {/* Type */}
                  <p style={{ ...s.label, fontSize: '8px', margin: 0 }}>
                    {c.type}
                  </p>

                  {/* Value */}
                  <p style={{ ...s.mono, fontSize: '12px', color: '#4ade80', margin: 0 }}>
                    {c.type === 'percentage' ? `${c.value}%` : `${c.value.toLocaleString()} EGP`}
                  </p>

                  {/* Uses */}
                  <p style={{ ...s.mono, fontSize: '11px', color: '#FAF6F0', margin: 0 }}>
                    {c.usage_count}
                  </p>

                  {/* Max uses */}
                  <p style={{ ...s.mono, fontSize: '11px', color: 'rgba(190,176,160,0.6)', margin: 0 }}>
                    {c.max_uses ?? '∞'}
                  </p>

                  {/* Expires */}
                  <p style={{ ...s.mono, fontSize: '9px', color: expired ? '#A8401A' : 'rgba(190,176,160,0.6)', margin: 0 }}>
                    {expired ? `${fmtDate(c.expires_at)} ✕` : fmtDate(c.expires_at)}
                  </p>

                  {/* Status badge */}
                  <div>
                    <span style={{
                      fontFamily: "'Courier New', monospace", fontSize: '8px', letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: effectivelyActive ? '#4ade80' : expired ? '#A8401A' : usedUp ? '#6b7280' : 'rgba(190,176,160,0.5)',
                    }}>
                      {effectivelyActive ? 'Active' : expired ? 'Expired' : usedUp ? 'Used up' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button
                      onClick={() => handleToggle(c)}
                      disabled={togglingId === c.id || expired || usedUp}
                      title={c.active ? 'Deactivate' : 'Activate'}
                      style={{
                        fontFamily: "'Courier New', monospace", fontSize: '8px', letterSpacing: '0.14em',
                        textTransform: 'uppercase', padding: '0.3rem 0.6rem', cursor: 'pointer',
                        background: 'transparent', border: '1px solid',
                        borderColor: c.active ? 'rgba(74,222,128,0.4)' : 'rgba(190,176,160,0.25)',
                        color: c.active ? '#4ade80' : 'rgba(190,176,160,0.5)',
                        opacity: (togglingId === c.id || expired || usedUp) ? 0.4 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      {togglingId === c.id ? '…' : c.active ? 'On' : 'Off'}
                    </button>

                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      title="Delete coupon"
                      style={{
                        fontFamily: "'Courier New', monospace", fontSize: '8px', letterSpacing: '0.14em',
                        textTransform: 'uppercase', padding: '0.3rem 0.6rem', cursor: 'pointer',
                        background: confirmDelete === c.id ? '#A8401A' : 'transparent',
                        border: '1px solid rgba(168,64,26,0.35)',
                        color: confirmDelete === c.id ? '#FAF6F0' : 'rgba(168,64,26,0.6)',
                        opacity: deletingId === c.id ? 0.4 : 1,
                        transition: 'all 0.15s',
                      }}
                      onMouseLeave={() => { if (confirmDelete === c.id) setConfirmDelete(null) }}
                    >
                      {deletingId === c.id ? '…' : confirmDelete === c.id ? 'Sure?' : 'Del'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
