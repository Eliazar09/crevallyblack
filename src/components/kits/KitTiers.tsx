import { motion } from 'framer-motion'
import { Check, MessageCircle, Package } from 'lucide-react'
import { kits, RETAIL_PRICE_PER_KIT } from '../../data/kits'
import { buildKitWhatsAppLink } from '../../lib/whatsapp'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { cn } from '../../lib/cn'

const kitImages: Record<string, string[]> = {
  k1: ['/images/products/product-p1.jpg', '/images/products/product-p4.jpg'],
  k2: ['/images/products/product-p1.jpg', '/images/products/product-p2.jpg', '/images/products/product-p4.jpg'],
  k3: ['/images/products/product-p1.jpg', '/images/products/product-p2.jpg', '/images/products/product-p3.jpg', '/images/products/product-p4.jpg'],
  k4: ['/images/products/product-p1.jpg', '/images/products/product-p2.jpg', '/images/products/product-p3.jpg', '/images/products/product-p5.jpg', '/images/products/product-p6.jpg'],
  k5: ['/images/products/product-p1.jpg', '/images/products/product-p2.jpg', '/images/products/product-p3.jpg', '/images/products/product-p4.jpg', '/images/products/product-p5.jpg', '/images/products/product-p6.jpg'],
}

export function KitTiers() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-16">
      <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kits.map((kit, i) => {
          const profit = RETAIL_PRICE_PER_KIT - kit.pricePerUnit
          const images = kitImages[kit.id] ?? []

          return (
            <motion.div
              key={kit.id}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.09 }}
              className={cn(
                'relative flex flex-col rounded-2xl border overflow-hidden',
                kit.featured
                  ? 'bg-gold-400/5 border-gold-400/40 ring-1 ring-gold-400/20'
                  : 'bg-forest-900/40 border-white/10'
              )}
            >
              {/* Popular badge */}
              {kit.featured && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gold-400 text-forest-950 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    Popular
                  </span>
                </div>
              )}

              {/* Product images mosaic */}
              <div className="relative h-28 overflow-hidden bg-forest-950/60 flex-shrink-0">
                {images.length === 1 && (
                  <img src={images[0]} alt="" className="w-full h-full object-cover opacity-80" />
                )}
                {images.length === 2 && (
                  <div className="grid grid-cols-2 h-full">
                    {images.map((src, j) => (
                      <img key={j} src={src} alt="" className="w-full h-full object-cover opacity-80" />
                    ))}
                  </div>
                )}
                {images.length === 3 && (
                  <div className="grid grid-cols-3 h-full">
                    {images.map((src, j) => (
                      <img key={j} src={src} alt="" className="w-full h-full object-cover opacity-80" />
                    ))}
                  </div>
                )}
                {images.length >= 4 && (
                  <div className="grid grid-cols-4 h-full">
                    {images.slice(0, 4).map((src, j) => (
                      <img key={j} src={src} alt="" className="w-full h-full object-cover opacity-80" />
                    ))}
                  </div>
                )}

                {/* Dark overlay + product count */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/20 to-transparent" />
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-forest-950/70 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <Package size={9} className="text-gold-400" />
                  <span className="text-[9px] font-mono text-gold-400 font-bold">
                    {kit.minQuantity === 1 ? '1 kit' : `${kit.minQuantity}+ kits`}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5 gap-4">
                <div>
                  <p className="section-eyebrow mb-1">{kit.tier}</p>
                  <p className="font-display text-2xl font-medium text-cream-50">
                    <span className="font-mono text-gold-400">${kit.pricePerUnit}</span>
                    <span className="text-sm font-sans text-ink-500 font-normal ml-1">/kit</span>
                  </p>
                  {kit.discount > 0 && (
                    <p className="font-mono text-xs text-moss-400 mt-0.5">
                      −{kit.discount}% descuento
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-ink-500 font-mono">Ganancia por kit:</p>
                  <p className="font-mono text-lg font-medium text-green-400">
                    +${profit}
                  </p>
                </div>

                <ul className="space-y-2 flex-1">
                  {kit.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-cream-200/80">
                      <Check size={12} strokeWidth={2.5} className="text-moss-400 mt-0.5 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                <a
                  href={buildKitWhatsAppLink(kit.tier, kit.minQuantity, kit.pricePerUnit)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95',
                    kit.featured
                      ? 'bg-gold-400 text-forest-950 hover:bg-gold-300'
                      : 'bg-white/5 border border-white/10 text-cream-100 hover:bg-white/10'
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
