import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { TrendingUp, Package, Users, MessageCircle, Leaf, Star } from 'lucide-react'
import { KitTiers } from '../components/kits/KitTiers'
import { ProfitCalculator } from '../components/kits/ProfitCalculator'
import { buildDirectWhatsAppLink } from '../lib/whatsapp'
import { useScrollReveal } from '../hooks/useScrollReveal'

const whyReasons = [
  {
    icon: Package,
    title: 'Productos con demanda real',
    description:
      'Suplementos que la gente ya busca. Sin convencer a nadie: el mercado de bienestar crece cada año.',
  },
  {
    icon: TrendingUp,
    title: 'Márgenes de hasta 40%',
    description:
      'Cuanto más compras, mayor es tu descuento. Un modelo de negocio transparente y escalable.',
  },
  {
    icon: Users,
    title: 'Soporte real de Jennifer',
    description:
      'No estás solo. Recibes apoyo directo, material de marketing y estrategias de venta probadas.',
  },
  {
    icon: Star,
    title: 'Marca con historia',
    description:
      'GreenLife lleva más de 3 años construyendo confianza. Tus clientes ya conocen la marca.',
  },
]

export default function Kits() {
  const { ref, isInView } = useScrollReveal()

  return (
    <div className="min-h-[100dvh] bg-forest-950">
      <Helmet>
        <title>Mayorista — GreenLife</title>
        <meta name="description" content="Programa mayorista GreenLife. Revende suplementos naturales de alta demanda con márgenes de hasta 40%. Kits de inversión para distribuidores en Venezuela." />
      </Helmet>
      {/* Hero */}
      <div className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold-500/8 blur-[120px]" />
        </div>
        <div className="grain-overlay" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="section-eyebrow mb-4"
            >
              Programa mayorista
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light text-cream-50 leading-tight tracking-tight mb-6"
            >
              Sé parte de la familia
              <br />
              <em className="text-gold-400">GreenLife</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-ink-500 text-lg leading-relaxed mb-8"
            >
              Revende productos naturales de alta demanda con márgenes reales.
              Elige tu tier y comienza a construir tu propio negocio hoy.
            </motion.p>
            <motion.a
              href={buildDirectWhatsAppLink('Quiero información sobre los kits mayoristas de GreenLife')}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1fb855] transition-colors active:scale-95"
            >
              <MessageCircle size={16} strokeWidth={2} />
              Hablar con Jennifer por WhatsApp
            </motion.a>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="mb-10">
          <p className="section-eyebrow mb-3">Tiers de inversión</p>
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-medium text-cream-50 tracking-tight">
            Escoge tu nivel de entrada
          </h2>
        </div>
        <KitTiers />
      </div>

      {/* Calculator */}
      <div className="bg-forest-900/30 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ProfitCalculator />
        </div>
      </div>

      {/* Why section */}
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="mb-12">
          <p className="section-eyebrow mb-3">Por qué elegir GreenLife</p>
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-medium text-cream-50 tracking-tight">
            Un negocio que ya tiene tracción
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {whyReasons.map((reason, i) => {
            const Icon = reason.icon
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-forest-900/40 p-6 space-y-4"
              >
                <div className="p-2.5 rounded-xl bg-gold-400/10 border border-gold-400/15 w-fit">
                  <Icon size={18} strokeWidth={1.5} className="text-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-cream-100 text-sm mb-2">{reason.title}</h3>
                  <p className="text-xs text-ink-500 leading-relaxed">{reason.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Final CTA */}
      <div className="border-t border-white/8 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center mx-auto mb-6">
            <Leaf size={20} strokeWidth={1.5} className="text-gold-400" />
          </div>
          <h2 className="font-display text-3xl font-medium text-cream-50 mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-ink-500 mb-8 leading-relaxed">
            Escribe a Jennifer directamente por WhatsApp. Te responde en minutos
            con toda la información que necesitas para empezar.
          </p>
          <a
            href={buildDirectWhatsAppLink('Hola Jennifer! Quiero ser distribuidor/a de GreenLife. ¿Me das información sobre los kits?')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#25D366] text-white font-semibold text-base hover:bg-[#1fb855] transition-colors active:scale-95"
          >
            <MessageCircle size={18} strokeWidth={2} />
            Escribir a Jennifer
          </a>
        </div>
      </div>
    </div>
  )
}
