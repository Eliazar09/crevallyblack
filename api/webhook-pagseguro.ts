import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const event = req.body

  // PagSeguro envia { id, reference_id, charges: [{ status }] }
  const charge = event?.charges?.[0]
  if (charge?.status === 'PAID') {
    const orderId = event.reference_id
    await supabase
      .from('sales')
      .update({ payment_status: 'pago' })
      .eq('id', orderId)
  }

  res.status(200).json({ received: true })
}
