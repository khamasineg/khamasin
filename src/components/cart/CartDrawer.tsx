'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import CartItem from './CartItem'

export default function CartDrawer() {
  const { items, isOpen, closeCart, total, itemCount } = useCart()
  const router = useRouter()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCheckout = () => {
    closeCart()
    router.push('/cart')
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-[100] backdrop-blur-sm" onClick={closeCart} />

      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-parchment md:bottom-auto md:top-0 md:left-auto md:right-0 md:w-[420px] md:h-full flex flex-col max-h-[90vh] md:max-h-full">
        <div className="flex items-center justify-between px-6 py-5 border-b border-taupe-light">
          <div>
            <h2 className="font-display text-2xl tracking-wider text-ink uppercase">Cart</h2>
            <p className="font-mono text-[9px] uppercase tracking-widest text-taupe">
              {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="font-mono text-[10px] uppercase tracking-widest text-ink hover:text-sienna transition-colors min-h-[44px] min-w-[44px] flex items-center justify-end"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
              <p className="font-mono text-xs uppercase tracking-widest text-taupe">Your cart is empty</p>
              <p className="font-serif text-sm italic text-taupe">Cut for the wind — find your pair</p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={item.variantId} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-6 border-t border-taupe-light">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-taupe">Total</span>
              <span className="font-mono text-base text-ink">{total().toLocaleString()} EGP</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-ink text-ivory font-mono text-xs uppercase tracking-widest py-4 min-h-[44px] hover:bg-sienna transition-colors mb-3"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={closeCart}
              className="w-full border border-taupe-light text-ink font-mono text-xs uppercase tracking-widest py-4 min-h-[44px] hover:border-ink transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
