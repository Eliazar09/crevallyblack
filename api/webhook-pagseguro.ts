import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const config = { api: { bodyParser: false } }

function readRawBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (c: any) => { data += c })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).end(); return }

  const rawBody = await readRawBody(req)

  const token = process.env.PAGSEGURO_TOKEN!
  const signature = req.headers['x-authenticity-token']
  const expected = crypto.createHash('sha256').update(`${token}-${rawBody}`).digest('hex')

  if (signature && signature !== expected) {
    console.error('Webhook: assinatura inválida', { signature, expected })
    res.status(401).json({ error: 'invalid signature' }); return
  }

  const event = JSON.parse(rawBody)
  const charge = event?.charges?.[0]

  if (charge?.status === 'PAID') {
    const orderId = event.reference_id
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data, error } = await supabase
      .from('sales')
      .update({ payment_status: 'pago' })
      .eq('id', orderId)
      .select()

    if (error) {
      console.error('Supabase erro ao atualizar pedido:', error)
      res.status(500).json({ error }); return
    }
    if (!data?.length) {
      console.error('Webhook: nenhuma venda encontrada com id =', orderId)
    }
  }

  res.status(200).json({ received: true })
}
