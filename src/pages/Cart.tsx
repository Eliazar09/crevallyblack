import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../lib/currency'

export default function Cart() {
  const { items, total, itemCount, removeItem, updateQuantity } = useCart()
  const navigate = useNavigate()
  const count = itemCount()

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0c] pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <Link
            to="/loja"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-ink-600 hover:text-cream-300 transition-colors mb-7 group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Continuar comprando
          </Link>
          <div className="flex items-baseline gap-5">
            <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] text-cream-50 tracking-wider leading-none">
              SEU CARRINHO
            </h1>
            {count > 0 && (
              <span className="font-mono text-sm text-ink-500 tabular-nums">
                {count} {count === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>
          <div className="h-px bg-white/8 mt-5" />
        </motion.div>

        {/* Empty state */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center justify-center py-36 gap-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full border border-white/10 bg-white/3 flex items-center justify-center"
            >
              <ShoppingBag size={26} strokeWidth={1} className="text-ink-600" />
            </motion.div>
            <div>
              <p className="font-display text-2xl text-cream-200 tracking-wider mb-2">CARRINHO VAZIO</p>
              <p className="text-sm text-ink-500">Explore o catálogo e encontre sua próxima peça</p>
            </div>
            <Link
              to="/loja"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 rounded-full text-sm text-cream-200 hover:bg-white/5 hover:border-white/30 transition-all font-medium"
            >
              Ver catálogo
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}

        {/* Cart with items */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

            {/* Items list */}
            <div className="divide-y divide-white/8">
              <AnimatePresence initial={false}>
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="flex items-center gap-5 py-7"
                  >
                    {/* Foto */}
                    <Link to={`/produto/${item.productId}`} className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-ink-800 ring-1 ring-white/5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/produto/${item.productId}`} className="block">
                        <p className="font-display text-lg sm:text-xl text-cream-100 tracking-wider leading-tight hover:text-coffee-400 transition-colors uppercase">
                          {item.name}
                        </p>
                      </Link>
                      {item.selectedOption && (
                        <p className="text-[11px] font-mono text-ink-500 mt-1 uppercase tracking-widest">
                          Tamanho — {item.selectedOption}
                        </p>
                      )}
                      <p className="font-mono text-coffee-400 text-sm mt-2">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Qtd + Remover */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                      <div className="flex items-center gap-1 border border-white/12 rounded-full bg-white/3 px-1.5 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-cream-300 hover:bg-white/10 transition-colors text-base leading-none select-none"
                        >
                          −
                        </button>
                        <span className="font-mono text-xs text-cream-100 min-w-[2ch] text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-cream-300 hover:bg-white/10 transition-colors text-base leading-none select-none"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium text-cream-100 min-w-[5.5ch] text-right tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-xl text-ink-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          aria-label="Remover"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Resumo */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="lg:sticky lg:top-28 bg-white/4 border border-white/10 rounded-3xl p-6 space-y-5 backdrop-blur-sm"
            >
              <p className="font-display text-xl text-cream-50 tracking-widest">RESUMO</p>

              <div className="space-y-2.5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-ink-400 leading-snug flex-1">
                      {item.name}
                      {item.selectedOption && (
                        <span className="text-ink-600"> ({item.selectedOption})</span>
                      )}
                      <span className="text-ink-600"> ×{item.quantity}</span>
                    </span>
                    <span className="font-mono text-cream-300 flex-shrink-0 tabular-nums">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-500">Total</span>
                <span className="font-mono text-2xl font-medium text-coffee-400 tabular-nums">
                  {formatPrice(total())}
                </span>
              </div>

              <p className="text-[11px] text-ink-600 leading-relaxed">
                Frete calculado na etapa de entrega · Envios para todo o Brasil via Correios
              </p>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-coffee-500 hover:bg-coffee-400 active:scale-[0.98] text-white font-display text-sm tracking-[0.18em] rounded-2xl transition-all flex items-center justify-center gap-3"
              >
                FINALIZAR PEDIDO
                <ArrowRight size={15} />
              </button>

              <Link
                to="/loja"
                className="block text-center text-[11px] font-mono text-ink-500 hover:text-ink-300 transition-colors uppercase tracking-widest"
              >
                Adicionar mais itens
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
