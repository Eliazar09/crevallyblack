import { supabase } from '../supabase'

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'transferencia' | 'boleto' | 'outro'
export type PaymentStatus = 'pago' | 'pendente' | 'parcial'

export const methodLabels: Record<PaymentMethod, string> = {
  pix:            'Pix',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito:  'Cartão de Débito',
  dinheiro:       'Dinheiro',
  transferencia:  'Transferência',
  boleto:         'Boleto',
  outro:          'Outro',
}

export interface SaleItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface SalePayload {
  client_id: string | null
  client_name: string
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  notes: string | null
}

export interface DbSale {
  id: string
  client_id: string | null
  client_name: string
  subtotal: number
  discount: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  notes: string | null
  created_at: string
  sale_items?: Array<{ product_name: string; quantity: number; unit_price: number; subtotal: number }>
}

export async function createSale(payload: SalePayload): Promise<string> {
  const { data: sale, error: saleErr } = await supabase
    .from('sales')
    .insert({
      client_id: payload.client_id,
      client_name: payload.client_name,
      subtotal: payload.subtotal,
      discount: payload.discount,
      total: payload.total,
      payment_method: payload.payment_method,
      payment_status: payload.payment_status,
      notes: payload.notes,
    })
    .select('id')
    .single()
  if (saleErr) throw saleErr

  const saleId = sale.id

  const items = payload.items.map((i) => ({
    sale_id: saleId,
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    unit_price: i.unit_price,
    subtotal: i.subtotal,
  }))
  const { error: itemsErr } = await supabase.from('sale_items').insert(items)
  if (itemsErr) throw itemsErr

  const movements = payload.items.map((i) => ({
    product_id: i.product_id,
    type: 'saida',
    quantity: -Math.abs(i.quantity),
    reason: 'Venda',
    related_sale_id: saleId,
  }))
  const { error: movErr } = await supabase.from('inventory_movements').insert(movements)
  if (movErr) throw movErr

  for (const item of payload.items) {
    const { data: prod } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single()
    if (prod) {
      await supabase.from('products')
        .update({ stock_quantity: Math.max(0, prod.stock_quantity - item.quantity) })
        .eq('id', item.product_id)
    }
  }

  const { error: txErr } = await supabase.from('transactions').insert({
    type: 'receita',
    category: 'Venda',
    amount: payload.total,
    description: `Venda #${saleId.slice(-6)} — ${payload.client_name}`,
    related_sale_id: saleId,
    date: new Date().toISOString().slice(0, 10),
  })
  if (txErr) throw txErr

  return saleId
}

export async function getSales(filters?: { from?: string; to?: string }) {
  let q = supabase.from('sales').select('*, sale_items(product_name,quantity,unit_price,subtotal)')
    .order('created_at', { ascending: false })
  if (filters?.from) q = q.gte('created_at', filters.from)
  if (filters?.to)   q = q.lte('created_at', filters.to)
  const { data, error } = await q
  if (error) throw error
  return data as DbSale[]
}

export async function deleteSale(id: string) {
  const { error } = await supabase.from('sales').delete().eq('id', id)
  if (error) throw error
}
