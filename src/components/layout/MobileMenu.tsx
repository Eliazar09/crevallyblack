import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Shirt } from 'lucide-react'
import { buildDirectWhatsAppLink } from '../../lib/whatsapp'
import { cn } from '../../lib/cn'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  links: { href: string; label: string }[]
}

export function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  const location = useLocation()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-ink-900 border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-coffee-400/10 border border-coffee-400/30 flex items-center justify-center">
                  <Shirt size={12} className="text-coffee-400" strokeWidth={1.5} />
                </div>
                <span className="font-display text-base font-semibold text-cream-50 tracking-wider">
                  CREVALLY <span className="text-coffee-400">BLACK</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-cream-200"
                aria-label="Fechar menu"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 p-5 flex flex-col gap-1">
              {links.map((link, i) => {
                const isActive = location.pathname === link.href
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={link.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors',
                        isActive
                          ? 'text-coffee-400 bg-coffee-400/10'
                          : 'text-cream-200/80 hover:text-cream-100 hover:bg-white/5'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            <div className="p-5 border-t border-white/10">
              <a
                href={buildDirectWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1fb855] transition-colors"
              >
                <MessageCircle size={16} strokeWidth={2} />
                Falar pelo WhatsApp
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
