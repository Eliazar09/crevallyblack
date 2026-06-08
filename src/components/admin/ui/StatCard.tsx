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
}

const accents = {
  green: { wrap: 'text-emerald-600 bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' },
  red:   { wrap: 'text-red-500 bg-red-50 border-red-200',             bar: 'bg-red-500' },
  gold:  { wrap: 'text-amber-600 bg-amber-50 border-amber-200',       bar: 'bg-amber-400' },
  blue:  { wrap: 'text-blue-600 bg-blue-50 border-blue-200',          bar: 'bg-blue-500' },
}

export function StatCard({ title, value, icon: Icon, accent = 'gold', subtitle, delay = 0 }: StatCardProps) {
  const a = accents[accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-4 relative overflow-hidden"
    >
      <div className={cn('absolute top-0 left-0 w-1 h-full rounded-l-2xl', a.bar)} />
      <div className="flex items-center justify-between pl-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <div className={cn('p-2.5 rounded-xl border', a.wrap)}>
          <Icon size={15} strokeWidth={1.8} />
        </div>
      </div>
      <div className="pl-2">
        <p className="font-mono text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  )
}
