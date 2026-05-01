import { useCartStore } from '@/store/cart'

export function useCart() {
  const items = useCartStore((state) => state.items)
  const isOpen = useCartStore((state) => state.isOpen)
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const openCart = useCartStore((state) => state.openCart)
  const closeCart = useCartStore((state) => state.closeCart)
  const total = useCartStore((state) => state.total)

  return {
    items,
    isOpen,
    addItem,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    total,
    itemCount: items.length,
  }
}