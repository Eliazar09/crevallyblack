import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/8">
        <Icon size={28} className="text-ink-500" strokeWidth={1.2} />
      </div>
      <div>
        <p className="font-display text-base text-cream-200 mb-1">{title}</p>
        {description && <p className="text-sm text-ink-500 max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  )
}
