'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type OrderItem = {
  id: string
  name: string
  price: number
  size?: string
  image?: string
}

type Order = {
  id: string
  customer_email: string
  name: string
  phone: string
  address: string
  city: string
  notes: string
  items: OrderItem[]
  total: number
  payment_id: string
  payment_method: 'cod' | 'instapay'
  payment_confirmed: boolean
  payment_status: 'pending' | 'confirmed'
  order_status: 'new' | 'processing' | 'delivered' | 'cancelled'
  created_at: string
}

const ORDER_STATUSES  = ['new', 'processing', 'delivered', 'cancelled'] as const
const PAYMENT_STATUSES = ['pending', 'confirmed'] as const
const PAGE_SIZE = 15

const OS: Record<string, { bg: string; color: string; label: string; dot: string }> = {
  new:        { bg:'rgba(168,64,26,.15)',  color:'#C4521F', label:'New',        dot:'#C4521F' },
  processing: { bg:'rgba(240,233,223,.08)',color:'#F0E9DF', label:'Processing', dot:'#F0E9DF' },
  delivered:  { bg:'rgba(45,80,22,.25)',   color:'#6DBF4A', label:'Delivered',  dot:'#6DBF4A' },
  cancelled:  { bg:'rgba(138,129,120,.15)',color:'#8A8178', label:'Cancelled',  dot:'#8A8178' },
}
const PS: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg:'rgba(138,129,120,.12)', color:'#8A8178', label:'Pending'   },
  confirmed: { bg:'rgba(168,64,26,.2)',    color:'#C4521F', label:'Confirmed' },
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}
function fmtT(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
}
function copyText(t: string) {
  navigator.clipboard.writeText(t).catch(() => {})
}

export default function OrdersPage() {
  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [oFilter,  setOFilter]  = useState<'all' | Order['order_status']>('all')
  const [pFilter,  setPFilter]  = useState<'all' | Order['payment_status']>('all')
  const [mFilter,  setMFilter]  = useState<'all'|'cod'|'instapay'>('all')
  const [page,     setPage]     = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy,     setBusy]     = useState<string | null>(null)
  const [toast,    setToast]    = useState<{ msg: string; type: 'ok'|'err' } | null>(null)
  const [modal,    setModal]    = useState<{ orderId: string; type: 'order_status'|'payment_status'|'delete' } | null>(null)

  const showToast = useCallback((msg: string, type: 'ok'|'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (!error && data) setOrders(data as Order[])
    else if (error) showToast('Failed to load orders', 'err')
    setLoading(false)
  }, [showToast])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [search, oFilter, pFilter, mFilter])

  async function updateOrderStatus(orderId: string, value: string) {
    setBusy(orderId)
    const { error } = await supabase.from('orders').update({ order_status: value }).eq('id', orderId)
    if (error) { showToast('Update failed', 'err'); setBusy(null); return }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: value as Order['order_status'] } : o))
    showToast(`Order marked as ${value}`)
    setBusy(null)
    setModal(null)
  }

  async function updatePaymentStatus(orderId: string, value: string) {
    setBusy(orderId)
    const updates: Record<string, unknown> = { payment_status: value }
    if (value === 'confirmed') {
      updates.payment_confirmed = true
      const order = orders.find(o => o.id === orderId)
      if (order) {
        const ids = (order.items || []).map(i => i.id).filter(Boolean)
        if (ids.length) await supabase.from('products').update({ sold: true }).in('id', ids)
      }
    }
    const { error } = await supabase.from('orders').update(updates).eq('id', orderId)
    if (error) { showToast('Update failed', 'err'); setBusy(null); return }
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, payment_status: value as Order['payment_status'], payment_confirmed: value === 'confirmed' } : o
    ))
    showToast(`Payment marked as ${value}`)
    setBusy(null)
    setModal(null)
  }

  async function deleteOrder(orderId: string) {
    setBusy(orderId)
    const { error } = await supabase.from('orders').delete().eq('id', orderId)
    if (error) { showToast('Delete failed', 'err'); setBusy(null); return }
    setOrders(prev => prev.filter(o => o.id !== orderId))
    setModal(null)
    setExpanded(null)
    showToast('Order deleted')
    setBusy(null)
  }

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const q = search.toLowerCase().trim()
      const matchS = !q || [o.name, o.customer_email, o.phone, o.city, o.address, o.id.slice(0,8)]
        .some(f => f?.toLowerCase().includes(q))
      return matchS
        && (oFilter === 'all' || o.order_status   === oFilter)
        && (pFilter === 'all' || o.payment_status === pFilter)
        && (mFilter === 'all' || o.payment_method  === mFilter)
    })
  }, [orders, search, oFilter, pFilter, mFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const counts = useMemo(() => ({
    o: { all: orders.length, new: orders.filter(o=>o.order_status==='new').length, processing: orders.filter(o=>o.order_status==='processing').length, delivered: orders.filter(o=>o.order_status==='delivered').length, cancelled: orders.filter(o=>o.order_status==='cancelled').length },
    p: { all: orders.length, pending: orders.filter(o=>o.payment_status==='pending').length, confirmed: orders.filter(o=>o.payment_status==='confirmed').length },
  }), [orders])

  const modalOrder = modal ? orders.find(o => o.id === modal.orderId) : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Bebas+Neue&family=Instrument+Mono&display=swap');
        *{box-sizing:border-box;}

        /* ── Page ── */
        .op{padding:2.5rem 2rem;max-width:1300px;color:#F0E9DF;}
        .op-ey{font-family:'Instrument Mono',monospace;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#8A8178;margin:0 0 6px;}
        .op-h1{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:3rem;color:#F0E9DF;margin:0 0 .5rem;line-height:1;}

        /* ── Top bar ── */
        .op-topbar{display:flex;align-items:center;gap:12px;margin-bottom:1.75rem;flex-wrap:wrap;}
        .op-search-wrap{position:relative;flex:1;min-width:240px;}
        .op-search{width:100%;background:#1A1917;border:1px solid #3A3734;padding:13px 16px 13px 44px;font-family:'Instrument Mono',monospace;font-size:12px;color:#F0E9DF;outline:none;border-radius:0;transition:border-color .15s;letter-spacing:.04em;}
        .op-search:focus{border-color:#A8401A;}
        .op-search::placeholder{color:#8A8178;}
        .op-si{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#8A8178;font-size:16px;pointer-events:none;}
        .op-refresh{background:none;border:1px solid #3A3734;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#8A8178;font-size:16px;transition:all .15s;flex-shrink:0;}
        .op-refresh:hover{border-color:#F0E9DF;color:#F0E9DF;}

        /* ── Filters ── */
        .op-fg{margin-bottom:.875rem;}
        .op-fl{font-family:'Instrument Mono',monospace;font-size:8px;letter-spacing:.3em;text-transform:uppercase;color:#3A3734;display:block;margin-bottom:7px;}
        .op-frow{display:flex;flex-wrap:wrap;gap:5px;}
        .op-fb{background:none;border:1px solid #3A3734;padding:6px 13px;font-family:'Instrument Mono',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#8A8178;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px;border-radius:0;}
        .op-fb:hover{border-color:#F0E9DF;color:#F0E9DF;}
        .op-fb.on{background:#A8401A;border-color:#A8401A;color:#FAF6F0;}
        .op-fc{font-size:8px;padding:1px 5px;background:rgba(168,64,26,.2);color:#C4521F;border-radius:10px;}
        .op-fb.on .op-fc{background:rgba(255,255,255,.2);color:#FAF6F0;}

        /* ── Divider + meta ── */
        .op-div{width:100%;height:1px;background:#3A3734;margin:1.25rem 0 1rem;}
        .op-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:8px;}
        .op-count{font-family:'Instrument Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#8A8178;}

        /* ── Table ── */
        .op-tbl{width:100%;border-collapse:collapse;}
        .op-tbl th{font-family:'Instrument Mono',monospace;font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:#8A8178;text-align:left;padding:0 12px 12px;border-bottom:1px solid #3A3734;white-space:nowrap;}
        .op-tbl td{padding:15px 12px;border-bottom:1px solid #242220;vertical-align:top;}
        .op-row{cursor:pointer;transition:background .12s;}
        .op-row:hover{background:rgba(240,233,223,.03);}
        .op-row.on{background:rgba(168,64,26,.06);}

        /* Cell types */
        .c-id{font-family:'Instrument Mono',monospace;font-size:11px;letter-spacing:.1em;color:#A8401A;font-weight:600;}
        .c-name{font-family:'Instrument Mono',monospace;font-size:12px;color:#F0E9DF;margin-bottom:3px;}
        .c-sub{font-family:'Instrument Mono',monospace;font-size:10px;color:#8A8178;margin-top:2px;}
        .c-date{font-family:'Instrument Mono',monospace;font-size:11px;color:#F0E9DF;margin-bottom:2px;}
        .c-total{font-family:'Instrument Mono',monospace;font-size:13px;color:#F0E9DF;font-weight:600;white-space:nowrap;}
        .c-pcs{font-family:'Instrument Mono',monospace;font-size:11px;color:#F0E9DF;}
        .c-tag{font-family:'Instrument Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:4px 9px;border:1px solid #3A3734;color:#8A8178;white-space:nowrap;}
        .c-badge{font-family:'Instrument Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:5px 10px;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;cursor:pointer;border:none;outline:none;transition:opacity .15s;border-radius:0;}
        .c-badge:hover{opacity:.8;}
        .c-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

        /* Copy btn */
        .cp-btn{background:none;border:none;cursor:pointer;color:#8A8178;font-size:10px;padding:2px 4px;transition:color .15s;vertical-align:middle;margin-left:4px;}
        .cp-btn:hover{color:#F0E9DF;}

        /* ── Expand row ── */
        .exp-row td{padding:0;border-bottom:1px solid #3A3734;}
        .exp-inner{padding:1.5rem 2rem;background:#1A1917;border-top:1px solid #3A3734;display:grid;grid-template-columns:1fr 1fr;gap:2rem;}
        .exp-lbl{font-family:'Instrument Mono',monospace;font-size:8px;letter-spacing:.3em;text-transform:uppercase;color:#8A8178;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;}
        .exp-del-btn{background:none;border:1px solid rgba(200,50,50,.3);padding:4px 10px;font-family:'Instrument Mono',monospace;font-size:7px;letter-spacing:.18em;text-transform:uppercase;color:rgba(200,80,80,.7);cursor:pointer;transition:all .15s;border-radius:0;}
        .exp-del-btn:hover{border-color:rgb(200,60,60);color:rgb(220,80,80);}

        /* Items list */
        .it-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #242220;}
        .it-row:last-child{border-bottom:none;}
        .it-img{width:52px;height:66px;object-fit:cover;flex-shrink:0;background:#242220;}
        .it-ph{width:52px;height:66px;background:#242220;border:1px solid #3A3734;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#3A3734;font-size:14px;}
        .it-name{font-family:'Instrument Mono',monospace;font-size:11px;color:#F0E9DF;margin-bottom:3px;}
        .it-sz{font-family:'Instrument Mono',monospace;font-size:9px;color:#8A8178;letter-spacing:.12em;text-transform:uppercase;}
        .it-price{font-family:'Instrument Mono',monospace;font-size:12px;color:#F0E9DF;margin-left:auto;white-space:nowrap;flex-shrink:0;}

        /* Detail fields */
        .det-row{display:flex;flex-direction:column;gap:2px;padding:7px 0;border-bottom:1px solid #242220;}
        .det-row:last-child{border-bottom:none;}
        .det-lbl{font-family:'Instrument Mono',monospace;font-size:8px;letter-spacing:.22em;text-transform:uppercase;color:#8A8178;}
        .det-val{font-family:'Instrument Mono',monospace;font-size:11px;color:#F0E9DF;word-break:break-all;display:flex;align-items:center;gap:4px;}

        /* Order total row */
        .exp-total{grid-column:1/-1;display:flex;justify-content:flex-end;padding-top:1rem;border-top:1px solid #3A3734;margin-top:.5rem;}
        .exp-total-label{font-family:'Instrument Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#8A8178;margin-right:1.5rem;align-self:center;}
        .exp-total-val{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.6rem;color:#F0E9DF;font-weight:300;}

        /* ── Pagination ── */
        .pag{display:flex;align-items:center;gap:6px;margin-top:2rem;justify-content:center;flex-wrap:wrap;}
        .pag-btn{background:none;border:1px solid #3A3734;width:36px;height:36px;font-family:'Instrument Mono',monospace;font-size:10px;color:#8A8178;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;border-radius:0;}
        .pag-btn:hover:not(:disabled){border-color:#F0E9DF;color:#F0E9DF;}
        .pag-btn.cur{background:#A8401A;border-color:#A8401A;color:#FAF6F0;}
        .pag-btn:disabled{opacity:.3;cursor:not-allowed;}
        .pag-ellipsis{font-family:'Instrument Mono',monospace;font-size:10px;color:#8A8178;padding:0 4px;}

        /* ── Empty / loading ── */
        .op-empty{text-align:center;padding:5rem 2rem;}
        .op-ei{width:44px;height:44px;border:1px solid #3A3734;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;color:#A8401A;font-size:16px;}
        .op-et{font-family:'Instrument Mono',monospace;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#8A8178;}

        /* ── Toast ── */
        .toast{position:fixed;bottom:2rem;right:2rem;z-index:500;padding:12px 20px;font-family:'Instrument Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#FAF6F0;animation:tin .25s ease;border-left:3px solid;}
        .toast.ok{background:#1A1917;border-color:#A8401A;}
        .toast.err{background:#1A1917;border-color:rgb(180,50,50);}
        @keyframes tin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

        /* ── Modal ── */
        .mo{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:400;display:flex;align-items:center;justify-content:center;padding:1.5rem;}
        .mo-card{background:#1A1917;border:1px solid #3A3734;padding:2.5rem;max-width:440px;width:100%;}
        .mo-title{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:1.6rem;color:#F0E9DF;margin:0 0 4px;line-height:1.2;}
        .mo-sub{font-family:'Instrument Mono',monospace;font-size:10px;line-height:1.8;color:#8A8178;margin:0 0 1.5rem;letter-spacing:.06em;}
        .mo-warn{font-family:'Instrument Mono',monospace;font-size:9px;color:#C4521F;letter-spacing:.08em;line-height:1.7;margin-bottom:1.25rem;padding:10px 12px;border:1px solid rgba(168,64,26,.25);background:rgba(168,64,26,.07);}
        .mo-opts{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:1.5rem;}
        .mo-opt{background:none;border:1px solid #3A3734;padding:10px 18px;font-family:'Instrument Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8A8178;cursor:pointer;transition:all .15s;border-radius:0;}
        .mo-opt:hover{border-color:#F0E9DF;color:#F0E9DF;}
        .mo-opt.cur{border-color:#A8401A;color:#A8401A;background:rgba(168,64,26,.1);}
        .mo-opt:disabled{opacity:.4;cursor:not-allowed;}
        .mo-acts{display:flex;gap:10px;}
        .mo-cancel{flex:1;background:none;color:#8A8178;border:1px solid #3A3734;padding:13px;font-family:'Instrument Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;transition:all .15s;border-radius:0;}
        .mo-cancel:hover{border-color:#F0E9DF;color:#F0E9DF;}
        .mo-danger{flex:1;background:rgba(180,50,50,.15);color:rgb(220,80,80);border:1px solid rgba(180,50,50,.3);padding:13px;font-family:'Instrument Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;transition:all .15s;border-radius:0;}
        .mo-danger:hover{background:rgba(180,50,50,.25);}
        .mo-danger:disabled{opacity:.5;cursor:not-allowed;}

        /* Mobile */
        @media(max-width:768px){
          .op{padding:1.5rem 1rem;}
          .op-h1{font-size:2.2rem;}
          .op-tbl thead{display:none;}
          .op-tbl,.op-tbl tbody,.op-tbl tr,.op-tbl td{display:block;}
          .op-row{background:#1A1917;border:1px solid #3A3734;margin-bottom:10px;padding:1rem;}
          .op-row td{padding:4px 0;border:none;}
          .exp-row{display:none;}
          .exp-inner{grid-template-columns:1fr;}
          .exp-total{flex-direction:column;align-items:flex-end;gap:4px;}
        }
      `}</style>

      <div className="op">

        {/* Header */}
        <p className="op-ey">Admin Panel · Orders</p>
        <h1 className="op-h1">All Orders.</h1>

        {/* Search + refresh */}
        <div className="op-topbar">
          <div className="op-search-wrap">
            <span className="op-si">⌕</span>
            <input className="op-search" type="text" placeholder="Search by name, email, phone, city or order ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="op-refresh" onClick={fetchOrders} title="Refresh orders">↻</button>
        </div>

        {/* Filters */}
        <div className="op-fg">
          <span className="op-fl">Order Status</span>
          <div className="op-frow">
            {(['all', ...ORDER_STATUSES] as const).map(s => (
              <button key={s} className={`op-fb${oFilter === s ? ' on' : ''}`} onClick={() => setOFilter(s as typeof oFilter)}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="op-fc">{s === 'all' ? counts.o.all : counts.o[s as keyof typeof counts.o]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="op-fg">
          <span className="op-fl">Payment Status</span>
          <div className="op-frow">
            {(['all', ...PAYMENT_STATUSES] as const).map(s => (
              <button key={s} className={`op-fb${pFilter === s ? ' on' : ''}`} onClick={() => setPFilter(s as typeof pFilter)}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="op-fc">{s === 'all' ? counts.p.all : counts.p[s as keyof typeof counts.p]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="op-fg">
          <span className="op-fl">Payment Method</span>
          <div className="op-frow">
            {(['all', 'cod', 'instapay'] as const).map(m => (
              <button key={m} className={`op-fb${mFilter === m ? ' on' : ''}`} onClick={() => setMFilter(m)}>
                {m === 'all' ? 'All Methods' : m.toUpperCase()}
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
            <p className="op-et">{search ? `No orders matching "${search}"` : 'No orders found'}</p>
          </div>
        ) : (
          <>
            <div className="op-meta">
              <span className="op-count">
                {filtered.length} order{filtered.length !== 1 ? 's' : ''}
                {filtered.length !== orders.length ? ` · ${orders.length} total` : ''}
              </span>
              <span className="op-count">Page {page} of {totalPages}</span>
            </div>

            <table className="op-tbl">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Method</th>
                  <th>Order Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(order => {
                  const isExp = expanded === order.id
                  const os = OS[order.order_status] ?? OS.new
                  const ps = PS[order.payment_status] ?? PS.pending

                  return (
                    <>
                      <tr key={order.id} className={`op-row${isExp ? ' on' : ''}`}
                        onClick={() => setExpanded(isExp ? null : order.id)}>
                        <td><span className="c-id">#{order.id.slice(0,8).toUpperCase()}</span></td>
                        <td>
                          <div className="c-name">{order.name || '—'}</div>
                          <div className="c-sub">{order.customer_email}</div>
                          <div className="c-sub">{order.phone || '—'}</div>
                        </td>
                        <td>
                          <div className="c-date">{fmt(order.created_at)}</div>
                          <div className="c-sub">{fmtT(order.created_at)}</div>
                        </td>
                        <td><span className="c-pcs">{Array.isArray(order.items) ? order.items.length : 0} pc</span></td>
                        <td><span className="c-total">EGP {Number(order.total).toLocaleString()}</span></td>
                        <td><span className="c-tag">{order.payment_method?.toUpperCase() || '—'}</span></td>
                        <td onClick={e => e.stopPropagation()}>
                          <button className="c-badge" style={{ background: os.bg, color: os.color }}
                            onClick={() => setModal({ orderId: order.id, type: 'order_status' })}>
                            <span className="c-dot" style={{ background: os.dot }} />
                            {os.label} ↓
                          </button>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <button className="c-badge" style={{ background: ps.bg, color: ps.color }}
                            onClick={() => setModal({ orderId: order.id, type: 'payment_status' })}>
                            {ps.label} ↓
                          </button>
                        </td>
                      </tr>

                      {isExp && (
                        <tr key={`${order.id}-exp`} className="exp-row">
                          <td colSpan={8}>
                            <div className="exp-inner">

                              {/* Items */}
                              <div>
                                <p className="exp-lbl">Items in this order</p>
                                {Array.isArray(order.items) && order.items.map((item, i) => (
                                  <div key={i} className="it-row">
                                    {item.image
                                      ? <img src={item.image} alt={item.name} className="it-img" />
                                      : <div className="it-ph">✦</div>}
                                    <div style={{ flex:1 }}>
                                      <div className="it-name">{item.name}</div>
                                      {item.size && <div className="it-sz">Size: {item.size}</div>}
                                    </div>
                                    <div className="it-price">EGP {Number(item.price).toLocaleString()}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Customer info */}
                              <div>
                                <p className="exp-lbl" style={{ justifyContent:'space-between' }}>
                                  <span>Customer Details</span>
                                  <button className="exp-del-btn"
                                    onClick={() => setModal({ orderId: order.id, type: 'delete' })}>
                                    Delete Order
                                  </button>
                                </p>
                                {[
                                  { l:'Full Name',   v: order.name },
                                  { l:'Email',       v: order.customer_email },
                                  { l:'Phone',       v: order.phone },
                                  { l:'City',        v: order.city },
                                  { l:'Address',     v: order.address },
                                  { l:'Notes',       v: order.notes },
                                  { l:'Payment Ref', v: order.payment_id },
                                ].filter(d => d.v).map(d => (
                                  <div key={d.l} className="det-row">
                                    <span className="det-lbl">{d.l}</span>
                                    <span className="det-val">
                                      {d.v}
                                      {(d.l === 'Email' || d.l === 'Phone') && (
                                        <button className="cp-btn" title="Copy"
                                          onClick={() => { copyText(d.v!); showToast(`${d.l} copied`) }}>⎘</button>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Total */}
                              <div className="exp-total">
                                <span className="exp-total-label">Order Total</span>
                                <span className="exp-total-val">EGP {Number(order.total).toLocaleString()}</span>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pag">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
                  const show = n === 1 || n === totalPages || Math.abs(n - page) <= 1
                  const ellipsisBefore = n === page - 2 && page > 3
                  const ellipsisAfter  = n === page + 2 && page < totalPages - 2
                  if (ellipsisBefore || ellipsisAfter) return <span key={n} className="pag-ellipsis">…</span>
                  if (!show) return null
                  return (
                    <button key={n} className={`pag-btn${page === n ? ' cur' : ''}`} onClick={() => setPage(n)}>{n}</button>
                  )
                })}
                <button className="pag-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modal && modalOrder && (() => {
        if (modal.type === 'delete') return (
          <div className="mo" onClick={() => setModal(null)}>
            <div className="mo-card" onClick={e => e.stopPropagation()}>
              <p className="mo-title">Delete this order?</p>
              <p className="mo-sub">
                #{modalOrder.id.slice(0,8).toUpperCase()} · {modalOrder.name || modalOrder.customer_email}<br/>
                EGP {Number(modalOrder.total).toLocaleString()} · {Array.isArray(modalOrder.items) ? modalOrder.items.length : 0} items
              </p>
              <p className="mo-warn">This will permanently delete the order. Products will NOT be automatically restored to available. This cannot be undone.</p>
              <div className="mo-acts">
                <button className="mo-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="mo-danger" disabled={busy === modal.orderId}
                  onClick={() => deleteOrder(modal.orderId)}>
                  {busy === modal.orderId ? 'Deleting...' : 'Delete Order'}
                </button>
              </div>
            </div>
          </div>
        )

        const isOrder  = modal.type === 'order_status'
        const options  = isOrder ? ORDER_STATUSES : PAYMENT_STATUSES
        const current  = isOrder ? modalOrder.order_status : modalOrder.payment_status
        const styles   = isOrder ? OS : PS
        const willSell = !isOrder && current !== 'confirmed'

        return (
          <div className="mo" onClick={() => setModal(null)}>
            <div className="mo-card" onClick={e => e.stopPropagation()}>
              <p className="mo-title">{isOrder ? 'Update order status' : 'Update payment status'}</p>
              <p className="mo-sub">
                #{modalOrder.id.slice(0,8).toUpperCase()} · {modalOrder.name || modalOrder.customer_email}
              </p>
              {willSell && (
                <p className="mo-warn">Confirming payment will mark all items in this order as sold in your inventory.</p>
              )}
              <div className="mo-opts">
                {options.map(opt => (
                  <button key={opt} className={`mo-opt${current === opt ? ' cur' : ''}`}
                    disabled={busy === modal.orderId}
                    onClick={() => {
                      if (current === opt) { setModal(null); return }
                      isOrder ? updateOrderStatus(modal.orderId, opt) : updatePaymentStatus(modal.orderId, opt)
                    }}>
                    {styles[opt].label}{current === opt ? ' ✓' : ''}
                  </button>
                ))}
              </div>
              <div className="mo-acts">
                <button className="mo-cancel" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  )
}