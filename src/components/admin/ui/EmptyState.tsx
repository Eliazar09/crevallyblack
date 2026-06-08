import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="p-4 rounded-2xl bg-gray-100 border border-gray-200">
        <Icon size={26} className="text-gray-400" strokeWidth={1.2} />
      </div>
      <div>
        <p className="font-semibold text-gray-700 mb-0.5">{title}</p>
        {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  )
}
