import { createClient } from '@supabase/supabase-js'

const APP_URL = process.env.VITE_APP_URL ?? 'https://crevallyblack.vercel.app'

function maskEmail(email: string) {
  const [user, domain] = (email ?? '').split('@')
  return `${(user ?? '').slice(0, 2)}***@${domain ?? ''}`
}

export default async function handler(req: any, res: any) {
  const route = `${req.method} /api/create-order`

  if (req.method !== 'POST') {
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

  console.log(`[${route}] orderId=${orderId} method=${paymentMethod} customer=${maskEmail(customer?.email)}`)

  // ── Recalcula total no servidor — nunca confia no cliente ──
  let totalCents = 0
  try {
    const admin = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const productIds = (items as any[]).map((i) => i.productId).filter(Boolean)
    if (productIds.length > 0) {
      const { data: products, error } = await admin
        .from('products')
        .select('id, price')
        .in('id', productIds)
      if (error) throw error
      const priceMap = new Map((products ?? []).map((p: any) => [p.id, p.price]))
      totalCents = Math.round(
        (items as any[]).reduce((sum, item) => {
          const price = priceMap.get(item.productId) ?? item.unit_price
          return sum + price * item.quantity
        }, 0) * 100
      )
    }
  } catch (err: any) {
    console.warn(`[${route}] Preço do DB falhou, usando cliente:`, err?.message)
  }
  if (totalCents === 0) {
    totalCents = Math.round(
      (items as any[]).reduce((s: number, i: any) => s + i.unit_price * i.quantity, 0) * 100
    )
  }

  console.log(`[${route}] totalCents=${totalCents}`)

  const phoneDigits = (customer.phone ?? '').replace(/\D/g, '')
  const customerPayload = {
    name: customer.name,
    email: customer.email,
    tax_id: (customer.cpf ?? '').replace(/\D/g, ''),
    phones: [{ country: '55', area: phoneDigits.slice(0, 2), number: phoneDigits.slice(2), type: 'MOBILE' }],
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

  // ── Checkout hospedado PagBank para PIX e Cartão ──────────
  // O mesmo endpoint /checkouts serve os dois — PagBank monta a tela
  const paymentMethods =
    paymentMethod === 'pix'
      ? [{ type: 'PIX' }]
      : [{ type: 'CREDIT_CARD' }, { type: 'DEBIT_CARD' }, { type: 'PIX' }]

  const payload = {
    reference_id: orderId,
    customer: customerPayload,
    items: itemsPayload,
    payment_methods: paymentMethods,
    redirect_url: `${APP_URL}/pedido-confirmado`,
    return_url: `${APP_URL}/pedido-confirmado`,
    notification_urls: [`${APP_URL}/api/webhook-pagseguro`],
    expiration_date: new Date(Date.now() + 3 * 60 * 60 * 1000)
      .toISOString()
      .replace('Z', '-03:00'),
    shipping: shippingPayload,
  }

  try {
    console.log(`[${route}] POST https://api.pagseguro.com/checkouts`)

    const response = await fetch('https://api.pagseguro.com/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    console.log(`[${route}] status=${response.status} body=${JSON.stringify(data)}`)

    if (!response.ok) {
      res.status(response.status).json({ error: data })
      return
    }

    const redirectUrl = data.links?.find((l: any) => l.rel === 'PAY')?.href ?? null
    if (!redirectUrl) {
      console.error(`[${route}] Checkout criado mas sem link PAY:`, JSON.stringify(data))
    }

    res.status(200).json({ redirect_url: redirectUrl, pagseguro_id: data.id })

  } catch (err: any) {
    console.error(`[${route}] Erro de fetch:`, err?.message)
    res.status(500).json({ error: 'Erro de conexão com PagSeguro', detail: err?.message })
  }
}
