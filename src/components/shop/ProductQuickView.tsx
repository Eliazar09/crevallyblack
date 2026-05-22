import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Check } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { CategoryBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { Product } from '../../data/products'
import { formatPrice } from '../../lib/currency'
import { useCart } from '../../hooks/useCart'
import { cn } from '../../lib/cn'

interface ProductQuickViewProps {
  product: Product | null
  onClose: () => void
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    product?.options?.[0]?.value
  )
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  if (!product) return null

  const activeOption = product.options?.find((o) => o.value === selectedOption)
  const price = activeOption?.price ?? product.price

  function handleAdd() {
    addItem({
      productId: product!.id,
      name: product!.name,
      image: product!.image,
      price,
      quantity,
      selectedOption: activeOption?.label,
    })
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      onClose()
    }, 1200)
  }

  return (
    <Modal isOpen={!!product} onClose={onClose} size="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {/* Image */}
        <div className="aspect-square bg-forest-800/30 rounded-tl-3xl rounded-bl-none sm:rounded-bl-3xl rounded-tr-3xl sm:rounded-tr-none overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <CategoryBadge category={product.category} />
          <h2 className="font-display text-xl font-semibold text-cream-50 leading-snug">
            {product.name}
          </h2>
          <p className="text-sm text-ink-500 leading-relaxed">
            {product.short}
          </p>

          {/* Options */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-ink-500">Opción</p>
              <div className="flex flex-wrap gap-2">
                {product.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedOption(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      selectedOption === opt.value
                        ? 'border-gold-400 bg-gold-400/10 text-gold-400'
                        : 'border-white/10 text-cream-200/70 hover:border-white/20'
                    )}
                  >
                    {opt.label}
                    {opt.price && <span className="ml-1.5 font-mono">${opt.price}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price + qty */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
            <span className="font-mono text-2xl font-medium text-gold-400 tabular-nums">
              {formatPrice(price)}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-white/10 rounded-full px-1 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-cream-200 hover:bg-white/10 transition-colors"
                >
                  −
                </button>
                <span className="font-mono text-sm text-cream-100 min-w-[1.5ch] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-cream-200 hover:bg-white/10 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <Button onClick={handleAdd} size="md" variant="primary" className="w-full justify-center">
            {added ? (
              <>
                <Check size={16} />
                Añadido al carrito
              </>
            ) : (
              <>
                <ShoppingBag size={16} strokeWidth={1.5} />
                Añadir al carrito
              </>
            )}
          </Button>

          <Link
            to={`/producto/${product.id}`}
            onClick={onClose}
            className="text-center text-xs text-ink-500 hover:text-cream-200 transition-colors flex items-center justify-center gap-1"
          >
            Ver página completa
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </Modal>
  )
}
