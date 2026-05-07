'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ────────────────────────────────────────────────────────────────────

type SoldInOrder = {
  orderId: string
  orderNumber: number | null
  customerName: string
  status: string
}

type Product = {
  id: string
  name: string
  slug: string
  brand: string | null
  era: string | null
  condition: string | null
  price: number
  sizes: string[]
  images: string[]
  story: string | null
  collection: string | null
  sold: boolean
  created_at: string
  soldInOrder: SoldInOrder | null
}

type ProductForm = {
  name: string
  brand: string
  era: string
  condition: string
  price: string
  sizes: string      // comma-separated input
  images: string[]   // array of URLs
  story: string
  collection: string
  slug: string
}

const EMPTY_FORM: ProductForm = {
  name: '', brand: '', era: '', condition: '', price: '',
  sizes: '', images: [''], story: '', collection: '', slug: '',
}

const ERA_OPTIONS = ['60s', '70s', '80s', '90s', '00s', 'Deadstock']
const CONDITION_OPTIONS = ['Deadstock', 'Excellent', 'Very Good', 'Good', 'Fair']
const COLLECTION_OPTIONS = ['Main', 'Archive', 'Limited', 'Seasonal']

const STATUS_COLOR: Record<string, string> = {
  pending: '#BEB0A0', confirmed: '#4ade80', delivered: '#A8401A', cancelled: '#6b7280',
}

function ordNum(n: number | null, id: string) {
  return n ? `#${n}` : `#${id.slice(0, 8).toUpperCase()}`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ sold: number; freed: number } | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')

  // ── Data loading ───────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/products')
    if (res.status === 401) { router.push('/admin/login'); return }
    const { products: data } = await res.json()
    setProducts(data ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  // ── Panel helpers ──────────────────────────────────────────────────────────

  function openCreate() {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setPanelOpen(true)
  }

  function openEdit(p: Product) {
    setEditingProduct(p)
    setForm({
      name: p.name,
      brand: p.brand ?? '',
      era: p.era ?? '',
      condition: p.condition ?? '',
      price: String(p.price),
      sizes: (p.sizes ?? []).join(', '),
      images: p.images?.length ? p.images : [''],
      story: p.story ?? '',
      collection: p.collection ?? '',
      slug: p.slug ?? '',
    })
    setFormError('')
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditingProduct(null)
    setFormError('')
    setNewImageUrl('')
  }

  // ── Form actions ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      setFormError('Name and price are required')
      return
    }
    if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setFormError('Price must be a valid positive number')
      return
    }

    setFormLoading(true)
    setFormError('')

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      era: form.era || null,
      condition: form.condition || null,
      price: Number(form.price),
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      images: form.images.filter(u => u?.startsWith('http')),
      story: form.story.trim() || null,
      collection: form.collection.trim() || null,
      slug: form.slug.trim() || undefined,
    }

    try {
      let res: Response
      if (editingProduct) {
        res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: editingProduct.id, ...payload }),
        })
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      const data = await res.json()
      if (!res.ok) { setFormError(data.error ?? 'Save failed'); return }
      closePanel()
      await load()
    } catch {
      setFormError('Network error — please try again')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Toggle sold ────────────────────────────────────────────────────────────

  const handleToggle = async (p: Product) => {
    setTogglingId(p.id)
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: p.id, sold: !p.sold }),
    })
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, sold: !x.sold } : x))
    setTogglingId(null)
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return }
    setDeletingId(id)
    setConfirmDeleteId(null)
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
    if (editingProduct?.id === id) closePanel()
    setDeletingId(null)
  }

  // ── Sync ───────────────────────────────────────────────────────────────────

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    const res = await fetch('/api/admin/sync', { method: 'POST' })
    const data = await res.json()
    setSyncResult({ sold: data.sold ?? 0, freed: data.freed ?? 0 })
    await load()
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = setTimeout(() => setSyncResult(null), 5000)
    setSyncing(false)
  }

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || [p.name, p.brand, p.era, p.condition, p.collection, p.id]
      .some(v => v?.toLowerCase().includes(q))
    const matchFilter =
      filter === 'all' ||
      (filter === 'available' && !p.sold) ||
      (filter === 'sold' && p.sold)
    return matchSearch && matchFilter
  })

  const availableCount = products.filter(p => !p.sold).length
  const soldCount = products.filter(p => p.sold).length

  // ── Shared styles ──────────────────────────────────────────────────────────

  const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace" }
  const serif: React.CSSProperties = { fontFamily: 'Georgia, serif' }
  const label: React.CSSProperties = { ...mono, fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(190,176,160,0.5)' }
  const inputStyle: React.CSSProperties = {
    ...mono, fontSize: '12px', width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', color: '#FAF6F0',
    padding: '0.5rem 0.75rem', outline: 'none', boxSizing: 'border-box',
  }
  const selectStyle: React.CSSProperties = {
    ...inputStyle, background: '#1A1714', cursor: 'pointer',
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ── Sticky controls ─────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: '48px', zIndex: 40,
        background: '#1C1917', borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0.9rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Title */}
          <div style={{ flex: '0 0 auto' }}>
            <h1 style={{ ...serif, fontSize: '1.2rem', fontWeight: 'normal', fontStyle: 'italic', color: '#FAF6F0', margin: 0 }}>
              Products
            </h1>
            <p style={{ ...label, margin: '2px 0 0' }}>
              {availableCount} available · {soldCount} sold · {products.length} total
            </p>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '140px', ...inputStyle }}
          />

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {(['all', 'available', 'sold'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                ...mono, fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                padding: '0.35rem 0.7rem', cursor: 'pointer', border: 'none',
                background: filter === f ? '#A8401A' : 'rgba(255,255,255,0.06)',
                color: filter === f ? '#FAF6F0' : 'rgba(190,176,160,0.55)',
                transition: 'all 0.15s',
              }}>
                {f}
              </button>
            ))}
          </div>

          {/* Sync */}
          <button onClick={handleSync} disabled={syncing} style={{
            ...mono, fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '0.35rem 0.8rem', cursor: syncing ? 'not-allowed' : 'pointer',
            background: 'rgba(255,255,255,0.05)', color: syncing ? 'rgba(190,176,160,0.35)' : '#FAF6F0',
            border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0,
          }}>
            {syncing ? '↻ Syncing…' : '↻ Sync'}
          </button>

          {/* Add product */}
          <button onClick={openCreate} style={{
            ...mono, fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '0.35rem 1rem', cursor: 'pointer',
            background: '#A8401A', color: '#FAF6F0', border: 'none', flexShrink: 0,
          }}>
            + Add Product
          </button>
        </div>

        {syncResult && (
          <div style={{ marginTop: '0.4rem', ...mono, fontSize: '9px', letterSpacing: '0.12em', color: '#A8401A' }}>
            ✦ Sync complete — {syncResult.sold} marked sold, {syncResult.freed} freed
          </div>
        )}
      </div>

      {/* ── Product table ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '0 1.5rem 4rem' }}>
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <p style={label}>Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <p style={{ ...serif, fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(190,176,160,0.35)', margin: '0 0 0.5rem' }}>
              {products.length === 0 ? 'No products yet.' : 'No results for that search.'}
            </p>
            {products.length === 0 && (
              <button onClick={openCreate} style={{
                ...mono, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '0.5rem 1.25rem', background: '#A8401A', color: '#FAF6F0',
                border: 'none', cursor: 'pointer', marginTop: '0.75rem',
              }}>
                Add first product
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '56px 1fr 80px 70px 70px 90px 100px 90px',
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
              marginTop: '0.5rem',
            }}>
              {['', 'Product', 'Era', 'Cond.', 'Sizes', 'Price', 'Status', 'Actions'].map(h => (
                <span key={h} style={label}>{h}</span>
              ))}
            </div>

            {filtered.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr 80px 70px 70px 90px 100px 90px',
                  alignItems: 'center',
                  padding: '0.65rem 0.75rem',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,64,26,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)')}
              >
                {/* Thumbnail */}
                <div style={{ width: '44px', height: '55px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </div>

                {/* Name + brand + sold-in-order */}
                <div style={{ paddingRight: '0.75rem', overflow: 'hidden' }}>
                  <p style={{ ...serif, fontSize: '13px', color: '#FAF6F0', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </p>
                  {p.brand && (
                    <p style={{ ...mono, fontSize: '9px', color: 'rgba(190,176,160,0.5)', margin: '0 0 2px', letterSpacing: '0.1em' }}>
                      {p.brand}
                    </p>
                  )}
                  {p.soldInOrder && (
                    <p style={{ ...mono, fontSize: '8px', color: STATUS_COLOR[p.soldInOrder.status] ?? '#BEB0A0', margin: 0, letterSpacing: '0.08em' }}>
                      {ordNum(p.soldInOrder.orderNumber, p.soldInOrder.orderId)}
                    </p>
                  )}
                </div>

                {/* Era */}
                <p style={{ ...mono, fontSize: '10px', color: 'rgba(190,176,160,0.65)', margin: 0 }}>{p.era ?? '—'}</p>

                {/* Condition */}
                <p style={{ ...mono, fontSize: '10px', color: 'rgba(190,176,160,0.65)', margin: 0 }}>{p.condition ?? '—'}</p>

                {/* Sizes */}
                <p style={{ ...mono, fontSize: '9px', color: 'rgba(190,176,160,0.65)', margin: 0 }}>
                  {p.sizes?.length ? p.sizes.join(', ') : '—'}
                </p>

                {/* Price */}
                <p style={{ ...mono, fontSize: '11px', color: '#FAF6F0', margin: 0 }}>
                  {p.price?.toLocaleString()} EGP
                </p>

                {/* Sold toggle */}
                <button
                  onClick={() => handleToggle(p)}
                  disabled={togglingId === p.id}
                  style={{
                    ...mono, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase',
                    padding: '0.3rem 0.6rem', cursor: togglingId === p.id ? 'not-allowed' : 'pointer',
                    border: '1px solid',
                    borderColor: p.sold ? 'rgba(168,64,26,0.5)' : 'rgba(74,222,128,0.4)',
                    color: p.sold ? '#A8401A' : '#4ade80',
                    background: 'transparent',
                    opacity: togglingId === p.id ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {togglingId === p.id ? '…' : p.sold ? 'Sold' : 'Available'}
                </button>

                {/* Edit / Delete */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => openEdit(p)}
                    style={{
                      ...mono, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase',
                      padding: '0.3rem 0.55rem', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.07)', color: '#FAF6F0', border: 'none',
                      transition: 'background 0.15s',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    onMouseLeave={() => { if (confirmDeleteId === p.id) setConfirmDeleteId(null) }}
                    style={{
                      ...mono, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase',
                      padding: '0.3rem 0.55rem', cursor: 'pointer',
                      background: confirmDeleteId === p.id ? '#A8401A' : 'transparent',
                      color: confirmDeleteId === p.id ? '#FAF6F0' : 'rgba(168,64,26,0.55)',
                      border: '1px solid rgba(168,64,26,0.3)',
                      opacity: deletingId === p.id ? 0.4 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {deletingId === p.id ? '…' : confirmDeleteId === p.id ? 'Sure?' : 'Del'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit / Create Panel ────────────────────────────────────────────── */}
      {/* Backdrop */}
      {panelOpen && (
        <div
          onClick={closePanel}
          style={{
            position: 'fixed', inset: 0, zIndex: 700,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Slide-in panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 800,
          width: '100%', maxWidth: '520px',
          background: '#181512',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          overflowY: 'auto',
          transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.76,0,0.24,1)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Panel header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: '#181512', borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ ...label, color: '#A8401A', margin: '0 0 3px' }}>
              {editingProduct ? '✦ Edit Product' : '✦ New Product'}
            </p>
            {editingProduct && (
              <p style={{ ...mono, fontSize: '9px', color: 'rgba(190,176,160,0.35)', margin: 0, letterSpacing: '0.08em' }}>
                {editingProduct.id}
              </p>
            )}
          </div>
          <button
            onClick={closePanel}
            style={{
              ...mono, fontSize: '16px', color: 'rgba(190,176,160,0.5)', background: 'none',
              border: 'none', cursor: 'pointer', padding: '0.25rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Panel form */}
        <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Name */}
          <div>
            <p style={{ ...label, marginBottom: '0.35rem' }}>Name *</p>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Vintage Levi's 501 Denim Jacket"
            />
          </div>

          {/* Brand */}
          <div>
            <p style={{ ...label, marginBottom: '0.35rem' }}>Brand</p>
            <input
              style={inputStyle}
              value={form.brand}
              onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              placeholder="Levi's, Wrangler, Carhartt…"
            />
          </div>

          {/* Era + Condition */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <p style={{ ...label, marginBottom: '0.35rem' }}>Era</p>
              <select
                style={selectStyle}
                value={form.era}
                onChange={e => setForm(f => ({ ...f, era: e.target.value }))}
              >
                <option value="">Select era</option>
                {ERA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <p style={{ ...label, marginBottom: '0.35rem' }}>Condition</p>
              <select
                style={selectStyle}
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
              >
                <option value="">Select condition</option>
                {CONDITION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Price + Collection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <p style={{ ...label, marginBottom: '0.35rem' }}>Price (EGP) *</p>
              <input
                style={inputStyle}
                type="number"
                min={0}
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="1500"
              />
            </div>
            <div>
              <p style={{ ...label, marginBottom: '0.35rem' }}>Collection</p>
              <select
                style={selectStyle}
                value={form.collection}
                onChange={e => setForm(f => ({ ...f, collection: e.target.value }))}
              >
                <option value="">None</option>
                {COLLECTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p style={{ ...label, marginBottom: '0.35rem' }}>Sizes <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(comma-separated)</span></p>
            <input
              style={inputStyle}
              value={form.sizes}
              onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))}
              placeholder="XS, S, M, L, XL  or  28, 30, 32"
            />
          </div>

          {/* Images */}
          <div>
            <p style={{ ...label, marginBottom: '0.5rem' }}>Image URLs</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {form.images.map((url, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {/* Thumbnail preview */}
                  <div style={{
                    width: '36px', height: '44px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}>
                    {url?.startsWith('http') && (
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    )}
                  </div>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={url}
                    onChange={e => {
                      const newImgs = [...form.images]
                      newImgs[idx] = e.target.value
                      setForm(f => ({ ...f, images: newImgs }))
                    }}
                    placeholder={`Image URL ${idx + 1}`}
                  />
                  {form.images.length > 1 && (
                    <button
                      onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                      style={{
                        ...mono, fontSize: '14px', color: 'rgba(168,64,26,0.7)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.25rem', lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))}
                style={{
                  ...mono, fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'rgba(190,176,160,0.5)', background: 'rgba(255,255,255,0.04)',
                  border: '1px dashed rgba(255,255,255,0.1)', padding: '0.4rem', cursor: 'pointer',
                  width: '100%', textAlign: 'center',
                }}
              >
                + Add image URL
              </button>
            </div>
          </div>

          {/* Story */}
          <div>
            <p style={{ ...label, marginBottom: '0.35rem' }}>Story / Description</p>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }}
              value={form.story}
              onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
              placeholder="A rare find from the archives. This piece…"
              rows={4}
            />
          </div>

          {/* Slug (advanced) */}
          <details style={{ cursor: 'pointer' }}>
            <summary style={{ ...label, cursor: 'pointer', userSelect: 'none', marginBottom: '0.35rem' }}>
              Advanced — URL Slug
            </summary>
            <input
              style={{ ...inputStyle, marginTop: '0.35rem' }}
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="auto-generated from name"
            />
            <p style={{ ...mono, fontSize: '8px', color: 'rgba(190,176,160,0.35)', margin: '0.25rem 0 0', letterSpacing: '0.1em' }}>
              Leave blank to auto-generate. Used in the shop URL.
            </p>
          </details>

        </div>

        {/* Panel footer */}
        <div style={{
          position: 'sticky', bottom: 0,
          background: '#181512', borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1rem 1.25rem',
        }}>
          {formError && (
            <p style={{ ...mono, fontSize: '9px', letterSpacing: '0.12em', color: '#A8401A', marginBottom: '0.75rem' }}>
              ⚠ {formError}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={closePanel}
              style={{
                ...mono, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '0.65rem 1rem', cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)', color: 'rgba(190,176,160,0.6)',
                border: '1px solid rgba(255,255,255,0.08)', flex: '0 0 auto',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={formLoading}
              style={{
                ...mono, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '0.65rem 1.5rem', cursor: formLoading ? 'not-allowed' : 'pointer',
                background: '#A8401A', color: '#FAF6F0', border: 'none', flex: 1,
                opacity: formLoading ? 0.6 : 1, transition: 'opacity 0.15s',
              }}
            >
              {formLoading ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
