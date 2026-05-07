/**
 * POST /api/validate-coupon
 * Public endpoint — validates a coupon code and returns the discount info.
 * Rate-limited to prevent brute-force enumeration of coupon codes.
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isRateLimited } from '@/lib/order-security'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (isRateLimited(`coupon:${ip}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { code, orderTotal } = await req.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' }, { status: 404 })
    }

    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: 'This coupon is no longer active' })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This coupon has expired' })
    }

    if (coupon.max_uses !== null && coupon.usage_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' })
    }

    // Calculate discount
    let discountAmount = 0
    const total = Number(orderTotal) || 0
    if (coupon.type === 'percentage') {
      discountAmount = Math.round((total * coupon.value) / 100)
    } else {
      // fixed
      discountAmount = Math.min(coupon.value, total)
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
    })
  } catch (err) {
    console.error('validate-coupon error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
