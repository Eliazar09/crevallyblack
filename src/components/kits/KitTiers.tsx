import { motion } from 'framer-motion'
import { Check, MessageCircle, Star } from 'lucide-react'
import { kits, RETAIL_PRICE_PER_KIT } from '../../data/kits'
import { buildKitWhatsAppLink } from '../../lib/whatsapp'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { cn } from '../../lib/cn'

const KIT_IMAGE = "/images/fotos de parte do site/kitImagem do WhatsApp de 2025-09-09 à(s) 23.00.14_f0e7e84f.jpg"

const TIER_COLORS = [
  { gradient: 'from-ink-900 to-ink-800',   accent: 'text-coffee-400', ring: '' },
  { gradient: 'from-ink-900 to-ink-800',   accent: 'text-coffee-400', ring: '' },
  { gradient: 'from-[#2a1a00] to-[#3d2800]', accent: 'text-coffee-400', ring: 'ring-1 ring-coffee-400/30' },
  { gradient: 'from-ink-900 to-ink-800',   accent: 'text-coffee-400', ring: '' },
  { gradient: 'from-ink-900 to-ink-800',   accent: 'text-coffee-400', ring: '' },
]

export function KitTiers() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-16">
      <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {kits.map((kit, i) => {
          const profit = RETAIL_PRICE_PER_KIT - kit.pricePerUnit
          const colors = TIER_COLORS[i] ?? TIER_COLORS[0]

          return (
            <motion.div
              key={kit.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={cn(
                'relative flex flex-col rounded-3xl border overflow-hidden',
                kit.featured
                  ? `bg-gradient-to-b ${colors.gradient} border-coffee-400/40 shadow-2xl shadow-coffee-400/10 scale-[1.03] ${colors.ring}`
                  : 'bg-ink-900/50 border-white/8 hover:border-white/20 transition-colors duration-300'
              )}
            >
              {/* Popular badge */}
              {kit.featured && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="flex items-center gap-1 bg-coffee-400 text-ink-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    <Star size={8} fill="currentColor" />Popular
                  </span>
                </div>
              )}

              {/* Image */}
              <div className={cn(
                'relative flex-shrink-0 flex items-center justify-center overflow-hidden',
                kit.featured ? 'bg-[#1a0f00]/60' : 'bg-ink-950/50'
              )}>
                <img
                  src={KIT_IMAGE}
                  alt={`Kit ${kit.tier}`}
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: 220 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <span className="text-[10px] font-mono font-bold text-coffee-400">
                    {kit.minQuantity === 1 ? '1 kit' : `${kit.minQuantity}+ kits`}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-4 gap-3.5">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-ink-500">
                  {kit.tier}
                </p>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn('font-mono text-3xl font-bold', kit.featured ? 'text-coffee-400' : 'text-cream-50')}>
                      R${kit.pricePerUnit}
                    </span>
                    <span className="text-xs text-ink-500 font-sans">/kit</span>
                  </div>
                  {kit.discount > 0 && (
                    <p className="text-[11px] text-coffee-400 font-mono mt-0.5">−{kit.discount}% desconto</p>
                  )}
                </div>

                {/* Profit highlight */}
                <div className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-xl',
                  kit.featured ? 'bg-coffee-400/10 border border-coffee-400/20' : 'bg-white/5 border border-white/5'
                )}>
                  <span className="text-[11px] text-ink-500 font-mono">Lucro/kit</span>
                  <span className="font-mono font-bold text-green-400 text-base">+R${profit}</span>
                </div>

                {/* Benefits */}
                <ul className="space-y-2 flex-1">
                  {kit.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[11px] text-cream-200/80 leading-relaxed">
                      <Check size={11} strokeWidth={2.5} className="text-coffee-400 mt-0.5 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={buildKitWhatsAppLink(kit.tier, kit.minQuantity, kit.pricePerUnit)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 mt-1',
                    kit.featured
                      ? 'bg-coffee-400 text-ink-900 hover:bg-coffee-300 shadow-lg shadow-coffee-400/20'
                      : 'bg-white/8 border border-white/10 text-cream-100 hover:bg-white/15'
                  )}
                >
                  <MessageCircle size={14} strokeWidth={2} />
                  Consultar
                </a>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
