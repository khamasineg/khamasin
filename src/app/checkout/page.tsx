'use client'

import { useEffect, useState } from 'react'
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
const [errors, setErrors] = useState<Record<string, string>>({})
const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name) newErrors.name = 'Required'
    if (!form.email) newErrors.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.phone) newErrors.phone = 'Required'
    else if (!/^01[0-9]{9}$/.test(form.phone)) newErrors.phone = 'Enter a valid Egyptian number'
    if (!form.address) newErrors.address = 'Required'
    if (!form.city) newErrors.city = 'Required'
    if (!paymentMethod) newErrors.payment = 'Please select a payment method'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    try {
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
        const orderLines = items
          .map((item) => `• ${item.product.name} — Size: ${item.size} — ${item.product.price.toLocaleString()} EGP`)
          .join('\n')

        const message =
          `Hello FYNDE! I'd like to place an order:\n\n` +
          `${orderLines}\n\n` +
          `Total: ${total().toLocaleString()} EGP\n\n` +
          `Name: ${form.name}\n` +
          `Phone: ${form.phone}\n` +
          `Address: ${form.address}, ${form.city}\n` +
          `${form.notes ? `Notes: ${form.notes}\n` : ''}` +
          `\nPayment: InstaPay — please share your InstaPay number.\n\nThank you!`

        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
        if (!whatsappNumber) {
          throw new Error('WhatsApp contact is unavailable')
        }
        const encoded = encodeURIComponent(message)
        window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank')
      }

      setSubmitted(true)
clearCart()
router.push(`/order-confirmed?id=${data.order.id}&token=${encodeURIComponent(data.token)}`)
    } catch (error) {
      console.error('Checkout submission failed')
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (items.length === 0 && !submitted) {
      router.push('/shop')
    }
  }, [items.length, submitted, router])

  if (items.length === 0 && !submitted) return null

  return (
    <main className="min-h-screen bg-parchment">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24 md:px-10 md:pt-40">

        {/* Header */}
        <div className="mb-12 border-b border-taupe-light pb-8">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.32em] text-taupe mb-4 flex items-center gap-3">
            <span className="h-px w-6 bg-taupe-light inline-block" />
            Almost there
          </p>
          <h1
            className="font-serif font-light leading-[0.9]"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
          >
            Check<em className="italic text-sienna">out.</em>
          </h1>
        </div>

        {/* Order Summary */}
        <div className="mb-12">
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sienna mb-6 flex items-center gap-3">
            <span className="h-px w-6 bg-sienna inline-block" />
            Order Summary
          </p>
          <div className="border border-taupe-light">
            {items.map((item, i) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className="flex gap-4 p-4 border-b border-taupe-light last:border-0"
              >
                {/* Thumbnail */}
                <div className="w-14 h-18 flex-shrink-0 overflow-hidden bg-taupe-light" style={{ height: '72px' }}>
                  {item.product.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-serif text-sm text-ink leading-snug">{item.product.name}</p>
                    <p className="font-mono text-[0.45rem] uppercase tracking-[0.2em] text-taupe mt-1">
                      {item.product.era} · Size {item.size}
                    </p>
                  </div>
                  <p className="font-mono text-xs text-ink">
                    {item.product.price.toLocaleString()} EGP
                  </p>
                </div>
              </div>
            ))}
            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-ivory">
              <span className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-taupe">
                Total
              </span>
              <span className="font-mono text-base text-ink">
                {total().toLocaleString()} EGP
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mb-12">
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sienna mb-6 flex items-center gap-3">
            <span className="h-px w-6 bg-sienna inline-block" />
            Your Details
          </p>

          <div className="flex flex-col gap-5">
            {[
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Ahmed Mohamed' },
              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'ahmed@example.com' },
              { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '01XXXXXXXXX' },
              { name: 'address', label: 'Address', type: 'text', placeholder: '123 Street Name, District' },
              { name: 'city', label: 'City', type: 'text', placeholder: 'Cairo' },
            ].map((field) => (
              <div key={field.name}>
                <label className="font-mono text-[0.45rem] uppercase tracking-[0.22em] text-taupe block mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full bg-transparent px-4 py-3 font-mono text-sm text-ink placeholder:text-taupe outline-none transition-colors min-h-[44px]"
                  style={{
                    border: errors[field.name] ? '1px solid #A8401A' : '1px solid #D9CFC4',
                  }}
                  onFocus={(e) => {
                    if (!errors[field.name]) e.target.style.borderColor = '#1C1917'
                  }}
                  onBlur={(e) => {
                    if (!errors[field.name]) e.target.style.borderColor = '#D9CFC4'
                  }}
                />
                {errors[field.name] && (
                  <p className="font-mono text-[0.45rem] uppercase tracking-[0.15em] text-sienna mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="font-mono text-[0.45rem] uppercase tracking-[0.22em] text-taupe block mb-2">
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
        <div className="mb-12">
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sienna mb-6 flex items-center gap-3">
            <span className="h-px w-6 bg-sienna inline-block" />
            Payment Method
          </p>

          <div className="grid grid-cols-2 gap-0 border border-taupe-light mb-4">
            {[
              { id: 'instapay', title: 'InstaPay', sub: 'Transfer online' },
              { id: 'cod', title: 'Cash', sub: 'Pay on delivery' },
            ].map((method, i) => (
              <button
                key={method.id}
                onClick={() => {
                  setPaymentMethod(method.id as 'instapay' | 'cod')
                  setErrors({ ...errors, payment: '' })
                }}
                className="flex flex-col items-center justify-center gap-2 p-6 min-h-[80px] transition-colors duration-200 relative"
                style={{
                  background: paymentMethod === method.id ? '#1C1917' : 'transparent',
                  borderRight: i === 0 ? '1px solid #D9CFC4' : 'none',
                  color: paymentMethod === method.id ? '#FAF6F0' : '#1C1917',
                }}
              >
                <span className="font-serif italic text-lg">{method.title}</span>
                <span className="font-mono text-[0.45rem] uppercase tracking-[0.2em] opacity-60">
                  {method.sub}
                </span>
                {paymentMethod === method.id && (
                  <span className="absolute top-2 right-2 font-mono text-[0.4rem] text-sienna">✦</span>
                )}
              </button>
            ))}
          </div>

          {errors.payment && (
            <p className="font-mono text-[0.45rem] uppercase tracking-[0.15em] text-sienna mb-4">
              {errors.payment}
            </p>
          )}

          {paymentMethod === 'instapay' && (
            <div className="border-l-2 border-sienna pl-4 py-2">
              <p className="font-mono text-[0.45rem] uppercase tracking-[0.22em] text-taupe mb-2">
                How InstaPay works
              </p>
              <p className="font-serif text-sm italic text-ink leading-relaxed">
                After confirming on WhatsApp, we will send you our InstaPay number. Transfer the total and send a screenshot to confirm.
              </p>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="border-l-2 border-sienna pl-4 py-2">
              <p className="font-mono text-[0.45rem] uppercase tracking-[0.22em] text-taupe mb-2">
                How Cash on Delivery works
              </p>
              <p className="font-serif text-sm italic text-ink leading-relaxed">
                You will receive a confirmation email after placing your order. We arrange delivery and you pay the courier in cash.
              </p>
            </div>
          )}
        </div>

       {/* Submit */}
<div className="relative overflow-hidden">
  <button
    onClick={handleSubmit}
    disabled={loading}
    className="relative w-full overflow-hidden font-mono text-[0.58rem] uppercase tracking-[0.22em] py-4 min-h-[44px] group transition-colors duration-300"
    style={{
      background: loading ? '#BEB0A0' : '#1C1917',
      color: '#FAF6F0',
      cursor: loading ? 'not-allowed' : 'pointer',
    }}
  >
    {!loading && (
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
        style={{
          background: '#A8401A',
          transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
        }}
      />
    )}
    <span className="relative z-10">
      {loading
        ? 'Processing...'
        : paymentMethod === 'instapay'
        ? 'Continue to WhatsApp →'
        : paymentMethod === 'cod'
        ? 'Place Order →'
        : 'Select Payment & Continue →'}
    </span>
  </button>
</div>

{/* Errors below button */}
{errors.submit && (
  <p className="font-mono text-[0.45rem] uppercase tracking-[0.15em] text-sienna mt-3 text-center">
    {errors.submit}
  </p>
)}

<p
  className="font-mono text-[0.45rem] uppercase tracking-[0.15em] text-center mt-4"
  style={{ color: 'rgba(28,25,23,0.4)' }}
>
  {paymentMethod === 'instapay'
    ? 'You will be redirected to WhatsApp to confirm your order'
    : paymentMethod === 'cod'
    ? 'A confirmation email will be sent to you shortly'
    : 'Your order is safe and secure'}
</p>
    

      </div>
    </main>
  )
}