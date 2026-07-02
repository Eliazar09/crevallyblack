import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../lib/cn'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  accent?: 'green' | 'red' | 'gold' | 'blue'
  subtitle?: string
  delay?: number
  trend?: 'up' | 'down'
}

const accents = {
  green: {
    icon:  'bg-emerald-500 shadow-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700',
    bar:   'bg-emerald-500',
    glow:  'shadow-emerald-100',
  },
  red: {
    icon:  'bg-red-500 shadow-red-200',
    badge: 'bg-red-50 text-red-600',
    bar:   'bg-red-500',
    glow:  'shadow-red-100',
  },
  gold: {
    icon:  'bg-amber-500 shadow-amber-200',
    badge: 'bg-amber-50 text-amber-700',
    bar:   'bg-amber-400',
    glow:  'shadow-amber-100',
  },
  blue: {
    icon:  'bg-blue-500 shadow-blue-200',
    badge: 'bg-blue-50 text-blue-700',
    bar:   'bg-blue-500',
    glow:  'shadow-blue-100',
  },
}

export function StatCard({ title, value, icon: Icon, accent = 'gold', subtitle, delay = 0 }: StatCardProps) {
  const a = accents[accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
    >
      {/* Colored top bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-2xl', a.bar)} />

      <div className="flex items-start justify-between pt-1">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
          <p className="font-mono text-3xl font-bold text-gray-900 tabular-nums leading-none">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className={cn(
          'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ml-3',
          a.icon
        )}>
          <Icon size={18} strokeWidth={2} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}
