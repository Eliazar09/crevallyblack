import { useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Eye, Leaf, ShoppingCart, Sparkles } from 'lucide-react'
import type { Product } from '../../data/products'
import { formatPrice } from '../../lib/currency'
import { useCart } from '../../hooks/useCart'

const categoryLabels: Record<string, string> = {
  adelgazamiento: 'Adelgazamiento',
  detox: 'Detox',
  fitness: 'Fitness',
  belleza: 'Belleza',
  descanso: 'Descanso',
  vitaminas: 'Vitaminas',
  masculino: 'Masculino',
}

interface ProductCardProps {
  product: Product
  dark?: boolean
  onQuickView?: (product: Product) => void
}

export function ProductCard({ product, dark = false, onQuickView }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()
  const navigate = useNavigate()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-0.5, 0.5], ['3deg', '-3deg'])
  const rotateY = useTransform(x, [-0.5, 0.5], ['-4deg', '4deg'])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) / rect.width)
    y.set((e.clientY - (rect.top + rect.height / 2)) / rect.height)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (product.options && product.options.length > 0) {
      navigate(`/producto/${product.id}`)
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
    })
  }

  const price = product.options?.[0]?.price ?? product.price
  const shortBenefits = product.benefits.slice(0, 2).map((b) =>
    b.split(' ').slice(0, 3).join(' ')
  )

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="h-full"
    >
      <div
        className={`group flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-300 ${
          dark
            ? 'bg-forest-900 border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-black/30'
            : 'bg-white border-ink-900/8 hover:border-ink-900/15 hover:shadow-xl hover:shadow-ink-900/8'
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-100 flex-shrink-0">
          <Link to={`/producto/${product.id}`}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle dark gradient at bottom for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </Link>

          {/* Category badge — white pill top-left */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-ink-900 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
              <Leaf size={10} className="text-forest-700" strokeWidth={2} />
              {categoryLabels[product.category] ?? product.category}
            </span>
          </div>

          {/* Quick view — top right */}
          {onQuickView && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product) }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-ink-600 hover:bg-white hover:text-ink-900 transition-all shadow-sm opacity-0 group-hover:opacity-100"
              aria-label="Vista rápida"
            >
              <Eye size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-3">

          {/* Name + Price */}
          <div className="flex items-start justify-between gap-2">
            <Link to={`/producto/${product.id}`} className="flex-1 min-w-0">
              <h3 className={`font-semibold text-[14px] leading-snug line-clamp-2 hover:opacity-75 transition-opacity ${dark ? 'text-cream-100' : 'text-ink-900'}`}>
                {product.name}
              </h3>
            </Link>
            <div className="flex-shrink-0 text-right">
              <span className={`font-mono text-sm font-bold tabular-nums ${dark ? 'text-gold-400' : 'text-forest-800'}`}>
                {formatPrice(price)}
              </span>
              {product.options && product.options.length > 0 && (
                <p className="text-[10px] text-ink-500 leading-none mt-0.5">desde</p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-[12px] text-ink-700 leading-relaxed line-clamp-2">
            {product.short}
          </p>

          {/* Metadata dividers row */}
          <div className={`flex items-center text-[11px] font-medium border-t pt-3 ${dark ? 'border-white/8 text-cream-200' : 'border-ink-900/8 text-ink-700'}`}>
            <div className="flex items-center gap-1.5 flex-1">
              <Leaf size={11} strokeWidth={2} className={dark ? 'text-moss-300' : 'text-forest-700'} />
              <span>Natural</span>
            </div>
            <div className={`w-px h-3 mx-2 ${dark ? 'bg-white/20' : 'bg-ink-900/15'}`} />
            <div className="flex items-center gap-1.5 flex-1 justify-center">
              <ShoppingCart size={11} strokeWidth={2} />
              <span>{product.options && product.options.length > 0 ? 'Variantes' : 'Un tamaño'}</span>
            </div>
            {product.featured && (
              <>
                <div className={`w-px h-3 mx-2 ${dark ? 'bg-white/20' : 'bg-ink-900/15'}`} />
                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  <Sparkles size={11} strokeWidth={2} className="text-amber-500" />
                  <span className="text-amber-600">Popular</span>
                </div>
              </>
            )}
          </div>

          {/* Benefit tags */}
          <div className="flex flex-wrap gap-1.5">
            {shortBenefits.map((b, i) => (
              <span
                key={i}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${dark ? 'bg-white/8 text-cream-100 border-white/10' : 'bg-cream-100 text-ink-700 border-ink-900/10'}`}
              >
                {b}
              </span>
            ))}
          </div>

          {/* CTA button */}
          <button
            onClick={handleAddToCart}
            className={`mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 ${
              dark
                ? 'bg-gold-400 text-forest-950 hover:bg-gold-300'
                : 'bg-forest-950 text-cream-50 hover:bg-forest-800'
            }`}
          >
            <ShoppingCart size={14} strokeWidth={1.5} />
            Añadir al carrito
          </button>
        </div>
      </div>
    </motion.div>
  )
}
