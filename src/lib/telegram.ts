/**
 * Telegram Bot notification — completely free, instant push to your phone.
 *
 * Setup (2 minutes):
 *  1. Open Telegram → search @BotFather → /newbot → follow prompts → copy the token
 *  2. Send any message to your new bot
 *  3. Visit: https://api.telegram.org/bot<TOKEN>/getUpdates
 *     Copy the "id" value inside "chat" — that's your TELEGRAM_CHAT_ID
 *  4. Add to environment variables:
 *       TELEGRAM_BOT_TOKEN=123456:ABC...
 *       TELEGRAM_CHAT_ID=123456789
 *
 * If env vars are not set the function is a no-op (safe to deploy without them).
 */

const TELEGRAM_API = 'https://api.telegram.org'

function isConfigured(): boolean {
  return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
}

export async function sendTelegramNotification(message: string): Promise<void> {
  if (!isConfigured()) return

  try {
    const url = `${TELEGRAM_API}/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    })
  } catch (err) {
    // Non-critical — never crash the order flow
    console.error('Telegram notification failed:', err)
  }
}

export function buildOrderNotificationMessage(params: {
  orderRef: string
  customerName: string
  phone: string
  city: string
  paymentMethod: string
  items: Array<{ name: string; size: string; price: number }>
  total: number
  couponCode?: string | null
  discountAmount?: number | null
}): string {
  const { orderRef, customerName, phone, city, paymentMethod, items, total, couponCode, discountAmount } = params

  const itemLines = items
    .map(i => `  • ${i.name} — ${i.size} — ${i.price.toLocaleString()} EGP`)
    .join('\n')

  const payLabel = paymentMethod === 'cod' ? 'Cash on Delivery' : 'InstaPay'

  const couponLine = couponCode && discountAmount
    ? `\n🏷 Coupon: <b>${couponCode}</b> (−${discountAmount.toLocaleString()} EGP)`
    : ''

  return (
    `🛍 <b>New FYNDE Order — ${orderRef}</b>\n\n` +
    `👤 <b>${customerName}</b>\n` +
    `📞 ${phone}\n` +
    `📍 ${city}\n` +
    `💳 ${payLabel}\n\n` +
    `<b>Items:</b>\n${itemLines}` +
    couponLine + '\n\n' +
    `<b>Total: ${total.toLocaleString()} EGP</b>`
  )
}
