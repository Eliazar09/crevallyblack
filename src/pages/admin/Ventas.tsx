import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ShoppingCart } from 'lucide-react'
import { getSales, methodLabels, type DbSale } from '../../lib/queries/sales'
import { formatPrice } from '../../lib/currency'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Skeleton } from '../../components/admin/ui/Skeleton'
import { StatCard } from '../../components/admin/ui/StatCard'
import { DollarSign, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/cn'

const statusLabel: Record<string, string> = { pagado:'Pagado', pendiente:'Pendiente', parcial:'Parcial' }
const statusColor: Record<string, string> = {
  pagado: 'text-green-400 bg-green-400/10',
  pendiente: 'text-amber-400 bg-amber-400/10',
  parcial: 'text-blue-400 bg-blue-400/10',
}

function monthRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
  return { from, to }
}

export default function Ventas() {
  const [sales, setSales] = useState<DbSale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSales().then(setSales).finally(() => setLoading(false))
  }, [])

  const { from } = monthRange()
  const monthlySales = sales.filter((s) => s.created_at >= from)
  const monthTotal = monthlySales.reduce((a, s) => a + s.total, 0)
  const avgTicket = monthlySales.length ? monthTotal / monthlySales.length : 0

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-cream-50">Ventas</h1>
          <p className="text-sm text-ink-500">{sales.length} ventas registradas</p>
        </div>
        <Link to="/admin/ventas/nueva"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold-400 text-forest-950 font-semibold text-sm hover:bg-gold-300 transition-colors">
          <Plus size={15} />Nueva venta
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard title="Ingresos del mes" value={formatPrice(monthTotal)} icon={DollarSign} accent="green" delay={0} />
        <StatCard title="Ventas del mes"   value={String(monthlySales.length)} icon={ShoppingCart} accent="gold" delay={0.05} />
        <StatCard title="Ticket promedio"  value={formatPrice(avgTicket)} icon={TrendingUp} accent="blue" delay={0.1} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-14 w-full"/>)}</div>
      ) : sales.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Sin ventas" description="Registra tu primera venta."
          action={<Link to="/admin/ventas/nueva" className="text-sm text-gold-400">+ Nueva venta</Link>} />
      ) : (
        <div className="rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                {['#','Cliente','Método','Total','Estado','Fecha'].map((h)=>(
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map((s, i) => (
                <motion.tr key={s.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.02}}
                  className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-500">{s.id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 text-cream-100 font-medium">{s.client_name}</td>
                  <td className="px-4 py-3 text-ink-500 text-xs">{methodLabels[s.payment_method] ?? s.payment_method}</td>
                  <td className="px-4 py-3 font-mono text-green-400">{formatPrice(s.total)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', statusColor[s.payment_status])}>
                      {statusLabel[s.payment_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500 text-xs">{new Date(s.created_at).toLocaleDateString('es-VE')}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
