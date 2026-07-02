import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') { res.status(405).end(); return }

  const id = String(req.query?.id ?? '').trim()
  if (!id || id.length < 10) {
    res.status(400).json({ error: 'ID inválido' }); return
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await supabase
    .from('sales')
    .select('payment_status')
    .eq('id', id)
    .single()

  if (error || !data) {
    res.status(404).json({ error: 'Pedido não encontrado' }); return
  }

  res.status(200).json({ payment_status: data.payment_status })
}
