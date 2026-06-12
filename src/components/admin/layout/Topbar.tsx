import { Menu } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'

interface TopbarProps {
  onMenuOpen: () => void
}

function ptBRDate() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
}

export function Topbar({ onMenuOpen }: TopbarProps) {
  const { user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Admin'
  const date = ptBRDate()

  return (
    <header className="h-14 flex items-center px-4 sm:px-6 border-b border-gray-200 bg-white flex-shrink-0">
      <button
        onClick={onMenuOpen}
        className="lg:hidden mr-3 text-gray-400 hover:text-gray-700 transition-colors"
        aria-label="Menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          Olá, <span className="text-coffee-600 capitalize font-semibold">{name}</span>
        </p>
        <p className="text-[11px] text-gray-400 capitalize hidden sm:block">{date}</p>
      </div>
    </header>
  )
}
