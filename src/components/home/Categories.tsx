import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shirt, Layers, Columns2, PersonStanding, HardHat, Package, Gem, ArrowUpRight } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { categories } from '../../data/categories'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Shirt, Layers, Columns2, PersonStanding, HardHat, Package, Gem,
}

const colSpans = [
  'col-span-1 md:col-span-3',
  'col-span-1 md:col-span-3',
  'col-span-1 md:col-span-2',
  'col-span-1 md:col-span-2',
  'col-span-1 md:col-span-2',
  'col-span-1 md:col-span-3',
  'col-span-2 md:col-span-3',
]

const gradients = [
  { bg: 'from-neutral-50 to-stone-50',    icon: 'bg-neutral-100 text-neutral-700',  accent: 'text-neutral-600' },
  { bg: 'from-stone-50 to-amber-50',      icon: 'bg-stone-100 text-stone-700',      accent: 'text-stone-600' },
  { bg: 'from-slate-50 to-zinc-50',       icon: 'bg-slate-100 text-slate-700',      accent: 'text-slate-600' },
  { bg: 'from-amber-50 to-orange-50',     icon: 'bg-amber-100 text-amber-700',      accent: 'text-amber-600' },
  { bg: 'from-zinc-50 to-neutral-50',     icon: 'bg-zinc-100 text-zinc-700',        accent: 'text-zinc-600' },
  { bg: 'from-orange-50 to-amber-50',     icon: 'bg-orange-100 text-orange-700',    accent: 'text-orange-600' },
  { bg: 'from-stone-50 to-neutral-50',    icon: 'bg-stone-100 text-stone-600',      accent: 'text-stone-500' },
]

export function Categories() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-coffee-500 mb-3"
          >
            Categorias
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(2rem,4vw,3rem)] font-medium text-ink-900 tracking-tight"
          >
            Tudo que você precisa
            <br />
            para vestir <em className="text-coffee-600">bem</em>
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon]
            const g = gradients[i]
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className={colSpans[i]}
              >
                <Link
                  to={`/loja?categoria=${cat.id}`}
                  className={`group flex flex-col justify-between p-5 md:p-6 rounded-2xl bg-gradient-to-br ${g.bg} border border-ink-900/6 hover:border-ink-900/12 hover:shadow-lg hover:shadow-ink-900/6 transition-all duration-300 min-h-[150px] md:min-h-[170px] overflow-hidden`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${g.icon} transition-transform duration-300 group-hover:scale-110`}>
                      {Icon && <Icon size={22} strokeWidth={1.5} />}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -4, y: 4 }}
                      whileHover={{ opacity: 1, x: 0, y: 0 }}
                      className={`${g.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                    >
                      <ArrowUpRight size={18} strokeWidth={1.5} />
                    </motion.div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-bold text-ink-900 group-hover:text-ink-700 transition-colors leading-tight">
                      {cat.label}
                    </p>
                    <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
