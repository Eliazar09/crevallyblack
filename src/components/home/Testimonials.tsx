import { motion } from 'framer-motion'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { testimonials } from '../../data/testimonials'
import { TestimonialsColumn } from '../ui/TestimonialsColumn'

const col1 = testimonials.slice(0, 3)
const col2 = testimonials.slice(3, 6)
const col3 = testimonials.slice(6, 9)

export function Testimonials() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-24 bg-cream-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-coffee-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div ref={ref} className="flex flex-col items-center text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-coffee-500 mb-3"
          >
            Depoimentos reais
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(2rem,4vw,3rem)] font-medium text-ink-900 tracking-tight"
          >
            O que dizem
            <br />
            <em className="text-coffee-600">nossos clientes</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-sm text-ink-500 mt-4 max-w-[36ch]"
          >
            Mais de 2.000 brasileiros já vestem Crevally Black.
          </motion.p>
        </div>

        {/* 3 animated columns */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4 max-h-[680px] overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          }}
        >
          <TestimonialsColumn testimonials={col1} duration={18} />
          <TestimonialsColumn testimonials={col2} duration={22} className="hidden md:block" />
          <TestimonialsColumn testimonials={col3} duration={20} className="hidden lg:block" />
        </motion.div>
      </div>
    </section>
  )
}
