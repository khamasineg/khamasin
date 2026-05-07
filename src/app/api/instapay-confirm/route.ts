import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/resend'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/instapay-confirm
//
// Admin-only endpoint. Called from the admin panel when you have verified that
// the customer's InstaPay payment has been received.
//
// What it does:
//   1. Verifies the request is from the admin (x-admin-key header)
//   2. Fetches the pending InstaPay order by ID
//   3. Checks that ALL products in the order are still unsold
//      (a COD customer may have bought the same item while waiting for payment)
//   4. Marks products as sold
//   5. Updates order status to 'confirmed'
//   6. Sends the customer their order confirmation email
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Admin authentication
  const adminKey = req.headers.get('x-admin-key')
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 })
    }

    // 2. Fetch the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // 3. Guard: must be a pending instapay order
    if (order.payment_method !== 'instapay') {
      return NextResponse.json(
        { success: false, error: 'This order is not an InstaPay order' },
        { status: 400 }
      )
    }

    if (order.status === 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'This order is already confirmed' },
        { status: 409 }
      )
    }

    // 4. Check product availability — someone else may have bought via COD
    const productIds: string[] = order.items.map(
      (item: { product: { id: string } }) => item.product.id
    )

    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, sold')
      .in('id', productIds)

    if (productsError || !products) {
      throw new Error('Failed to fetch products for availability check')
    }

    const soldProducts = products.filter((p) => p.sold)
    if (soldProducts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'One or more items in this order have already been sold to another customer',
          soldItems: soldProducts.map((p) => p.name),
        },
        { status: 409 }
      )
    }

    // 5. Mark products as sold
    const { error: updateProductsError } = await supabaseAdmin
      .from('products')
      .update({ sold: true })
      .in('id', productIds)

    if (updateProductsError) throw updateProductsError

    // 6. Confirm the order
    const { error: updateOrderError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'confirmed', payment_confirmed: true })
      .eq('id', orderId)

    if (updateOrderError) throw updateOrderError

    // 7. Send customer confirmation email
    const emailResult = await sendOrderConfirmationEmail({
      customerEmail: order.customer_email,
      customerName: order.name,
      items: order.items.map(
        (item: { product: { name: string; price: number; images?: string[] }; size: string }) => ({
          name: item.product.name,
          size: item.size,
          price: item.product.price,
          image: item.product.images?.[0],
        })
      ),
      total: order.total,
      paymentMethod: 'instapay',
      address: order.address,
      city: order.city,
    })

    if (!emailResult?.data?.id) {
      console.error('Failed to send InstaPay confirmation email for order:', orderId)
    }

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('InstaPay confirm route failure:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
