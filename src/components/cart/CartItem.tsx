import { Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '../../hooks/useCart'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../lib/currency'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart()

  return (
    <div className="flex items-start gap-3 p-4">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-ink-800/30 flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-cream-100 line-clamp-2 leading-snug">
          {item.name}
        </p>
        {item.selectedOption && (
          <p className="text-xs text-ink-500 mt-0.5">{item.selectedOption}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 border border-white/10 rounded-full px-1 py-0.5">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-cream-200 hover:bg-white/10 transition-colors text-sm"
            >
              −
            </button>
            <span className="font-mono text-xs text-cream-100 min-w-[1.5ch] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-cream-200 hover:bg-white/10 transition-colors text-sm"
            >
              +
            </button>
          </div>
          <span className="font-mono text-sm font-medium text-coffee-400 tabular-nums">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>

      <button
        onClick={() => removeItem(item.id)}
        className="p-1.5 rounded-lg text-ink-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        aria-label="Remover"
      >
        <Trash2 size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}
