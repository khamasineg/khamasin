/**
 * GET  /api/admin/products  — all products, enriched with the order each sold item belongs to
 * PATCH /api/admin/products  — manually toggle sold (override; sync will correct on next order change)
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { syncProductsFromOrders } from '@/lib/sync-products'

function verifySession(req: NextRequest): boolean {
  const session = req.cookies.get('fynde-admin-session')?.value
  const expected = process.env.ADMIN_SESSION_SECRET
  return !!expected && session === expected
}

export async function GET(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Fetch all products
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (productsError) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }

  // 2. Fetch confirmed/delivered orders to show which order sold each product
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, status, name, items')
    .in('status', ['confirmed', 'delivered'])

  if (ordersError) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  // Build a map: productId → order info
  const soldInOrder: Record<string, { orderId: string; orderNumber: number | null; customerName: string; status: string }> = {}
  for (const order of orders ?? []) {
    const items = order.items as Array<{ product?: { id?: string } }> | null
    items?.forEach(item => {
      if (item?.product?.id && !soldInOrder[item.product.id]) {
        soldInOrder[item.product.id] = {
          orderId: order.id,
          orderNumber: order.order_number,
          customerName: order.name,
          status: order.status,
        }
      }
    })
  }

  // Attach order info to each product
  const enriched = (products ?? []).map(p => ({
    ...p,
    soldInOrder: soldInOrder[p.id] ?? null,
  }))

  return NextResponse.json({ products: enriched })
}

export async function PATCH(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { productId, sold } = await req.json()
    if (!productId || typeof sold !== 'boolean') {
      return NextResponse.json({ error: 'productId and sold (boolean) are required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('products')
      .update({ sold })
      .eq('id', productId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin product PATCH failed:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
