const APP_URL = process.env.VITE_APP_URL ?? 'https://crevallyblack.vercel.app'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const token = process.env.PAGSEGURO_TOKEN
  if (!token) { res.status(500).json({ error: 'Token não configurado' }); return }

  const { orderId, customer, items, total, address, paymentMethod = 'pix' } = req.body

  const phoneDigits = (customer.phone ?? '').replace(/\D/g, '')
  const area = phoneDigits.slice(0, 2)
  const phoneNumber = phoneDigits.slice(2)
  const totalCents = Math.round(total * 100)

  const customerPayload = {
    name: customer.name,
    email: customer.email,
    tax_id: (customer.cpf ?? '').replace(/\D/g, ''),
    phones: [{ country: '55', area, number: phoneNumber, type: 'MOBILE' }],
  }

  const itemsPayload = items.map((item: any, i: number) => ({
    reference_id: `item_${i}`,
    name: String(item.name).slice(0, 100),
    quantity: item.quantity,
    unit_amount: Math.round(item.unit_price * 100),
  }))

  const shippingPayload: any = {
    address: {
      street: address.street,
      number: address.number,
      locality: address.neighborhood || 'Centro',
      city: address.city,
      region_code: address.state.toUpperCase().slice(0, 2),
      country: 'BRA',
      postal_code: (address.cep ?? '').replace(/\D/g, ''),
    },
  }
  if (address.complement) shippingPayload.address.complement = address.complement

  try {
    // ── PIX: cria order com qr_code ──────────────────────────
    if (paymentMethod === 'pix') {
      const expiration = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().replace('Z', '-03:00')

      const payload = {
        reference_id: orderId,
        customer: customerPayload,
        items: itemsPayload,
        qr_codes: [{ amount: { value: totalCents }, expiration_date: expiration }],
        notification_urls: [`${APP_URL}/api/webhook-pagseguro`],
        shipping: shippingPayload,
      }

      const response = await fetch('https://api.pagseguro.com/orders', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) { console.error('PSG PIX error:', JSON.stringify(data)); res.status(response.status).json({ error: data }); return }

      const qrCode = data.qr_codes?.[0]
      const qrImage = qrCode?.links?.find((l: any) => l.rel === 'QRCODE.PNG')?.href

      res.status(200).json({
        type: 'pix',
        pagseguro_id: data.id,
        pix_key: qrCode?.text ?? null,
        qr_image: qrImage ?? null,
      })
      return
    }

    // ── CARTÃO: cria checkout hospedado (redirect) ───────────
    if (paymentMethod === 'card') {
      const payload = {
        reference_id: orderId,
        customer: customerPayload,
        items: itemsPayload,
        payment_methods: [
          { type: 'CREDIT_CARD' },
          { type: 'DEBIT_CARD' },
          { type: 'PIX' },
        ],
        redirect_url: `${APP_URL}/pedido-confirmado`,
        return_url: `${APP_URL}/pedido-confirmado`,
        notification_urls: [`${APP_URL}/api/webhook-pagseguro`],
        expiration_date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().replace('Z', '-03:00'),
        shipping: shippingPayload,
      }

      const response = await fetch('https://api.pagseguro.com/checkouts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) { console.error('PSG Checkout error:', JSON.stringify(data)); res.status(response.status).json({ error: data }); return }

      const redirectUrl = data.links?.find((l: any) => l.rel === 'PAY')?.href ?? null

      res.status(200).json({
        type: 'card',
        pagseguro_id: data.id,
        redirect_url: redirectUrl,
      })
      return
    }

    res.status(400).json({ error: 'paymentMethod inválido' })
  } catch (err: any) {
    console.error('PagSeguro fetch error:', err)
    res.status(500).json({ error: 'Erro de conexão com PagSeguro' })
  }
}
