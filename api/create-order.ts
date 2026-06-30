import { createClient } from '@supabase/supabase-js'

const rawUrl  = process.env.APP_URL || 'https://crevallyblack.vercel.app'
const APP_URL = rawUrl.replace(/\/+$/, '').startsWith('http') ? rawUrl.replace(/\/+$/, '') : `https://${rawUrl.replace(/\/+$/, '')}`

export default async function handler(req: any, res: any) {
  // Garante sempre JSON — nunca HTML 500 do Vercel
  try {
    await run(req, res)
  } catch (err: any) {
    console.error('[create-order] unhandled:', err?.message, err?.stack)
    res.status(500).json({ error: 'Erro interno', detail: err?.message ?? String(err) })
  }
}

async function run(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' }); return
  }

  const token = process.env.MP_ACCESS_TOKEN
  if (!token) {
    res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado no servidor' }); return
  }

  // Body parsing defensivo
  const body = req.body ?? {}
  const { orderId, items, buyer } = body

  if (!orderId || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Payload inválido', got: { orderId, itemsLen: items?.length } }); return
  }

  console.log(`[create-order] orderId=${orderId} items=${items.length} buyer=${buyer?.nome ?? '?'}`)

  // ── Busca preços no banco (nunca confia no cliente) ──────────────
  let itemsPayload: any[] = []
  try {
    const admin = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    // Filtra apenas UUIDs válidos (exclui itens especiais como "frete")
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const productIds = items.map((i: any) => i.productId).filter((id: any) => id && UUID_REGEX.test(String(id)))
    const { data: products, error } = await admin
      .from('products')
      .select('id, price, name')
      .in('id', productIds)

    if (error) throw error

    const map = new Map((products ?? []).map((p: any) => [p.id, p]))
    itemsPayload = items.map((item: any) => {
      const db = map.get(item.productId)
      return {
        id:          String(item.productId),
        title:       String(db?.name ?? item.name).slice(0, 256),
        quantity:    Number(item.quantity),
        unit_price:  Number(db?.price ?? item.unit_price),
        currency_id: 'BRL',
      }
    })
  } catch (err: any) {
    console.warn('[create-order] DB fallback:', err?.message)
    itemsPayload = items.map((item: any) => ({
      id:          String(item.productId),
      title:       String(item.name).slice(0, 256),
      quantity:    Number(item.quantity),
      unit_price:  Number(item.unit_price),
      currency_id: 'BRL',
    }))
  }

  const total = itemsPayload.reduce((s: number, i: any) => s + i.unit_price * i.quantity, 0)
  console.log(`[create-order] total=R$${total.toFixed(2)}`)

  // ── Dados do comprador (pré-preenche o checkout do MP) ───────────
  let payer: any = undefined
  if (buyer?.nome) {
    const parts = String(buyer.nome).trim().split(' ')
    const phone = String(buyer.telefone ?? '').replace(/\D/g, '')
    payer = {
      name:    parts[0] ?? '',
      surname: parts.slice(1).join(' ') || parts[0] || '',
      email:   buyer.email ?? `pedido-${orderId.slice(-6)}@crevally.com`,
      ...(phone.length >= 10 ? { phone: { area_code: phone.slice(0, 2), number: phone.slice(2) } } : {}),
      ...(buyer.cpf ? { identification: { type: 'CPF', number: String(buyer.cpf).replace(/\D/g, '') } } : {}),
    }
  }

  // ── Preference ───────────────────────────────────────────────────
  const preference = {
    items: itemsPayload,
    ...(payer ? { payer } : {}),
    external_reference: orderId,
    back_urls: {
      success: `${APP_URL}/pedido-confirmado`,
      failure: `${APP_URL}/pedido-confirmado`,
      pending: `${APP_URL}/pedido-confirmado`,
    },
    auto_return:      'approved',
    notification_url: `${APP_URL}/api/webhook-mp`,
    expires:          true,
    expiration_date_to: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  }

  console.log('[create-order] preference items:', itemsPayload.length, 'total=R$' + total.toFixed(2))

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(preference),
  })

  const data = await response.json()
  console.log(`[create-order] MP status=${response.status} preference_id=${data?.id ?? 'err'}`)

  if (!response.ok) {
    res.status(response.status).json({ error: data?.message || 'Mercado Pago recusou a preference', cause: data?.cause, detail: data }); return
  }

  const isSandbox   = String(token).startsWith('TEST-')
  const redirectUrl = isSandbox ? data.sandbox_init_point : data.init_point

  if (!redirectUrl) {
    res.status(502).json({ error: 'MP não retornou URL de pagamento', raw: data }); return
  }

  res.status(200).json({ preference_id: data.id, redirect_url: redirectUrl })
}
