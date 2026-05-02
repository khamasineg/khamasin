import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmationEmail({
  customerEmail,
  customerName,
  items,
  total,
  paymentMethod,
  address,
  city,
}: {
  customerEmail: string
  customerName: string
  items: { name: string; size: string; price: number }[]
  total: number
  paymentMethod: string
  address: string
  city: string
}) {
  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; font-family: monospace; font-size: 12px; border-bottom: 1px solid #D9CFC4;">${item.name}</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 12px; border-bottom: 1px solid #D9CFC4; text-align: center;">${item.size}</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 12px; border-bottom: 1px solid #D9CFC4; text-align: right;">${item.price.toLocaleString()} EGP</td>
        </tr>`
    )
    .join('')

  const html = `
    <div style="background-color: #F0E9DF; padding: 40px 20px; font-family: serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FAF6F0; padding: 40px;">
        
        <h1 style="font-family: sans-serif; font-size: 32px; letter-spacing: 0.3em; color: #1C1917; margin: 0 0 8px;">FYNDE</h1>
        <p style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #BEB0A0; margin: 0 0 40px;">Rare finds, beautifully worn.</p>
        
        <h2 style="font-family: serif; font-size: 20px; color: #1C1917; margin: 0 0 8px;">Order Confirmed</h2>
        <p style="font-family: serif; font-size: 14px; color: #BEB0A0; font-style: italic; margin: 0 0 32px;">Thank you ${customerName}, your order has been received.</p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr>
              <th style="font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #BEB0A0; text-align: left; padding-bottom: 8px;">Item</th>
              <th style="font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #BEB0A0; text-align: center; padding-bottom: 8px;">Size</th>
              <th style="font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #BEB0A0; text-align: right; padding-bottom: 8px;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-bottom: 32px;">
          <span style="font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #BEB0A0;">Total</span>
          <span style="font-family: monospace; font-size: 14px; color: #1C1917;">${total.toLocaleString()} EGP</span>
        </div>

        <div style="border-top: 1px solid #D9CFC4; padding-top: 24px; margin-bottom: 32px;">
          <p style="font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #BEB0A0; margin: 0 0 8px;">Delivery Address</p>
          <p style="font-family: monospace; font-size: 12px; color: #1C1917; margin: 0;">${address}, ${city}</p>
        </div>

        <div style="border-top: 1px solid #D9CFC4; padding-top: 24px; margin-bottom: 32px;">
          <p style="font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #BEB0A0; margin: 0 0 8px;">Payment Method</p>
          <p style="font-family: monospace; font-size: 12px; color: #1C1917; margin: 0;">${paymentMethod === 'cod' ? 'Cash on Delivery' : 'InstaPay'}</p>
        </div>

        <p style="font-family: serif; font-size: 13px; color: #BEB0A0; font-style: italic; margin: 0;">We will be in touch shortly to confirm your delivery details.</p>

      </div>
    </div>
  `

  return resend.emails.send({
    from: 'FYNDE <onboarding@resend.dev>',
    to: customerEmail,
    subject: 'Your FYNDE Order is Confirmed',
    html,
  })
}