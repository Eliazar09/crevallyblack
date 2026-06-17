import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { CartItem } from './CartItem'
import { Button } from '../ui/Button'
import { formatPrice } from '../../lib/currency'

export function CartDrawer() {
  const { items, isOpen, closeCart, total, itemCount } = useCart()
  const navigate = useNavigate()

  const count = itemCount()
  const totalAmount = total()

  function handleClose() {
    closeCart()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-ink-900 border-l border-white/10 flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} strokeWidth={1.5} className="text-coffee-400" />
                <h2 className="font-display text-lg font-semibold text-cream-50">
                  Seu carrinho
                </h2>
                {count > 0 && (
                  <span className="font-mono text-xs text-ink-500">({count} {count === 1 ? 'item' : 'itens'})</span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-cream-200"
                aria-label="Fechar carrinho"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-5 py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <ShoppingBag size={24} strokeWidth={1} className="text-ink-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream-200 mb-1">Seu carrinho está vazio</p>
                    <p className="text-xs text-ink-500">Explore o catálogo e adicione produtos</p>
                  </div>
                  <Button onClick={handleClose} as="a" href="/loja" variant="ghost" size="sm">
                    Ver catálogo
                    <ArrowRight size={14} />
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-white/8">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-500">Total</span>
                  <span className="font-mono text-xl font-medium text-coffee-400 tabular-nums">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <Button
                  onClick={() => { handleClose(); navigate('/carrinho') }}
                  size="md"
                  variant="primary"
                  className="w-full justify-center"
                >
                  Finalizar pedido
                  <ArrowRight size={16} />
                </Button>
                <p className="text-center text-xs text-ink-500">
                  Pix · Cartão · Transferência · Envios para todo o Brasil
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
