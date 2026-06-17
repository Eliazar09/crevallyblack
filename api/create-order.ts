import { createClient } from '@supabase/supabase-js'

const APP_URL = process.env.APP_URL ?? process.env.VITE_APP_URL ?? 'https://crevallyblack.vercel.app'

export default async function handler(req: any, res: any) {
  const route = `${req.method} /api/create-order`

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const token = process.env.MP_ACCESS_TOKEN
  if (!token) {
    console.error(`[${route}] MP_ACCESS_TOKEN não configurado`)
    res.status(500).json({ error: 'Token não configurado' })
    return
  }

  const { orderId, items, buyer } = req.body
  console.log(`[${route}] orderId=${orderId} items=${items?.length} buyer=${buyer?.nome}`)

  // ── Preços vêm do banco — nunca do cliente ──────────────────────
  let itemsPayload: any[] = []
  try {
    const admin = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const productIds = (items as any[]).map((i: any) => i.productId).filter(Boolean)
    const { data: products, error } = await admin
      .from('products')
      .select('id, price, name')
      .in('id', productIds)

    if (error) throw error

    const map = new Map((products ?? []).map((p: any) => [p.id, p]))

    itemsPayload = (items as any[]).map((item: any) => {
      const db = map.get(item.productId)
      return {
        id: String(item.productId),
        title: String(db?.name ?? item.name).slice(0, 256),
        quantity: Number(item.quantity),
        unit_price: Number(db?.price ?? item.unit_price), // MP usa reais, não centavos
        currency_id: 'BRL',
      }
    })
  } catch (err: any) {
    console.warn(`[${route}] Preço do DB falhou, usando cliente:`, err?.message)
    itemsPayload = (items as any[]).map((item: any) => ({
      id: String(item.productId),
      title: String(item.name).slice(0, 256),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      currency_id: 'BRL',
    }))
  }

  const total = itemsPayload.reduce((s: number, i: any) => s + i.unit_price * i.quantity, 0)
  console.log(`[${route}] total=R$${total.toFixed(2)}`)

  // Dados do comprador para pré-preencher o checkout do MP
  const payer = buyer ? (() => {
    const parts = String(buyer.nome ?? '').trim().split(' ')
    const phone = String(buyer.telefone ?? '').replace(/\D/g, '')
    return {
      name:    parts[0] ?? '',
      surname: parts.slice(1).join(' ') || parts[0] ?? '',
      email:   buyer.email ?? `${orderId.slice(-8)}@crevally.com`,
      phone:   phone.length >= 10 ? {
        area_code: phone.slice(0, 2),
        number:    phone.slice(2),
      } : undefined,
      identification: buyer.cpf ? {
        type:   'CPF',
        number: String(buyer.cpf).replace(/\D/g, ''),
      } : undefined,
    }
  })() : undefined

  const preference = {
    items: itemsPayload,
    ...(payer ? { payer } : {}),
    external_reference: orderId,
    back_urls: {
      success: `${APP_URL}/pedido-confirmado?id=${orderId}`,
      failure: `${APP_URL}/pedido-confirmado?id=${orderId}`,
      pending: `${APP_URL}/pedido-confirmado?id=${orderId}`,
    },
    auto_return: 'approved',
    notification_url: `${APP_URL}/api/webhook-mp`,
    expires: true,
    expiration_date_to: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  }

  try {
    console.log(`[${route}] POST https://api.mercadopago.com/checkout/preferences`)

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    })

    const data = await response.json()
    console.log(`[${route}] status=${response.status} id=${data.id}`)

    if (!response.ok) {
      res.status(response.status).json({ error: data })
      return
    }

    // Token TEST-... = sandbox → usa sandbox_init_point; produção → init_point
    const isSandbox = String(token).startsWith('TEST-')
    const redirectUrl = isSandbox ? data.sandbox_init_point : data.init_point

    if (!redirectUrl) {
      console.error(`[${route}] Preference sem init_point:`, JSON.stringify(data))
      res.status(502).json({ error: 'Preference sem URL de pagamento', raw: data })
      return
    }

    res.status(200).json({ preference_id: data.id, redirect_url: redirectUrl })

  } catch (err: any) {
    console.error(`[${route}] Erro de conexão:`, err?.message)
    res.status(500).json({ error: 'Erro de conexão com Mercado Pago', detail: err?.message })
  }
}
