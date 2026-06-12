import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { TrendingUp, Package, Users, MessageCircle, Shirt, Star } from 'lucide-react'
import { KitTiers } from '../components/kits/KitTiers'
import { buildDirectWhatsAppLink } from '../lib/whatsapp'
import { useScrollReveal } from '../hooks/useScrollReveal'

const whyReasons = [
  {
    icon: Package,
    title: 'Produtos com demanda real',
    description:
      'Streetwear que as pessoas já buscam. Sem convencer ninguém: o mercado de moda urbana cresce todo ano no Brasil.',
  },
  {
    icon: TrendingUp,
    title: 'Margens de até 40%',
    description:
      'Quanto mais você compra, maior é o seu desconto. Um modelo de negócio transparente e escalável desde a primeira peça.',
  },
  {
    icon: Users,
    title: 'Suporte real da nossa equipe',
    description:
      'Você não está sozinho. Recebe apoio direto, materiais de marketing e estratégias de venda que já funcionam.',
  },
  {
    icon: Star,
    title: 'Marca com identidade',
    description:
      'Crevally Black tem mais de 3 anos construindo reputação. Seus clientes já sabem o que significa a marca.',
  },
]

export default function Kits() {
  const { ref, isInView } = useScrollReveal()

  return (
    <div className="min-h-[100dvh] bg-ink-900">
      <Helmet>
        <title>Atacado — Crevally Black</title>
        <meta name="description" content="Programa de atacado Crevally Black. Revenda streetwear premium com margens de até 40%. Kits de investimento para revendedores em todo o Brasil." />
      </Helmet>
      {/* Hero */}
      <div className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-coffee-500/8 blur-[120px]" />
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
              Programa de atacado
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light text-cream-50 leading-tight tracking-tight mb-6"
            >
              Faça parte da família
              <br />
              <em className="text-coffee-400">Crevally Black</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-ink-400 text-lg leading-relaxed mb-8"
            >
              Revenda streetwear premium com demanda real e margens competitivas.
              Escolha seu nível e comece a construir seu negócio hoje.
            </motion.p>
            <motion.a
              href={buildDirectWhatsAppLink('Quero informações sobre os kits de atacado Crevally Black')}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1fb855] transition-colors active:scale-95"
            >
              <MessageCircle size={16} strokeWidth={2} />
              Falar pelo WhatsApp
            </motion.a>
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="mb-10">
          <p className="section-eyebrow mb-3">Níveis de investimento</p>
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-medium text-cream-50 tracking-tight">
            Escolha seu nível de entrada
          </h2>
        </div>
        <KitTiers />
      </div>

      {/* 3 passos */}
      <div className="bg-ink-800/30 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-3">Simples assim</p>
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-medium text-cream-50 tracking-tight">
              3 passos para começar
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Escolha seu kit',
                desc: 'Selecione o nível que cabe no seu bolso e na sua intenção de venda. A partir de 5 peças para começar.',
              },
              {
                step: '02',
                title: 'Fale pelo WhatsApp',
                desc: 'Entre em contato com nossa equipe. Respondemos em minutos com os detalhes de pagamento e envio.',
              },
              {
                step: '03',
                title: 'Venda e lucre',
                desc: 'Receba seu kit, use nosso material de marketing e comece a gerar renda desde o primeiro dia.',
              },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-white/10 bg-ink-800/40 p-7 space-y-3">
                <span className="font-mono text-4xl font-bold text-coffee-400/20 leading-none">{item.step}</span>
                <h3 className="font-display text-lg font-medium text-cream-50">{item.title}</h3>
                <p className="text-sm text-ink-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why section */}
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="mb-12">
          <p className="section-eyebrow mb-3">Por que Crevally Black</p>
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-medium text-cream-50 tracking-tight">
            Um negócio que já tem tração
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
                className="rounded-2xl border border-white/10 bg-ink-800/40 p-6 space-y-4"
              >
                <div className="p-2.5 rounded-xl bg-coffee-400/10 border border-coffee-400/15 w-fit">
                  <Icon size={18} strokeWidth={1.5} className="text-coffee-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-cream-100 text-sm mb-2">{reason.title}</h3>
                  <p className="text-xs text-ink-400 leading-relaxed">{reason.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Final CTA */}
      <div className="border-t border-white/8 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-coffee-400/10 border border-coffee-400/30 flex items-center justify-center mx-auto mb-6">
            <Shirt size={20} strokeWidth={1.5} className="text-coffee-400" />
          </div>
          <h2 className="font-display text-3xl font-medium text-cream-50 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-ink-400 mb-8 leading-relaxed">
            Fale diretamente com nossa equipe pelo WhatsApp. Respondemos em minutos
            com tudo que você precisa para dar o primeiro passo.
          </p>
          <a
            href={buildDirectWhatsAppLink('Olá! Quero ser revendedor da Crevally Black. Me passa informações sobre os kits?')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#25D366] text-white font-semibold text-base hover:bg-[#1fb855] transition-colors active:scale-95"
          >
            <MessageCircle size={18} strokeWidth={2} />
            Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
