import { supabase } from '../supabase'

export interface DbCollection {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  active: boolean
  show_on_home: boolean
  created_at: string
  product_count?: number
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Admin: lista todas + contagem de produtos
export async function getCollections(): Promise<DbCollection[]> {
  const [{ data: cols, error }, { data: counts }] = await Promise.all([
    supabase.from('collections').select('*').order('sort_order').order('name'),
    supabase.from('products').select('collection_id').not('collection_id', 'is', null),
  ])
  if (error) throw error

  const countMap: Record<string, number> = {}
  for (const p of counts ?? []) {
    if (p.collection_id) countMap[p.collection_id] = (countMap[p.collection_id] ?? 0) + 1
  }

  return (cols ?? []).map((c) => ({ ...c, product_count: countMap[c.id] ?? 0 }))
}

// Loja: só ativas, ordenadas
export async function getActiveCollections(): Promise<DbCollection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('active', true)
    .order('sort_order')
    .order('name')
  if (error) throw error
  return data ?? []
}

// Home: coleções ativas marcadas para aparecer na home
export async function getHomeCollections(): Promise<DbCollection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('active', true)
    .eq('show_on_home', true)
    .order('sort_order')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getCollectionBySlug(slug: string): Promise<DbCollection> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  if (error) throw error
  return data
}

export async function createCollection(
  payload: Omit<DbCollection, 'id' | 'created_at' | 'product_count'>,
): Promise<DbCollection> {
  const { data, error } = await supabase.from('collections').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateCollection(
  id: string,
  payload: Partial<Omit<DbCollection, 'id' | 'created_at' | 'product_count'>>,
): Promise<DbCollection> {
  const { data, error } = await supabase.from('collections').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCollection(id: string): Promise<void> {
  // Desvincula produtos antes de deletar (ON DELETE SET NULL garante isso,
  // mas fazemos explicitamente para clareza)
  await supabase.from('products').update({ collection_id: null }).eq('collection_id', id)
  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) throw error
}
