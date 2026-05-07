/**
 * POST /api/admin/sync
 * Manually re-runs the product availability sync.
 * Useful after bulk imports or direct Supabase edits.
 */
import { NextRequest, NextResponse } from 'next/server'
import { syncProductsFromOrders } from '@/lib/sync-products'

function verifySession(req: NextRequest): boolean {
  const session = req.cookies.get('fynde-admin-session')?.value
  const expected = process.env.ADMIN_SESSION_SECRET
  return !!expected && session === expected
}

export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncProductsFromOrders()

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, sold: result.sold, freed: result.freed })
}
