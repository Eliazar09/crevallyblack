import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Shirt, Sparkles, Heart, Users, Package, Calendar, Award } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { buildDirectWhatsAppLink } from '../lib/whatsapp'

const values = [
  {
    icon: Shirt,
    title: 'Feito para durar',
    description:
      'Cada peça Crevally Black passa por controle de qualidade rigoroso. Usamos tecidos selecionados que mantêm o caimento e a cor após muitas lavagens.',
  },
  {
    icon: Sparkles,
    title: 'Design com identidade',
    description:
      'Não seguimos tendências — criamos as nossas. Cada coleção nasce de uma estética própria, pensada para quem quer se destacar sem precisar gritar.',
  },
  {
    icon: Heart,
    title: 'Comunidade em primeiro lugar',
    description:
      'Crevally Black nasceu nas ruas do Brasil. Cada venda representa uma relação de confiança com quem nos escolheu para contar a própria história.',
  },
]

const stats = [
  { value: '+2.000', label: 'Clientes satisfeitos', icon: Users },
  { value: '+50', label: 'Modelos ativos', icon: Package },
  { value: '3', label: 'Anos de história', icon: Calendar },
  { value: '100%', label: 'Produção nacional', icon: Award },
]

export default function About() {
  const { ref: valuesRef, isInView: valuesInView } = useScrollReveal()
  const { ref: statsRef, isInView: statsInView } = useScrollReveal()

  return (
    <div className="min-h-[100dvh]">
      <Helmet>
        <title>Sobre — Crevally Black</title>
        <meta name="description" content="Crevally Black é uma marca brasileira de streetwear premium. Mais de 3 anos construindo identidade visual e qualidade real para quem vive nas ruas." />
      </Helmet>
      {/* Hero editorial: dark section, split layout */}
      <div className="bg-ink-900 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="section-eyebrow"
            >
              Nossa história
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light text-cream-50 tracking-tight leading-tight"
            >
              Estilo que nasce
              <br />
              da <em className="text-coffee-400">rua</em>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 text-ink-400 text-[17px] leading-relaxed"
            >
              <p>
                Crevally Black nasceu de uma convicção simples: a moda streetwear
                brasileira merecia uma marca que falasse a língua das ruas sem
                abrir mão da qualidade. Um time apaixonado por cultura urbana
                começou desenvolvendo peças que unissem estética e resistência.
              </p>
              <p>
                O que começou como experimentos entre amigos se transformou numa
                comunidade de mais de 2.000 pessoas que escolhem Crevally Black
                para contar a própria história através do que vestem.
              </p>
              <p>
                Hoje oferecemos mais de 50 modelos produzidos no Brasil, com
                tecidos selecionados, acabamento premium e identidade visual única.
                Sem atalhos, sem promessas vazias. Só roupa boa.
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
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-ink-800">
                <img src="/images/fotos%20de%20parte%20do%20site/www.jpeg" alt="Família Crevally Black" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-ink-800">
                <img src="/images/fotos%20de%20parte%20do%20site/w.jpeg" alt="Crevally Black estilo" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
            </div>
            <div className="space-y-3 pt-8">
              <div className="aspect-square rounded-2xl overflow-hidden bg-ink-800">
                <img src="/images/fotos%20de%20parte%20do%20site/WhatsApp%20Image%202026-06-09%20at%208.35.53%20PM.jpeg" alt="Camiseta Crevally Black" className="w-full h-full object-cover object-center" loading="lazy" />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-ink-800">
                <img src="/images/fotos%20de%20parte%20do%20site/www.jpeg" alt="Comunidade Crevally Black" className="w-full h-full object-cover object-center" loading="lazy" />
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
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-coffee-500 mb-3"
            >
              Nossos valores
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-[clamp(2rem,4vw,3rem)] font-medium text-ink-900 tracking-tight"
            >
              O que nos move
            </motion.h2>
          </div>

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
                  <div className="p-3 rounded-xl bg-ink-900/6 border border-ink-900/10 w-fit">
                    <Icon size={22} strokeWidth={1.5} className="text-ink-900" />
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
      <div ref={statsRef} className="bg-ink-900 py-20 border-y border-white/8">
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
                  <div className="p-2.5 rounded-xl bg-coffee-400/10 border border-coffee-400/20">
                    <Icon size={18} strokeWidth={1.5} className="text-coffee-400" />
                  </div>
                  <span className="font-mono text-3xl font-medium text-cream-50 tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-xs text-ink-400 uppercase tracking-wider">{stat.label}</span>
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
            Quer saber mais?
          </h2>
          <p className="text-ink-500 mb-8 leading-relaxed">
            Nossa equipe responde cada mensagem. Fale pelo WhatsApp e descubra
            como Crevally Black pode fazer parte do seu estilo.
          </p>
          <a
            href={buildDirectWhatsAppLink('Olá! Quero saber mais sobre a Crevally Black.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-ink-900 text-cream-50 font-semibold text-base hover:bg-ink-700 transition-colors active:scale-95"
          >
            <Shirt size={16} strokeWidth={1.5} />
            Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
