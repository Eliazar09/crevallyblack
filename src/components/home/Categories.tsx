import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Droplets, Dumbbell, Sparkles, Moon, Pill, Shield, ArrowUpRight } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { categories } from '../../data/categories'

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Flame, Droplets, Dumbbell, Sparkles, Moon, Pill, Shield,
}

// Bento: 6-col grid — row 1: 3+3 | row 2: 2+2+2 | row 3: 3+3
// Mobile 2-col: 1+1 | 1+1 | 1+1 | full (last)
const colSpans = [
  'col-span-1 md:col-span-3',  // Adelgazamiento
  'col-span-1 md:col-span-3',  // Detox
  'col-span-1 md:col-span-2',  // Fitness
  'col-span-1 md:col-span-2',  // Belleza
  'col-span-1 md:col-span-2',  // Descanso
  'col-span-1 md:col-span-3',  // Vitaminas
  'col-span-2 md:col-span-3',  // Masculino
]

const gradients = [
  { bg: 'from-amber-50 to-orange-50',   icon: 'bg-amber-100 text-amber-700',   accent: 'text-amber-600' },
  { bg: 'from-emerald-50 to-teal-50',   icon: 'bg-emerald-100 text-emerald-700', accent: 'text-emerald-600' },
  { bg: 'from-sky-50 to-blue-50',       icon: 'bg-sky-100 text-sky-700',       accent: 'text-sky-600' },
  { bg: 'from-rose-50 to-pink-50',      icon: 'bg-rose-100 text-rose-700',     accent: 'text-rose-600' },
  { bg: 'from-violet-50 to-indigo-50',  icon: 'bg-violet-100 text-violet-700', accent: 'text-violet-600' },
  { bg: 'from-lime-50 to-green-50',     icon: 'bg-lime-100 text-lime-700',     accent: 'text-lime-600' },
  { bg: 'from-slate-50 to-zinc-50',     icon: 'bg-slate-100 text-slate-600',   accent: 'text-slate-500' },
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
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-500 mb-3"
          >
            Categorías
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(2rem,4vw,3rem)] font-medium text-ink-900 tracking-tight"
          >
            Todo lo que necesitas
            <br />
            para estar <em className="text-forest-800">bien</em>
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
                  to={`/tienda?categoria=${cat.id}`}
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
