import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { cn } from '../../lib/cn'

type TabKey = 'producto' | 'uso' | 'ingredientes'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'producto', label: 'Info del Producto' },
  { key: 'uso', label: 'Cómo Usarlo' },
  { key: 'ingredientes', label: 'Ingredientes' },
]

const faqs: Record<TabKey, { q: string; a: string }[]> = {
  producto: [
    {
      q: '¿Para quién están diseñados estos suplementos?',
      a: 'Nuestros suplementos están diseñados para hombres y mujeres que buscan mejorar su bienestar diario, ya sea adelgazar, desintoxicar el cuerpo, ganar energía o fortalecer su salud en general.',
    },
    {
      q: '¿Son seguros para el consumo diario?',
      a: 'Sí. Todos nuestros productos están formulados con ingredientes 100% naturales, sin conservantes artificiales ni colorantes. Son seguros para el consumo diario siguiendo las dosis recomendadas.',
    },
    {
      q: '¿Cuándo empezaré a ver resultados?',
      a: 'Los resultados varían según cada persona y el producto. En general, nuestros clientes reportan cambios visibles entre 2 y 4 semanas de uso constante, especialmente en energía y bienestar general.',
    },
    {
      q: '¿Puedo combinarlo con otros suplementos?',
      a: 'En la mayoría de los casos sí. Sin embargo, si estás tomando medicamentos recetados, te recomendamos consultar con tu médico antes de combinar cualquier suplemento.',
    },
  ],
  uso: [
    {
      q: '¿Cómo debo tomar los suplementos?',
      a: 'Cada producto incluye sus instrucciones específicas. En general, se recomienda tomar con agua al momento de una de las comidas principales para una mejor absorción.',
    },
    {
      q: '¿Puedo tomarlo en ayunas?',
      a: 'Depende del producto. Los suplementos de detox y algunos de adelgazamiento funcionan mejor en ayunas. Los de vitaminas y proteínas se recomiendan con alimentos.',
    },
    {
      q: '¿Qué pasa si olvido una dosis?',
      a: 'No hay problema. Simplemente continúa con tu dosis habitual en el siguiente horario. No tomes doble dosis para compensar.',
    },
    {
      q: '¿Cuánto tiempo debo tomar el producto?',
      a: 'Recomendamos ciclos mínimos de 30 días para notar resultados sólidos. Muchos de nuestros clientes mantienen el uso de forma continua como parte de su rutina de bienestar.',
    },
  ],
  ingredientes: [
    {
      q: '¿Contienen aditivos o conservantes artificiales?',
      a: 'No. Todos los productos GreenLife están formulados sin conservantes artificiales, sin colorantes sintéticos y sin gluten. Ingredientes limpios, resultados reales.',
    },
    {
      q: '¿Son aptos para veganos?',
      a: 'La mayoría de nuestros productos son aptos para veganos. Te recomendamos revisar la etiqueta de cada producto o consultarnos directamente por WhatsApp para confirmar.',
    },
    {
      q: '¿De dónde provienen los ingredientes?',
      a: 'Utilizamos ingredientes de origen natural, seleccionados por su calidad y concentración activa. Priorizamos materias primas certificadas para garantizar la eficacia de cada fórmula.',
    },
    {
      q: '¿Contienen azúcar añadida?',
      a: 'No. Nuestras fórmulas no contienen azúcar añadida. Algunos productos tienen edulcorantes naturales como stevia para mejorar su sabor sin impacto glucémico.',
    },
  ],
}

export function FAQ() {
  const { ref, isInView } = useScrollReveal()
  const [activeTab, setActiveTab] = useState<TabKey>('producto')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const items = faqs[activeTab]

  return (
    <section className="py-24 bg-cream-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-500 mb-3"
          >
            Preguntas frecuentes
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(2rem,4vw,3rem)] font-medium text-ink-900 tracking-tight"
          >
            Todo lo que necesitas
            <br />
            <em className="text-forest-800">saber</em>
          </motion.h2>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mt-8 flex-wrap"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setOpenIndex(0) }}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                  activeTab === tab.key
                    ? 'bg-forest-800 text-cream-50 border-forest-800'
                    : 'bg-white text-ink-500 border-ink-900/10 hover:border-forest-800/20 hover:text-ink-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Content: image + accordion */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          {/* Left: photo */}
          <div className="relative rounded-3xl overflow-hidden bg-forest-100 aspect-[4/5] lg:aspect-auto lg:h-[540px]">
            <img
              src="/images/fotos de parte do site/footer.png"
              alt="Suplementos GreenLife — bienestar natural"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/20 to-transparent" />
            {/* Floating stat card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur rounded-2xl p-4 flex items-center gap-4 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-forest-800/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🌿</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">+5.000 clientes satisfechos</p>
                <p className="text-xs text-ink-500">Resultados reales en toda Venezuela</p>
              </div>
            </div>
          </div>

          {/* Right: accordion */}
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                {items.map((item, i) => {
                  const isOpen = openIndex === i
                  return (
                    <div
                      key={i}
                      className={cn(
                        'rounded-2xl border transition-all duration-200 overflow-hidden',
                        isOpen
                          ? 'border-forest-800/20 bg-white shadow-sm shadow-forest-800/5'
                          : 'border-ink-900/8 bg-white hover:border-forest-800/15'
                      )}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                      >
                        <span className={cn(
                          'text-sm font-semibold leading-snug transition-colors',
                          isOpen ? 'text-forest-800' : 'text-ink-900'
                        )}>
                          {item.q}
                        </span>
                        <span className={cn(
                          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200',
                          isOpen
                            ? 'bg-forest-800 text-cream-50'
                            : 'bg-ink-900/6 text-ink-500'
                        )}>
                          {isOpen
                            ? <Minus size={13} strokeWidth={2.5} />
                            : <Plus size={13} strokeWidth={2.5} />
                          }
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
                          >
                            <p className="px-5 pb-5 text-sm text-ink-500 leading-relaxed">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
