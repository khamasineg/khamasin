import { NextRequest, NextResponse } from 'next/server'
import { sendAdminOrderNotification, sendOrderConfirmationEmail } from '@/lib/resend'
import { buildOrderNotificationMessage, sendTelegramNotification } from '@/lib/telegram'
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

    // Extract coupon code from raw body (optional, not part of core validation)
    const rawCouponCode = typeof rawBody === 'object' && rawBody !== null
      ? String((rawBody as Record<string, unknown>).couponCode ?? '').trim().toUpperCase()
      : ''

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

    const itemsSubtotal = items.reduce((sum, item) => {
      const serverProduct = productById.get(item.product.id)
      if (!serverProduct) return sum
      return sum + serverProduct.price * item.quantity
    }, 0)

    // Server-side coupon validation
    let appliedCouponCode: string | null = null
    let discountAmount = 0

    if (rawCouponCode) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', rawCouponCode)
        .single()

      const isValid =
        coupon &&
        coupon.active &&
        (!coupon.expires_at || new Date(coupon.expires_at) >= new Date()) &&
        (coupon.max_uses === null || coupon.usage_count < coupon.max_uses)

      if (isValid) {
        discountAmount = coupon.type === 'percentage'
          ? Math.round((itemsSubtotal * coupon.value) / 100)
          : Math.min(coupon.value, itemsSubtotal)
        appliedCouponCode = coupon.code
      }
    }

    const expectedTotal = itemsSubtotal - discountAmount
    if (expectedTotal !== total) {
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
        coupon_code: appliedCouponCode,
        discount_amount: discountAmount > 0 ? discountAmount : 0,
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Increment coupon usage_count (fire-and-forget; non-critical)
    if (appliedCouponCode) {
      supabaseAdmin
        .from('coupons')
        .select('usage_count')
        .eq('code', appliedCouponCode)
        .single()
        .then(({ data }) => {
          if (data) {
            supabaseAdmin
              .from('coupons')
              .update({ usage_count: (data.usage_count ?? 0) + 1 })
              .eq('code', appliedCouponCode!)
              .then(() => null)
          }
        })
    }

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
        orderNumber: order.order_number ?? undefined,
        items: items.map((item: { product: { name: string; price: number }; size: string }) => ({
          name: item.product.name,
          size: item.size,
          price: item.product.price,
        })),
        total,
        paymentMethod,
        address,
        city,
        couponCode: appliedCouponCode ?? undefined,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
      })

      if (!emailResult?.data?.id) {
        console.error('Failed to queue COD confirmation email for order:', order.id)
      }
    }

    // ── Admin notifications (fire-and-forget — never blocks user response) ──
    const orderRef = order.order_number ? `#${order.order_number}` : `#${order.id.slice(0, 8).toUpperCase()}`
    const notifItems = items.map((item: { product: { name: string; price: number }; size: string }) => ({
      name: item.product.name,
      size: item.size,
      price: item.product.price,
    }))

    // Email to admin Gmail
    sendAdminOrderNotification({
      orderRef,
      customerName: name,
      customerEmail: email,
      phone,
      address,
      city,
      paymentMethod,
      items: notifItems,
      total,
      couponCode: appliedCouponCode,
      discountAmount: discountAmount > 0 ? discountAmount : null,
      notes: notes || null,
    })

    // Telegram push (only fires if TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID are set)
    sendTelegramNotification(
      buildOrderNotificationMessage({
        orderRef,
        customerName: name,
        phone,
        city,
        paymentMethod,
        items: notifItems,
        total,
        couponCode: appliedCouponCode,
        discountAmount: discountAmount > 0 ? discountAmount : null,
      })
    )

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
    .select('id, order_number, name, customer_email, items, total, payment_method, status, created_at')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404, headers: corsHeaders(origin) })
  }

  return NextResponse.json({ success: true, order }, { headers: corsHeaders(origin) })
}