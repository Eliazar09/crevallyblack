import { createClient } from '@supabase/supabase-js'

const APP_URL = process.env.VITE_APP_URL ?? 'https://crevallyblack.vercel.app'

function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  return `${user.slice(0, 2)}***@${domain}`
}

export default async function handler(req: any, res: any) {
  const route = `${req.method} /api/create-order`

  if (req.method !== 'POST') {
    console.log(`[${route}] 405`)
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const token = process.env.PAGSEGURO_TOKEN
  if (!token) {
    console.error(`[${route}] PAGSEGURO_TOKEN não configurado`)
    res.status(500).json({ error: 'Token não configurado' })
    return
  }

  const { orderId, customer, items, address, paymentMethod = 'pix' } = req.body

  console.log(`[${route}] orderId=${orderId} method=${paymentMethod} customer=${maskEmail(customer?.email ?? '')} items=${items?.length}`)

  // ── Recalcula total no servidor — não confia no cliente ──
  let totalCents = 0
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL!
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (supabaseUrl && serviceKey) {
      const productIds = (items as any[]).map((i) => i.productId).filter(Boolean)
      if (productIds.length > 0) {
        const admin = createClient(supabaseUrl, serviceKey)
        const { data: products, error: dbErr } = await admin
          .from('products')
          .select('id, price')
          .in('id', productIds)

        if (dbErr) {
          console.error(`[${route}] Supabase price lookup error:`, dbErr.message)
        } else {
          const priceMap = new Map((products ?? []).map((p: any) => [p.id, p.price]))
          totalCents = Math.round(
            (items as any[]).reduce((sum, item) => {
              const realPrice = priceMap.get(item.productId) ?? item.unit_price
              return sum + realPrice * item.quantity
            }, 0) * 100
          )
          console.log(`[${route}] Total recalculado: R$ ${(totalCents / 100).toFixed(2)}`)
        }
      }
    }

    // Fallback se não conseguiu buscar do banco
    if (totalCents === 0) {
      totalCents = Math.round(
        (items as any[]).reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0) * 100
      )
      console.warn(`[${route}] Usando total do cliente como fallback: R$ ${(totalCents / 100).toFixed(2)}`)
    }
  } catch (calcErr: any) {
    console.error(`[${route}] Erro ao recalcular total:`, calcErr.message)
    totalCents = Math.round(
      (items as any[]).reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0) * 100
    )
  }

  const phoneDigits = (customer.phone ?? '').replace(/\D/g, '')
  const area = phoneDigits.slice(0, 2)
  const phoneNumber = phoneDigits.slice(2)

  const customerPayload = {
    name: customer.name,
    email: customer.email,
    tax_id: (customer.cpf ?? '').replace(/\D/g, ''),
    phones: [{ country: '55', area, number: phoneNumber, type: 'MOBILE' }],
  }

  const itemsPayload = (items as any[]).map((item, i) => ({
    reference_id: `item_${i}`,
    name: String(item.name).slice(0, 100),
    quantity: item.quantity,
    unit_amount: Math.round((item.unit_price ?? 0) * 100),
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
    // ── PIX ─────────────────────────────────────────────────
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

      console.log(`[${route}] POST https://api.pagseguro.com/orders totalCents=${totalCents}`)

      const response = await fetch('https://api.pagseguro.com/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log(`[${route}] PagSeguro PIX status=${response.status} body=${JSON.stringify(data)}`)

      if (!response.ok) {
        res.status(response.status).json({ error: data })
        return
      }

      const qrCode  = data.qr_codes?.[0]
      const qrImage = qrCode?.links?.find((l: any) => l.rel === 'QRCODE.PNG')?.href ?? null

      if (!qrCode?.text) {
        console.error(`[${route}] Resposta sem qr_codes[0].text — body:`, JSON.stringify(data))
      }

      res.status(200).json({
        type: 'pix',
        pagseguro_id: data.id,
        pix_key: qrCode?.text ?? null,
        qr_image: qrImage,
      })
      return
    }

    // ── CARTÃO ───────────────────────────────────────────────
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
        redirect_url:    `${APP_URL}/pedido-confirmado`,
        return_url:      `${APP_URL}/pedido-confirmado`,
        notification_urls: [`${APP_URL}/api/webhook-pagseguro`],
        expiration_date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().replace('Z', '-03:00'),
        shipping: shippingPayload,
      }

      console.log(`[${route}] POST https://api.pagseguro.com/checkouts totalCents=${totalCents}`)

      const response = await fetch('https://api.pagseguro.com/checkouts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log(`[${route}] PagSeguro Card status=${response.status} body=${JSON.stringify(data)}`)

      if (!response.ok) {
        res.status(response.status).json({ error: data })
        return
      }

      const redirectUrl = data.links?.find((l: any) => l.rel === 'PAY')?.href ?? null
      if (!redirectUrl) {
        console.error(`[${route}] Checkout criado mas sem link PAY — body:`, JSON.stringify(data))
      }

      res.status(200).json({
        type: 'card',
        pagseguro_id: data.id,
        redirect_url: redirectUrl,
      })
      return
    }

    res.status(400).json({ error: 'paymentMethod inválido' })

  } catch (err: any) {
    console.error(`[${route}] Erro de fetch para PagSeguro:`, err?.message ?? err)
    res.status(500).json({ error: 'Erro de conexão com PagSeguro', detail: err?.message })
  }
}
