import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendOrderConfirmationEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      phone,
      email,
      address,
      city,
      notes,
      paymentMethod,
      items,
      total,
    } = body

    // Save order to Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: email,
        name,
        phone,
        address,
        city,
        notes,
        payment_method: paymentMethod,
        payment_confirmed: paymentMethod === 'cod' ? true : false,
        items,
        total,
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Mark products as sold for COD orders
    if (paymentMethod === 'cod') {
      const productIds = items.map((item: { product: { id: string } }) => item.product.id)
      await supabase
        .from('products')
        .update({ sold: true })
        .in('id', productIds)

      // Send confirmation email for COD
      await sendOrderConfirmationEmail({
        customerEmail: email,
        customerName: name,
        items: items.map((item: { product: { name: string; price: number }; size: string }) => ({
          name: item.product.name,
          size: item.size,
          price: item.product.price,
        })),
        total,
        paymentMethod,
        address,
        city,
      })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order error:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}