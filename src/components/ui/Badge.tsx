import { cn } from '../../lib/cn'
import type { ProductCategory } from '../../data/products'

const categoryLabels: Record<ProductCategory, string> = {
  camisetas: 'Camisetas',
  moletons: 'Moletons',
  calcas: 'Calças',
  shorts: 'Shorts',
  bones: 'Bonés',
  conjuntos: 'Conjuntos',
  acessorios: 'Acessórios',
}

const categoryColors: Record<ProductCategory, string> = {
  camisetas:   'bg-ink-900 text-cream-50 border-transparent',
  moletons:    'bg-coffee-700 text-cream-50 border-transparent',
  calcas:      'bg-stone-700 text-cream-50 border-transparent',
  shorts:      'bg-amber-600 text-amber-950 border-transparent',
  bones:       'bg-zinc-600 text-cream-50 border-transparent',
  conjuntos:   'bg-coffee-500 text-ink-900 border-transparent',
  acessorios:  'bg-slate-500 text-cream-50 border-transparent',
}

const lightCategoryColors: Record<ProductCategory, string> = {
  camisetas:   'bg-ink-900/10 text-ink-800 border-ink-900/20',
  moletons:    'bg-coffee-100 text-coffee-800 border-coffee-200',
  calcas:      'bg-stone-100 text-stone-800 border-stone-200',
  shorts:      'bg-amber-100 text-amber-800 border-amber-200',
  bones:       'bg-zinc-100 text-zinc-800 border-zinc-200',
  conjuntos:   'bg-coffee-50 text-coffee-700 border-coffee-200',
  acessorios:  'bg-slate-100 text-slate-800 border-slate-200',
}

interface BadgeProps {
  category: ProductCategory
  light?: boolean
  className?: string
}

export function CategoryBadge({ category, light = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border',
        light ? lightCategoryColors[category] : categoryColors[category],
        className
      )}
    >
      {categoryLabels[category]}
    </span>
  )
}

interface GenericBadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className }: GenericBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border border-white/10 bg-white/5 text-cream-200',
        className
      )}
    >
      {children}
    </span>
  )
}
