import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, size: string) => void
  removeItem: (productId: string, size: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size) => {
        const existing = get().items.find(
          (item) => item.product.id === product.id && item.size === size
        )
        if (existing) return // one-of-one pieces, no duplicates
        set((state) => ({
          items: [...state.items, { product, size, quantity: 1 }],
        }))
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size === size)
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),

      closeCart: () => set({ isOpen: false }),

      total: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'fynde-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items — isOpen always starts closed on fresh load
      partialize: (state) => ({ items: state.items }),
    }
  )
)
