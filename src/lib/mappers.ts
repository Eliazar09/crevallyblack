import type { DbProduct } from './queries/products'
import type { Product } from '../data/products'

export function dbProductToPublic(p: DbProduct): Product {
  return {
    id: p.id,
    name: p.name,
    short: p.short,
    description: p.description,
    composition: p.composition ?? '',
    care: p.care ?? '',
    model_info: p.model_info ?? '',
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    image: p.image,
    price: p.price,
    category: p.category,
    featured: p.featured,
  }
}
