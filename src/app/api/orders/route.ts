import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail } from '@/lib/resend'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  createOrderViewToken,
  isAllowedOrigin,
  isRateLimited,
  validateOrderPayload,
  verifyOrderViewToken,
} from '@/lib/order-security'

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? '',
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
  if (isRateLimited(`orders:${clientIp}`)) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429, headers: corsHeaders(origin) })
  }

  try {
    const rawBody = await req.json()
    const validation = validateOrderPayload(rawBody)
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400, headers: corsHeaders(origin) })
    }
    const { name, phone, email, address, city, notes, paymentMethod, items, total } = validation.data

    const productIds = Array.from(new Set(items.map((item) => item.product.id)))
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, sold')
      .in('id', productIds)

    if (productsError || !products || products.length !== productIds.length) {
      return NextResponse.json({ success: false, error: 'One or more products are unavailable' }, { status: 400, headers: corsHeaders(origin) })
    }

    const productById = new Map(products.map((product) => [product.id, product]))
    const hasSoldProduct = products.some((product) => product.sold)
    if (hasSoldProduct) {
      return NextResponse.json({ success: false, error: 'One or more products are already sold' }, { status: 409, headers: corsHeaders(origin) })
    }

    const recalculatedTotal = items.reduce((sum, item) => {
      const serverProduct = productById.get(item.product.id)
      if (!serverProduct) return sum
      return sum + serverProduct.price * item.quantity
    }, 0)

    if (recalculatedTotal !== total) {
      return NextResponse.json({ success: false, error: 'Order total mismatch' }, { status: 400, headers: corsHeaders(origin) })
    }

    // Save order to Supabase
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

    // Mark products as sold for COD orders
    if (paymentMethod === 'cod') {
      await supabaseAdmin
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
  
      if (!emailResult?.data?.id) {
        console.error('Failed to queue COD confirmation email for order:', order.id)
      }
    }

    const token = createOrderViewToken(order.id)
    return NextResponse.json({ success: true, order: { id: order.id }, token }, { headers: corsHeaders(origin) })
  } catch (error) {
    console.error('Order route failure:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500, headers: corsHeaders(origin) })
  }
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ success: false, error: 'Origin not allowed' }, { status: 403 })
  }

  const orderId = req.nextUrl.searchParams.get('id')?.trim() ?? ''
  const token = req.nextUrl.searchParams.get('token')?.trim() ?? ''
  if (!orderId || !token || !verifyOrderViewToken(orderId, token)) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401, headers: corsHeaders(origin) })
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, name, customer_email, items, total, payment_method, status, created_at')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404, headers: corsHeaders(origin) })
  }

  return NextResponse.json({ success: true, order }, { headers: corsHeaders(origin) })
}