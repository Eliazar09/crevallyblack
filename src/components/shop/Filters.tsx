import { Search, X } from 'lucide-react'
import type { ProductCategory } from '../../data/products'
import { cn } from '../../lib/cn'

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name'

const categoryOptions: { value: 'all' | ProductCategory; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'camisetas', label: 'Camisetas' },
  { value: 'moletons', label: 'Moletons' },
  { value: 'calcas', label: 'Calças' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'bones', label: 'Bonés' },
  { value: 'conjuntos', label: 'Conjuntos' },
  { value: 'acessorios', label: 'Acessórios' },
]

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Destaques' },
  { value: 'price-asc', label: 'Preço ↑' },
  { value: 'price-desc', label: 'Preço ↓' },
  { value: 'name', label: 'Nome' },
]

interface FiltersProps {
  search: string
  onSearchChange: (v: string) => void
  category: 'all' | ProductCategory
  onCategoryChange: (v: 'all' | ProductCategory) => void
  sort: SortOption
  onSortChange: (v: SortOption) => void
}

export function Filters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
}: FiltersProps) {
  return (
    <div className="bg-cream-50 border-b border-ink-900/8 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-3">
        {/* Search + sort row */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" strokeWidth={1.5} />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ink-900/10 bg-white text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none focus:border-coffee-500/40 transition-colors"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2.5 rounded-xl border border-ink-900/10 bg-white text-sm text-ink-900 focus:outline-none focus:border-coffee-500/40 cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onCategoryChange(opt.value)}
              className={cn(
                'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
                category === opt.value
                  ? 'bg-ink-900 text-cream-50 border-ink-900'
                  : 'bg-white text-ink-500 border-ink-900/10 hover:border-ink-900/30 hover:text-ink-900'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
