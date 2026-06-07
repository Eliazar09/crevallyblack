import { supabase } from '../supabase'
import type { ProductCategory } from '../../data/products'

export interface DbProduct {
  id: string
  name: string
  short: string
  description: string
  benefits: string[]
  how_to_use: string
  image: string
  images: string[]
  options: Array<{ label: string; value: string; price?: number }> | null
  price: number
  cost_price: number | null
  category: ProductCategory
  sku: string | null
  featured: boolean
  status: 'activo' | 'inactivo' | 'agotado'
  stock_quantity: number
  min_stock: number
  created_at: string
  updated_at: string
}

export async function getProducts(filters?: {
  category?: ProductCategory | 'all'
  status?: string
  search?: string
}) {
  let q = supabase.from('products').select('*').order('created_at', { ascending: false })
  if (filters?.category && filters.category !== 'all') q = q.eq('category', filters.category)
  if (filters?.status) q = q.eq('status', filters.status)
  if (filters?.search) q = q.ilike('name', `%${filters.search}%`)
  const { data, error } = await q
  if (error) throw error
  return data as DbProduct[]
}

export async function getProductById(id: string) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) throw error
  return data as DbProduct
}

export async function getActiveProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'activo')
    .order('featured', { ascending: false })
  if (error) throw error
  return data as DbProduct[]
}

export async function createProduct(payload: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('products').insert(payload).select().single()
  if (error) throw error
  return data as DbProduct
}

export async function updateProduct(id: string, payload: Partial<DbProduct>) {
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data as DbProduct
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function uploadProductPhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('product-photos').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('product-photos').getPublicUrl(path)
  return data.publicUrl
}
