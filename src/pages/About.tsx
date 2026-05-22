import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Leaf, Sparkles, Heart, Users, Package, Calendar, FlaskConical } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { buildDirectWhatsAppLink } from '../lib/whatsapp'

const values = [
  {
    icon: Leaf,
    title: 'Naturalmente puro',
    description:
      'Sin conservantes, sin colorantes artificiales. Cada producto nace de ingredientes seleccionados con criterio y respeto por el cuerpo humano.',
  },
  {
    icon: Sparkles,
    title: 'Calidad comprobada',
    description:
      'Formulaciones desarrolladas con tecnología de punta y respaldadas por evidencia científica. No ofrecemos promesas vacías.',
  },
  {
    icon: Heart,
    title: 'Comunidad primero',
    description:
      'GreenLife nació de una necesidad real en Venezuela. Cada venta es una relación de confianza, no solo una transacción.',
  },
]

const stats = [
  { value: '+5.000', label: 'Clientes satisfechos', icon: Users },
  { value: '+30', label: 'Productos activos', icon: Package },
  { value: '3', label: 'Años de experiencia', icon: Calendar },
  { value: '100%', label: 'Ingredientes naturales', icon: FlaskConical },
]

export default function About() {
  const { ref: valuesRef, isInView: valuesInView } = useScrollReveal()
  const { ref: statsRef, isInView: statsInView } = useScrollReveal()

  return (
    <div className="min-h-[100dvh]">
      <Helmet>
        <title>Acerca de GreenLife — Bienestar Natural desde Venezuela</title>
        <meta name="description" content="GreenLife nació en Venezuela con una misión simple: bienestar natural accesible. Más de 3 años, +5000 clientes y 30 productos formulados con ingredientes naturales." />
      </Helmet>
      {/* Hero editorial: dark section, split layout */}
      <div className="bg-forest-950 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="section-eyebrow"
            >
              Nuestra historia
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light text-cream-50 tracking-tight leading-tight"
            >
              Bienestar que nace
              <br />
              de la <em className="text-gold-400">tierra</em>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 text-ink-500 text-[17px] leading-relaxed"
            >
              <p>
                GreenLife nació de una convicción sencilla: que la naturaleza tiene
                las respuestas que la industria farmacéutica complica. Jennifer, su
                fundadora, comenzó investigando suplementos naturales después de
                transformar su propio bienestar con ellos.
              </p>
              <p>
                Lo que empezó como recomendaciones a amigas y familiares en Caracas
                se convirtió en una comunidad de más de 5.000 venezolanas que confían
                en GreenLife para cuidar su cuerpo cada día.
              </p>
              <p>
                Hoy ofrecemos más de 30 productos formulados con ingredientes de
                origen natural, sin atajos y sin promesas vacías. Solo resultados
                reales para personas reales.
              </p>
            </motion.div>
          </div>

          {/* Image collage */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img src="/images/products/about-1.jpg" alt="Productos naturales GreenLife" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img src="/images/products/about-2.jpg" alt="GreenLife bienestar natural" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
            <div className="space-y-3 pt-8">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img src="/images/products/about-3.jpg" alt="GreenLife comunidad Venezuela" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img src="/images/products/about-4.jpg" alt="GreenLife suplementos naturales" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-cream-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={valuesRef} className="mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              animate={valuesInView ? { opacity: 1 } : {}}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-moss-500 mb-3"
            >
              Nuestros valores
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-[clamp(2rem,4vw,3rem)] font-medium text-ink-900 tracking-tight"
            >
              Lo que nos guía
            </motion.h2>
          </div>

          {/* Zig-zag, not 3 equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 32 }}
                  animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.12 }}
                  className={`flex flex-col gap-5 p-8 rounded-2xl border border-ink-900/8 ${i === 1 ? 'md:mt-6' : ''}`}
                >
                  <div className="p-3 rounded-xl bg-forest-800/8 border border-forest-800/10 w-fit">
                    <Icon size={22} strokeWidth={1.5} className="text-forest-800" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink-900 mb-3">
                      {v.title}
                    </h3>
                    <p className="text-sm text-ink-500 leading-relaxed">{v.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="bg-forest-900 py-20 border-y border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center gap-3"
                >
                  <div className="p-2.5 rounded-xl bg-gold-400/10 border border-gold-400/15">
                    <Icon size={18} strokeWidth={1.5} className="text-gold-400" />
                  </div>
                  <span className="font-mono text-3xl font-medium text-cream-50 tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-xs text-ink-500 uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-cream-50 py-24">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-medium text-ink-900 mb-4">
            ¿Quieres saber más?
          </h2>
          <p className="text-ink-500 mb-8 leading-relaxed">
            Jennifer responde personalmente cada mensaje. Escríbele por WhatsApp
            y descubre cómo GreenLife puede ayudarte.
          </p>
          <a
            href={buildDirectWhatsAppLink('Hola Jennifer! Quiero saber más sobre GreenLife.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-forest-800 text-cream-50 font-semibold text-base hover:bg-forest-700 transition-colors active:scale-95"
          >
            <Leaf size={16} strokeWidth={1.5} />
            Hablar con Jennifer
          </a>
        </div>
      </div>
    </div>
  )
}
