import { supabase } from '../supabase'

export interface DbClient {
  id: string
  name: string
  phone: string | null
  email: string | null
  cedula: string | null
  city: string | null
  type: 'cliente' | 'distribuidor' | 'mayorista'
  notes: string | null
  created_at: string
  updated_at: string
}

export type ClientType = 'cliente' | 'distribuidor' | 'mayorista'
export type ClientInsert = Omit<DbClient, 'id' | 'created_at' | 'updated_at'>

export async function getClients(search?: string) {
  let q = supabase.from('clients').select('*').order('created_at', { ascending: false })
  if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%,cedula.ilike.%${search}%`)
  const { data, error } = await q
  if (error) throw error
  return data as DbClient[]
}

export async function createClient(payload: ClientInsert) {
  const { data, error } = await supabase.from('clients').insert(payload).select().single()
  if (error) throw error
  return data as DbClient
}

export async function updateClient(id: string, payload: Partial<ClientInsert>) {
  const { data, error } = await supabase.from('clients').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data as DbClient
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}
