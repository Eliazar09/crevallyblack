import { cn } from '../../../lib/cn'

interface StockBadgeProps {
  stock: number
  minStock: number
}

export function StockBadge({ stock, minStock }: StockBadgeProps) {
  const isOut  = stock === 0
  const isLow  = !isOut && stock <= minStock

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium',
      isOut ? 'text-red-400 bg-red-400/10' :
      isLow ? 'text-amber-400 bg-amber-400/10' :
              'text-green-400 bg-green-400/10'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', isOut ? 'bg-red-400' : isLow ? 'bg-amber-400' : 'bg-green-400')} />
      {stock} {isOut ? '— Agotado' : isLow ? '— Stock bajo' : ''}
    </span>
  )
}
