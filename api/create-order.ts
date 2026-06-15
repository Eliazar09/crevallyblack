export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const token = process.env.PAGSEGURO_TOKEN
  if (!token) {
    res.status(500).json({ error: 'Token PagSeguro não configurado' })
    return
  }

  const { orderId, customer, items, total, address } = req.body

  const phoneDigits = (customer.phone ?? '').replace(/\D/g, '')
  const area = phoneDigits.slice(0, 2)
  const phoneNumber = phoneDigits.slice(2)
  const totalCents = Math.round(total * 100)

  // QR code expira em 3 horas
  const expiration = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const expirationStr = expiration.toISOString().replace('Z', '-03:00')

  const payload: any = {
    reference_id: orderId,
    customer: {
      name: customer.name,
      email: customer.email,
      tax_id: (customer.cpf ?? '').replace(/\D/g, ''),
      phones: [{ country: '55', area, number: phoneNumber, type: 'MOBILE' }],
    },
    items: items.map((item: any, i: number) => ({
      reference_id: `item_${i}`,
      name: String(item.name).slice(0, 100),
      quantity: item.quantity,
      unit_amount: Math.round(item.unit_price * 100),
    })),
    qr_codes: [{
      amount: { value: totalCents },
      expiration_date: expirationStr,
    }],
    shipping: {
      address: {
        street: address.street,
        number: address.number,
        locality: address.neighborhood || 'Centro',
        city: address.city,
        region_code: address.state.toUpperCase().slice(0, 2),
        country: 'BRA',
        postal_code: (address.cep ?? '').replace(/\D/g, ''),
      },
    },
  }

  if (address.complement) {
    payload.shipping.address.complement = address.complement
  }

  try {
    const response = await fetch('https://api.pagseguro.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('PagSeguro error:', JSON.stringify(data))
      res.status(response.status).json({ error: data })
      return
    }

    const qrCode = data.qr_codes?.[0]
    const qrImage = qrCode?.links?.find((l: any) => l.rel === 'QRCODE.PNG')?.href

    res.status(200).json({
      pagseguro_id: data.id,
      pix_key: qrCode?.text ?? null,
      qr_image: qrImage ?? null,
    })
  } catch (err: any) {
    console.error('PagSeguro fetch error:', err)
    res.status(500).json({ error: 'Erro de conexão com PagSeguro' })
  }
}
