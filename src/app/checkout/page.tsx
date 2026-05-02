'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  })

  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'cod' | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const isFormValid = form.name && form.email && form.phone && form.address && form.city && paymentMethod

  const handleSubmit = async () => {
    if (!isFormValid) return
    setLoading(true)

    try {
      // Save order to Supabase via API
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          items,
          total: total(),
        }),
      })

      const data = await res.json()
      if (!data.success) throw new Error('Order failed')

      if (paymentMethod === 'instapay') {
        // Redirect to WhatsApp for InstaPay
        const orderLines = items
          .map(
            (item) =>
              `• ${item.product.name} — Size: ${item.size} — ${item.product.price.toLocaleString()} EGP`
          )
          .join('\n')

        const message =
          `Hello FYNDE! I'd like to place an order:\n\n` +
          `${orderLines}\n\n` +
          `Total: ${total().toLocaleString()} EGP\n\n` +
          `Name: ${form.name}\n` +
          `Phone: ${form.phone}\n` +
          `Address: ${form.address}, ${form.city}\n` +
          `${form.notes ? `Notes: ${form.notes}\n` : ''}` +
          `\nPayment: InstaPay — please share your InstaPay number so I can complete the transfer.\n\n` +
          `Please confirm availability. Thank you!`

        const encoded = encodeURIComponent(message)
        window.open(`https://wa.me/201050545699?text=${encoded}`, '_blank')
      }

      clearCart()
      router.push('/order-confirmed')
    } catch (error) {
      console.error(error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push('/shop')
    return null
  }

  return (
    <main className="min-h-screen bg-parchment px-6 pt-32 pb-24 md:px-16 md:pt-40">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-2">
            Almost there
          </p>
          <h1 className="font-display text-5xl md:text-7xl tracking-wider text-ink uppercase">
            Checkout
          </h1>
        </div>

        {/* Order Summary */}
        <div className="mb-10 border border-taupe-light p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-4">
            Order Summary
          </p>
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.size}`}
              className="flex justify-between py-3 border-b border-taupe-light last:border-0"
            >
              <div>
                <p className="font-serif text-sm text-ink">{item.product.name}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-taupe">
                  Size: {item.size}
                </p>
              </div>
              <p className="font-mono text-sm text-ink">
                {item.product.price.toLocaleString()} EGP
              </p>
            </div>
          ))}
          <div className="flex justify-between pt-4 mt-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">
              Total
            </span>
            <span className="font-mono text-base text-ink">
              {total().toLocaleString()} EGP
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-6">
            Your Details
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-taupe block mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ahmed Mohamed"
                className="w-full bg-transparent border border-taupe-light px-4 py-3 font-mono text-sm text-ink placeholder:text-taupe focus:border-ink outline-none transition-colors min-h-[44px]"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-taupe block mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ahmed@example.com"
                className="w-full bg-transparent border border-taupe-light px-4 py-3 font-mono text-sm text-ink placeholder:text-taupe focus:border-ink outline-none transition-colors min-h-[44px]"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-taupe block mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                className="w-full bg-transparent border border-taupe-light px-4 py-3 font-mono text-sm text-ink placeholder:text-taupe focus:border-ink outline-none transition-colors min-h-[44px]"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-taupe block mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Street Name, District"
                className="w-full bg-transparent border border-taupe-light px-4 py-3 font-mono text-sm text-ink placeholder:text-taupe focus:border-ink outline-none transition-colors min-h-[44px]"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-taupe block mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Cairo"
                className="w-full bg-transparent border border-taupe-light px-4 py-3 font-mono text-sm text-ink placeholder:text-taupe focus:border-ink outline-none transition-colors min-h-[44px]"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-taupe block mb-2">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any special instructions..."
                rows={3}
                className="w-full bg-transparent border border-taupe-light px-4 py-3 font-mono text-sm text-ink placeholder:text-taupe focus:border-ink outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-taupe mb-6">
            Payment Method
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => setPaymentMethod('instapay')}
              className={`flex flex-col items-center justify-center gap-2 p-6 border transition-colors min-h-[44px] ${
                paymentMethod === 'instapay'
                  ? 'border-ink bg-ink text-ivory'
                  : 'border-taupe-light text-ink hover:border-ink'
              }`}
            >
              <span className="font-display text-xl tracking-wider">InstaPay</span>
              <span className="font-mono text-[9px] uppercase tracking-widest opacity-60">
                Transfer online
              </span>
            </button>

            <button
              onClick={() => setPaymentMethod('cod')}
              className={`flex flex-col items-center justify-center gap-2 p-6 border transition-colors min-h-[44px] ${
                paymentMethod === 'cod'
                  ? 'border-ink bg-ink text-ivory'
                  : 'border-taupe-light text-ink hover:border-ink'
              }`}
            >
              <span className="font-display text-xl tracking-wider">Cash</span>
              <span className="font-mono text-[9px] uppercase tracking-widest opacity-60">
                Pay on delivery
              </span>
            </button>
          </div>

          {paymentMethod === 'instapay' && (
            <div className="border border-taupe-light p-4 bg-ivory">
              <p className="font-mono text-[9px] uppercase tracking-widest text-taupe mb-2">
                How InstaPay works
              </p>
              <p className="font-serif text-sm italic text-ink leading-relaxed">
                After confirming your order on WhatsApp, we will send you our InstaPay number.
                Transfer the total amount and send us a screenshot to confirm your payment.
              </p>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="border border-taupe-light p-4 bg-ivory">
              <p className="font-mono text-[9px] uppercase tracking-widest text-taupe mb-2">
                How Cash on Delivery works
              </p>
              <p className="font-serif text-sm italic text-ink leading-relaxed">
                After placing your order, you will receive a confirmation email with your order details.
                We will arrange delivery to your address and you pay the courier in cash.
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
          className={`w-full font-mono text-xs uppercase tracking-widest py-4 min-h-[44px] transition-colors ${
            isFormValid && !loading
              ? paymentMethod === 'instapay'
                ? 'bg-[#25D366] text-ivory hover:bg-[#1ebe5d]'
                : 'bg-ink text-ivory hover:bg-sienna'
              : 'bg-taupe-light text-taupe cursor-not-allowed'
          }`}
        >
          {loading
            ? 'Processing...'
            : paymentMethod === 'instapay'
            ? 'Continue to WhatsApp'
            : 'Place Order'}
        </button>

        <p className="font-mono text-[9px] uppercase tracking-widest text-taupe text-center mt-4">
          {paymentMethod === 'instapay'
            ? 'You will be redirected to WhatsApp to confirm your order'
            : 'A confirmation email will be sent to you shortly'}
        </p>

      </div>
    </main>
  )
}