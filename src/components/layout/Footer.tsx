import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { InstagramIcon } from '../ui/InstagramIcon'
import { buildDirectWhatsAppLink } from '../../lib/whatsapp'
import { navLinks } from '../../lib/navigation'

export function Footer() {
  return (
    <footer className="bg-ink-900 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 pb-12 border-b border-white/8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-ink-900">
                <img
                  src="/logo.jpeg"
                  alt="Crevally Black"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 10%' }}
                />
              </div>
              <span className="font-display text-xl text-white tracking-wide">
                CREVALLY<span className="text-coffee-400"> BLACK</span>
              </span>
            </div>
            <p className="text-sm text-ink-400 leading-relaxed max-w-[28ch]">
              Streetwear premium com identidade forte e urbana. Feito para quem não passa despercebido.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={buildDirectWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-neutral-300"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} strokeWidth={1.5} />
              </a>
              <a
                href="https://instagram.com/crevallyblack_oficial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-neutral-300"
                aria-label="Instagram"
              >
                <InstagramIcon size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div>
            <p className="section-eyebrow mb-5">Navegação</p>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-ink-400 hover:text-neutral-200 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="section-eyebrow mb-5">Contato</p>
            <ul className="space-y-2.5 text-sm text-ink-400">
              <li>
                <a
                  href={buildDirectWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-200 transition-colors"
                >
                  WhatsApp · (12) 99202-4748
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/crevallyblack_oficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-200 transition-colors"
                >
                  @crevallyblack_oficial
                </a>
              </li>
              <li className="text-ink-500/60 text-xs pt-1">
                Envios para todo o Brasil
              </li>
              <li className="text-ink-500/60 text-xs">
                Segunda a sábado · 9h – 19h
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500/50 font-mono">
            © {new Date().getFullYear()} Crevally Black · Todos os direitos reservados
          </p>
          <p className="text-xs text-ink-500/30 font-mono">
            STREETWEAR PREMIUM · BRASIL
          </p>
        </div>
      </div>
    </footer>
  )
}
