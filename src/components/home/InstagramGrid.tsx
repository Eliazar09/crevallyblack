import { motion } from 'framer-motion'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const INSTAGRAM_URL = 'https://instagram.com/crevallyblack_oficial'

const posts = [
  {
    src: '/images/fotos%20de%20parte%20do%20site/www.jpeg',
    alt: 'Crevally Black — família',
  },
  {
    src: '/images/fotos%20de%20parte%20do%20site/WhatsApp%20Image%202026-06-09%20at%208.35.53%20PM.jpeg',
    alt: 'Crevally Black — camiseta gorila',
  },
  {
    src: '/images/fotos%20de%20parte%20do%20site/w.jpeg',
    alt: 'Crevally Black — casal na praia',
  },
]

export function InstagramGrid() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-24 bg-cream-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div ref={ref} className="flex flex-col items-center text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-coffee-500 mb-3"
          >
            Instagram
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(2rem,4vw,3rem)] font-medium text-ink-900 tracking-tight leading-tight"
          >
            Siga a gente no{' '}
            <em className="text-coffee-600 not-italic">@crevallyblack_oficial</em>
          </motion.h2>
        </div>

        {/* 3 posts */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
        >
          {posts.map((post, i) => {
            const isCenter = i === 1
            return (
              <a
                key={i}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative rounded-2xl overflow-hidden block bg-ink-900 ${
                  isCenter ? 'md:-my-6 shadow-2xl shadow-ink-900/20' : 'shadow-md shadow-ink-900/10'
                }`}
              >
                <div className={`aspect-square overflow-hidden ${isCenter ? 'aspect-[4/5]' : ''}`}>
                  <img
                    src={post.src}
                    alt={post.alt}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/40 transition-all duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-xs font-mono text-white uppercase tracking-widest">
                    Ver no Instagram
                  </span>
                </div>
              </a>
            )
          })}
        </motion.div>

        {/* Follow button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="flex justify-center mt-12"
        >
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-7 py-3 rounded-full border border-ink-900/12 bg-white text-sm font-semibold text-ink-900 hover:bg-ink-900 hover:text-cream-50 hover:border-ink-900 transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
            Seguir no Instagram
          </a>
        </motion.div>

      </div>
    </section>
  )
}
