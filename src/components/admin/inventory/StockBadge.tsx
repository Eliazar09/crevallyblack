import { cn } from '../../../lib/cn'

interface StockBadgeProps {
  stock: number
  minStock: number
}

export function StockBadge({ stock, minStock }: StockBadgeProps) {
  const isOut = stock === 0
  const isLow = !isOut && stock <= minStock

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
      isOut ? 'text-red-600 bg-red-50 border border-red-200' :
      isLow ? 'text-amber-700 bg-amber-50 border border-amber-200' :
              'text-emerald-700 bg-emerald-50 border border-emerald-200'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full',
        isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
      )} />
      {stock} {isOut ? '— Agotado' : isLow ? '— Stock bajo' : ''}
    </span>
  )
}
