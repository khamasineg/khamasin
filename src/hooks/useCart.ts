import { useCartStore } from '@/store/cart'

export function useCart() {
  const items = useCartStore((state) => state.items)
  const isOpen = useCartStore((state) => state.isOpen)
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const openCart = useCartStore((state) => state.openCart)
  const closeCart = useCartStore((state) => state.closeCart)
  const total = useCartStore((state) => state.total)

  return {
    items,
    isOpen,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    openCart,
    closeCart,
    total,
    // Sum of quantities, not line-item count — a batch-stock cart can hold
    // more than one of a given size, unlike FYNDE's one-of-one pieces.
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}