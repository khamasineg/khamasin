// Matches supabase/migrations/0001_khamsin_schema.sql — CLAUDE.md §8.
// FYNDE's one-of-one model (era/brand/condition/sold/sizes[]) has no
// equivalent here: KHAMSIN is batch stock, one row per size in
// product_variants, and availability is `active` + per-variant stock,
// not a single sold boolean.

export type ProductVariant = {
  id: string
  product_id: string
  size: string
  sku: string
  stock_quantity: number
  created_at: string
}

export type ProductCategory =
  | 'trouser'
  | 'short'
  | 'wide-leg'
  | 'palazzo'
  | 'cargo'
  | 'pleated'

export type Product = {
  id: string
  name: string
  slug: string
  landform: string
  category: ProductCategory
  fabric: string | null
  price: number
  description: string | null
  story: string | null
  images: string[]
  collection: string | null
  active: boolean
  created_at: string
  // Present when the query joins it (`select('*, product_variants(*)')`) —
  // absent otherwise, so always guard with `product.product_variants?.`.
  product_variants?: ProductVariant[]
}

export type Order = {
  id: string
  customer_email: string
  items: OrderLineItem[]
  total: number
  payment_id: string | null
  status: string
  created_at: string
}

export type OrderLineItem = {
  product_id: string
  variant_id: string
  size: string
  qty: number
  price: number
}

export type CartItem = {
  product: Product
  variantId: string
  size: string
  quantity: number
}

export type Subscriber = {
  id: string
  email: string
  push_token?: string
  created_at: string
}
