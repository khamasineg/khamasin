'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

// Order placement isn't wired to Supabase yet — the `orders` table has no
// public insert policy by design (CLAUDE.md §8: writes go through the
// service role key server-side), and no service role key is configured in
// this environment. Rather than fake a submission or fail silently, the
// review step is fully real and the final action honestly says so.
export default function CartPage() {
  const { items, total, setQuantity, removeItem } = useCart()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '' })

  const canSubmit = items.length > 0 && form.name && form.email && form.address

  return (
    <main className="px-6 md:px-12 pt-28 pb-24 md:pt-36">
      <div className="mb-10">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-sienna mb-3">Your Order</p>
        <h1 className="font-display italic text-ink" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)' }}>
          Review &amp; ship.
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <p className="font-display italic text-2xl text-ink">Your cart is empty.</p>
          <Link
            href="/shop"
            className="font-mono text-xs uppercase tracking-widest text-ivory bg-ink px-6 py-3 hover:bg-sienna transition-colors min-h-[44px] flex items-center"
          >
            Browse the Archive
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-12 max-w-5xl">
          {/* Items */}
          <div>
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4 py-5 border-b border-taupe-light">
                <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-taupe-light">
                  {item.product.images?.[0] && (
                    <img src={item.product.images[0]} alt={item.product.name} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-serif text-base text-ink">{item.product.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mt-1">Size {item.size}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-sm text-ink">{item.product.price.toLocaleString()} EGP</p>
                      <div className="flex items-center border border-taupe-light">
                        <button onClick={() => setQuantity(item.variantId, item.quantity - 1)} className="w-8 h-8 font-mono text-ink hover:text-sienna">−</button>
                        <span className="w-8 text-center font-mono text-xs">{item.quantity}</span>
                        <button onClick={() => setQuantity(item.variantId, item.quantity + 1)} className="w-8 h-8 font-mono text-ink hover:text-sienna">+</button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.variantId)} className="font-mono text-[10px] uppercase tracking-widest text-taupe hover:text-sienna min-h-[44px]">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-6">
              <span className="font-mono text-xs uppercase tracking-widest text-taupe">Total</span>
              <span className="font-mono text-xl text-ink">{total().toLocaleString()} EGP</span>
            </div>
          </div>

          {/* Shipping form */}
          <div className="bg-ivory p-6 border border-taupe-light h-fit">
            <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-4">Shipping Details</p>
            <div className="flex flex-col gap-3">
              {(['name', 'email', 'phone', 'address', 'city'] as const).map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="sr-only">{field}</label>
                  <input
                    id={field}
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    placeholder={field[0].toUpperCase() + field.slice(1)}
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full bg-transparent border border-taupe-light px-3 py-3 min-h-[44px] font-mono text-sm text-ink placeholder:text-taupe focus:outline-none focus:border-sienna transition-colors"
                  />
                </div>
              ))}
            </div>

            <button
              disabled={!canSubmit}
              title="Payment isn't connected yet — the last piece before launch"
              className="w-full mt-5 font-mono text-xs uppercase tracking-widest py-4 min-h-[44px] bg-taupe-light text-taupe cursor-not-allowed"
            >
              Place Order — Coming Soon
            </button>
            <p className="font-mono text-[9px] uppercase tracking-widest text-taupe mt-3 leading-relaxed">
              Payment isn&rsquo;t connected yet. This review step is real — placing the order is the
              last piece before launch.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
