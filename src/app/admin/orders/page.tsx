'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

type OrderItem = {
  product: { id: string; name: string; price: number; images?: string[] }
  size: string
  quantity: number
}

type Order = {
  id: string
  order_number: number | null
  customer_email: string
  name: string
  phone: string
  address: string
  city: string
  notes: string | null
  items: OrderItem[]
  total: number
  payment_method: 'cod' | 'instapay'
  payment_confirmed: boolean
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  created_at: string
  tracking_number: string | null
  bosta_shipment_id: string | null
  shipped_at: string | null
  coupon_code: string | null
  discount_amount: number | null
}

const STATUS = {
  pending:   { bg: 'rgba(200,160,40,.15)',  color: '#D4A017', label: 'Pending',   dot: '#D4A017' },
  confirmed: { bg: 'rgba(168,64,26,.2)',    color: '#C4521F', label: 'Confirmed', dot: '#C4521F' },
  delivered: { bg: 'rgba(45,120,22,.2)',    color: '#5DBF3A', label: 'Delivered', dot: '#5DBF3A' },
  cancelled: { bg: 'rgba(138,129,120,.15)', color: '#6A6168', label: 'Cancelled', dot: '#6A6168' },
} as const

const PAGE_SIZE = 20

function ordNum(o: Order) {
  return o.order_number ? `#${o.order_number}` : `#${o.id.slice(0, 8).toUpperCase()}`
}
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtT(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
function copyText(t: string) { navigator.clipboard.writeText(t).catch(() => {}) }
function waLink(phone: string, ref: string, name: string) {
  const d = phone.replace(/\D/g, '')
  const intl = d.startsWith('0') ? '2' + d : d.startsWith('20') ? d : '20' + d
  return `https://wa.me/${intl}?text=${encodeURIComponent(`Hello ${name}, regarding your FYNDE order ${ref}.`)}`
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Instrument+Mono&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  /* ── Layout ── */
  .op { padding: 2.5rem 2.5rem 4rem; max-width: 1400px; margin: 0 auto; color: #F0E9DF; }
  .op-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap; }
  .op-eye { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .32em; text-transform: uppercase; color: #5A5754; margin: 0 0 6px; }
  .op-h1 { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: 3.2rem; color: #F0E9DF; margin: 0; line-height: 1; }
  .op-hbtns { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .op-refresh { background: none; border: 1px solid #3A3734; padding: 9px 16px; font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .14em; color: #8A8178; cursor: pointer; transition: all .15s; border-radius: 0; }
  .op-refresh:hover { border-color: #F0E9DF; color: #F0E9DF; }
  .op-logout { background: none; border: 1px solid rgba(240,233,223,.14); padding: 9px 16px; font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: #5A5754; cursor: pointer; transition: all .15s; border-radius: 0; }
  .op-logout:hover { border-color: #F0E9DF; color: #F0E9DF; }

  /* ── Search ── */
  .op-topbar { margin-bottom: 1.5rem; }
  .op-sw { position: relative; }
  .op-search { width: 100%; background: #1A1917; border: 1px solid #2E2C2A; padding: 13px 16px 13px 46px; font-family: 'Instrument Mono', monospace; font-size: 13px; color: #F0E9DF; outline: none; border-radius: 0; transition: border-color .15s; }
  .op-search:focus { border-color: #A8401A; }
  .op-search::placeholder { color: #3E3C3A; }
  .op-si { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #4A4844; font-size: 17px; pointer-events: none; }

  /* ── Filters ── */
  .op-fg { margin-bottom: 1rem; }
  .op-fl { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #3E3C3A; display: block; margin-bottom: 8px; }
  .op-frow { display: flex; flex-wrap: wrap; gap: 6px; }
  .op-fb { background: none; border: 1px solid #2E2C2A; padding: 7px 15px; font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .15em; text-transform: uppercase; color: #6A6864; cursor: pointer; transition: all .15s; display: inline-flex; align-items: center; gap: 7px; border-radius: 0; }
  .op-fb:hover { border-color: #8A8784; color: #D0C8C0; }
  .op-fb.on { background: #A8401A; border-color: #A8401A; color: #FAF6F0; }
  .op-fc { font-size: 10px; padding: 1px 7px; background: rgba(168,64,26,.18); color: #C4521F; border-radius: 10px; }
  .op-fb.on .op-fc { background: rgba(255,255,255,.2); color: #FAF6F0; }

  .op-div { width: 100%; height: 1px; background: #252321; margin: 1.5rem 0 1.25rem; }

  /* ── Meta row ── */
  .op-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; gap: 8px; flex-wrap: wrap; }
  .op-count { font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: #4A4844; }
  .op-newbtn { background: #A8401A; color: #FAF6F0; border: none; font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .16em; padding: 5px 12px; cursor: pointer; border-radius: 0; animation: blink .9s ease-in-out infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.65} }

  /* ── Table ── */
  .op-tbl { width: 100%; border-collapse: collapse; }
  .op-tbl th { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: #4A4844; text-align: left; padding: 0 16px 14px; border-bottom: 1px solid #252321; white-space: nowrap; }
  .op-tbl td { padding: 17px 16px; border-bottom: 1px solid #1C1A18; vertical-align: middle; }
  .op-row { cursor: pointer; transition: background .1s; }
  .op-row:hover { background: rgba(240,233,223,.028); }
  .op-row.sel { background: rgba(168,64,26,.07); border-left: 2px solid #A8401A; }

  .c-num { font-family: 'Instrument Mono', monospace; font-size: 13px; letter-spacing: .08em; color: #A8401A; font-weight: 600; }
  .c-name { font-family: 'Instrument Mono', monospace; font-size: 13px; color: #E8E0D8; margin-bottom: 3px; }
  .c-sub { font-family: 'Instrument Mono', monospace; font-size: 11px; color: #4A4844; margin-top: 2px; }
  .c-date { font-family: 'Instrument Mono', monospace; font-size: 12px; color: #B0A8A0; margin-bottom: 2px; }
  .c-total { font-family: 'Instrument Mono', monospace; font-size: 14px; color: #F0E9DF; font-weight: 600; white-space: nowrap; }
  .c-tag { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; padding: 5px 10px; border: 1px solid #2E2C2A; color: #6A6864; white-space: nowrap; }
  .c-tag.ip { border-color: rgba(168,64,26,.35); color: #C4521F; }
  .c-badge { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; padding: 5px 10px; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; border: none; border-radius: 0; cursor: default; }
  .c-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .c-wa { border: 1px solid rgba(37,211,102,.2); padding: 6px 12px; font-family: 'Instrument Mono', monospace; font-size: 10px; color: rgba(37,211,102,.65); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; transition: all .15s; white-space: nowrap; }
  .c-wa:hover { border-color: rgba(37,211,102,.55); color: #25D366; }

  /* ── Side Panel ── */
  .panel-bg { position: fixed; inset: 0; z-index: 510; background: rgba(0,0,0,.55); }
  .panel { position: fixed; top: 0; right: 0; height: 100%; width: 480px; max-width: 100vw; z-index: 520; background: #0F0E0D; border-left: 1px solid #2A2826; overflow-y: auto; display: flex; flex-direction: column; }

  .panel-head { padding: 1.75rem 2rem 1.5rem; border-bottom: 1px solid #1E1C1A; position: sticky; top: 0; background: #0F0E0D; z-index: 1; }
  .panel-close { position: absolute; top: 1.5rem; right: 1.75rem; background: none; border: none; font-size: 20px; color: #4A4844; cursor: pointer; padding: 4px 6px; line-height: 1; transition: color .15s; }
  .panel-close:hover { color: #F0E9DF; }
  .panel-eye { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .32em; text-transform: uppercase; color: #4A4844; margin: 0 0 5px; }
  .panel-num { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: 2.6rem; color: #F0E9DF; margin: 0 0 6px; line-height: 1; }
  .panel-date { font-family: 'Instrument Mono', monospace; font-size: 11px; color: #4A4844; margin-bottom: 12px; }

  .panel-body { flex: 1; }
  .panel-sec { padding: 1.5rem 2rem; border-bottom: 1px solid #1A1917; }
  .panel-sec-lbl { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .32em; text-transform: uppercase; color: #4A4844; margin: 0 0 1.1rem; }

  .pf { display: flex; flex-direction: column; gap: 3px; padding: 9px 0; border-bottom: 1px solid #171614; }
  .pf:last-child { border-bottom: none; }
  .pf-lbl { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: #3E3C3A; }
  .pf-val { font-family: 'Instrument Mono', monospace; font-size: 13px; color: #B8B0A8; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; word-break: break-word; }

  .p-wa { border: 1px solid rgba(37,211,102,.22); padding: 5px 12px; font-family: 'Instrument Mono', monospace; font-size: 10px; color: rgba(37,211,102,.75); text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: all .15s; white-space: nowrap; }
  .p-wa:hover { border-color: rgba(37,211,102,.55); color: #25D366; }
  .p-call { border: 1px solid #2A2826; padding: 5px 12px; font-family: 'Instrument Mono', monospace; font-size: 10px; color: #6A6864; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: all .15s; white-space: nowrap; }
  .p-call:hover { border-color: #8A8784; color: #D0C8C0; }
  .p-copy { background: none; border: none; cursor: pointer; color: #3E3C3A; font-size: 13px; padding: 1px 4px; transition: color .15s; flex-shrink: 0; }
  .p-copy:hover { color: #F0E9DF; }

  /* Items in panel */
  .pi { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #171614; }
  .pi:last-child { border-bottom: none; }
  .pi-img { width: 56px; height: 72px; object-fit: cover; flex-shrink: 0; background: #1A1917; display: block; }
  .pi-ph { width: 56px; height: 72px; background: #1A1917; border: 1px solid #252321; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #2E2C2A; font-size: 16px; }
  .pi-info { flex: 1; min-width: 0; }
  .pi-name { font-family: 'Instrument Mono', monospace; font-size: 12px; color: #C0B8B0; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pi-sz { font-family: 'Instrument Mono', monospace; font-size: 10px; color: #4A4844; letter-spacing: .15em; text-transform: uppercase; }
  .pi-price { font-family: 'Instrument Mono', monospace; font-size: 13px; color: #E0D8D0; flex-shrink: 0; }
  .pi-total { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; margin-top: 4px; border-top: 1px solid #252321; }
  .pi-total-lbl { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #4A4844; }
  .pi-total-val { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: 1.9rem; color: #F0E9DF; }

  /* Bosta scaffold */
  .bosta-wrap { border: 1px dashed #252321; padding: 1.25rem; text-align: center; }
  .bosta-lbl { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #3A3836; margin: 0 0 10px; }
  .bosta-soon { font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; padding: 9px 18px; background: none; border: 1px solid #252321; color: #3A3836; cursor: not-allowed; border-radius: 0; }

  /* Panel actions */
  .panel-acts { padding: 1.75rem 2rem; border-top: 1px solid #1E1C1A; display: flex; flex-direction: column; gap: 10px; }
  .pa-confirm { width: 100%; background: #A8401A; color: #FAF6F0; border: none; padding: 15px; font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .24em; text-transform: uppercase; cursor: pointer; transition: background .15s; border-radius: 0; }
  .pa-confirm:hover:not(:disabled) { background: #C4521F; }
  .pa-confirm:disabled { opacity: .5; cursor: not-allowed; }
  .pa-row { display: flex; gap: 10px; }
  .pa-deliver { flex: 1; background: none; color: #5DBF3A; border: 1px solid rgba(93,191,58,.28); padding: 12px; font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; transition: all .15s; border-radius: 0; }
  .pa-deliver:hover:not(:disabled) { border-color: rgba(93,191,58,.65); }
  .pa-cancel-o { flex: 1; background: none; color: #6A6864; border: 1px solid #2A2826; padding: 12px; font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; transition: all .15s; border-radius: 0; }
  .pa-cancel-o:hover:not(:disabled) { border-color: #8A8784; color: #C0B8B0; }
  .pa-delete { width: 100%; background: none; color: rgba(200,70,70,.55); border: 1px solid rgba(200,70,70,.18); padding: 10px; font-family: 'Instrument Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; transition: all .15s; border-radius: 0; margin-top: 2px; }
  .pa-delete:hover:not(:disabled) { border-color: rgba(200,70,70,.42); color: rgba(220,80,80,.9); }
  .pa-*:disabled { opacity: .5; cursor: not-allowed; }

  /* Empty / loading */
  .op-empty { text-align: center; padding: 5rem 2rem; }
  .op-ei { width: 44px; height: 44px; border: 1px solid #252321; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.1rem; color: #A8401A; font-size: 16px; }
  .op-et { font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .26em; text-transform: uppercase; color: #4A4844; }

  /* Pagination */
  .pag { display: flex; align-items: center; gap: 6px; margin-top: 2.5rem; justify-content: center; flex-wrap: wrap; }
  .pag-btn { background: none; border: 1px solid #252321; width: 40px; height: 40px; font-family: 'Instrument Mono', monospace; font-size: 12px; color: #4A4844; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; border-radius: 0; }
  .pag-btn:hover:not(:disabled) { border-color: #8A8784; color: #D0C8C0; }
  .pag-btn.cur { background: #A8401A; border-color: #A8401A; color: #FAF6F0; }
  .pag-btn:disabled { opacity: .3; cursor: not-allowed; }
  .pag-el { font-family: 'Instrument Mono', monospace; font-size: 12px; color: #3A3836; padding: 0 4px; }

  /* Toast */
  .toast { position: fixed; bottom: 2rem; right: 2rem; z-index: 600; padding: 13px 22px; font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #FAF6F0; animation: tin .22s ease; border-left: 3px solid; }
  .toast.ok  { background: #161412; border-color: #A8401A; }
  .toast.err { background: #161412; border-color: rgb(180,55,55); }
  @keyframes tin { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  /* Modals */
  .mo { position: fixed; inset: 0; background: rgba(0,0,0,.82); z-index: 560; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
  .mo-card { background: #161412; border: 1px solid #2A2826; padding: 2.5rem; max-width: 440px; width: 100%; }
  .mo-title { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; font-size: 1.9rem; color: #F0E9DF; margin: 0 0 6px; line-height: 1.15; }
  .mo-sub { font-family: 'Instrument Mono', monospace; font-size: 12px; line-height: 2; color: #6A6864; margin: 0 0 1.5rem; letter-spacing: .06em; }
  .mo-warn { font-family: 'Instrument Mono', monospace; font-size: 11px; color: #C4521F; letter-spacing: .08em; line-height: 1.8; margin-bottom: 1.25rem; padding: 12px 14px; border: 1px solid rgba(168,64,26,.22); background: rgba(168,64,26,.06); }
  .mo-err  { font-family: 'Instrument Mono', monospace; font-size: 11px; color: rgb(220,80,80); letter-spacing: .08em; line-height: 1.8; margin-bottom: 1.25rem; padding: 12px 14px; border: 1px solid rgba(180,55,55,.3); background: rgba(180,55,55,.07); }
  .mo-opts { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; }
  .mo-opt { background: none; border: 1px solid #2A2826; padding: 11px 20px; font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #6A6864; cursor: pointer; transition: all .15s; border-radius: 0; }
  .mo-opt:hover { border-color: #8A8784; color: #D0C8C0; }
  .mo-acts { display: flex; gap: 10px; }
  .mo-cancel { flex: 1; background: none; color: #6A6864; border: 1px solid #2A2826; padding: 13px; font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; transition: all .15s; border-radius: 0; }
  .mo-cancel:hover { border-color: #8A8784; color: #D0C8C0; }
  .mo-go { flex: 2; background: #A8401A; color: #FAF6F0; border: none; padding: 13px; font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; transition: background .15s; border-radius: 0; }
  .mo-go:hover:not(:disabled) { background: #C4521F; }
  .mo-go:disabled { opacity: .5; cursor: not-allowed; }
  .mo-danger { flex: 2; background: rgba(180,55,55,.12); color: rgb(220,80,80); border: 1px solid rgba(180,55,55,.28); padding: 13px; font-family: 'Instrument Mono', monospace; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; cursor: pointer; transition: all .15s; border-radius: 0; }
  .mo-danger:hover { background: rgba(180,55,55,.22); }
  .mo-danger:disabled { opacity: .5; cursor: not-allowed; }

  /* Mobile */
  @media(max-width: 768px) {
    .op { padding: 1.25rem 1rem 3rem; }
    .op-h1 { font-size: 2.4rem; }
    .op-tbl thead { display: none; }
    .op-tbl, .op-tbl tbody, .op-tbl tr, .op-tbl td { display: block; }
    .op-row { background: #161412; border: 1px solid #252321; margin-bottom: 8px; padding: .875rem; }
    .op-row td { padding: 3px 0; border: none; }
    .panel { width: 100vw; }
  }
`

export default function OrdersPage() {
  const router = useRouter()
  const [orders,       setOrders]       = useState<Order[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [sFilter,      setSFilter]      = useState<'all' | Order['status']>('all')
  const [mFilter,      setMFilter]      = useState<'all' | 'cod' | 'instapay'>('all')
  const [page,         setPage]         = useState(1)
  const [selected,     setSelected]     = useState<Order | null>(null)
  const [busy,         setBusy]         = useState<string | null>(null)
  const [toast,        setToast]        = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [modal,        setModal]        = useState<{ orderId: string; type: 'confirm' | 'delete' | 'status' } | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [hasNew,       setHasNew]       = useState(false)
  const latestAt = useRef<string | null>(null)

  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch('/api/admin/orders')
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      if (data.orders) {
        if (silent && latestAt.current) {
          const found = data.orders.some((o: Order) => o.created_at > latestAt.current!)
          if (found) setHasNew(true)
        }
        setOrders(data.orders)
        if (data.orders.length > 0) latestAt.current = data.orders[0].created_at
      }
    } catch { if (!silent) showToast('Failed to load orders', 'err') }
    if (!silent) setLoading(false)
  }, [router, showToast])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Auto-refresh every 45 seconds
  useEffect(() => {
    const id = setInterval(() => fetchOrders(true), 45_000)
    return () => clearInterval(id)
  }, [fetchOrders])

  useEffect(() => { setPage(1) }, [search, sFilter, mFilter])

  // Keep panel in sync when orders update
  useEffect(() => {
    if (selected) {
      const updated = orders.find(o => o.id === selected.id)
      if (updated) setSelected(updated)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders])

  async function updateStatus(orderId: string, status: string) {
    setBusy(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      })
      if (!res.ok) throw new Error()
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o))
      showToast(`Order marked as ${status}`)
      setModal(null)
    } catch { showToast('Update failed', 'err') }
    setBusy(null)
  }

  async function confirmInstapay(orderId: string) {
    setBusy(orderId)
    setConfirmError(null)
    try {
      const res = await fetch('/api/admin/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setConfirmError(
          data.soldItems?.length
            ? `Already sold: ${data.soldItems.join(', ')}`
            : data.error ?? 'Confirmation failed'
        )
        setBusy(null)
        return
      }
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'confirmed', payment_confirmed: true } : o
      ))
      showToast('Payment confirmed — customer notified ✦')
      setModal(null)
    } catch { setConfirmError('Something went wrong. Please try again.') }
    setBusy(null)
  }

  async function deleteOrder(orderId: string) {
    setBusy(orderId)
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setOrders(prev => prev.filter(o => o.id !== orderId))
      setModal(null)
      setSelected(null)
      showToast('Order deleted')
    } catch { showToast('Delete failed', 'err') }
    setBusy(null)
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const filtered = useMemo(() => orders.filter(o => {
    const q = search.toLowerCase().trim()
    const hit = !q || [o.name, o.customer_email, o.phone, o.city,
      String(o.order_number ?? ''), o.id.slice(0, 8)].some(f => f?.toLowerCase().includes(q))
    return hit
      && (sFilter === 'all' || o.status === sFilter)
      && (mFilter === 'all' || o.payment_method === mFilter)
  }), [orders, search, sFilter, mFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const counts = useMemo(() => ({
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }), [orders])

  const modalOrder = modal ? orders.find(o => o.id === modal.orderId) : null

  // ── Helpers ───────────────────────────────────────────────────────────────
  function closePanel() { setSelected(null) }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* ── Main ── */}
      <div className="op">

        {/* Header */}
        <div className="op-header">
          <div>
            <p className="op-eye">FYNDE · Admin</p>
            <h1 className="op-h1">Orders.</h1>
          </div>
          <div className="op-hbtns">
            <button className="op-refresh" onClick={() => { fetchOrders(); setHasNew(false) }}>
              ↻ Refresh
            </button>
            <button className="op-logout" onClick={logout}>Sign Out →</button>
          </div>
        </div>

        {/* Search */}
        <div className="op-topbar">
          <div className="op-sw">
            <span className="op-si">⌕</span>
            <input
              className="op-search"
              type="text"
              placeholder="Search by name, email, phone, city or order number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Status filter */}
        <div className="op-fg">
          <span className="op-fl">Status</span>
          <div className="op-frow">
            {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as const).map(s => (
              <button key={s} className={`op-fb${sFilter === s ? ' on' : ''}`} onClick={() => setSFilter(s)}>
                {s === 'all' ? 'All Orders' : STATUS[s]?.label ?? s}
                <span className="op-fc">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment filter */}
        <div className="op-fg">
          <span className="op-fl">Payment</span>
          <div className="op-frow">
            {(['all', 'cod', 'instapay'] as const).map(m => (
              <button key={m} className={`op-fb${mFilter === m ? ' on' : ''}`} onClick={() => setMFilter(m)}>
                {m === 'all' ? 'All Methods' : m === 'cod' ? 'Cash on Delivery' : 'InstaPay'}
              </button>
            ))}
          </div>
        </div>

        <div className="op-div" />

        {loading ? (
          <div className="op-empty">
            <div className="op-ei">✦</div>
            <p className="op-et">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="op-empty">
            <div className="op-ei">◫</div>
            <p className="op-et">{search ? `No results for "${search}"` : 'No orders yet'}</p>
          </div>
        ) : (
          <>
            {/* Meta */}
            <div className="op-meta">
              <span className="op-count">
                {filtered.length} order{filtered.length !== 1 ? 's' : ''}
                {filtered.length !== orders.length ? ` · ${orders.length} total` : ''}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {hasNew && (
                  <button className="op-newbtn" onClick={() => { fetchOrders(); setHasNew(false) }}>
                    ● New orders — refresh
                  </button>
                )}
                {totalPages > 1 && (
                  <span className="op-count">Page {page} of {totalPages}</span>
                )}
              </div>
            </div>

            {/* Table */}
            <table className="op-tbl">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(order => {
                  const st = STATUS[order.status] ?? STATUS.pending
                  return (
                    <tr
                      key={order.id}
                      className={`op-row${selected?.id === order.id ? ' sel' : ''}`}
                      onClick={() => setSelected(order)}
                    >
                      <td><span className="c-num">{ordNum(order)}</span></td>
                      <td>
                        <div className="c-name">{order.name || '—'}</div>
                        <div className="c-sub">{order.city || '—'}</div>
                      </td>
                      <td>
                        <div className="c-date">{fmt(order.created_at)}</div>
                        <div className="c-sub">{fmtT(order.created_at)}</div>
                      </td>
                      <td>
                        <span className="c-total">EGP {Number(order.total).toLocaleString()}</span>
                      </td>
                      <td>
                        <span className={`c-tag${order.payment_method === 'instapay' ? ' ip' : ''}`}>
                          {order.payment_method === 'cod' ? 'COD' : 'InstaPay'}
                        </span>
                      </td>
                      <td>
                        <span className="c-badge" style={{ background: st.bg, color: st.color }}>
                          <span className="c-dot" style={{ background: st.dot }} />
                          {st.label}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {order.phone && (
                          <a
                            className="c-wa"
                            href={waLink(order.phone, ordNum(order), order.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            WA
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pag">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
                  if (n === page - 2 && page > 3) return <span key={n} className="pag-el">…</span>
                  if (n === page + 2 && page < totalPages - 2) return <span key={n} className="pag-el">…</span>
                  if (n !== 1 && n !== totalPages && Math.abs(n - page) > 1) return null
                  return (
                    <button key={n} className={`pag-btn${page === n ? ' cur' : ''}`} onClick={() => setPage(n)}>
                      {n}
                    </button>
                  )
                })}
                <button className="pag-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Side Panel ── */}
      {selected && (() => {
        const o = selected
        const st = STATUS[o.status] ?? STATUS.pending
        const isPendingInstapay = o.payment_method === 'instapay' && o.status === 'pending'
        const ref = ordNum(o)
        return (
          <>
            <div className="panel-bg" onClick={closePanel} />
            <div className="panel">

              {/* Panel header */}
              <div className="panel-head">
                <button className="panel-close" onClick={closePanel}>×</button>
                <p className="panel-eye">Order Details</p>
                <p className="panel-num">{ref}</p>
                <p className="panel-date">{fmt(o.created_at)} · {fmtT(o.created_at)}</p>
                <span className="c-badge" style={{ background: st.bg, color: st.color }}>
                  <span className="c-dot" style={{ background: st.dot }} />
                  {st.label}
                  {o.payment_method === 'instapay' && (
                    <span style={{ marginLeft: '6px', opacity: .7 }}>· InstaPay</span>
                  )}
                </span>
              </div>

              {/* Panel body */}
              <div className="panel-body">

                {/* Customer */}
                <div className="panel-sec">
                  <p className="panel-sec-lbl">Customer</p>
                  <div className="pf">
                    <span className="pf-lbl">Full Name</span>
                    <span className="pf-val">{o.name || '—'}</span>
                  </div>
                  <div className="pf">
                    <span className="pf-lbl">Phone</span>
                    <span className="pf-val">
                      {o.phone || '—'}
                      {o.phone && (
                        <>
                          <a className="p-wa" href={waLink(o.phone, ref, o.name)} target="_blank" rel="noopener noreferrer">
                            ✦ WhatsApp
                          </a>
                          <a className="p-call" href={`tel:${o.phone}`}>📞</a>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="pf">
                    <span className="pf-lbl">Email</span>
                    <span className="pf-val">
                      {o.customer_email || '—'}
                      {o.customer_email && (
                        <button className="p-copy" title="Copy email"
                          onClick={() => { copyText(o.customer_email); showToast('Email copied') }}>⎘</button>
                      )}
                    </span>
                  </div>
                  <div className="pf">
                    <span className="pf-lbl">Address</span>
                    <span className="pf-val">{o.address}{o.city ? ` · ${o.city}` : ''}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="panel-sec">
                  <p className="panel-sec-lbl">Items</p>
                  {Array.isArray(o.items) && o.items.map((item, i) => (
                    <div key={i} className="pi">
                      {item.product.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.product.name} className="pi-img" />
                        : <div className="pi-ph">✦</div>
                      }
                      <div className="pi-info">
                        <div className="pi-name">{item.product.name}</div>
                        <div className="pi-sz">Size · {item.size}</div>
                      </div>
                      <div className="pi-price">EGP {Number(item.product.price).toLocaleString()}</div>
                    </div>
                  ))}
                  <div className="pi-total">
                    <span className="pi-total-lbl">
                      Total · {o.payment_method === 'cod' ? 'Cash on Delivery' : 'InstaPay'}
                    </span>
                    <span className="pi-total-val">EGP {Number(o.total).toLocaleString()}</span>
                  </div>
                </div>

                {/* Bosta Shipping */}
                <div className="panel-sec">
                  <p className="panel-sec-lbl">Shipping — Bosta</p>
                  {o.tracking_number ? (
                    <div className="pf">
                      <span className="pf-lbl">Tracking Number</span>
                      <span className="pf-val">
                        {o.tracking_number}
                        <button className="p-copy" title="Copy tracking"
                          onClick={() => { copyText(o.tracking_number!); showToast('Tracking number copied') }}>⎘</button>
                      </span>
                    </div>
                  ) : (
                    <div className="bosta-wrap">
                      <p className="bosta-lbl">Bosta integration — coming soon</p>
                      <button className="bosta-soon" disabled>Create Shipment →</button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {o.notes && (
                  <div className="panel-sec">
                    <p className="panel-sec-lbl">Customer Notes</p>
                    <p style={{ fontFamily: '\'Instrument Mono\',monospace', fontSize: '13px', color: '#6A6864', lineHeight: '1.75', margin: 0, fontStyle: 'italic' }}>
                      &ldquo;{o.notes}&rdquo;
                    </p>
                  </div>
                )}

              </div>

              {/* Actions */}
              <div className="panel-acts">
                {isPendingInstapay && (
                  <button className="pa-confirm"
                    disabled={busy === o.id}
                    onClick={() => { setConfirmError(null); setModal({ orderId: o.id, type: 'confirm' }) }}>
                    {busy === o.id ? 'Confirming...' : 'Confirm InstaPay Payment ✦'}
                  </button>
                )}
                {o.status === 'confirmed' && (
                  <div className="pa-row">
                    <button className="pa-deliver" disabled={busy === o.id}
                      onClick={() => updateStatus(o.id, 'delivered')}>
                      Mark Delivered
                    </button>
                    <button className="pa-cancel-o" disabled={busy === o.id}
                      onClick={() => updateStatus(o.id, 'cancelled')}>
                      Cancel Order
                    </button>
                  </div>
                )}
                {o.status === 'delivered' && (
                  <button className="pa-cancel-o" style={{ width: '100%' }} disabled={busy === o.id}
                    onClick={() => updateStatus(o.id, 'cancelled')}>
                    Cancel Order
                  </button>
                )}
                <button className="pa-delete" disabled={busy === o.id}
                  onClick={() => setModal({ orderId: o.id, type: 'delete' })}>
                  Delete Order
                </button>
              </div>

            </div>
          </>
        )
      })()}

      {/* ── Confirm InstaPay Modal ── */}
      {modal?.type === 'confirm' && modalOrder && (
        <div className="mo" onClick={() => { setModal(null); setConfirmError(null) }}>
          <div className="mo-card" onClick={e => e.stopPropagation()}>
            <p className="mo-title">Confirm payment?</p>
            <p className="mo-sub">
              {ordNum(modalOrder)} · {modalOrder.name}<br />
              EGP {Number(modalOrder.total).toLocaleString()} · InstaPay
            </p>
            <p className="mo-warn">
              Only confirm after you have received and verified the payment.
              This marks all items as sold and emails the customer a confirmation.
            </p>
            {confirmError && <p className="mo-err">⚠ {confirmError}</p>}
            <div className="mo-acts">
              <button className="mo-cancel" onClick={() => { setModal(null); setConfirmError(null) }}>Cancel</button>
              <button className="mo-go" disabled={busy === modal.orderId}
                onClick={() => confirmInstapay(modal.orderId)}>
                {busy === modal.orderId ? 'Confirming...' : 'Confirm & Notify Customer →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {modal?.type === 'delete' && modalOrder && (
        <div className="mo" onClick={() => setModal(null)}>
          <div className="mo-card" onClick={e => e.stopPropagation()}>
            <p className="mo-title">Delete this order?</p>
            <p className="mo-sub">
              {ordNum(modalOrder)} · {modalOrder.name || modalOrder.customer_email}<br />
              EGP {Number(modalOrder.total).toLocaleString()} · {Array.isArray(modalOrder.items) ? modalOrder.items.length : 0} items
            </p>
            <p className="mo-warn">
              Permanently removes this order record. Products will NOT be automatically
              restored to available — do that manually if needed. This cannot be undone.
            </p>
            <div className="mo-acts">
              <button className="mo-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="mo-danger" disabled={busy === modal.orderId}
                onClick={() => deleteOrder(modal.orderId)}>
                {busy === modal.orderId ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Modal ── */}
      {modal?.type === 'status' && modalOrder && (
        <div className="mo" onClick={() => setModal(null)}>
          <div className="mo-card" onClick={e => e.stopPropagation()}>
            <p className="mo-title">Update status</p>
            <p className="mo-sub">{ordNum(modalOrder)} · {modalOrder.name}</p>
            <div className="mo-opts">
              {(modalOrder.status === 'confirmed'
                ? ['delivered', 'cancelled']
                : modalOrder.status === 'delivered'
                ? ['cancelled']
                : []
              ).map(opt => (
                <button key={opt} className="mo-opt" disabled={busy === modal.orderId}
                  onClick={() => updateStatus(modal.orderId, opt)}>
                  {STATUS[opt as keyof typeof STATUS]?.label ?? opt}
                </button>
              ))}
            </div>
            <div className="mo-acts">
              <button className="mo-cancel" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  )
}
