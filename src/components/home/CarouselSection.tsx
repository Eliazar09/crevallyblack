import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CardStack, type CardStackItem } from './carousel/CardStack'
import { FrameButton } from './carousel/FrameButton'
import WhatsAppIcon from './carousel/WhatsAppIcon'
import { buildDirectWhatsAppLink } from '../../lib/whatsapp'

const ITEMS: CardStackItem[] = [
  {
    id: 1,
    title: 'Camiseta Gorila CB',
    description: 'Estampa exclusiva frente e costas',
    imageSrc: '/images/fotos%20de%20parte%20do%20site/WhatsApp%20Image%202026-06-09%20at%208.35.53%20PM.jpeg',
    href: '/loja',
    tag: 'Destaque',
  },
  {
    id: 2,
    title: 'Looks Crevally',
    description: 'Camiseta + Shorts — perfeitos juntos',
    imageSrc: '/images/fotos%20de%20parte%20do%20site/w.jpeg',
    href: '/loja',
    tag: 'Novo',
  },
  {
    id: 3,
    title: 'Para toda a família',
    description: 'Jaquetas e camisetas em todos os tamanhos',
    imageSrc: '/images/fotos%20de%20parte%20do%20site/www.jpeg',
    href: '/loja',
    tag: 'Coleção',
  },
  {
    id: 4,
    title: 'Camiseta Gorila CB',
    description: 'Vista o símbolo do Brasil',
    imageSrc: '/images/fotos%20de%20parte%20do%20site/WhatsApp%20Image%202026-06-09%20at%208.35.53%20PM.jpeg',
    href: '/loja',
  },
  {
    id: 5,
    title: 'Estilo na praia',
    description: 'Do street ao litoral com a Crevally',
    imageSrc: '/images/fotos%20de%20parte%20do%20site/w.jpeg',
    href: '/loja',
  },
]

export default function CarouselSection() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const cardWidth  = isMobile ? Math.min(window.innerWidth - 80, 300) : 480
  const cardHeight = isMobile ? 220 : 340

  return (
    <section className="relative overflow-hidden bg-cream-50 py-20 md:py-28">
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mb-4 font-mono text-[11px] font-extrabold uppercase tracking-[0.2em] text-coffee-500"
          >
            Coleção exclusiva
          </motion.p>

          <h2
            className="font-display font-light leading-none text-ink-900"
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              letterSpacing: '-0.02em',
              lineHeight: 0.96,
            }}
          >
            Encontre a peça{' '}
            <em className="not-italic text-coffee-500">perfeita</em>
            <br />
            para você
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink-500"
          >
            Peças selecionadas com qualidade premium e identidade própria.
            Streetwear brasileiro feito para quem não passa despercebido.
          </motion.p>
        </motion.div>

        {/* CardStack */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <CardStack
            items={ITEMS}
            initialIndex={2}
            autoAdvance
            intervalMs={isMobile ? 1800 : 3000}
            pauseOnHover
            showDots
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            overlap={isMobile ? 0.42 : 0.52}
            spreadDeg={isMobile ? 36 : 44}
            activeLiftPx={isMobile ? 18 : 28}
            activeScale={1.04}
            inactiveScale={isMobile ? 0.88 : 0.92}
            springStiffness={isMobile ? 420 : 280}
            springDamping={isMobile ? 34 : 28}
          />
        </motion.div>

        {/* Botões */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <FrameButton as="link" href="/loja" variant="default">
            Ver coleção completa
          </FrameButton>
          <FrameButton
            as="link"
            href={buildDirectWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            variant="green"
          >
            <WhatsAppIcon className="mr-2 h-4 w-4" />
            Falar no WhatsApp
          </FrameButton>
        </motion.div>

      </div>
    </section>
  )
}
