import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Users, Package, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../components/admin/ui/StatCard'
import { StatCardSkeleton } from '../../components/admin/ui/Skeleton'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/currency'

interface DashStats {
  ingresos: number
  ventas: number
  clientes: number
  stockBajo: number
}

interface RecentSale {
  id: string
  client_name: string
  total: number
  payment_method: string
  created_at: string
}

const methodLabels: Record<string, string> = {
  pago_movil: 'Pago Móvil', divisas: 'Divisas', zelle: 'Zelle',
  transferencia: 'Transferencia', binance: 'Binance', punto: 'Punto', otro: 'Otro',
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashStats | null>(null)
  const [recent, setRecent] = useState<RecentSale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [salesRes, clientsRes, stockRes, recentRes] = await Promise.all([
        supabase.from('sales').select('total').gte('created_at', from),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('v_low_stock').select('id', { count: 'exact', head: true }),
        supabase.from('sales').select('id,client_name,total,payment_method,created_at')
          .order('created_at', { ascending: false }).limit(5),
      ])

      const ingresos = (salesRes.data ?? []).reduce((s, r) => s + (r.total ?? 0), 0)
      setStats({
        ingresos,
        ventas: salesRes.data?.length ?? 0,
        clientes: clientsRes.count ?? 0,
        stockBajo: stockRes.count ?? 0,
      })
      setRecent(recentRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-medium text-cream-50">Dashboard</h1>
        <p className="text-sm text-ink-500 mt-0.5">Resumen del mes actual</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Ingresos del mes" value={formatPrice(stats?.ingresos ?? 0)} icon={DollarSign} accent="green" delay={0} />
            <StatCard title="Ventas del mes"   value={String(stats?.ventas ?? 0)}         icon={ShoppingCart} accent="gold"  delay={0.05} />
            <StatCard title="Clientes"          value={String(stats?.clientes ?? 0)}       icon={Users}        accent="blue"  delay={0.1} />
            <StatCard title="Stock bajo"        value={String(stats?.stockBajo ?? 0)}      icon={Package}      accent="red"   delay={0.15}
              subtitle="productos con alerta" />
          </>
        )}
      </div>

      {/* Recent sales */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-forest-900/60 border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <p className="text-sm font-semibold text-cream-100">Últimas ventas</p>
          <Link to="/admin/ventas" className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors">
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Sin ventas aún" description="Registra tu primera venta en el módulo de Ventas." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Cliente', 'Método', 'Total', 'Fecha'].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-ink-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((s) => (
                <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-cream-100 font-medium">{s.client_name}</td>
                  <td className="px-5 py-3 text-ink-500 text-xs">{methodLabels[s.payment_method] ?? s.payment_method}</td>
                  <td className="px-5 py-3 font-mono text-green-400">{formatPrice(s.total)}</td>
                  <td className="px-5 py-3 text-ink-500 text-xs">
                    {new Date(s.created_at).toLocaleDateString('es-VE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { to: '/admin/ventas/nueva', label: 'Nueva venta', icon: ShoppingCart },
          { to: '/admin/productos/nuevo', label: 'Nuevo producto', icon: Package },
          { to: '/admin/clientes', label: 'Ver clientes', icon: Users },
        ].map(({ to, label, icon: Icon }) => (
          <Link
            key={to} to={to}
            className="flex items-center gap-3 p-4 rounded-2xl bg-forest-900/40 border border-white/5 hover:border-gold-400/20 hover:bg-white/3 transition-all group"
          >
            <Icon size={16} className="text-gold-400" strokeWidth={1.6} />
            <span className="text-sm text-cream-200 group-hover:text-cream-50 transition-colors">{label}</span>
            <ArrowRight size={12} className="ml-auto text-ink-500 group-hover:text-gold-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
