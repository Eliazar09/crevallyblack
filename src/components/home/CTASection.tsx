import { motion } from 'framer-motion'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { buildDirectWhatsAppLink } from '../../lib/whatsapp'
import { Button } from '../ui/Button'

export function CTASection() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-32 bg-ink-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {/* Pulsing coffee glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-coffee-500/8 blur-[120px]"
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Secondary outer ring */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-ink-800/10 blur-[140px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div ref={ref} className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-coffee-500 mb-5"
        >
          Pronto para vestir bem?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-light text-cream-50 leading-[0.95] tracking-tight mb-6"
        >
          Seu estilo começa
          <br />
          <em className="text-coffee-400">agora</em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="text-ink-400 text-lg mb-10 leading-relaxed max-w-[38ch] mx-auto"
        >
          Mais de 2.000 brasileiros já escolheram Crevally Black.
          Junte-se a eles hoje.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button as="a" href="/loja" size="lg" variant="primary">
            Ver catálogo completo
            <ArrowRight size={16} strokeWidth={2} />
          </Button>
          <Button
            as="a"
            href={buildDirectWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            variant="whatsapp"
          >
            <MessageCircle size={16} strokeWidth={2} />
            Falar pelo WhatsApp
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
