'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type SoldInOrder = {
  orderId: string
  orderNumber: number | null
  customerName: string
  status: string
}

type Product = {
  id: string
  name: string
  brand?: string
  era?: string
  size?: string
  price: number
  sold: boolean
  images?: string[]
  created_at: string
  soldInOrder: SoldInOrder | null
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#BEB0A0',
  confirmed: '#4ade80',
  delivered: '#A8401A',
  cancelled: '#6b7280',
}

function ordNum(orderNumber: number | null, orderId: string) {
  return orderNumber ? `#${orderNumber}` : `#${orderId.slice(0, 8).toUpperCase()}`
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ sold: number; freed: number } | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/products')
    if (res.status === 401) { router.push('/admin/login'); return }
    const { products: data } = await res.json()
    setProducts(data ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' })
      const data = await res.json()
      setSyncResult({ sold: data.sold ?? 0, freed: data.freed ?? 0 })
      setLastSynced(new Date())
      await load()
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = setTimeout(() => setSyncResult(null), 5000)
    } catch { /* ignore */ }
    setSyncing(false)
  }

  const handleToggle = async (product: Product) => {
    setTogglingId(product.id)
    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, sold: !product.sold }),
      })
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, sold: !p.sold } : p))
    } catch { /* ignore */ }
    setTogglingId(null)
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchesSearch = !q || [p.name, p.brand, p.era, p.size, p.id]
      .some(v => v?.toLowerCase().includes(q))
    const matchesFilter =
      filter === 'all' ||
      (filter === 'available' && !p.sold) ||
      (filter === 'sold' && p.sold)
    return matchesSearch && matchesFilter
  })

  const availableCount = products.filter(p => !p.sold).length
  const soldCount = products.filter(p => p.sold).length

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
    serif: { fontFamily: 'Georgia, serif' },
  }

  return (
    <div style={s.root}>
      {/* Sticky controls */}
      <div style={s.sticky}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Title + counts */}
          <div style={{ flex: '0 0 auto' }}>
            <h1 style={{ ...s.serif, fontSize: '1.3rem', fontWeight: 'normal', fontStyle: 'italic', color: '#FAF6F0', margin: 0 }}>
              Products
            </h1>
            <p style={{ ...s.label, margin: '2px 0 0', fontSize: '8px' }}>
              {availableCount} available · {soldCount} sold · {products.length} total
            </p>
          </div>

          <div style={{ flex: 1, minWidth: '160px' }}>
            <input
              type="text"
              placeholder="Search name, brand, era, size…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#FAF6F0',
                padding: '0.5rem 0.75rem', outline: 'none',
                fontFamily: "'Courier New', monospace", fontSize: '11px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '4px', flex: '0 0 auto' }}>
            {(['all', 'available', 'sold'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: "'Courier New', monospace", fontSize: '8px',
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  padding: '0.4rem 0.75rem', cursor: 'pointer',
                  background: filter === f ? '#A8401A' : 'rgba(255,255,255,0.06)',
                  color: filter === f ? '#FAF6F0' : 'rgba(190,176,160,0.6)',
                  border: 'none', transition: 'all 0.15s',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sync button */}
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              fontFamily: "'Courier New', monospace", fontSize: '8px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              padding: '0.4rem 1rem', cursor: syncing ? 'not-allowed' : 'pointer',
              background: syncing ? 'rgba(255,255,255,0.06)' : '#2A2521',
              color: syncing ? 'rgba(190,176,160,0.4)' : '#FAF6F0',
              border: '1px solid rgba(255,255,255,0.1)', flex: '0 0 auto',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {syncing ? '↻ Syncing…' : '↻ Sync All'}
          </button>
        </div>

        {/* Sync result banner */}
        {syncResult && (
          <div style={{
            marginTop: '0.5rem', padding: '0.4rem 0.75rem',
            background: 'rgba(168,64,26,0.15)', border: '1px solid rgba(168,64,26,0.3)',
            fontFamily: "'Courier New', monospace", fontSize: '9px',
            letterSpacing: '0.15em', color: '#A8401A',
          }}>
            ✦ Sync complete — {syncResult.sold} marked sold, {syncResult.freed} freed
            {lastSynced && ` · ${lastSynced.toLocaleTimeString()}`}
          </div>
        )}
      </div>

      {/* Table body */}
      <div style={s.body}>
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <p style={{ ...s.label }}>Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <p style={{ ...s.label }}>No products found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '64px 1fr 100px 80px 80px 120px 120px',
              gap: '0',
              padding: '0.6rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.03)',
            }}>
              {['', 'Product', 'Brand', 'Era', 'Size', 'Price', 'Status'].map(h => (
                <span key={h} style={{ ...s.label, fontSize: '7px' }}>{h}</span>
              ))}
            </div>

            {filtered.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr 100px 80px 80px 120px 120px',
                  gap: '0',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,64,26,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)')}
              >
                {/* Thumbnail */}
                <div style={{ width: '48px', height: '60px', flexShrink: 0, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </div>

                {/* Name + order link */}
                <div style={{ paddingRight: '1rem' }}>
                  <p style={{ ...s.serif, fontSize: '13px', color: '#FAF6F0', margin: '0 0 3px', lineHeight: 1.3 }}>
                    {p.name}
                  </p>
                  {p.soldInOrder && (
                    <p style={{ ...s.mono, fontSize: '9px', letterSpacing: '0.12em', color: STATUS_COLOR[p.soldInOrder.status] ?? '#BEB0A0', margin: 0 }}>
                      {ordNum(p.soldInOrder.orderNumber, p.soldInOrder.orderId)} · {p.soldInOrder.customerName}
                    </p>
                  )}
                </div>

                {/* Brand */}
                <p style={{ ...s.mono, fontSize: '10px', color: 'rgba(190,176,160,0.7)', margin: 0 }}>
                  {p.brand ?? '—'}
                </p>

                {/* Era */}
                <p style={{ ...s.mono, fontSize: '10px', color: 'rgba(190,176,160,0.7)', margin: 0 }}>
                  {p.era ?? '—'}
                </p>

                {/* Size */}
                <p style={{ ...s.mono, fontSize: '10px', color: 'rgba(190,176,160,0.7)', margin: 0 }}>
                  {p.size ?? '—'}
                </p>

                {/* Price */}
                <p style={{ ...s.mono, fontSize: '11px', color: '#FAF6F0', margin: 0 }}>
                  {p.price?.toLocaleString()} EGP
                </p>

                {/* Status toggle */}
                <div>
                  <button
                    onClick={() => handleToggle(p)}
                    disabled={togglingId === p.id}
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '8px',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      padding: '0.35rem 0.75rem',
                      cursor: togglingId === p.id ? 'not-allowed' : 'pointer',
                      border: '1px solid',
                      background: 'transparent',
                      borderColor: p.sold ? 'rgba(168,64,26,0.5)' : 'rgba(74,222,128,0.4)',
                      color: p.sold ? '#A8401A' : '#4ade80',
                      opacity: togglingId === p.id ? 0.5 : 1,
                      transition: 'all 0.15s',
                      minWidth: '80px',
                    }}
                  >
                    {togglingId === p.id ? '…' : p.sold ? 'Sold' : 'Available'}
                  </button>
                  {p.sold && !p.soldInOrder && (
                    <p style={{ ...s.mono, fontSize: '7px', color: 'rgba(190,176,160,0.35)', margin: '3px 0 0', letterSpacing: '0.1em' }}>
                      manual override
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
