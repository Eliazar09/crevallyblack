import { cn } from '../../lib/cn'
import type { ProductCategory } from '../../data/products'

const categoryLabels: Record<ProductCategory, string> = {
  adelgazamiento: 'Adelgazamiento',
  detox: 'Detox',
  fitness: 'Fitness',
  belleza: 'Belleza',
  descanso: 'Descanso',
  vitaminas: 'Vitaminas',
  masculino: 'Masculino',
}

const categoryColors: Record<ProductCategory, string> = {
  adelgazamiento: 'bg-amber-500 text-amber-950 border-transparent',
  detox: 'bg-emerald-500 text-emerald-950 border-transparent',
  fitness: 'bg-sky-500 text-sky-950 border-transparent',
  belleza: 'bg-rose-400 text-rose-950 border-transparent',
  descanso: 'bg-violet-500 text-violet-950 border-transparent',
  vitaminas: 'bg-lime-500 text-lime-950 border-transparent',
  masculino: 'bg-slate-400 text-slate-950 border-transparent',
}

const lightCategoryColors: Record<ProductCategory, string> = {
  adelgazamiento: 'bg-amber-100 text-amber-800 border-amber-200',
  detox: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  fitness: 'bg-blue-100 text-blue-800 border-blue-200',
  belleza: 'bg-rose-100 text-rose-800 border-rose-200',
  descanso: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  vitaminas: 'bg-green-100 text-green-800 border-green-200',
  masculino: 'bg-slate-100 text-slate-800 border-slate-200',
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
