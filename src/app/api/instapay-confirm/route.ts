import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/resend'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  createOrderViewToken,
  isAllowedOrigin,
  isRateLimited,
  validateOrderPayload,
} from '@/lib/order-security'

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': origin ?? '*',
    Vary: 'Origin',
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (!isAllowedOrigin(origin)) {
    return new NextResponse(null, { status: 403 })
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ success: false, error: 'Origin not allowed' }, { status: 403 })
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(`instapay:${clientIp}`)) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429, headers: corsHeaders(origin) })
  }

  try {
    const rawBody = await req.json()
    const validation = validateOrderPayload(rawBody)
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400, headers: corsHeaders(origin) })
    }
    const { name, phone, email, address, city, notes, paymentMethod, items, total } = validation.data

    const { data: order, error: orderError } = await supabaseAdmin
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

    if (paymentMethod === 'cod') {
      const productIds = items.map((item: { product: { id: string } }) => item.product.id)
      await supabaseAdmin
        .from('products')
        .update({ sold: true })
        .in('id', productIds)

      const emailResult = await sendOrderConfirmationEmail({
        customerEmail: email,
        customerName: name,
        items: items.map((item: { product: { name: string; price: number; images?: string[] }; size: string }) => ({
          name: item.product.name,
          size: item.size,
          price: item.product.price,
          image: item.product.images?.[0] || undefined,
        })),
        total,
        paymentMethod,
        address,
        city,
      })

      if (!emailResult?.data?.id) {
        console.error('Failed to queue COD confirmation email')
      }
    }

    const token = createOrderViewToken(order.id)
    return NextResponse.json(
      { success: true, order: { id: order.id }, token, whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '' },
      { headers: corsHeaders(origin) }
    )
  } catch (error) {
    console.error('InstaPay route failure')
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500, headers: corsHeaders(origin) })
  }
}