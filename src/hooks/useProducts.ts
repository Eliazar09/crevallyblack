import { create } from 'zustand'
import { getActiveProducts } from '../lib/queries/products'
import { dbProductToPublic } from '../lib/mappers'
import { isSupabaseConfigured } from '../lib/supabase'
import { products as staticProducts } from '../data/products'
import type { Product } from '../data/products'

interface ProductsStore {
  products: Product[]
  loading: boolean
  fetched: boolean
  fetch: () => Promise<void>
}

const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  loading: false,
  fetched: false,

  async fetch() {
    if (get().fetched || get().loading) return
    set({ loading: true })
    if (!isSupabaseConfigured) {
      set({ products: staticProducts, loading: false, fetched: true })
      return
    }
    try {
      const data = await getActiveProducts()
      set({ products: data.map(dbProductToPublic), loading: false, fetched: true })
    } catch {
      set({ products: staticProducts, loading: false, fetched: true })
    }
  },
}))

export function usePublicProducts() {
  const { products, loading, fetch } = useProductsStore()

  // trigger fetch on first use
  if (!useProductsStore.getState().fetched && !useProductsStore.getState().loading) {
    fetch()
  }

  return { products, loading }
}
