import crypto from 'crypto'

type OrderItemInput = {
  product: {
    id: string
    name: string
    price: number
    images?: string[]
  }
  size: string
  quantity: number
}

type OrderPayload = {
  name: string
  phone: string
  email: string
  address: string
  city: string
  notes: string
  paymentMethod: 'instapay' | 'cod'
  items: OrderItemInput[]
  total: number
}

const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 6
const requestWindowByKey = new Map<string, number[]>()

function sanitizeText(value: unknown, max = 200): string {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, ' ').slice(0, max)
}

export function validateOrderPayload(raw: unknown): { valid: true; data: OrderPayload } | { valid: false; error: string } {
  if (!raw || typeof raw !== 'object') return { valid: false, error: 'Invalid payload' }
  const body = raw as Record<string, unknown>
  const name = sanitizeText(body.name, 80)
  const phone = sanitizeText(body.phone, 20)
  const email = sanitizeText(body.email, 120).toLowerCase()
  const address = sanitizeText(body.address, 200)
  const city = sanitizeText(body.city, 80)
  const notes = sanitizeText(body.notes ?? '', 500)
  const paymentMethod = body.paymentMethod
  const total = Number(body.total)
  const items = Array.isArray(body.items) ? body.items : []

  if (!name || !phone || !email || !address || !city) return { valid: false, error: 'Missing required fields' }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { valid: false, error: 'Invalid email address' }
  if (!/^01[0-9]{9}$/.test(phone)) return { valid: false, error: 'Invalid Egyptian phone number' }
  if (paymentMethod !== 'instapay' && paymentMethod !== 'cod') return { valid: false, error: 'Invalid payment method' }
  if (!Number.isFinite(total) || total <= 0) return { valid: false, error: 'Invalid total' }
  if (!items.length || items.length > 25) return { valid: false, error: 'Invalid cart items' }

  const normalizedItems: OrderItemInput[] = []
  for (const item of items) {
    if (!item || typeof item !== 'object') return { valid: false, error: 'Invalid item entry' }
    const candidate = item as Record<string, unknown>
    const product = candidate.product as Record<string, unknown> | undefined
    const productId = sanitizeText(product?.id, 64)
    const productName = sanitizeText(product?.name, 150)
    const productPrice = Number(product?.price)
    const size = sanitizeText(candidate.size, 20)
    const quantity = Number(candidate.quantity)
    const image = Array.isArray(product?.images) && typeof product.images[0] === 'string' ? product.images[0] : undefined

    if (!productId || !productName || !size) return { valid: false, error: 'Invalid product details' }
    if (!Number.isFinite(productPrice) || productPrice <= 0) return { valid: false, error: 'Invalid product price' }
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 5) return { valid: false, error: 'Invalid quantity' }

    normalizedItems.push({
      product: { id: productId, name: productName, price: productPrice, images: image ? [image] : [] },
      size,
      quantity,
    })
  }

  return {
    valid: true,
    data: { name, phone, email, address, city, notes, paymentMethod, items: normalizedItems, total },
  }
}

function getTokenSecret(): string {
  const secret = process.env.ORDER_VIEW_TOKEN_SECRET
  if (!secret) {
    throw new Error('ORDER_VIEW_TOKEN_SECRET is not configured')
  }
  return secret
}

export function createOrderViewToken(orderId: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24
  const payload = `${orderId}.${exp}`
  const signature = crypto.createHmac('sha256', getTokenSecret()).update(payload).digest('hex')
  return `${payload}.${signature}`
}

export function verifyOrderViewToken(orderId: string, token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [tokenOrderId, exp, signature] = parts
  if (tokenOrderId !== orderId) return false
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false
  const expected = crypto.createHmac('sha256', getTokenSecret()).update(`${tokenOrderId}.${exp}`).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  const requests = (requestWindowByKey.get(key) ?? []).filter((time) => time > windowStart)
  requests.push(now)
  requestWindowByKey.set(key, requests)
  return requests.length > MAX_REQUESTS_PER_WINDOW
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  const configured = (process.env.ALLOWED_ORIGINS ?? process.env.NEXT_PUBLIC_SITE_URL ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (!configured.length) return true
  return configured.includes(origin)
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
