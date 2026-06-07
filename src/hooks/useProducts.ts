import { useEffect, useState } from 'react'
import { getActiveProducts } from '../lib/queries/products'
import { dbProductToPublic } from '../lib/mappers'
import { isSupabaseConfigured } from '../lib/supabase'
import { products as staticProducts } from '../data/products'
import type { Product } from '../data/products'

interface UseProductsResult {
  products: Product[]
  loading: boolean
}

export function usePublicProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setProducts(staticProducts)
      return
    }
    getActiveProducts()
      .then((data) => setProducts(data.map(dbProductToPublic)))
      .catch(() => setProducts(staticProducts))
      .finally(() => setLoading(false))
  }, [])

  return { products, loading }
}
