/**
 * GET    /api/admin/products           — all products, enriched with which order sold each
 * POST   /api/admin/products           — create a new product
 * PATCH  /api/admin/products           — update product fields (or toggle sold)
 * DELETE /api/admin/products?id=<uuid> — permanently delete a product
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function verifySession(req: NextRequest): boolean {
  const session = req.cookies.get('fynde-admin-session')?.value
  const expected = process.env.ADMIN_SESSION_SECRET
  return !!expected && session === expected
}

/** Derive a URL slug from a product name */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: products, error: productsError }, { data: orders, error: ordersError }] =
    await Promise.all([
      supabaseAdmin.from('products').select('*').order('created_at', { ascending: false }),
      supabaseAdmin
        .from('orders')
        .select('id, order_number, status, name, items')
        .in('status', ['confirmed', 'delivered']),
    ])

  if (productsError) return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  if (ordersError)  return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })

  // Build productId → order map
  const soldInOrder: Record<string, {
    orderId: string; orderNumber: number | null; customerName: string; status: string
  }> = {}
  for (const order of orders ?? []) {
    const items = order.items as Array<{ product?: { id?: string } }> | null
    items?.forEach(item => {
      if (item?.product?.id && !soldInOrder[item.product.id]) {
        soldInOrder[item.product.id] = {
          orderId: order.id,
          orderNumber: order.order_number,
          customerName: order.name,
          status: order.status,
        }
      }
    })
  }

  const enriched = (products ?? []).map(p => ({ ...p, soldInOrder: soldInOrder[p.id] ?? null }))
  return NextResponse.json({ products: enriched })
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, brand, era, condition, price, sizes, images, story, collection } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'name and price are required' }, { status: 400 })
    }

    // Generate a unique slug
    const baseSlug = slugify(String(name))
    const timestamp = Date.now().toString(36)
    const slug = `${baseSlug}-${timestamp}`

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: String(name).trim(),
        slug,
        brand: brand ? String(brand).trim() : null,
        era: era ? String(era).trim() : null,
        condition: condition ? String(condition).trim() : null,
        price: Number(price),
        sizes: Array.isArray(sizes) ? sizes.filter(Boolean) : [],
        images: Array.isArray(images) ? images.filter((u: string) => u?.startsWith('http')) : [],
        story: story ? String(story).trim() : null,
        collection: collection ? String(collection).trim() : null,
        sold: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ product: data }, { status: 201 })
  } catch (err) {
    console.error('Admin product POST failed:', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

// ─── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { productId, ...rest } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    // Whitelist updatable fields
    const allowed: Record<string, unknown> = {}
    if (typeof rest.sold    === 'boolean') allowed.sold      = rest.sold
    if (rest.name     !== undefined)       allowed.name      = String(rest.name).trim()
    if (rest.brand    !== undefined)       allowed.brand     = rest.brand ? String(rest.brand).trim() : null
    if (rest.era      !== undefined)       allowed.era       = rest.era ? String(rest.era).trim() : null
    if (rest.condition !== undefined)      allowed.condition = rest.condition ? String(rest.condition).trim() : null
    if (rest.price    !== undefined)       allowed.price     = Number(rest.price)
    if (rest.story    !== undefined)       allowed.story     = rest.story ? String(rest.story).trim() : null
    if (rest.collection !== undefined)     allowed.collection = rest.collection ? String(rest.collection).trim() : null
    if (Array.isArray(rest.sizes))         allowed.sizes     = rest.sizes.filter(Boolean)
    if (Array.isArray(rest.images))        allowed.images    = rest.images.filter((u: string) => u?.startsWith('http'))
    if (rest.slug !== undefined)           allowed.slug      = String(rest.slug).trim()

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('products')
      .update(allowed)
      .eq('id', productId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin product PATCH failed:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  if (!verifySession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin product DELETE failed:', err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
