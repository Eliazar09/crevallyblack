import { supabase } from '../supabase'

export interface Transaction {
  id: string
  type: 'receita' | 'despesa'
  category: string
  amount: number
  description: string | null
  related_sale_id: string | null
  created_at: string
}

export interface MonthlyFinance {
  month: string
  receitas: number
  despesas: number
  lucro: number
}

export async function getTransactions(filters?: { type?: string; from?: string; to?: string }) {
  let q = supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(200)
  if (filters?.type) q = q.eq('type', filters.type)
  if (filters?.from) q = q.gte('date', filters.from)
  if (filters?.to)   q = q.lte('date', filters.to)
  const { data, error } = await q
  if (error) throw error
  return data as Transaction[]
}

export async function getMonthlyFinance(): Promise<MonthlyFinance[]> {
  const { data, error } = await supabase.from('v_monthly_finance').select('*').order('month', { ascending: true })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    month: r.month,
    receitas: Number(r.receitas ?? r.ingresos ?? 0),
    despesas: Number(r.despesas ?? r.egresos ?? 0),
    lucro: Number(r.lucro ?? r.ganancia ?? 0),
  }))
}

export async function createTransaction(payload: {
  type: 'receita' | 'despesa'
  category: string
  amount: number
  description: string
}) {
  const { error } = await supabase.from('transactions').insert({
    ...payload,
    date: new Date().toISOString().slice(0, 10),
  })
  if (error) throw error
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}

export async function getFinanceSummary() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data } = await supabase.from('transactions').select('type,amount').gte('date', from.slice(0,10))
  const rows = data ?? []
  const receitas = rows.filter((r) => r.type === 'receita').reduce((s, r) => s + r.amount, 0)
  const despesas = rows.filter((r) => r.type === 'despesa').reduce((s, r) => s + r.amount, 0)
  return { receitas, despesas, lucro: receitas - despesas }
}
