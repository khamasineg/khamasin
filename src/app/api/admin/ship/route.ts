/**
 * POST /api/admin/ship
 *
 * Creates a Bosta shipment for a confirmed order.
 * Requires BOSTA_API_KEY environment variable to be set.
 * Until then, returns 503 "Bosta not configured".
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { buildBostaPayload, createBostaShipment, isBostaConfigured } from '@/lib/bosta'

function verifySession(req: NextRequest): boolean {
  const session = req.cookies.get('fynde-admin-session')?.value
  const expected = process.env.ADMIN_SESSION_SECRET
  return !!expected && session === expected
}

export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isBostaConfigured()) {
    return NextResponse.json(
      { error: 'Bosta is not configured. Add BOSTA_API_KEY to your environment variables.' },
      { status: 503 }
    )
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

    if (order.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Order must be confirmed before creating a shipment' },
        { status: 400 }
      )
    }

    if (order.bosta_shipment_id) {
      return NextResponse.json(
        { error: 'Shipment already created', trackingNumber: order.tracking_number },
        { status: 409 }
      )
    }

    // Create Bosta shipment
    const payload = buildBostaPayload(order)
    const result = await createBostaShipment(payload)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Save tracking info to order
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        tracking_number: result.trackingNumber,
        bosta_shipment_id: result.shipmentId,
        shipped_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      trackingNumber: result.trackingNumber,
      shipmentId: result.shipmentId,
    })
  } catch (error) {
    console.error('Admin ship route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
