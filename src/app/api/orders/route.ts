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
const emailResult = await sendOrderConfirmationEmail({
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
  
  console.log('Email result:', JSON.stringify(emailResult, null, 2))
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order error:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}