/**
 * Bosta Delivery Integration — Scaffold
 *
 * All methods are implemented and ready.
 * Activate by adding BOSTA_API_KEY to your environment variables.
 * Obtain the key from: https://app.bosta.co → Settings → API Keys
 */

const BOSTA_API_URL = 'https://app.bosta.co/api/v2'
const BOSTA_API_KEY = process.env.BOSTA_API_KEY ?? ''

/** Returns true when the API key is configured — used to enable/disable UI */
export function isBostaConfigured(): boolean {
  return !!BOSTA_API_KEY
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BostaAddress {
  city: string
  district?: string
  firstLine: string
  secondLine?: string
}

export interface BostaReceiver {
  firstName: string
  lastName: string
  phone: string
  address: BostaAddress
}

export interface BostaShipmentPayload {
  type: number         // 10 = delivery, 25 = exchange, 30 = cash collection
  specs: {
    packageType: string  // 'Parcel' | 'Document' | 'Pallet'
    size: string         // 'SMALL' | 'MEDIUM' | 'LARGE' | 'XLARGE'
  }
  receiver: BostaReceiver
  notes?: string
  cod?: number           // Cash on Delivery amount (0 for paid orders)
  businessReference?: string  // Your internal order ID/number
}

export interface BostaShipmentResult {
  success: boolean
  trackingNumber?: string
  shipmentId?: string
  error?: string
}

export interface BostaTrackingEvent {
  code: string
  state: string
  timestamp: string
}

export interface BostaTrackingResult {
  trackingNumber: string
  status: string
  currentStatus: string
  transitEvents: BostaTrackingEvent[]
}

// ── API Methods ───────────────────────────────────────────────────────────────

/**
 * Create a new delivery shipment with Bosta.
 * Returns the tracking number and Bosta shipment ID on success.
 */
export async function createBostaShipment(
  payload: BostaShipmentPayload
): Promise<BostaShipmentResult> {
  if (!isBostaConfigured()) {
    return { success: false, error: 'Bosta API key not configured' }
  }

  try {
    const res = await fetch(`${BOSTA_API_URL}/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BOSTA_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data.message ?? `Bosta API error (${res.status})` }
    }

    return {
      success: true,
      trackingNumber: data.trackingNumber,
      shipmentId: data._id,
    }
  } catch (err) {
    console.error('Bosta createShipment error:', err)
    return { success: false, error: 'Network error contacting Bosta' }
  }
}

/**
 * Get live tracking status for a shipment.
 * Returns null if Bosta is not configured or the request fails.
 */
export async function getBostaTracking(
  trackingNumber: string
): Promise<BostaTrackingResult | null> {
  if (!isBostaConfigured()) return null

  try {
    const res = await fetch(
      `${BOSTA_API_URL}/deliveries/business/tracking/${trackingNumber}`,
      {
        headers: { Authorization: BOSTA_API_KEY },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/**
 * Cancel a Bosta shipment by its internal ID.
 */
export async function cancelBostaShipment(
  shipmentId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isBostaConfigured()) {
    return { success: false, error: 'Bosta API key not configured' }
  }

  try {
    const res = await fetch(`${BOSTA_API_URL}/deliveries/${shipmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BOSTA_API_KEY,
      },
      body: JSON.stringify({ state: 'CANCELLED' }),
    })

    if (!res.ok) {
      const data = await res.json()
      return { success: false, error: data.message ?? 'Bosta cancel failed' }
    }

    return { success: true }
  } catch (err) {
    console.error('Bosta cancelShipment error:', err)
    return { success: false, error: 'Network error contacting Bosta' }
  }
}

/**
 * Build a Bosta payload from a FYNDE order.
 * Call this helper before createBostaShipment.
 */
export function buildBostaPayload(order: {
  name: string
  phone: string
  address: string
  city: string
  notes?: string | null
  total: number
  payment_method: string
  order_number?: number | null
  id: string
}): BostaShipmentPayload {
  const [firstName, ...rest] = (order.name || 'Customer').split(' ')
  const lastName = rest.join(' ') || '.'

  // Normalize Egyptian phone: 01xxxxxxxxx → 201xxxxxxxxx
  const digits = order.phone.replace(/\D/g, '')
  const phone = digits.startsWith('0') ? '2' + digits : digits.startsWith('20') ? digits : '20' + digits

  return {
    type: 10, // standard delivery
    specs: {
      packageType: 'Parcel',
      size: 'MEDIUM',
    },
    receiver: {
      firstName,
      lastName,
      phone,
      address: {
        city: order.city || 'Cairo',
        firstLine: order.address || '',
      },
    },
    notes: order.notes || undefined,
    // COD = full order total for cash orders, 0 for instapay (already paid)
    cod: order.payment_method === 'cod' ? order.total : 0,
    businessReference: order.order_number ? `FYNDE-${order.order_number}` : order.id.slice(0, 8).toUpperCase(),
  }
}
