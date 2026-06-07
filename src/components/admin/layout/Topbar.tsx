import { Menu } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'

interface TopbarProps {
  onMenuOpen: () => void
}

function spanishDate() {
  return new Intl.DateTimeFormat('es-VE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
}

export function Topbar({ onMenuOpen }: TopbarProps) {
  const { user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Admin'
  const date = spanishDate()

  return (
    <header className="h-14 flex items-center px-4 sm:px-6 border-b border-white/5 bg-forest-950/80 backdrop-blur-sm flex-shrink-0">
      <button
        onClick={onMenuOpen}
        className="lg:hidden mr-3 text-ink-500 hover:text-cream-200 transition-colors"
        aria-label="Menú"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-cream-100 truncate">
          Hola, <span className="text-gold-400 capitalize">{name}</span> 👋
        </p>
        <p className="text-[11px] text-ink-500 capitalize hidden sm:block">{date}</p>
      </div>
    </header>
  )
}
