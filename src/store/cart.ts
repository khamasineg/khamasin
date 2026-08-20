import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CartItem, Product, ProductVariant } from '@/types'

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, variant: ProductVariant) => void
  removeItem: (variantId: string) => void
  setQuantity: (variantId: string, quantity: number) => void
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

      addItem: (product, variant) => {
        const existing = get().items.find((item) => item.variantId === variant.id)
        if (existing) {
          set((state) => ({
            items: state.items.map((item) =>
              item.variantId === variant.id
                ? { ...item, quantity: Math.min(item.quantity + 1, variant.stock_quantity) }
                : item
            ),
          }))
          return
        }
        set((state) => ({
          items: [...state.items, { product, variantId: variant.id, size: variant.size, quantity: 1 }],
        }))
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }))
      },

      setQuantity: (variantId, quantity) => {
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((item) => item.variantId !== variantId)
            : state.items.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    {
      name: 'khamsin-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
