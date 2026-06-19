import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function validateSignature(req: any): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // sem segredo configurado, deixa passar

  const xSignature  = req.headers['x-signature']  || ''
  const xRequestId  = req.headers['x-request-id'] || ''
  const dataId      = req.query?.['data.id']       || req.body?.data?.id || ''

  if (!xSignature) return false

  const ts    = (xSignature.match(/ts=([^,]+)/)  || [])[1] || ''
  const v1    = (xSignature.match(/v1=([^,]+)/)  || [])[1] || ''
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  return expected === v1
}

// MP envia GET para validar o endpoint na configuração
export default async function handler(req: any, res: any) {
  if (req.method === 'GET') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).end(); return }

  if (!validateSignature(req)) {
    console.warn('[webhook-mp] Assinatura inválida')
    res.status(401).json({ error: 'Assinatura inválida' }); return
  }

  const { type, data } = req.body || {}

  // Só processa eventos de pagamento aprovado/recusado
  if (type !== 'payment' || !data?.id) {
    res.status(200).json({ received: true }); return
  }

  const token = process.env.MP_ACCESS_TOKEN!

  try {
    // Busca detalhes do pagamento para verificar status real
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!payRes.ok) {
      console.error('[webhook-mp] Falha ao buscar pagamento:', data.id, payRes.status)
      res.status(200).json({ received: true }); return
    }

    const payment = await payRes.json()
    const orderId = payment.external_reference

    console.log(`[webhook-mp] payment=${data.id} status=${payment.status} order=${orderId}`)

    if (!orderId) {
      console.warn('[webhook-mp] Sem external_reference no pagamento', data.id)
      res.status(200).json({ received: true }); return
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const methodMap: Record<string, string> = {
      pix:           'pix',
      credit_card:   'cartao_credito',
      debit_card:    'cartao_debito',
      bank_transfer: 'transferencia',
      ticket:        'boleto',
    }
    const paymentMethod = methodMap[payment.payment_type_id] || 'outro'

    if (payment.status === 'approved') {
      const { error } = await supabase
        .from('sales')
        .update({ payment_status: 'pago', payment_method: paymentMethod })
        .eq('id', orderId)

      if (error) console.error('[webhook-mp] Supabase error:', error.message)
      else console.log(`[webhook-mp] Pedido ${orderId} PAGO via ${paymentMethod}`)
    }

    if (payment.status === 'rejected' || payment.status === 'cancelled') {
      const { error } = await supabase
        .from('sales')
        .update({ payment_status: 'cancelado' })
        .eq('id', orderId)

      if (error) console.error('[webhook-mp] Supabase error:', error.message)
      else console.log(`[webhook-mp] Pedido ${orderId} marcado como CANCELADO`)
    }

  } catch (err: any) {
    console.error('[webhook-mp] Erro:', err?.message)
  }

  res.status(200).json({ received: true })
}
