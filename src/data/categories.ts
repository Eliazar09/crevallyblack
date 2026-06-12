import type { ProductCategory } from './products'

export interface Category {
  id: ProductCategory
  label: string
  description: string
  icon: string
  color: string
}

export const categories: Category[] = [
  {
    id: 'camisetas',
    label: 'Camisetas',
    description: 'Oversized, cropped e básicas',
    icon: 'Shirt',
    color: 'from-neutral-800/30 to-neutral-900/10',
  },
  {
    id: 'moletons',
    label: 'Moletons',
    description: 'Streetwear de alto peso',
    icon: 'Layers',
    color: 'from-coffee-800/30 to-coffee-900/10',
  },
  {
    id: 'calcas',
    label: 'Calças',
    description: 'Cargo, wide leg e jogger',
    icon: 'Columns2',
    color: 'from-neutral-700/30 to-neutral-800/10',
  },
  {
    id: 'shorts',
    label: 'Shorts',
    description: 'Treino e lifestyle',
    icon: 'PersonStanding',
    color: 'from-coffee-700/30 to-coffee-800/10',
  },
  {
    id: 'bones',
    label: 'Bonés',
    description: 'Snapback e dad hat',
    icon: 'HardHat',
    color: 'from-neutral-600/30 to-neutral-700/10',
  },
  {
    id: 'conjuntos',
    label: 'Conjuntos',
    description: 'Looks completos da marca',
    icon: 'Package',
    color: 'from-coffee-600/30 to-coffee-700/10',
  },
  {
    id: 'acessorios',
    label: 'Acessórios',
    description: 'Meias, bolsas e mais',
    icon: 'Gem',
    color: 'from-neutral-500/30 to-neutral-600/10',
  },
]
