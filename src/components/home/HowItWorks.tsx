import { motion } from 'framer-motion'
import { Search, ShoppingCart, Package } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Escolha sua peça',
    description: 'Explore o catálogo e selecione as peças que combinam com o seu estilo. Filtros por categoria, tamanho e cor.',
  },
  {
    icon: ShoppingCart,
    number: '02',
    title: 'Finalize no site',
    description: 'Adicione ao carrinho, escolha tamanho e cor, e conclua seu pedido direto aqui. Pagamento seguro pelo site.',
  },
  {
    icon: Package,
    number: '03',
    title: 'Receba em casa',
    description: 'Envios para todo o Brasil. Peças embaladas com cuidado e código de rastreio enviado por e-mail.',
  },
]

export function HowItWorks() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 md:gap-16 items-center">

          {/* Left: title */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-coffee-500 mb-3"
            >
              Como funciona
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-[clamp(2rem,3.5vw,2.8rem)] font-medium text-ink-900 tracking-tight leading-tight"
            >
              Simples, rápido e sem
              <br />
              <em className="text-coffee-600">complicação</em>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-sm text-ink-500 mt-4 leading-relaxed max-w-[28ch]"
            >
              Seu pedido chega em casa em poucos dias. Sem filas, sem complicação.
            </motion.p>
          </div>

          {/* Right: steps */}
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: 24 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.12 }}
                  className="flex items-start gap-5 p-5 rounded-2xl bg-white border border-ink-900/6 hover:border-coffee-400/20 hover:shadow-sm transition-all duration-200"
                >
                  {/* Icon + number */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: 4 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 15 }}
                      className="w-12 h-12 rounded-xl bg-ink-900/6 border border-ink-900/10 flex items-center justify-center cursor-default"
                    >
                      <Icon size={20} strokeWidth={1.5} className="text-ink-900" />
                    </motion.div>
                    <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full bg-coffee-400 flex items-center justify-center font-mono text-[9px] font-bold text-white leading-none">
                      {step.number.replace('0', '')}
                    </span>
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="font-semibold text-ink-900 text-sm leading-tight mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-ink-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
