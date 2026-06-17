import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Shirt, ChevronDown, Layers2 } from 'lucide-react'
import { buildDirectWhatsAppLink } from '../../lib/whatsapp'
import { cn } from '../../lib/cn'
import type { DbCollection } from '../../lib/queries/collections'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  links: { href: string; label: string }[]
  collections?: DbCollection[]
}

export function MobileMenu({ isOpen, onClose, links, collections = [] }: MobileMenuProps) {
  const location = useLocation()
  const [collectionsExpanded, setCollectionsExpanded] = useState(false)

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

            <nav className="flex-1 p-5 flex flex-col gap-1 overflow-y-auto">
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

              {/* Collections accordion */}
              {collections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: links.length * 0.06 }}
                  className="mt-1"
                >
                  <button
                    onClick={() => setCollectionsExpanded((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-cream-200/80 hover:text-cream-100 hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Layers2 size={16} strokeWidth={1.5} className="text-coffee-400/70 flex-shrink-0" />
                      Coleções
                    </span>
                    <ChevronDown
                      size={14}
                      strokeWidth={1.5}
                      className={cn('text-ink-400 transition-transform duration-200', collectionsExpanded && 'rotate-180')}
                    />
                  </button>

                  <AnimatePresence>
                    {collectionsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 pl-4 border-l border-white/8 mt-1 mb-1 flex flex-col gap-0.5">
                          {collections.map((col) => (
                            <Link
                              key={col.id}
                              to={`/colecao/${col.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-cream-200/70 hover:text-cream-100 hover:bg-white/5 transition-colors"
                            >
                              {col.image_url ? (
                                <img
                                  src={col.image_url}
                                  alt={col.name}
                                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-ink-700 flex-shrink-0" />
                              )}
                              <span className="leading-tight line-clamp-1">{col.name}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
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
