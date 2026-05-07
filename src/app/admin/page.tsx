'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Stats = {
  revenue: { total: number; thisMonth: number; lastMonth: number }
  orders: { total: number; pending: number; confirmed: number; delivered: number; cancelled: number }
  products: { total: number; available: number; sold: number }
  coupons: { active: number; totalUses: number }
  recentOrders: Array<{
    id: string
    order_number: number | null
    name: string
    total: number
    status: string
    created_at: string
  }>
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#BEB0A0',
  confirmed: '#4ade80',
  delivered: '#A8401A',
  cancelled: '#6b7280',
}

function ordNum(o: { order_number: number | null; id: string }) {
  return o.order_number ? `#${o.order_number}` : `#${o.id.slice(0, 8).toUpperCase()}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: '#2A2521',
      border: '1px solid rgba(255,255,255,0.07)',
      padding: '1.5rem',
    }}>
      <p style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(190,176,160,0.5)', marginBottom: '0.75rem' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 'normal', color: '#FAF6F0', margin: '0 0 0.25rem' }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(190,176,160,0.45)', margin: 0 }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, productsRes, couponsRes] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/admin/products'),
          fetch('/api/admin/coupons'),
        ])

        if (ordersRes.status === 401) { router.push('/admin/login'); return }

        const [{ orders = [] }, { products = [] }, { coupons = [] }] = await Promise.all([
          ordersRes.json(),
          productsRes.json(),
          couponsRes.json(),
        ])

        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

        const finalized = orders.filter((o: { status: string }) => ['confirmed', 'delivered'].includes(o.status))
        const revenue = {
          total: finalized.reduce((s: number, o: { total: number }) => s + (o.total ?? 0), 0),
          thisMonth: finalized
            .filter((o: { created_at: string }) => new Date(o.created_at) >= thisMonthStart)
            .reduce((s: number, o: { total: number }) => s + (o.total ?? 0), 0),
          lastMonth: finalized
            .filter((o: { created_at: string }) => new Date(o.created_at) >= lastMonthStart && new Date(o.created_at) < thisMonthStart)
            .reduce((s: number, o: { total: number }) => s + (o.total ?? 0), 0),
        }

        const orderStats = {
          total: orders.length,
          pending: orders.filter((o: { status: string }) => o.status === 'pending').length,
          confirmed: orders.filter((o: { status: string }) => o.status === 'confirmed').length,
          delivered: orders.filter((o: { status: string }) => o.status === 'delivered').length,
          cancelled: orders.filter((o: { status: string }) => o.status === 'cancelled').length,
        }

        const productStats = {
          total: products.length,
          available: products.filter((p: { sold: boolean }) => !p.sold).length,
          sold: products.filter((p: { sold: boolean }) => p.sold).length,
        }

        const couponStats = {
          active: coupons.filter((c: { active: boolean }) => c.active).length,
          totalUses: coupons.reduce((s: number, c: { usage_count: number }) => s + (c.usage_count ?? 0), 0),
        }

        const recentOrders = [...orders]
          .sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 8)

        setStats({ revenue, orders: orderStats, products: productStats, coupons: couponStats, recentOrders })
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(190,176,160,0.5)' }}>
          Loading dashboard…
        </p>
      </div>
    )
  }

  if (!stats) return null

  const monthChange = stats.revenue.lastMonth > 0
    ? Math.round(((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100)
    : null

  return (
    <div style={{ padding: '2rem 2.5rem 4rem', maxWidth: '1100px' }}>

      {/* Page heading */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#A8401A', margin: '0 0 0.5rem' }}>
          ✦ Overview
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 'normal', fontStyle: 'italic', color: '#FAF6F0', margin: 0 }}>
          Dashboard
        </h1>
      </div>

      {/* Revenue stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '1px' }}>
        <StatCard
          label="Total Revenue"
          value={`${stats.revenue.total.toLocaleString()} EGP`}
          sub="All confirmed + delivered"
        />
        <StatCard
          label="This Month"
          value={`${stats.revenue.thisMonth.toLocaleString()} EGP`}
          sub={monthChange !== null
            ? monthChange >= 0
              ? `+${monthChange}% vs last month`
              : `${monthChange}% vs last month`
            : 'No previous month data'}
        />
        <StatCard
          label="Last Month"
          value={`${stats.revenue.lastMonth.toLocaleString()} EGP`}
        />
      </div>

      {/* Order stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '2.5rem', marginTop: '1px' }}>
        <StatCard label="Total Orders" value={stats.orders.total} />
        <StatCard label="Pending" value={stats.orders.pending} />
        <StatCard label="Confirmed" value={stats.orders.confirmed} />
        <StatCard label="Delivered" value={stats.orders.delivered} />
        <StatCard label="Cancelled" value={stats.orders.cancelled} />
      </div>

      {/* Products + Coupons row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Products summary */}
        <div style={{ background: '#2A2521', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(190,176,160,0.5)', margin: '0 0 0.5rem' }}>
                Products
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', color: '#FAF6F0', margin: 0 }}>
                {stats.products.total}
              </p>
            </div>
            <a href="/admin/products" style={{ fontFamily: "'Courier New', monospace", fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A8401A', textDecoration: 'none' }}>
              Manage →
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Available', value: stats.products.available, color: '#4ade80' },
              { label: 'Sold', value: stats.products.sold, color: '#A8401A' },
            ].map(row => (
              <div key={row.label} style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem' }}>
                <p style={{ fontFamily: "'Courier New', monospace", fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(190,176,160,0.45)', margin: '0 0 0.25rem' }}>{row.label}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: row.color, margin: 0 }}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coupons summary */}
        <div style={{ background: '#2A2521', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(190,176,160,0.5)', margin: '0 0 0.5rem' }}>
                Coupons
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', color: '#FAF6F0', margin: 0 }}>
                {stats.coupons.active} active
              </p>
            </div>
            <a href="/admin/coupons" style={{ fontFamily: "'Courier New', monospace", fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A8401A', textDecoration: 'none' }}>
              Manage →
            </a>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem' }}>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(190,176,160,0.45)', margin: '0 0 0.25rem' }}>
              Total redemptions
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', color: '#FAF6F0', margin: 0 }}>{stats.coupons.totalUses}</p>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={{ fontFamily: "'Courier New', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#A8401A', margin: 0 }}>
            &#8212; Recent Orders
          </p>
          <a href="/admin/orders" style={{ fontFamily: "'Courier New', monospace", fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(190,176,160,0.55)', textDecoration: 'none' }}>
            View all →
          </a>
        </div>

        <div style={{ border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                {['Order', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '8px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(190,176,160,0.45)',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontWeight: 'normal',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o, i) => (
                <tr
                  key={o.id}
                  onClick={() => router.push('/admin/orders')}
                  style={{
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,64,26,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)')}
                >
                  <td style={{ padding: '0.75rem 1rem', fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#FAF6F0', letterSpacing: '0.1em' }}>
                    {ordNum(o)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'Georgia, serif', fontSize: '13px', color: '#FAF6F0' }}>
                    {o.name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: "'Courier New', monospace", fontSize: '11px', color: '#FAF6F0' }}>
                    {o.total?.toLocaleString()} EGP
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '8px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: STATUS_COLOR[o.status] ?? '#BEB0A0',
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: "'Courier New', monospace", fontSize: '10px', color: 'rgba(190,176,160,0.55)' }}>
                    {fmtDate(o.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
