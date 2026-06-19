import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import type { ProductCategory } from '../../data/products'

// ── Stroke-based SVG icons (24×24, fill=none, strokeWidth=1.5) ───

const ico = (children: React.ReactNode) => (
  <svg
    viewBox="1 1 22 22"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    {children}
  </svg>
)

const IconTodos     = () => ico(<><rect x="3"  y="3"  width="7.5" height="7.5" rx="1.2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.2"/></>)
const IconCamiseta  = () => ico(<path d="M9.5 5.5Q12 8 14.5 5.5L20.5 8.5l-2 4-2.5-1V19.5H8V11.5L5.5 12.5l-2-4Z"/>)
const IconMoletom   = () => ico(<><path d="M10 5.5Q12 7 14 5.5L20 8l-2 4-2.5-1V19.5H8.5V11L6 12l-2-4Z"/><rect x="10.5" y="13.5" width="3" height="3" rx="0.8"/></>)
const IconCalcas    = () => ico(<path d="M6.5 4.5h11l1.5 9.5H15.5V20H8.5v-6H5Z"/>)
const IconShorts    = () => ico(<path d="M6.5 4.5h11l1 7.5H15.5v4H8.5v-4H5.5Z"/>)
const IconBone      = () => ico(<><path d="M4.5 14.5C4.5 9.5 7.8 5.5 12 5.5s7.5 4 7.5 9"/><rect x="3" y="14.5" width="18" height="3" rx="1.5"/></>)
const IconConjunto  = () => ico(<><path d="M10 3.5Q12 5 14 3.5l4 2.3-1.5 3-2-1v4.7H9.5V7.8L7.5 8.8 6 5.8Z"/><path d="M8.5 15h7l.8 6H14v-3.5h-4V21H8.5L8 20Z"/></>)
const IconAcessorio = () => ico(<><circle cx="8.5" cy="12.5" r="3.5"/><circle cx="15.5" cy="12.5" r="3.5"/><path d="M12 12.5h0M5 12.5L3.5 11M19 12.5L20.5 11"/></>)

// ── Data ─────────────────────────────────────────────────────────

type CatItem = { value: 'all' | ProductCategory; label: string; icon: React.ReactNode }

const CATS: CatItem[] = [
  { value: 'all',        label: 'Todos',      icon: <IconTodos /> },
  { value: 'camisetas',  label: 'Camisetas',  icon: <IconCamiseta /> },
  { value: 'moletons',   label: 'Moletons',   icon: <IconMoletom /> },
  { value: 'calcas',     label: 'Calças',     icon: <IconCalcas /> },
  { value: 'shorts',     label: 'Shorts',     icon: <IconShorts /> },
  { value: 'bones',      label: 'Bonés',      icon: <IconBone /> },
  { value: 'conjuntos',  label: 'Conjuntos',  icon: <IconConjunto /> },
  { value: 'acessorios', label: 'Acessórios', icon: <IconAcessorio /> },
]

// ── Component ─────────────────────────────────────────────────────

interface CategoriesNavProps {
  active: 'all' | ProductCategory
  onChange: (v: 'all' | ProductCategory) => void
}

export function CategoriesNav({ active, onChange }: CategoriesNavProps) {
  return (
    <div className="bg-white border-b border-ink-900/8 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 sm:gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory sm:justify-center">
          {CATS.map((cat) => {
            const isActive = active === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => onChange(cat.value)}
                className="flex-shrink-0 snap-start flex flex-col items-center gap-2 group outline-none"
                style={{ minWidth: 68 }}
                aria-pressed={isActive}
              >
                <motion.div
                  whileHover={{ scale: 1.08, y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-200',
                    isActive
                      ? 'bg-coffee-50 text-coffee-600 ring-2 ring-coffee-400 shadow-sm shadow-coffee-200'
                      : 'bg-gray-100 text-ink-600 group-hover:bg-gray-50 group-hover:text-ink-900 group-hover:shadow-md group-hover:shadow-black/8'
                  )}
                >
                  {cat.icon}
                </motion.div>
                <span className={cn(
                  'text-[11px] font-medium leading-tight transition-colors duration-150',
                  isActive ? 'text-coffee-600' : 'text-ink-400 group-hover:text-ink-700'
                )}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
