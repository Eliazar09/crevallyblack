import { Menu, Bell, Store } from 'lucide-react'
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
  const name = (user?.email?.split('@')[0] ?? 'Admin')
  const nameFormatted = name.charAt(0).toUpperCase() + name.slice(1)
  const date = ptBRDate()

  return (
    <header className="h-16 flex items-center px-4 sm:px-6 border-b border-gray-100 bg-white flex-shrink-0 gap-4">
      <button
        onClick={onMenuOpen}
        className="lg:hidden text-gray-400 hover:text-gray-700 transition-colors p-1"
        aria-label="Menu"
      >
        <Menu size={20} />
      </button>

      {/* Store info */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
        <Store size={13} className="text-coffee-600" strokeWidth={1.8} />
        <span className="text-xs font-semibold text-gray-700">Crevally Black</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate capitalize hidden sm:block">{date}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <Bell size={17} strokeWidth={1.6} />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-coffee-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold uppercase">{nameFormatted[0]}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 capitalize">{nameFormatted}</p>
            <p className="text-[10px] text-gray-400">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  )
}
