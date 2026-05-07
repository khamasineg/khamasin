import { Resend } from 'resend'
import { escapeHtml } from './order-security'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmationEmail({
  customerEmail,
  customerName,
  orderNumber,
  items,
  total,
  paymentMethod,
  address,
  city,
  couponCode,
  discountAmount,
}: {
  customerEmail: string
  customerName: string
  orderNumber?: number
  items: { name: string; size: string; price: number; image?: string }[]
  total: number
  paymentMethod: string
  address: string
  city: string
  couponCode?: string
  discountAmount?: number
}) {
  const firstName = escapeHtml(customerName.split(' ')[0] || 'Customer')
  const orderRef = orderNumber ? `#${orderNumber}` : ''
  const hasDiscount = couponCode && discountAmount && discountAmount > 0
  const subtotal = hasDiscount ? total + discountAmount : total
  const safeAddress = escapeHtml(address)
  const safeCity = escapeHtml(city)

  const itemRows = items
    .map(
      (item) => {
        const safeName = escapeHtml(item.name)
        const safeSize = escapeHtml(item.size)
        const safeImage = item.image && /^https:\/\//i.test(item.image) ? item.image : ''
        return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #D9CFC4;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                ${safeImage ? `
                <td style="padding-right: 16px; vertical-align: top;">
                  <img src="${safeImage}" alt="${safeName}" width="60" height="75" style="display: block; width: 60px; height: 75px; object-fit: cover;" />
                </td>` : ''}
                <td style="vertical-align: top;">
                  <p style="font-family: Georgia, serif; font-size: 14px; color: #1C1917; margin: 0 0 4px;">${safeName}</p>
                  <p style="font-family: 'Courier New', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #BEB0A0; margin: 0;">Size: ${safeSize}</p>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 16px 0; border-bottom: 1px solid #D9CFC4; text-align: right; vertical-align: top;">
            <p style="font-family: 'Courier New', monospace; font-size: 12px; color: #1C1917; margin: 0;">${item.price.toLocaleString()} EGP</p>
          </td>
        </tr>
      `
      }
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your FYNDE Order</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F0E9DF;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0E9DF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header dark -->
          <tr>
            <td style="background-color: #1C1917; padding: 40px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="font-family: 'Courier New', monospace; font-size: 28px; letter-spacing: 0.35em; color: #F0E9DF; margin: 0 0 6px; font-weight: normal;">FYNDE</p>
                    <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #BEB0A0; margin: 0;">Rare finds, beautifully worn.</p>
                  </td>
                  <td align="right" style="vertical-align: bottom;">
                    <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #A8401A; margin: 0;">&#10022; Order Confirmed</p>
                    ${orderRef ? `<p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.15em; color: #F0E9DF; margin: 6px 0 0;">Ref ${orderRef}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sienna rule -->
          <tr>
            <td style="background-color: #A8401A; height: 2px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="background-color: #FAF6F0; padding: 48px 48px 32px;">
              <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #BEB0A0; margin: 0 0 16px;">For ${firstName},</p>
              <h1 style="font-family: Georgia, serif; font-size: 36px; font-weight: normal; font-style: italic; color: #1C1917; margin: 0 0 16px; line-height: 1.1;">Your piece is<br/>on its way.</h1>
              <p style="font-family: Georgia, serif; font-size: 14px; color: #BEB0A0; font-style: italic; margin: 0; line-height: 1.8;">
                Every piece we carry has lived a life. We are glad this one found you.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 1px solid #D9CFC4; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order items -->
          <tr>
            <td style="background-color: #FAF6F0; padding: 32px 48px;">
              <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #A8401A; margin: 0 0 20px;">&#8212; Your Order</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
                ${hasDiscount ? `
                <tr>
                  <td style="padding: 20px 0 0;">
                    <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #BEB0A0; margin: 0;">Subtotal</p>
                  </td>
                  <td style="padding: 20px 0 0; text-align: right;">
                    <p style="font-family: 'Courier New', monospace; font-size: 13px; color: #BEB0A0; margin: 0;">${subtotal.toLocaleString()} EGP</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0 0;">
                    <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #A8401A; margin: 0;">Coupon (${escapeHtml(couponCode!)})</p>
                  </td>
                  <td style="padding: 6px 0 0; text-align: right;">
                    <p style="font-family: 'Courier New', monospace; font-size: 13px; color: #A8401A; margin: 0;">−${discountAmount!.toLocaleString()} EGP</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 0; border-top: 1px solid #D9CFC4;">
                    <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #BEB0A0; margin: 0;">Total</p>
                  </td>
                  <td style="padding: 10px 0 0; text-align: right; border-top: 1px solid #D9CFC4;">
                    <p style="font-family: 'Courier New', monospace; font-size: 18px; color: #1C1917; margin: 0;">${total.toLocaleString()} EGP</p>
                  </td>
                </tr>
                ` : `
                <tr>
                  <td style="padding: 20px 0 0;">
                    <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #BEB0A0; margin: 0;">Total</p>
                  </td>
                  <td style="padding: 20px 0 0; text-align: right;">
                    <p style="font-family: 'Courier New', monospace; font-size: 18px; color: #1C1917; margin: 0;">${total.toLocaleString()} EGP</p>
                  </td>
                </tr>
                `}
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 1px solid #D9CFC4; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery + Payment -->
          <tr>
            <td style="background-color: #FAF6F0; padding: 32px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 16px;">
                    <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #BEB0A0; margin: 0 0 8px;">Delivery To</p>
                    <p style="font-family: 'Courier New', monospace; font-size: 12px; color: #1C1917; margin: 0; line-height: 1.6;">${safeAddress}<br/>${safeCity}</p>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 16px; border-left: 1px solid #D9CFC4;">
                    <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #BEB0A0; margin: 0 0 8px;">Payment</p>
                    <p style="font-family: 'Courier New', monospace; font-size: 12px; color: #1C1917; margin: 0 0 8px;">${paymentMethod === 'cod' ? 'Cash on Delivery' : 'InstaPay'}</p>
                    <p style="font-family: Georgia, serif; font-size: 11px; color: #BEB0A0; font-style: italic; margin: 0;">
                      ${paymentMethod === 'cod'
                        ? 'You will pay the courier upon receiving your piece.'
                        : 'We will send you our InstaPay number via WhatsApp shortly.'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quote section -->
          <tr>
            <td style="background-color: #1C1917; padding: 40px 48px;">
              <p style="font-family: Georgia, serif; font-size: 16px; font-style: italic; font-weight: normal; color: #F0E9DF; margin: 0 0 16px; line-height: 1.7;">
                &ldquo;Fashion&rsquo;s most extraordinary chapter has already been written. We just help you find your page.&rdquo;
              </p>
              <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #BEB0A0; margin: 0;">
                &#8212; The FYNDE Archive
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1C1917; padding: 0 48px 32px; border-top: 1px solid rgba(240,233,223,0.08);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(190,176,160,0.4); margin: 0;">
                      &copy; ${new Date().getFullYear()} FYNDE. Cairo, Egypt.
                    </p>
                  </td>
                  <td align="right">
                    <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(190,176,160,0.4); margin: 0;">
                      orders@fyndethevintage.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `

  return resend.emails.send({
    from: 'FYNDE <orders@fyndethevintage.com>',
    to: customerEmail,
    // Replies go to Gmail where the inbox is actually monitored
    replyTo: 'fyndethevintage@gmail.com',
    subject: `✦ Your FYNDE order is confirmed${orderRef ? ` (${orderRef})` : ''}, ${firstName}.`,
    html,
  })
}

// ─── Admin notification email ─────────────────────────────────────────────────

export async function sendAdminOrderNotification(params: {
  orderRef: string
  customerName: string
  customerEmail: string
  phone: string
  address: string
  city: string
  paymentMethod: string
  items: Array<{ name: string; size: string; price: number }>
  total: number
  couponCode?: string | null
  discountAmount?: number | null
  notes?: string | null
}): Promise<void> {
  const {
    orderRef, customerName, customerEmail, phone, address, city,
    paymentMethod, items, total, couponCode, discountAmount, notes,
  } = params

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'fyndethevintage@gmail.com'
  const payLabel = paymentMethod === 'cod' ? 'Cash on Delivery' : 'InstaPay'

  const itemRows = items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2521;font-family:'Courier New',monospace;font-size:12px;color:#FAF6F0;">${escapeHtml(i.name)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2521;font-family:'Courier New',monospace;font-size:12px;color:#BEB0A0;text-align:center;">${escapeHtml(i.size)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2521;font-family:'Courier New',monospace;font-size:12px;color:#FAF6F0;text-align:right;">${i.price.toLocaleString()} EGP</td>
    </tr>`).join('')

  const couponRow = couponCode && discountAmount ? `
    <tr>
      <td colspan="2" style="padding:8px 12px;font-family:'Courier New',monospace;font-size:11px;color:#A8401A;">Coupon: ${escapeHtml(couponCode)}</td>
      <td style="padding:8px 12px;font-family:'Courier New',monospace;font-size:12px;color:#A8401A;text-align:right;">−${discountAmount.toLocaleString()} EGP</td>
    </tr>` : ''

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0F0D0B;font-family:'Courier New',monospace;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <!-- Header -->
      <tr><td style="background:#1C1917;padding:24px 32px;border-bottom:2px solid #A8401A;">
        <p style="font-family:'Courier New',monospace;font-size:18px;letter-spacing:0.3em;color:#FAF6F0;margin:0 0 4px;">FYNDE</p>
        <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#A8401A;margin:0;">
          ✦ New Order — ${escapeHtml(orderRef)}
        </p>
      </td></tr>

      <!-- Customer -->
      <tr><td style="background:#1C1917;padding:20px 32px;border-bottom:1px solid #2A2521;">
        <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#BEB0A0;margin:0 0 12px;">Customer</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:4px 0;font-family:'Courier New',monospace;font-size:13px;color:#FAF6F0;font-weight:bold;">${escapeHtml(customerName)}</td>
          </tr>
          <tr><td style="padding:4px 0;font-size:12px;color:#BEB0A0;">${escapeHtml(customerEmail)}</td></tr>
          <tr><td style="padding:4px 0;font-size:12px;color:#BEB0A0;">${escapeHtml(phone)}</td></tr>
          <tr><td style="padding:4px 0;font-size:12px;color:#BEB0A0;">${escapeHtml(address)}, ${escapeHtml(city)}</td></tr>
          ${notes ? `<tr><td style="padding:4px 0;font-size:11px;color:#6A6864;font-style:italic;">Note: ${escapeHtml(notes)}</td></tr>` : ''}
        </table>
      </td></tr>

      <!-- Payment badge -->
      <tr><td style="background:#1C1917;padding:12px 32px;border-bottom:1px solid #2A2521;">
        <span style="display:inline-block;background:${paymentMethod === 'cod' ? 'rgba(74,222,128,0.15)' : 'rgba(0,87,184,0.2)'};border:1px solid ${paymentMethod === 'cod' ? 'rgba(74,222,128,0.4)' : 'rgba(0,87,184,0.4)'};padding:4px 12px;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:${paymentMethod === 'cod' ? '#4ade80' : '#60a5fa'};">
          ${payLabel}
        </span>
      </td></tr>

      <!-- Items -->
      <tr><td style="background:#1C1917;padding:20px 32px;">
        <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#BEB0A0;margin:0 0 12px;">Order Items</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2A2521;">
          <tr>
            <th style="padding:8px 12px;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#6A6864;text-align:left;border-bottom:1px solid #2A2521;font-weight:normal;">Item</th>
            <th style="padding:8px 12px;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#6A6864;text-align:center;border-bottom:1px solid #2A2521;font-weight:normal;">Size</th>
            <th style="padding:8px 12px;font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.18em;text-transform:uppercase;color:#6A6864;text-align:right;border-bottom:1px solid #2A2521;font-weight:normal;">Price</th>
          </tr>
          ${itemRows}
          ${couponRow}
          <tr>
            <td colspan="2" style="padding:12px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#BEB0A0;border-top:1px solid #A8401A;">Total</td>
            <td style="padding:12px;font-family:'Courier New',monospace;font-size:16px;color:#FAF6F0;text-align:right;font-weight:bold;border-top:1px solid #A8401A;">${total.toLocaleString()} EGP</td>
          </tr>
        </table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#111;padding:12px 32px;text-align:center;">
        <p style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;color:#3A3836;margin:0;">
          FYNDE Admin Notification · ${new Date().toLocaleString('en-GB', { timeZone: 'Africa/Cairo' })} Cairo
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`

  try {
    await resend.emails.send({
      from: 'FYNDE Orders <orders@fyndethevintage.com>',
      to: adminEmail,
      subject: `🛍 New order ${orderRef} — ${customerName} (${payLabel})`,
      html,
    })
  } catch (err) {
    // Non-critical — never crash the order flow
    console.error('Admin notification email failed:', err)
  }
}