'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Order = {
  id: string
  order_number: number | null
  name: string
  customer_email: string
  items: {
    product: {
      name: string
      era: string
      images: string[]
    }
    size: string
    quantity: number
  }[]
  total: number
  payment_method: string
  status: string
  created_at: string
}

function OrderConfirmedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const orderToken = searchParams.get('token')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false)
        return
      }

      if (!orderToken) {
        setLoading(false)
        return
      }

      const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}&token=${encodeURIComponent(orderToken)}`, {
        cache: 'no-store',
      })
      const result = await res.json()
      if (result?.success && result.order) {
        setOrder(result.order)
      }
      setLoading(false)
    }

    fetchOrder()
  }, [orderId, orderToken])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-taupe">
          Loading your order...
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">

      {/* Icon */}
      <div className="w-16 h-16 border border-taupe-light flex items-center justify-center mb-10">
        <span className="font-mono text-sienna text-xl">✦</span>
      </div>

      {/* Kicker */}
      <p className="font-mono text-[0.5rem] uppercase tracking-[0.32em] text-taupe mb-4 flex items-center gap-3">
        <span className="h-px w-6 bg-taupe-light inline-block" />
        Order received
        <span className="h-px w-6 bg-taupe-light inline-block" />
      </p>

      {/* Heading */}
      <h1
        className="font-serif font-light leading-[0.9] mb-6 text-center"
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
      >
        {order ? 'Thank you,' : 'Thank'}<br />
        <em className="italic text-sienna">
          {order ? `${order.name.split(' ')[0]}.` : 'You.'}
        </em>
      </h1>

      {/* Message */}
      <p
        className="font-mono text-[0.58rem] leading-loose tracking-wide max-w-sm mb-4 text-center"
        style={{ color: 'rgba(28,25,23,0.5)' }}
      >
        {order?.payment_method === 'cod'
          ? `Your order is confirmed. A confirmation email has been sent to ${order.customer_email}.`
          : 'Your order has been received. Check WhatsApp to complete your InstaPay payment.'}
      </p>

      {/* Order details */}
      {order && (
        <div className="w-full max-w-md mt-8 mb-10">

          {/* Order reference */}
          <div className="flex items-center justify-between mb-6">
            <p className="font-mono text-[0.45rem] uppercase tracking-[0.22em] text-taupe">
              Order Reference
            </p>
            <p className="font-mono text-[0.45rem] uppercase tracking-[0.15em] text-ink">
              {order.order_number ? `#${order.order_number}` : `#${order.id.slice(0, 8).toUpperCase()}`}
            </p>
          </div>

          {/* Items */}
          <div className="border border-taupe-light mb-4">
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 border-b border-taupe-light last:border-0"
              >
                {item.product.images?.[0] && (
                  <div
                    className="w-12 flex-shrink-0 overflow-hidden bg-taupe-light"
                    style={{ height: '60px' }}
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between">
                  <p className="font-serif text-sm text-ink leading-snug">
                    {item.product.name}
                  </p>
                  <p className="font-mono text-[0.4rem] uppercase tracking-[0.2em] text-taupe">
                    {item.product.era} · Size {item.size}
                  </p>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-ivory">
              <span className="font-mono text-[0.45rem] uppercase tracking-[0.22em] text-taupe">
                Total
              </span>
              <span className="font-mono text-sm text-ink">
                {order.total.toLocaleString()} EGP
              </span>
            </div>
          </div>

          {/* Payment */}
          <div className="flex items-center justify-between border-l-2 border-sienna pl-4 py-1 mb-3">
            <p className="font-mono text-[0.45rem] uppercase tracking-[0.22em] text-taupe">
              Payment
            </p>
            <p className="font-mono text-[0.45rem] uppercase tracking-[0.15em] text-ink">
              {order.payment_method === 'cod' ? 'Cash on Delivery' : 'InstaPay'}
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between border-l-2 border-taupe-light pl-4 py-1">
            <p className="font-mono text-[0.45rem] uppercase tracking-[0.22em] text-taupe">
              Status
            </p>
            <p
              className="font-mono text-[0.45rem] uppercase tracking-[0.15em]"
              style={{ color: order.status === 'confirmed' ? '#A8401A' : '#BEB0A0' }}
            >
              {order.status === 'confirmed' ? '✦ Confirmed' : 'Pending Payment'}
            </p>
          </div>

        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 mb-10 w-full max-w-md">
        <span className="h-px flex-1 bg-taupe-light" />
        <span className="font-display text-xl tracking-widest text-ink">FYNDE</span>
        <span className="h-px flex-1 bg-taupe-light" />
      </div>

      {/* CTAs */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
        <Link
          href="/shop"
          className="relative overflow-hidden flex-1 flex items-center justify-center bg-ink text-ivory font-mono text-[0.55rem] uppercase tracking-[0.22em] py-4 min-h-[44px] group"
        >
          <span
            className="absolute inset-0 bg-sienna -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
            style={{ transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)' }}
          />
          <span className="relative z-10">Continue Shopping</span>
        </Link>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center border border-taupe-light text-ink font-mono text-[0.55rem] uppercase tracking-[0.22em] py-4 min-h-[44px] hover:border-ink transition-colors"
        >
          Back to Home
        </Link>
      </div>

    </div>
  )
}

export default function OrderConfirmedPage() {
  return (
    <main className="min-h-screen bg-parchment flex flex-col">
      <div className="h-px bg-taupe-light" />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-taupe">
            Loading...
          </p>
        </div>
      }>
        <OrderConfirmedContent />
      </Suspense>
    </main>
  )
}