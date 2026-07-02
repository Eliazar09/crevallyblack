import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Users,
  Boxes, BarChart2, LogOut, X, CalendarDays, Layers2, ShoppingCart
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { cn } from '../../../lib/cn'

const nav = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/pedidos',    icon: ShoppingCart,     label: 'Pedidos' },
  { to: '/admin/produtos',   icon: Package,          label: 'Produtos' },
  { to: '/admin/colecoes',   icon: Layers2,          label: 'Coleções' },
  { to: '/admin/clientes',   icon: Users,            label: 'Clientes' },
  { to: '/admin/estoque',    icon: Boxes,            label: 'Estoque' },
  { to: '/admin/financas',   icon: BarChart2,        label: 'Finanças' },
  { to: '/admin/agenda',     icon: CalendarDays,     label: 'Agenda' },
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
        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        active
          ? 'bg-coffee-600 text-white shadow-lg shadow-coffee-900/40'
          : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/6'
      )}
    >
      <Icon size={16} strokeWidth={active ? 2.2 : 1.6} className={active ? 'text-white' : ''} />
      {label}
    </Link>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { signOut } = useAuth()
  return (
    <div className="flex flex-col h-full">
      {/* Logo / brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-coffee-400/30 flex-shrink-0 bg-coffee-900/40">
            <img src="/logo.jpeg" alt="Crevally Black" className="w-full h-full object-cover" style={{ objectPosition: 'center 10%' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[15px] text-white tracking-wide leading-tight">CREVALLY</p>
            <p className="font-mono text-[9px] text-coffee-400 uppercase tracking-widest">Admin Panel</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-200 lg:hidden ml-auto">
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Label section */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.18em]">Menu principal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {nav.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-6 pt-4 border-t border-white/6">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-neutral-500 hover:text-red-400 hover:bg-red-400/8 transition-all w-full"
        >
          <LogOut size={15} strokeWidth={1.6} />
          Sair
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-56 flex-col bg-[#0e1420] border-r border-white/5 flex-shrink-0">
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
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-56 z-50 bg-[#0e1420] border-r border-white/5 lg:hidden"
            >
              <SidebarContent onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
