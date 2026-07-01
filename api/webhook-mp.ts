import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function validateSignature(req: any): { ok: boolean; reason?: string } {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[webhook-mp] MP_WEBHOOK_SECRET não configurado — validação ignorada')
    return { ok: true }
  }

  const xSignature = req.headers['x-signature']  || ''
  const xRequestId = req.headers['x-request-id'] || ''
  const dataId     = req.query?.['data.id']       || req.body?.data?.id || ''

  if (!xSignature) {
    return { ok: false, reason: 'header x-signature ausente' }
  }

  const ts = (xSignature.match(/ts=([^,]+)/)  || [])[1] || ''
  const v1 = (xSignature.match(/v1=([^,]+)/)  || [])[1] || ''

  if (!ts || !v1) {
    return { ok: false, reason: `x-signature malformado: "${xSignature}"` }
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  if (expected !== v1) {
    console.warn(`[webhook-mp] Assinatura inválida — esperado=${expected.slice(0,16)}... recebido=${v1.slice(0,16)}...`)
    return { ok: false, reason: 'assinatura HMAC não confere — verificar MP_WEBHOOK_SECRET no Vercel' }
  }

  return { ok: true }
}

// MP faz GET para validar o endpoint na configuração
export default async function handler(req: any, res: any) {
  if (req.method === 'GET')  { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).end(); return }

  const sig = validateSignature(req)
  if (!sig.ok) {
    console.error('[webhook-mp] Assinatura rejeitada:', sig.reason)
    res.status(401).json({ error: 'Assinatura inválida', reason: sig.reason }); return
  }

  const { type, data } = req.body || {}
  console.log(`[webhook-mp] evento recebido type=${type} data.id=${data?.id}`)

  // Só processa eventos de pagamento
  if (type !== 'payment' || !data?.id) {
    res.status(200).json({ received: true, skipped: 'não é evento payment' }); return
  }

  const token = process.env.MP_ACCESS_TOKEN
  if (!token) {
    console.error('[webhook-mp] MP_ACCESS_TOKEN não configurado')
    res.status(500).json({ error: 'MP_ACCESS_TOKEN ausente' }); return
  }

  try {
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!payRes.ok) {
      console.error(`[webhook-mp] Falha ao buscar pagamento ${data.id}: HTTP ${payRes.status}`)
      res.status(200).json({ received: true }); return
    }

    const payment = await payRes.json()
    const orderId = payment.external_reference

    console.log(`[webhook-mp] payment=${data.id} status=${payment.status} order=${orderId ?? 'SEM external_reference'}`)

    if (!orderId) {
      console.warn('[webhook-mp] Sem external_reference — ignorando')
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
    const paymentMethod = methodMap[payment.payment_type_id] ?? 'outro'

    // ── Pagamento APROVADO ────────────────────────────────────────────
    if (payment.status === 'approved') {
      const { data: currentSale, error: fetchErr } = await supabase
        .from('sales')
        .select('payment_status, total, client_name')
        .eq('id', orderId)
        .single()

      if (fetchErr || !currentSale) {
        console.error(`[webhook-mp] Pedido ${orderId} não encontrado no banco:`, fetchErr?.message)
        res.status(200).json({ received: true }); return
      }

      if (currentSale.payment_status === 'pago') {
        console.log(`[webhook-mp] Pedido ${orderId} já PAGO — idempotência, ignorando`)
        res.status(200).json({ received: true }); return
      }

      const { error: updateErr } = await supabase
        .from('sales')
        .update({ payment_status: 'pago', payment_method: paymentMethod })
        .eq('id', orderId)

      if (updateErr) {
        console.error(`[webhook-mp] Erro ao atualizar pedido ${orderId}:`, updateErr.message, 'code:', updateErr.code)
        res.status(200).json({ received: true }); return
      }

      console.log(`[webhook-mp] ✅ Pedido ${orderId} marcado como PAGO via ${paymentMethod}`)

      // Baixa estoque e lança receita só aqui (única vez, após pagamento confirmado)
      const { data: saleItems } = await supabase
        .from('sale_items')
        .select('product_id, quantity, unit_price, subtotal')
        .eq('sale_id', orderId)

      if (saleItems && saleItems.length > 0) {
        const { error: invErr } = await supabase.from('inventory_movements').insert(
          saleItems.map((item: any) => ({
            product_id:      item.product_id,
            type:            'saida',
            quantity:        -Math.abs(item.quantity),
            reason:          'Pedido online pago',
            related_sale_id: orderId,
          }))
        )
        if (invErr) console.error('[webhook-mp] inventory_movements error:', invErr.message)

        // Recalcula total com preços do banco para mitigar manipulação no frontend
        const dbTotal = saleItems.reduce((s: number, i: any) => s + Number(i.subtotal ?? 0), 0)
        if (dbTotal > 0 && Math.abs(dbTotal - currentSale.total) > 0.05) {
          await supabase.from('sales').update({ total: dbTotal, subtotal: dbTotal }).eq('id', orderId)
          console.log(`[webhook-mp] Total corrigido: R$${currentSale.total} → R$${dbTotal.toFixed(2)}`)
        }
      }

      const receita = saleItems
        ? saleItems.reduce((s: number, i: any) => s + Number(i.subtotal ?? 0), 0) || payment.transaction_amount
        : currentSale.total ?? payment.transaction_amount ?? 0

      const { error: txErr } = await supabase.from('transactions').insert({
        type:            'receita',
        category:        'Venda Online',
        amount:          receita,
        description:     `Pedido #${orderId.slice(-6).toUpperCase()} — ${currentSale.client_name ?? ''}`,
        related_sale_id: orderId,
        date:            new Date().toISOString().slice(0, 10),
      })
      if (txErr) console.error('[webhook-mp] transactions error:', txErr.message)
    }

    // ── Pagamento RECUSADO / CANCELADO ────────────────────────────────
    if (payment.status === 'rejected' || payment.status === 'cancelled') {
      const { error } = await supabase
        .from('sales')
        .update({ payment_status: 'cancelado' })
        .eq('id', orderId)

      if (error) console.error('[webhook-mp] Erro ao cancelar pedido:', error.message)
      else console.log(`[webhook-mp] Pedido ${orderId} marcado como CANCELADO (${payment.status})`)
    }

  } catch (err: any) {
    console.error('[webhook-mp] Erro inesperado:', err?.message, err?.stack?.slice(0, 300))
  }

  res.status(200).json({ received: true })
}
