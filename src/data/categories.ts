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
    id: 'adelgazamiento',
    label: 'Adelgazamiento',
    description: 'Control del peso y apetito',
    icon: 'Flame',
    color: 'from-amber-800/30 to-amber-900/10',
  },
  {
    id: 'detox',
    label: 'Detox',
    description: 'Purificación y limpieza',
    icon: 'Droplets',
    color: 'from-emerald-800/30 to-emerald-900/10',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    description: 'Rendimiento y músculo',
    icon: 'Dumbbell',
    color: 'from-blue-800/30 to-blue-900/10',
  },
  {
    id: 'belleza',
    label: 'Belleza',
    description: 'Piel, cabello y uñas',
    icon: 'Sparkles',
    color: 'from-rose-800/30 to-rose-900/10',
  },
  {
    id: 'descanso',
    label: 'Descanso',
    description: 'Sueño y relajación',
    icon: 'Moon',
    color: 'from-indigo-800/30 to-indigo-900/10',
  },
  {
    id: 'vitaminas',
    label: 'Vitaminas',
    description: 'Nutrición y salud',
    icon: 'Pill',
    color: 'from-forest-700/30 to-forest-900/10',
  },
  {
    id: 'masculino',
    label: 'Masculino',
    description: 'Salud del hombre',
    icon: 'Shield',
    color: 'from-slate-700/30 to-slate-900/10',
  },
]
