/**
 * syncProductsFromOrders
 *
 * Single source of truth for product availability.
 * Rule: a product is "sold" if and only if it appears in at least
 * one order with status = 'confirmed' or 'delivered'.
 * Any other state (pending, cancelled, or no order) → available.
 *
 * Called automatically after every order status change.
 * Also exposed via POST /api/admin/sync for manual use.
 */
import { supabaseAdmin } from './supabase-admin'

export async function syncProductsFromOrders(): Promise<{
  sold: number
  freed: number
  error?: string
}> {
  try {
    // 1. Collect all product IDs that appear in finalized orders
    const { data: finalizedOrders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('items')
      .in('status', ['confirmed', 'delivered'])

    if (ordersError) throw ordersError

    const soldIds = new Set<string>()
    for (const order of finalizedOrders ?? []) {
      const items = order.items as Array<{ product?: { id?: string } }> | null
      items?.forEach(item => {
        if (item?.product?.id) soldIds.add(item.product.id)
      })
    }

    // 2. Fetch all products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, sold')

    if (productsError) throw productsError
    if (!products?.length) return { sold: 0, freed: 0 }

    // 3. Determine which products need to change
    const toSell = products.filter(p => soldIds.has(p.id) && !p.sold).map(p => p.id)
    const toFree = products.filter(p => !soldIds.has(p.id) && p.sold).map(p => p.id)

    // 4. Apply changes in parallel
    await Promise.all([
      toSell.length > 0
        ? supabaseAdmin.from('products').update({ sold: true }).in('id', toSell)
        : Promise.resolve(),
      toFree.length > 0
        ? supabaseAdmin.from('products').update({ sold: false }).in('id', toFree)
        : Promise.resolve(),
    ])

    return { sold: toSell.length, freed: toFree.length }
  } catch (err) {
    console.error('syncProductsFromOrders failed:', err)
    return { sold: 0, freed: 0, error: String(err) }
  }
}
