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
  green: 'text-green-400 bg-green-400/10 border-green-400/20',
  red:   'text-red-400 bg-red-400/10 border-red-400/20',
  gold:  'text-gold-400 bg-gold-400/10 border-gold-400/20',
  blue:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
}

export function StatCard({ title, value, icon: Icon, accent = 'gold', subtitle, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl bg-forest-900/60 border border-white/5 backdrop-blur-sm p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-ink-500">{title}</p>
        <div className={cn('p-2 rounded-xl border', accents[accent])}>
          <Icon size={14} strokeWidth={1.8} />
        </div>
      </div>
      <p className="font-mono text-2xl font-semibold text-cream-50 tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
    </motion.div>
  )
}
