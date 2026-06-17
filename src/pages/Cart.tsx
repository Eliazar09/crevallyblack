import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Trash2, ShoppingBag,
  ShieldCheck, Lock, RefreshCw, Truck, CreditCard, Tag,
} from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../lib/currency'

// ── Trust badge ────────────────────────────────────────────────────

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="w-9 h-9 rounded-full bg-ink-900/5 flex items-center justify-center text-ink-600">
        {icon}
      </div>
      <span className="text-[10px] font-mono text-ink-500 leading-tight max-w-[7ch]">{label}</span>
    </div>
  )
}

// ── Payment methods ────────────────────────────────────────────────

function PayBadge({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 rounded-lg border border-ink-900/10 bg-gray-50 text-[10px] font-mono text-ink-600 uppercase tracking-wider">
      {label}
    </span>
  )
}

const categoryLabels: Record<string, string> = {
  camisetas: 'Camiseta',
  moletons: 'Moletom',
  calcas: 'Calça',
  shorts: 'Shorts',
  bones: 'Boné',
  conjuntos: 'Conjunto',
  acessorios: 'Acessório',
}

// ── Cart page ──────────────────────────────────────────────────────

export default function Cart() {
  const { items, total, itemCount, removeItem, updateQuantity } = useCart()
  const navigate = useNavigate()
  const count = itemCount()

  return (
    <div className="min-h-[100dvh] bg-cream-50 pt-24 pb-24">
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
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-ink-900 transition-colors mb-7 group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Continuar comprando
          </Link>
          <div className="flex items-baseline gap-5">
            <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] text-ink-900 tracking-wider leading-none">
              SEU CARRINHO
            </h1>
            {count > 0 && (
              <span className="font-mono text-sm text-ink-400 tabular-nums">
                {count} {count === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>
          <div className="h-px bg-ink-900/8 mt-5" />
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
              className="w-20 h-20 rounded-full border border-ink-900/10 bg-white flex items-center justify-center shadow-sm"
            >
              <ShoppingBag size={26} strokeWidth={1} className="text-ink-400" />
            </motion.div>
            <div>
              <p className="font-display text-2xl text-ink-900 tracking-wider mb-2">CARRINHO VAZIO</p>
              <p className="text-sm text-ink-500">Explore o catálogo e encontre sua próxima peça</p>
            </div>
            <Link
              to="/loja"
              className="inline-flex items-center gap-2 px-6 py-3 border border-ink-900/15 rounded-full text-sm text-ink-700 hover:bg-ink-900/5 hover:border-ink-900/30 transition-all font-medium"
            >
              Ver catálogo
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}

        {/* Cart with items */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">

            {/* Items list */}
            <div className="bg-white rounded-3xl shadow-sm shadow-ink-900/5 border border-ink-900/6 divide-y divide-ink-900/6 overflow-hidden">
              <AnimatePresence initial={false}>
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="flex items-center gap-5 px-6 py-6"
                  >
                    {/* Foto */}
                    <Link to={`/produto/${item.productId}`} className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-100 ring-1 ring-ink-900/6">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Badges: categoria + coleção */}
                      {(item.category || item.collection_name) && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {item.category && (
                            <span className="px-2 py-0.5 rounded-md bg-coffee-50 border border-coffee-200 text-coffee-700 text-[10px] font-mono uppercase tracking-wider">
                              {categoryLabels[item.category] ?? item.category}
                            </span>
                          )}
                          {item.collection_name && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-ink-900/5 border border-ink-900/10 text-ink-600 text-[10px] font-mono uppercase tracking-wider">
                              <Tag size={9} strokeWidth={2} />
                              {item.collection_name}
                            </span>
                          )}
                        </div>
                      )}

                      <Link to={`/produto/${item.productId}`} className="block">
                        <p className="font-display text-lg sm:text-xl text-ink-900 tracking-wider leading-tight hover:text-coffee-600 transition-colors uppercase">
                          {item.name}
                        </p>
                      </Link>
                      {item.selectedOption && (
                        <p className="text-[11px] font-mono text-ink-400 mt-1 uppercase tracking-widest">
                          Tamanho — {item.selectedOption}
                        </p>
                      )}
                      <p className="font-mono text-coffee-600 text-sm mt-1.5 font-medium">
                        {formatPrice(item.price)}
                        {item.quantity > 1 && (
                          <span className="text-ink-400 text-[11px] ml-1.5">/ unidade</span>
                        )}
                      </p>
                    </div>

                    {/* Qtd + Remover */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                      <div className="flex items-center gap-1 border border-ink-900/10 rounded-full bg-gray-50 px-1.5 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-ink-600 hover:bg-ink-900/8 transition-colors text-base leading-none select-none"
                        >
                          −
                        </button>
                        <span className="font-mono text-xs text-ink-900 min-w-[2ch] text-center tabular-nums font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-ink-600 hover:bg-ink-900/8 transition-colors text-base leading-none select-none"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-ink-900 min-w-[5.5ch] text-right tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-xl text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
              className="lg:sticky lg:top-28 space-y-4"
            >
              {/* Order summary card */}
              <div className="bg-white border border-ink-900/8 rounded-3xl p-6 shadow-sm shadow-ink-900/5 space-y-5">
                <p className="font-display text-xl text-ink-900 tracking-widest">RESUMO</p>

                <div className="space-y-2.5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
                      <span className="text-ink-500 leading-snug flex-1">
                        {item.name}
                        {item.selectedOption && (
                          <span className="text-ink-400"> ({item.selectedOption})</span>
                        )}
                        <span className="text-ink-400"> ×{item.quantity}</span>
                      </span>
                      <span className="font-mono text-ink-700 flex-shrink-0 tabular-nums font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-ink-900/8" />

                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-ink-500">Total</span>
                  <span className="font-mono text-2xl font-semibold text-coffee-600 tabular-nums">
                    {formatPrice(total())}
                  </span>
                </div>

                <p className="text-[11px] text-ink-400 leading-relaxed">
                  Frete calculado na etapa de entrega · Envios para todo o Brasil via Correios
                </p>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-coffee-500 hover:bg-coffee-400 active:scale-[0.98] text-white font-display text-sm tracking-[0.18em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-md shadow-coffee-500/25"
                >
                  FINALIZAR PEDIDO
                  <ArrowRight size={15} />
                </button>

                <Link
                  to="/loja"
                  className="block text-center text-[11px] font-mono text-ink-400 hover:text-ink-700 transition-colors uppercase tracking-widest"
                >
                  Adicionar mais itens
                </Link>
              </div>

              {/* Trust badges */}
              <div className="bg-white border border-ink-900/8 rounded-3xl p-5 shadow-sm shadow-ink-900/5">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={14} strokeWidth={1.5} className="text-green-600" />
                  <p className="text-[11px] font-mono uppercase tracking-widest text-ink-500">
                    Compra 100% segura
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-5">
                  <TrustBadge icon={<Lock size={15} strokeWidth={1.5} />} label="SSL criptografado" />
                  <TrustBadge icon={<ShieldCheck size={15} strokeWidth={1.5} />} label="Dados protegidos" />
                  <TrustBadge icon={<RefreshCw size={15} strokeWidth={1.5} />} label="Troca em 7 dias" />
                  <TrustBadge icon={<Truck size={15} strokeWidth={1.5} />} label="Todo o Brasil" />
                </div>

                <div className="h-px bg-ink-900/6 mb-4" />

                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={13} strokeWidth={1.5} className="text-ink-400" />
                  <p className="text-[11px] font-mono text-ink-400 uppercase tracking-wider">
                    Formas de pagamento
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PayBadge label="PIX" />
                  <PayBadge label="Cartão" />
                  <PayBadge label="Transferência" />
                </div>
              </div>

              {/* Policies */}
              <div className="bg-white border border-ink-900/8 rounded-3xl px-5 py-4 shadow-sm shadow-ink-900/5 space-y-2.5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-ink-400 mb-3">Políticas</p>
                {[
                  'Troca e devolução em até 7 dias corridos',
                  'Prazo de entrega: 5 a 12 dias úteis',
                  'Rastreio enviado por WhatsApp após postagem',
                  'Pagamento processado com segurança via PagBank',
                ].map((text) => (
                  <div key={text} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-coffee-400 flex-shrink-0 mt-1.5" />
                    <p className="text-[11px] text-ink-500 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
