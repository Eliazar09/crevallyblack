import { useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Eye, ShoppingCart, Sparkles } from 'lucide-react'
import type { Product } from '../../data/products'
import { formatPrice } from '../../lib/currency'
import { useCart } from '../../hooks/useCart'

const categoryLabels: Record<string, string> = {
  camisetas: 'Camisetas',
  moletons: 'Moletons',
  calcas: 'Calças',
  shorts: 'Shorts',
  bones: 'Bonés',
  conjuntos: 'Conjuntos',
  acessorios: 'Acessórios',
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
    if (product.sizes && product.sizes.length > 0) {
      navigate(`/produto/${product.id}`)
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
      category: product.category,
      collection_name: product.collection_name,
    })
  }

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
            ? 'bg-ink-800 border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-black/30'
            : 'bg-white border-ink-900/8 hover:border-ink-900/15 hover:shadow-xl hover:shadow-ink-900/8'
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-100 flex-shrink-0">
          <Link to={`/produto/${product.id}`}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </Link>

          {/* Badges row — category left, collection right */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
            <span className="inline-flex items-center bg-white/95 backdrop-blur-sm text-ink-900 text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-sm">
              {categoryLabels[product.category] ?? product.category}
            </span>
            {product.collection_name && (
              <span className="inline-flex items-center bg-coffee-500/90 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                {product.collection_name}
              </span>
            )}
          </div>

          {/* Quick view */}
          {onQuickView && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product) }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-ink-600 hover:bg-white hover:text-ink-900 transition-all shadow-sm opacity-0 group-hover:opacity-100"
              aria-label="Visualização rápida"
            >
              <Eye size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2 sm:gap-3">

          {/* Name + Price */}
          <div className="flex items-start justify-between gap-2">
            <Link to={`/produto/${product.id}`} className="flex-1 min-w-0">
              <h3 className={`font-semibold text-[13px] sm:text-[14px] leading-snug line-clamp-2 hover:opacity-75 transition-opacity ${dark ? 'text-cream-100' : 'text-ink-900'}`}>
                {product.name}
              </h3>
            </Link>
            <div className="flex-shrink-0 text-right">
              <span className={`font-mono text-sm font-bold tabular-nums ${dark ? 'text-coffee-400' : 'text-coffee-600'}`}>
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-[11px] sm:text-[12px] text-ink-700 leading-relaxed line-clamp-2">
            {product.short}
          </p>

          {/* Sizes + featured row */}
          <div className={`hidden sm:flex items-center text-[11px] font-medium border-t pt-3 ${dark ? 'border-white/8 text-cream-200' : 'border-ink-900/8 text-ink-700'}`}>
            <div className="flex items-center gap-1.5 flex-1">
              <ShoppingCart size={11} strokeWidth={2} />
              <span>{product.sizes && product.sizes.length > 0 ? product.sizes.slice(0, 4).join(' · ') : 'Único'}</span>
            </div>
            {product.featured && (
              <>
                <div className={`w-px h-3 mx-2 ${dark ? 'bg-white/20' : 'bg-ink-900/15'}`} />
                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  <Sparkles size={11} strokeWidth={2} className="text-amber-500" />
                  <span className="text-amber-600">Destaque</span>
                </div>
              </>
            )}
          </div>

          {/* Color tags */}
          {product.colors && product.colors.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1.5">
              {product.colors.slice(0, 3).map((c, i) => (
                <span
                  key={i}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${dark ? 'bg-white/8 text-cream-100 border-white/10' : 'bg-cream-100 text-ink-700 border-ink-900/10'}`}
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* CTA button */}
          <button
            onClick={handleAddToCart}
            className={`mt-auto w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 ${
              dark
                ? 'bg-coffee-400 text-white hover:bg-coffee-300'
                : 'bg-ink-900 text-cream-50 hover:bg-ink-700'
            }`}
          >
            <ShoppingCart size={13} strokeWidth={1.5} />
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </motion.div>
  )
}
