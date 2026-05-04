import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '@/lib/resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Supabase sends the new record in body.record
    const record = body.record

    // Only trigger if payment_confirmed just became true
    if (!record || record.payment_confirmed !== true) {
      return NextResponse.json({ skipped: true })
    }

    // Only trigger for instapay orders
    if (record.payment_method !== 'instapay') {
      return NextResponse.json({ skipped: true })
    }

    // Get full order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', record.id)
      .single()

    if (error || !order) throw new Error('Order not found')

    // Mark products as sold
    const productIds = order.items.map(
      (item: { product: { id: string } }) => item.product.id
    )
    await supabase
      .from('products')
      .update({ sold: true })
      .in('id', productIds)

    // Send confirmation email
    await sendOrderConfirmationEmail({
      customerEmail: order.customer_email,
      customerName: order.name,
      items: order.items.map((item: { product: { name: string; price: number }; size: string }) => ({
        name: item.product.name,
        size: item.size,
        price: item.product.price,
      })),
      total: order.total,
      paymentMethod: order.payment_method,
      address: order.address,
      city: order.city,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('InstaPay confirm error:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}