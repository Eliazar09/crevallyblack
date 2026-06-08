import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Boxes, BarChart2, LogOut, Leaf, X, CalendarDays
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { cn } from '../../../lib/cn'

const nav = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/productos', icon: Package,          label: 'Productos' },
  { to: '/admin/ventas',    icon: ShoppingCart,     label: 'Ventas' },
  { to: '/admin/clientes',  icon: Users,            label: 'Clientes' },
  { to: '/admin/inventario',icon: Boxes,            label: 'Inventario' },
  { to: '/admin/finanzas',  icon: BarChart2,        label: 'Finanzas' },
  { to: '/admin/agenda',    icon: CalendarDays,     label: 'Agenda' },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

function NavItem({ to, icon: Icon, label, onClick }: typeof nav[0] & { onClick?: () => void }) {
  const { pathname } = useLocation()
  const active = pathname === to || (to !== '/admin' && pathname.startsWith(to))
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
        active
          ? 'bg-white/8 text-gold-400 border-l-2 border-gold-400'
          : 'text-ink-500 hover:text-cream-200 hover:bg-white/5 border-l-2 border-transparent'
      )}
    >
      <Icon size={16} strokeWidth={active ? 2 : 1.6} />
      {label}
    </Link>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { signOut } = useAuth()
  return (
    <div className="flex flex-col h-full py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 mb-8">
        <div className="w-7 h-7 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center">
          <Leaf size={13} className="text-gold-400" strokeWidth={1.8} />
        </div>
        <div>
          <span className="font-display text-sm font-medium text-cream-100">GreenLife</span>
          <span className="block font-mono text-[9px] text-ink-500 uppercase tracking-widest">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-ink-500 hover:text-cream-200 lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {nav.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pt-4 border-t border-white/5">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-ink-500 hover:text-red-400 hover:bg-red-400/5 transition-all w-full"
        >
          <LogOut size={15} strokeWidth={1.6} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-56 flex-col bg-forest-900 border-r border-white/5 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-forest-950/80 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-56 z-50 bg-forest-900 border-r border-white/5 lg:hidden"
            >
              <SidebarContent onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
