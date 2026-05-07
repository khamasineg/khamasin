/**
 * GET    /api/admin/coupons  — list all coupons
 * POST   /api/admin/coupons  — create a new coupon
 * PATCH  /api/admin/coupons  — update a coupon (activate/deactivate/edit)
 * DELETE /api/admin/coupons?id=  — delete a coupon
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function verifySession(req: NextRequest): boolean {
  const session = req.cookies.get('fynde-admin-session')?.value
  const expected = process.env.ADMIN_SESSION_SECRET
  return !!expected && session === expected
}

export async function GET(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }

  return NextResponse.json({ coupons: data })
}

export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { code, type, value, max_uses, expires_at } = body

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: 'code, type, and value are required' }, { status: 400 })
    }
    if (!['percentage', 'fixed'].includes(type)) {
      return NextResponse.json({ error: 'type must be "percentage" or "fixed"' }, { status: 400 })
    }
    if (Number(value) <= 0) {
      return NextResponse.json({ error: 'value must be greater than 0' }, { status: 400 })
    }
    if (type === 'percentage' && Number(value) > 100) {
      return NextResponse.json({ error: 'percentage value cannot exceed 100' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert({
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        max_uses: max_uses ? Number(max_uses) : null,
        expires_at: expires_at || null,
        active: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ coupon: data }, { status: 201 })
  } catch (err) {
    console.error('Admin coupon POST failed:', err)
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Whitelist updatable fields
    const allowed: Record<string, unknown> = {}
    if (typeof updates.active === 'boolean') allowed.active = updates.active
    if (typeof updates.code === 'string') allowed.code = updates.code.trim().toUpperCase()
    if (updates.type !== undefined) allowed.type = updates.type
    if (updates.value !== undefined) allowed.value = Number(updates.value)
    if (updates.max_uses !== undefined) allowed.max_uses = updates.max_uses ? Number(updates.max_uses) : null
    if (updates.expires_at !== undefined) allowed.expires_at = updates.expires_at || null

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('coupons')
      .update(allowed)
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin coupon PATCH failed:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin coupon DELETE failed:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
