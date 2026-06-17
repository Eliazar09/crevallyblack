import { supabase } from '../supabase'
import type { ProductCategory } from '../../data/products'

export interface DbProduct {
  id: string
  name: string
  short: string
  description: string
  composition: string
  care: string
  model_info: string
  image: string
  images: string[]
  options: Array<{ label: string; value: string; price?: number }> | null
  price: number
  cost_price: number | null
  category: ProductCategory
  sku: string | null
  featured: boolean
  status: 'ativo' | 'inativo' | 'rascunho'
  stock_quantity: number
  min_stock: number
  sizes: string[]
  colors: string[]
  collection_id: string | null
  collection_name: string | null
  collection_slug: string | null
  created_at: string
  updated_at: string
}

const PRODUCT_SELECT = '*, collections(name, slug)'

function flattenCollection(p: any): DbProduct {
  return {
    ...p,
    collection_name: p.collections?.name ?? null,
    collection_slug: p.collections?.slug ?? null,
    collections: undefined,
  }
}

export async function getProducts(filters?: {
  category?: ProductCategory | 'all'
  status?: string
  search?: string
  collection_id?: string | 'all'
}) {
  let q = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false })

  if (filters?.category && filters.category !== 'all') q = q.eq('category', filters.category)
  if (filters?.status) q = q.eq('status', filters.status)
  if (filters?.search) q = q.ilike('name', `%${filters.search}%`)
  if (filters?.collection_id && filters.collection_id !== 'all') {
    q = q.eq('collection_id', filters.collection_id)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(flattenCollection)
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .single()
  if (error) throw error
  return flattenCollection(data)
}

export async function getActiveProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'ativo')
    .order('featured', { ascending: false })
  if (error) throw error
  return (data ?? []).map(flattenCollection)
}

export async function getActiveProductsByCollection(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'ativo')
    .eq('collections.slug', slug)
    .not('collection_id', 'is', null)
    .order('featured', { ascending: false })
  if (error) throw error
  return (data ?? []).map(flattenCollection).filter((p) => p.collection_slug === slug)
}

export async function createProduct(payload: Omit<DbProduct, 'id' | 'created_at' | 'updated_at' | 'collection_name' | 'collection_slug'>) {
  const { data, error } = await supabase.from('products').insert(payload).select(PRODUCT_SELECT).single()
  if (error) throw error
  return flattenCollection(data)
}

export async function updateProduct(id: string, payload: Partial<Omit<DbProduct, 'collection_name' | 'collection_slug'>>) {
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select(PRODUCT_SELECT).single()
  if (error) throw error
  return flattenCollection(data)
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
