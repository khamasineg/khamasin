import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendOrderConfirmationEmail } from '@/lib/resend'

function verifySession(req: NextRequest): boolean {
  const session = req.cookies.get('fynde-admin-session')?.value
  const expected = process.env.ADMIN_SESSION_SECRET
  return !!expected && session === expected
}

// POST — confirm an InstaPay order after verifying payment was received
// Checks product availability first (someone else may have paid COD for same item)
export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_method !== 'instapay') {
      return NextResponse.json({ error: 'Not an InstaPay order' }, { status: 400 })
    }

    if (order.status === 'confirmed') {
      return NextResponse.json({ error: 'Order already confirmed' }, { status: 409 })
    }

    // Get product IDs from order items
    const productIds: string[] = order.items.map(
      (item: { product: { id: string } }) => item.product.id
    )

    // Check if any products were sold in the meantime (e.g. COD order came in)
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, sold')
      .in('id', productIds)

    if (productsError || !products) throw new Error('Failed to fetch products')

    const soldProducts = products.filter((p) => p.sold)
    if (soldProducts.length > 0) {
      return NextResponse.json(
        {
          error: 'One or more items have already been sold to another customer',
          soldItems: soldProducts.map((p) => p.name),
        },
        { status: 409 }
      )
    }

    // Mark products as sold
    const { error: updateProductsError } = await supabaseAdmin
      .from('products')
      .update({ sold: true })
      .in('id', productIds)

    if (updateProductsError) throw updateProductsError

    // Confirm the order
    const { error: updateOrderError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'confirmed', payment_confirmed: true })
      .eq('id', orderId)

    if (updateOrderError) throw updateOrderError

    // Send customer confirmation email
    const emailResult = await sendOrderConfirmationEmail({
      customerEmail: order.customer_email,
      customerName: order.name,
      orderNumber: order.order_number ?? undefined,
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin confirm failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
