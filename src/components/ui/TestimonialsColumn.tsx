import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Testimonial } from '../../data/testimonials'

interface Props {
  testimonials: Testimonial[]
  duration?: number
  className?: string
}

export function TestimonialsColumn({ testimonials, duration = 15, className }: Props) {
  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-4"
      >
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {testimonials.map((t) => (
              <div
                key={`${copy}-${t.id}`}
                className="p-6 rounded-2xl border border-ink-900/8 bg-white shadow-sm shadow-coffee-500/5 max-w-xs w-full"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={11} className="fill-coffee-400 text-coffee-400" />
                  ))}
                </div>

                <p className="text-sm text-ink-700 leading-relaxed">"{t.text}"</p>

                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-ink-900/6">
                  <img
                    src={t.image}
                    alt={t.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink-900 leading-tight">{t.name}</p>
                    <p className="text-xs text-ink-500 leading-tight">{t.location} · {t.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  )
}
