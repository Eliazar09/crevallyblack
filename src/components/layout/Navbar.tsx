import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu, MessageCircle, ChevronDown, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../hooks/useCart'
import { MobileMenu } from './MobileMenu'
import { cn } from '../../lib/cn'
import { navLinks } from '../../lib/navigation'
import { buildDirectWhatsAppLink } from '../../lib/whatsapp'
import { getActiveCollections, type DbCollection } from '../../lib/queries/collections'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [collections, setCollections] = useState<DbCollection[]>([])
  const [collectionsOpen, setCollectionsOpen] = useState(false)
  const collectionsRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const count = itemCount()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    getActiveCollections().then(setCollections).catch(() => {})
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!collectionsOpen) return
    function onDown(e: MouseEvent) {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [collectionsOpen])

  // Close dropdown on route change
  useEffect(() => {
    setCollectionsOpen(false)
  }, [location.pathname])

  const cartLabel = count > 0 ? `CARRINHO ${String(count).padStart(2, '0')}` : 'CARRINHO'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white border-b border-neutral-200',
          scrolled && 'shadow-sm shadow-neutral-200/80'
        )}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-ink-900/15 group-hover:border-coffee-400/50 transition-colors flex-shrink-0 bg-ink-900">
              <img
                src="/logo.jpeg"
                alt="Crevally Black"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 10%' }}
              />
            </div>
            <span className="font-display text-xl text-ink-900 tracking-wide">
              CREVALLY<span className="text-coffee-500"> BLACK</span>
            </span>
          </Link>

          {/* Nav — centered with dot separators */}
          <nav className="hidden md:flex items-center">
            {navLinks.map((link, i) => {
              const isActive = location.pathname === link.href
              return (
                <div key={link.href} className="flex items-center">
                  {i > 0 && (
                    <span className="w-1 h-1 rounded-full bg-neutral-300 mx-4 flex-shrink-0" />
                  )}
                  <Link
                    to={link.href}
                    className={cn(
                      'relative font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-200',
                      isActive
                        ? 'text-ink-900 font-bold'
                        : 'text-ink-500 hover:text-ink-900'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-coffee-400"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </Link>
                </div>
              )
            })}

            {/* Collections dropdown */}
            {collections.length > 0 && (
              <div className="relative flex items-center" ref={collectionsRef}>
                <span className="w-1 h-1 rounded-full bg-neutral-300 mx-4 flex-shrink-0" />
                <button
                  onClick={() => setCollectionsOpen((v) => !v)}
                  className={cn(
                    'flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-200 outline-none',
                    collectionsOpen ? 'text-ink-900 font-bold' : 'text-ink-500 hover:text-ink-900'
                  )}
                >
                  Coleções
                  <ChevronDown
                    size={10}
                    strokeWidth={2}
                    className={cn('transition-transform duration-200 mt-px', collectionsOpen && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 bg-ink-900 rounded-2xl shadow-2xl shadow-black/40 z-50 border border-white/8 overflow-hidden"
                      style={{ width: 340 }}
                    >
                      {/* Arrow pointer */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-ink-900 border-l border-t border-white/8 rotate-45" />

                      {/* Header */}
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                          Coleções
                        </p>
                        <span className="text-[10px] font-mono text-ink-600">
                          {collections.length} {collections.length === 1 ? 'coleção' : 'coleções'}
                        </span>
                      </div>

                      {/* Grid */}
                      <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                        {collections.map((col) => (
                          <Link
                            key={col.id}
                            to={`/colecao/${col.slug}`}
                            onClick={() => setCollectionsOpen(false)}
                            className="group relative rounded-xl overflow-hidden bg-ink-800 block focus:outline-none focus-visible:ring-2 focus-visible:ring-coffee-400"
                            style={{ aspectRatio: '3/2' }}
                          >
                            {col.image_url ? (
                              <img
                                src={col.image_url}
                                alt={col.name}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-ink-700 to-ink-900" />
                            )}
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                            {/* Hover ring */}
                            <div className="absolute inset-0 ring-2 ring-inset ring-coffee-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                            {/* Name */}
                            <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 flex items-end justify-between">
                              <p className="font-display text-[11px] text-white tracking-wide leading-tight line-clamp-2 flex-1 mr-1">
                                {col.name}
                              </p>
                              <ArrowRight
                                size={10}
                                strokeWidth={2.5}
                                className="text-coffee-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 translate-x-1 group-hover:translate-x-0 duration-200"
                              />
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-white/8 px-4 py-3">
                        <Link
                          to="/loja"
                          onClick={() => setCollectionsOpen(false)}
                          className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-ink-400 hover:text-cream-50 transition-colors"
                        >
                          <span>Ver loja completa</span>
                          <ArrowRight size={11} strokeWidth={2} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-5">

            {/* Cart */}
            <button
              onClick={() => navigate('/carrinho')}
              className="relative flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500 hover:text-ink-900 transition-colors"
              aria-label="Abrir carrinho"
            >
              <ShoppingBag size={15} strokeWidth={1.5} className="flex-shrink-0" />
              <span className="hidden sm:inline">{cartLabel}</span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="sm:hidden absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-coffee-400 text-white text-[9px] font-mono font-bold leading-none"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* WhatsApp — desktop */}
            <a
              href={buildDirectWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#25D366]/80 hover:text-[#25D366] transition-colors"
            >
              <MessageCircle size={13} strokeWidth={2} />
              WhatsApp
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu size={18} className="text-ink-700" strokeWidth={1.5} />
            </button>
          </div>

        </div>
      </header>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={navLinks}
        collections={collections}
      />
    </>
  )
}
