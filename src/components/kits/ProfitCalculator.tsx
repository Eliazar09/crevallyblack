import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { kits, RETAIL_PRICE_PER_KIT, calculateProfit } from '../../data/kits'
import { cn } from '../../lib/cn'

export function ProfitCalculator() {
  const [selectedKitId, setSelectedKitId] = useState('k3')
  const [quantity, setQuantity] = useState(20)

  const kit = kits.find((k) => k.id === selectedKitId) ?? kits[2]
  const { investment, revenue, profit, margin } = calculateProfit(kit, quantity)

  return (
    <div className="rounded-3xl border border-white/10 bg-ink-900/60 p-8 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-coffee-400/10 border border-coffee-400/20">
          <TrendingUp size={20} strokeWidth={1.5} className="text-coffee-400" />
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-coffee-500">Calculadora</p>
          <h3 className="font-display text-xl font-semibold text-cream-50">
            Quanto você pode ganhar?
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-ink-500">Tier</label>
          <div className="flex flex-col gap-2">
            {kits.map((k) => (
              <button
                key={k.id}
                onClick={() => {
                  setSelectedKitId(k.id)
                  setQuantity(k.minQuantity)
                }}
                className={cn(
                  'flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all',
                  selectedKitId === k.id
                    ? 'border-coffee-400/40 bg-coffee-400/8 text-coffee-400'
                    : 'border-white/10 text-cream-200/70 hover:border-white/20 hover:text-cream-100'
                )}
              >
                <span className="font-medium">{k.tier}</span>
                <span className="font-mono text-xs">R${k.pricePerUnit}/kit</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-ink-500">
              Quantidade: <span className="text-cream-100">{quantity} kits</span>
            </label>
            <input
              type="range"
              min={kit.minQuantity}
              max={200}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-coffee-400"
            />
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Investimento', value: `R$${investment}`, color: 'text-red-400' },
              { label: 'Receita estimada', value: `R$${revenue}`, color: 'text-cream-100' },
              { label: 'Lucro líquido', value: `R$${profit}`, color: 'text-green-400', large: true },
              { label: 'Margem', value: `${margin}%`, color: 'text-coffee-400' },
            ].map((item) => (
              <div key={item.label} className={cn('flex justify-between items-center py-2 border-b border-white/8', item.large && 'border-b-0 pt-2')}>
                <span className="text-xs text-ink-500">{item.label}</span>
                <motion.span
                  key={`${item.value}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('font-mono font-medium tabular-nums', item.large ? 'text-2xl' : 'text-sm', item.color)}
                >
                  {item.value}
                </motion.span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-500 italic">
        * Estimativa baseada no preço de venda sugerido de R${RETAIL_PRICE_PER_KIT}/kit. Os resultados reais variam conforme mercado e volume de vendas.
      </p>
    </div>
  )
}
