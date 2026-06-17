import { createClient } from '@supabase/supabase-js'

// MP envia GET para validar o endpoint na configuração
export default async function handler(req: any, res: any) {
  if (req.method === 'GET') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).end(); return }

  const { type, data } = req.body ?? {}

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

    if (payment.status === 'approved') {
      const { error } = await supabase
        .from('sales')
        .update({ payment_status: 'pago' })
        .eq('id', orderId)

      if (error) console.error('[webhook-mp] Supabase error:', error.message)
      else console.log(`[webhook-mp] Pedido ${orderId} marcado como PAGO`)
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
