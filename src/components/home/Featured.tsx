import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { getFeaturedProducts } from '../../data/products'
import { formatPrice } from '../../lib/currency'
import { useCart } from '../../hooks/useCart'

const PER_PAGE = 4

export function Featured() {
  const { ref, isInView } = useScrollReveal()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const featured = getFeaturedProducts()
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(featured.length / PER_PAGE)
  const visible = featured.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  function handleAddToCart(e: React.MouseEvent, product: (typeof featured)[0]) {
    e.preventDefault()
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

  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div ref={ref} className="flex items-end justify-between gap-6 mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-500 mb-3"
            >
              Productos destacados
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-medium text-ink-900 tracking-tight"
            >
              Los más elegidos
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Link
              to="/tienda"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-forest-800 transition-colors group mr-2"
            >
              Ver todo el catálogo
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {/* Nav arrows */}
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-9 h-9 rounded-full border border-ink-900/12 bg-white flex items-center justify-center text-ink-500 hover:border-forest-800/30 hover:text-forest-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Anterior"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-9 h-9 rounded-full border border-ink-900/12 bg-white flex items-center justify-center text-ink-500 hover:border-forest-800/30 hover:text-forest-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Siguiente"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>

        {/* Cards grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {visible.map((product, i) => {
              const price = product.options?.[0]?.price ?? product.price
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    to={`/producto/${product.id}`}
                    className="group flex flex-col rounded-2xl border border-ink-900/8 bg-white hover:border-forest-800/20 hover:shadow-lg hover:shadow-forest-800/5 overflow-hidden transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative bg-cream-100 aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-ink-900 leading-snug line-clamp-2">
                          {product.name}
                        </p>
                        <span className="font-mono text-sm font-semibold text-forest-800 whitespace-nowrap flex-shrink-0">
                          {formatPrice(price)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-ink-900/12 bg-white text-xs font-semibold text-ink-700 hover:bg-forest-800 hover:text-cream-50 hover:border-forest-800 transition-all duration-200 active:scale-[0.97]"
                      >
                        <ShoppingCart size={13} strokeWidth={1.5} />
                        Añadir al carrito
                      </button>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
