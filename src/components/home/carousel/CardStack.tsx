import * as React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { SquareArrowOutUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ')
}

export type CardStackItem = {
  id: string | number
  title: string
  description?: string
  imageSrc?: string
  href?: string
  tag?: string
}

export type CardStackProps<T extends CardStackItem> = {
  items: T[]
  initialIndex?: number
  maxVisible?: number
  cardWidth?: number
  cardHeight?: number
  overlap?: number
  spreadDeg?: number
  perspectivePx?: number
  depthPx?: number
  tiltXDeg?: number
  activeLiftPx?: number
  activeScale?: number
  inactiveScale?: number
  springStiffness?: number
  springDamping?: number
  loop?: boolean
  autoAdvance?: boolean
  intervalMs?: number
  pauseOnHover?: boolean
  showDots?: boolean
  className?: string
  onChangeIndex?: (index: number, item: T) => void
  renderCard?: (item: T, state: { active: boolean }) => React.ReactNode
}

function wrapIndex(n: number, len: number) {
  if (len <= 0) return 0
  return ((n % len) + len) % len
}

function signedOffset(i: number, active: number, len: number, loop: boolean) {
  const raw = i - active
  if (!loop || len <= 1) return raw
  const alt = raw > 0 ? raw - len : raw + len
  return Math.abs(alt) < Math.abs(raw) ? alt : raw
}

export function CardStack<T extends CardStackItem>({
  items,
  initialIndex = 0,
  maxVisible = 7,
  cardWidth = 520,
  cardHeight = 320,
  overlap = 0.48,
  spreadDeg = 48,
  perspectivePx = 1100,
  depthPx = 140,
  tiltXDeg = 12,
  activeLiftPx = 22,
  activeScale = 1.03,
  inactiveScale = 0.94,
  springStiffness = 280,
  springDamping = 28,
  loop = true,
  autoAdvance = false,
  intervalMs = 2800,
  pauseOnHover = true,
  showDots = true,
  className,
  onChangeIndex,
  renderCard,
}: CardStackProps<T>) {
  const reduceMotion = useReducedMotion()
  const len = items.length

  const [active, setActive] = React.useState(() => wrapIndex(initialIndex, len))
  const [hovering, setHovering] = React.useState(false)

  React.useEffect(() => { setActive((a) => wrapIndex(a, len)) }, [len])
  React.useEffect(() => {
    if (!len) return
    onChangeIndex?.(active, items[active]!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const maxOffset = Math.max(0, Math.floor(maxVisible / 2))
  const cardSpacing = Math.max(10, Math.round(cardWidth * (1 - overlap)))
  const stepDeg = maxOffset > 0 ? spreadDeg / maxOffset : 0

  const canGoPrev = loop || active > 0
  const canGoNext = loop || active < len - 1

  const prev = React.useCallback(() => {
    if (!len || !canGoPrev) return
    setActive((a) => wrapIndex(a - 1, len))
  }, [canGoPrev, len])

  const next = React.useCallback(() => {
    if (!len || !canGoNext) return
    setActive((a) => wrapIndex(a + 1, len))
  }, [canGoNext, len])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }

  React.useEffect(() => {
    if (!autoAdvance || reduceMotion || !len) return
    if (pauseOnHover && hovering) return
    const id = window.setInterval(() => {
      if (loop || active < len - 1) next()
    }, Math.max(700, intervalMs))
    return () => window.clearInterval(id)
  }, [autoAdvance, intervalMs, hovering, pauseOnHover, reduceMotion, len, loop, active, next])

  if (!len) return null

  const activeItem = items[active]!

  return (
    <div
      className={cn('w-full', className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className="relative w-full"
        style={{ height: Math.max(380, cardHeight + 80) }}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div className="pointer-events-none absolute inset-x-0 top-6 mx-auto h-48 w-[70%] rounded-full bg-black/5 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-40 w-[76%] rounded-full bg-black/10 blur-3xl" aria-hidden="true" />

        <div className="absolute inset-0 flex items-end justify-center" style={{ perspective: `${perspectivePx}px` }}>
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const off = signedOffset(i, active, len, loop)
              const abs = Math.abs(off)
              if (abs > maxOffset) return null

              const rotateZ = off * stepDeg
              const x = off * cardSpacing
              const y = abs * 10
              const z = -abs * depthPx
              const isActive = off === 0
              const scale = isActive ? activeScale : inactiveScale
              const lift = isActive ? -activeLiftPx : 0
              const rotateX = isActive ? 0 : tiltXDeg
              const zIndex = 100 - abs

              const dragProps = isActive ? {
                drag: 'x' as const,
                dragConstraints: { left: 0, right: 0 },
                dragElastic: 0.18,
                onDragEnd: (_e: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
                  if (reduceMotion) return
                  const travel = info.offset.x
                  const v = info.velocity.x
                  const threshold = Math.min(160, cardWidth * 0.22)
                  if (travel > threshold || v > 650) prev()
                  else if (travel < -threshold || v < -650) next()
                },
              } : {}

              return (
                <motion.div
                  key={item.id}
                  className={cn(
                    'absolute bottom-0 rounded-2xl border-2 border-white/10 overflow-hidden shadow-xl will-change-transform select-none',
                    isActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                  )}
                  style={{ width: cardWidth, height: cardHeight, zIndex, transformStyle: 'preserve-3d' }}
                  initial={reduceMotion ? false : { opacity: 0, y: y + 40, x, rotateZ, rotateX, scale }}
                  animate={{ opacity: 1, x, y: y + lift, rotateZ, rotateX, scale }}
                  transition={{ type: 'spring', stiffness: springStiffness, damping: springDamping }}
                  onClick={() => setActive(i)}
                  {...dragProps}
                >
                  <div className="h-full w-full" style={{ transform: `translateZ(${z}px)`, transformStyle: 'preserve-3d' }}>
                    {renderCard ? renderCard(item, { active: isActive }) : <DefaultFanCard item={item} active={isActive} />}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {showDots && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            {items.map((it, idx) => {
              const on = idx === active
              return (
                <button
                  key={it.id}
                  onClick={() => setActive(idx)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    on ? 'w-6 bg-coffee-400' : 'w-2 bg-ink-900/20 hover:bg-coffee-400/50'
                  )}
                  aria-label={`Ir para ${it.title}`}
                />
              )
            })}
          </div>
          {activeItem.href ? (
            <Link to={activeItem.href} className="text-coffee-400/60 hover:text-coffee-400 transition" aria-label="Abrir">
              <SquareArrowOutUpRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function DefaultFanCard({ item, active }: { item: CardStackItem; active: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-900">
      {/* Grain texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '150px',
        }}
      />

      {/* Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        {item.imageSrc ? (
          <img
            src={item.imageSrc}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-700"
            style={{ transform: active ? 'scale(1.03)' : 'scale(1)' }}
            draggable={false}
            loading="eager"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/30">Sem imagem</div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36"
        style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, transparent 100%)' }}
      />

      {/* Tag */}
      {item.tag && (
        <div className="absolute top-4 left-4 z-10">
          <span className="font-mono text-[10px] uppercase tracking-widest bg-coffee-400 text-ink-900 px-2.5 py-1 rounded-full font-bold">
            {item.tag}
          </span>
        </div>
      )}

      {/* Text */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <div className="truncate text-[15px] font-bold text-cream-50 font-sans">{item.title}</div>
        {item.description && (
          <div className="mt-1 line-clamp-1 text-[12px] text-cream-200/60">{item.description}</div>
        )}
      </div>
    </div>
  )
}
