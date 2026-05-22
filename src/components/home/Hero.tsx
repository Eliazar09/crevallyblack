import { useRef, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, MessageCircle, ChevronDown, Star } from 'lucide-react'
import { Button } from '../ui/Button'
import { MagneticButton } from '../ui/MagneticButton'
import { buildDirectWhatsAppLink } from '../../lib/whatsapp'

const EASE_EXPO: [number, number, number, number] = [0.33, 1, 0.68, 1]

const avatars = [
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
]

export function Hero() {
  const glowRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()
  const bgParallax = useTransform(scrollY, [0, 600], [0, 80])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!glowRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    glowRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(212,184,106,0.07), transparent 65%)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!glowRef.current) return
    glowRef.current.style.background = 'transparent'
  }, [])

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[100dvh] flex flex-col overflow-hidden"
    >
      {/* Background image with parallax */}
      <motion.div
        style={{ y: bgParallax }}
        className="absolute inset-0 scale-[1.08] will-change-transform"
      >
        <img
          src="/images/fotos de parte do site/hero.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/75 to-forest-950/30 sm:from-forest-950/92 sm:via-forest-950/55 sm:to-forest-950/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/20 to-forest-950/50 sm:from-forest-950/90 sm:via-transparent sm:to-forest-950/35" />

      {/* Cursor glow */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none z-10 transition-all duration-200"
      />

      {/* Grain */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Main content */}
      <div className="relative z-20 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-24 sm:pt-28 pb-6 sm:pb-10">
          <div className="max-w-[580px] space-y-5 sm:space-y-8">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="flex items-center gap-3"
            >
              <motion.div
                className="h-px bg-gold-400/60"
                initial={{ width: 0 }}
                animate={{ width: 24 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              <span className="section-eyebrow">Bienestar Natural · Desde Venezuela</span>
            </motion.div>

            {/* Headline clip-reveal */}
            <h1 className="font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] font-light text-cream-50 tracking-tight">
              <span className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.75, delay: 0.2, ease: EASE_EXPO }}
                >
                  El arte de
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.75, delay: 0.38, ease: EASE_EXPO }}
                >
                  vivir{' '}
                  <em className="text-shimmer-gold not-italic font-light">bien</em>
                </motion.span>
              </span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="text-[15px] sm:text-[17px] text-cream-200/75 leading-relaxed max-w-[38ch]"
            >
              Suplementos naturales premium para resultados reales.
              Más de 5.000 venezolanas ya transformaron su bienestar.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.68 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <MagneticButton>
                <Button as="a" href="/tienda" size="lg" variant="primary">
                  Ver catálogo
                  <ArrowRight size={16} strokeWidth={2} />
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button
                  as="a"
                  href={buildDirectWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  variant="ghost"
                >
                  <MessageCircle size={16} strokeWidth={1.5} />
                  Hablar por WhatsApp
                </Button>
              </MagneticButton>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.82 }}
              className="flex items-center gap-6 sm:gap-8 pt-1 sm:pt-2"
            >
              {[
                { value: '+5.000', label: 'clientas' },
                { value: '+30', label: 'productos' },
                { value: '3', label: 'años' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.88 + i * 0.1 }}
                  className="flex flex-col"
                >
                  <span className="font-mono text-xl font-medium text-gold-400 tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-xs text-cream-200/45 uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom social proof strip */}
      <div className="relative z-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-row items-center gap-4 sm:gap-6 py-4 sm:py-5">

            {/* Reviews card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05 }}
              className="flex items-center gap-3 bg-white/6 backdrop-blur-sm border border-white/10 rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5"
            >
              {/* Avatars */}
              <div className="flex -space-x-2">
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    aria-hidden="true"
                    className="w-7 h-7 rounded-full border-2 border-forest-950 object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className="fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-xs text-cream-200/70 leading-tight">
                  <span className="font-semibold text-cream-50">+5.000</span> clientas satisfechas
                </p>
              </div>
            </motion.div>

            {/* 100% Natural badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15 }}
              className="hidden sm:flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full border border-gold-400/40 bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                <span className="text-gold-400 text-[10px] font-bold">✓</span>
              </div>
              <div>
                <p className="font-display text-lg font-medium text-cream-50 leading-tight">100% Natural</p>
                <a href="/tienda" className="text-xs text-moss-400 hover:text-gold-400 uppercase tracking-widest transition-colors font-mono">
                  VER TIENDA →
                </a>
              </div>
            </motion.div>

            {/* Divider + shipping */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25 }}
              className="hidden md:flex items-center gap-3 ml-auto"
            >
              <div className="w-px h-8 bg-white/10" />
              <p className="text-xs text-cream-200/50 leading-relaxed font-mono uppercase tracking-wider">
                Envíos a toda Venezuela<br />
                <span className="text-cream-200/35">Pago en efectivo · digital</span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-24 right-8 z-20 text-cream-200/25 hidden lg:block"
      >
        <ChevronDown size={20} strokeWidth={1} />
      </motion.div>
    </section>
  )
}
