import { supabase } from '../supabase'

export interface InventoryMovement {
  id: string
  product_id: string
  product_name?: string
  type: 'entrada' | 'salida' | 'ajuste'
  quantity: number
  reason: string | null
  related_sale_id: string | null
  created_at: string
}

export interface LowStockProduct {
  id: string
  name: string
  stock_quantity: number
  min_stock: number
  category: string
}

export async function getLowStock() {
  const { data, error } = await supabase.from('v_low_stock').select('*')
  if (error) throw error
  return data as LowStockProduct[]
}

export async function getMovements(productId?: string) {
  let q = supabase
    .from('inventory_movements')
    .select('*, products(name)')
    .order('created_at', { ascending: false })
    .limit(100)
  if (productId) q = q.eq('product_id', productId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map((m: any) => ({
    ...m,
    product_name: m.products?.name ?? '—',
  })) as InventoryMovement[]
}

export async function createMovement(payload: {
  product_id: string
  type: 'entrada' | 'salida' | 'ajuste'
  quantity: number
  reason: string
}) {
  const qty = payload.type === 'salida' ? -Math.abs(payload.quantity) : Math.abs(payload.quantity)
  const { error } = await supabase.from('inventory_movements').insert({
    product_id: payload.product_id,
    type: payload.type,
    quantity: qty,
    reason: payload.reason,
  })
  if (error) throw error
}
