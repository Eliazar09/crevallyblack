import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../hooks/useCart'
import { MobileMenu } from './MobileMenu'
import { cn } from '../../lib/cn'
import { navLinks } from '../../lib/navigation'
import { buildDirectWhatsAppLink } from '../../lib/whatsapp'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { itemCount, openCart } = useCart()
  const count = itemCount()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const cartLabel = count > 0 ? `CARRITO ${String(count).padStart(2, '0')}` : 'CARRITO'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-forest-950 border-b border-white/8',
          scrolled && 'shadow-lg shadow-black/30'
        )}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gold-400/30 group-hover:border-gold-400/60 transition-colors flex-shrink-0">
              <img
                src="/logo.jpg"
                alt="GreenLife"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 22%' }}
              />
            </div>
            <span className="font-display text-base font-semibold text-cream-50 tracking-tight">
              Green<span className="text-gold-400">Life</span>
            </span>
          </Link>

          {/* Nav — centered with dot separators */}
          <nav className="hidden md:flex items-center">
            {navLinks.map((link, i) => {
              const isActive = location.pathname === link.href
              return (
                <div key={link.href} className="flex items-center">
                  {i > 0 && (
                    <span className="w-1 h-1 rounded-full bg-white/20 mx-4 flex-shrink-0" />
                  )}
                  <Link
                    to={link.href}
                    className={cn(
                      'relative font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-200',
                      isActive
                        ? 'text-cream-50 font-bold'
                        : 'text-cream-200/50 hover:text-cream-100'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-gold-400/70"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-5">

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cream-200/60 hover:text-cream-50 transition-colors"
              aria-label="Abrir carrito"
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
                    className="sm:hidden absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-gold-400 text-forest-950 text-[9px] font-mono font-bold leading-none"
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
              className="md:hidden p-1.5 rounded-md hover:bg-white/8 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={18} className="text-cream-200" strokeWidth={1.5} />
            </button>
          </div>

        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} links={navLinks} />
    </>
  )
}
