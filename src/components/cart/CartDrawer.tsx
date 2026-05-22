import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { CartItem } from './CartItem'
import { CheckoutForm } from './CheckoutForm'
import { Button } from '../ui/Button'
import { formatPrice } from '../../lib/currency'

export function CartDrawer() {
  const { items, isOpen, closeCart, total, itemCount } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)

  const count = itemCount()
  const totalAmount = total()

  function handleClose() {
    closeCart()
    setShowCheckout(false)
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
            className="relative w-full max-w-md bg-forest-900 border-l border-white/10 flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} strokeWidth={1.5} className="text-gold-400" />
                <h2 className="font-display text-lg font-semibold text-cream-50">
                  Tu carrito
                </h2>
                {count > 0 && (
                  <span className="font-mono text-xs text-ink-500">({count} ítems)</span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-cream-200"
                aria-label="Cerrar carrito"
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
                    <p className="text-sm font-medium text-cream-200 mb-1">Tu carrito está vacío</p>
                    <p className="text-xs text-ink-500">Explora el catálogo y añade productos</p>
                  </div>
                  <Button onClick={handleClose} as="a" href="/tienda" variant="ghost" size="sm">
                    Ver catálogo
                    <ArrowRight size={14} />
                  </Button>
                </div>
              ) : showCheckout ? (
                <CheckoutForm
                  onBack={() => setShowCheckout(false)}
                  onClose={handleClose}
                />
              ) : (
                <div className="divide-y divide-white/8">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && !showCheckout && (
              <div className="p-5 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-500">Total</span>
                  <span className="font-mono text-xl font-medium text-gold-400 tabular-nums">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <Button
                  onClick={() => setShowCheckout(true)}
                  size="md"
                  variant="primary"
                  className="w-full justify-center"
                >
                  Finalizar pedido
                  <ArrowRight size={16} />
                </Button>
                <p className="text-center text-xs text-ink-500">
                  Pago en efectivo · Envíos a toda Venezuela
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
