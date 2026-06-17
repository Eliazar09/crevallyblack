import { Trash2, Tag } from 'lucide-react'
import type { CartItem as CartItemType } from '../../hooks/useCart'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../lib/currency'

const categoryLabels: Record<string, string> = {
  camisetas: 'Camiseta',
  moletons: 'Moletom',
  calcas: 'Calça',
  shorts: 'Shorts',
  bones: 'Boné',
  conjuntos: 'Conjunto',
  acessorios: 'Acessório',
}

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart()
  const catLabel = item.category ? categoryLabels[item.category] ?? item.category : null

  return (
    <div className="flex items-start gap-3 p-4">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-ink-800/30 flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Badges */}
        {(catLabel || item.collection_name) && (
          <div className="flex flex-wrap items-center gap-1 mb-1">
            {catLabel && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-coffee-400/15 text-coffee-300 text-[9px] font-mono uppercase tracking-wider">
                {catLabel}
              </span>
            )}
            {item.collection_name && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/8 text-ink-400 text-[9px] font-mono uppercase tracking-wider">
                <Tag size={7} strokeWidth={2} />
                {item.collection_name}
              </span>
            )}
          </div>
        )}

        <p className="text-sm font-medium text-cream-100 line-clamp-2 leading-snug">
          {item.name}
        </p>

        {item.selectedOption && (
          <p className="text-[10px] font-mono text-ink-500 mt-0.5 uppercase tracking-widest">
            Tam. {item.selectedOption}
          </p>
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
          <div className="text-right">
            <span className="font-mono text-sm font-medium text-coffee-400 tabular-nums block">
              {formatPrice(item.price * item.quantity)}
            </span>
            {item.quantity > 1 && (
              <span className="font-mono text-[9px] text-ink-600 tabular-nums">
                {formatPrice(item.price)} / un
              </span>
            )}
          </div>
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
