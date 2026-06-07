import type { DbProduct } from './queries/products'
import type { Product } from '../data/products'

export function dbProductToPublic(p: DbProduct): Product {
  return {
    id: p.id,
    name: p.name,
    short: p.short,
    description: p.description,
    benefits: p.benefits ?? [],
    howToUse: p.how_to_use,
    image: p.image,
    price: p.price,
    category: p.category,
    featured: p.featured,
    options: p.options ?? undefined,
  }
}
