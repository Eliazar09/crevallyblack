import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Users, Package, ArrowRight, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../components/admin/ui/StatCard'
import { StatCardSkeleton } from '../../components/admin/ui/Skeleton'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/currency'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/cn'

interface DashStats {
  receitas: number
  pedidos: number
  clientes: number
  estoqueBaixo: number
}

interface RecentSale {
  id: string
  client_name: string
  total: number
  subtotal: number
  payment_method: string
  payment_status: string
  created_at: string
  notes: string | null
}

const statusStyle: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
  pago:      { bg: 'bg-emerald-50',  text: 'text-emerald-700', icon: CheckCircle },
  pendente:  { bg: 'bg-amber-50',    text: 'text-amber-700',   icon: Clock },
  cancelado: { bg: 'bg-red-50',      text: 'text-red-600',     icon: Clock },
}
const statusLabel: Record<string, string> = { pago: 'Pago', pendente: 'Pendente', cancelado: 'Cancelado' }

function MiniBarChart({ sales }: { sales: RecentSale[] }) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const now = new Date()
  const bars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const dayStr = d.toISOString().slice(0, 10)
    const total = sales
      .filter((s) => s.payment_status === 'pago' && s.created_at.slice(0, 10) === dayStr)
      .reduce((acc, s) => acc + s.total, 0)
    return { label: days[d.getDay()], total, isToday: i === 6 }
  })
  const max = Math.max(...bars.map((b) => b.total), 1)
  return (
    <div className="flex items-end gap-2 h-24">
      {bars.map((bar, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(4, (bar.total / max) * 80)}px` }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className={cn(
              'w-full rounded-t-md transition-colors',
              bar.isToday ? 'bg-coffee-500' : bar.total > 0 ? 'bg-coffee-300' : 'bg-gray-100'
            )}
          />
          <span className={cn('text-[9px] font-mono uppercase', bar.isToday ? 'text-coffee-600 font-bold' : 'text-gray-400')}>
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const name = (user?.email?.split('@')[0] ?? 'Admin')
  const nameFormatted = name.charAt(0).toUpperCase() + name.slice(1)

  const [stats, setStats]   = useState<DashStats | null>(null)
  const [recent, setRecent] = useState<RecentSale[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const now = new Date()
        const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

        const [allSalesRes, clientsRes, stockRes, recentRes] = await Promise.all([
          supabase.from('sales').select('total,payment_status,created_at').gte('created_at', from),
          supabase.from('clients').select('id', { count: 'exact', head: true }),
          supabase.from('v_low_stock').select('id', { count: 'exact', head: true }),
          supabase.from('sales')
            .select('id,client_name,total,subtotal,payment_method,payment_status,created_at,notes')
            .order('created_at', { ascending: false }).limit(10),
        ])

        const allSales = allSalesRes.data ?? []
        const receitas = allSales
          .filter((s) => s.payment_status === 'pago')
          .reduce((acc, s) => acc + (s.total ?? 0), 0)

        setStats({
          receitas,
          pedidos: allSales.length,
          clientes: clientsRes.count ?? 0,
          estoqueBaixo: stockRes.count ?? 0,
        })
        setRecent(recentRes.data ?? [])
      } catch (err: any) {
        console.error('[dashboard] load error:', err?.message)
        setLoadError('Erro ao carregar dados.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pagoCount    = recent.filter((s) => s.payment_status === 'pago').length
  const pendenteCount = recent.filter((s) => s.payment_status === 'pendente').length

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#0e1420] to-[#1a2540] p-6 flex items-center gap-5"
      >
        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-coffee-400/40 flex-shrink-0">
          <img src="/logo.jpeg" alt="Crevally Black" className="w-full h-full object-cover object-center" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-coffee-400 text-xs font-mono uppercase tracking-widest mb-0.5">Bem-vindo de volta</p>
          <h1 className="font-display text-2xl text-white tracking-wide capitalize">{nameFormatted}</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Crevally Black · Painel de controle</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-white">{pagoCount}</p>
            <p className="text-[10px] text-emerald-400 font-mono uppercase">Pagos</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-white">{pendenteCount}</p>
            <p className="text-[10px] text-amber-400 font-mono uppercase">Pendentes</p>
          </div>
        </div>
      </motion.div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm text-red-700">{loadError}</div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Receita do mês"  value={formatPrice(stats?.receitas ?? 0)}   icon={DollarSign}   accent="green" delay={0}    subtitle="pedidos pagos" />
            <StatCard title="Pedidos do mês"  value={String(stats?.pedidos ?? 0)}          icon={ShoppingCart} accent="gold"  delay={0.06} subtitle="todos os status" />
            <StatCard title="Clientes"         value={String(stats?.clientes ?? 0)}         icon={Users}        accent="blue"  delay={0.12} />
            <StatCard title="Estoque baixo"    value={String(stats?.estoqueBaixo ?? 0)}     icon={Package}      accent="red"   delay={0.18} subtitle="com alerta" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Gráfico de vendas semanal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-gray-900">Vendas da semana</p>
              <p className="text-xs text-gray-400 mt-0.5">Receita de pedidos pagos</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-coffee-600 font-semibold bg-coffee-50 border border-coffee-100 px-3 py-1.5 rounded-full">
              <TrendingUp size={12} />
              Últimos 7 dias
            </div>
          </div>
          {loading ? (
            <div className="h-24 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <MiniBarChart sales={recent} />
          )}
        </motion.div>

        {/* Ações rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <p className="text-sm font-bold text-gray-900 mb-4">Ações rápidas</p>
          <div className="space-y-2.5">
            {[
              { to: '/admin/pedidos',       label: 'Ver pedidos',   icon: ShoppingCart, color: 'bg-amber-500' },
              { to: '/admin/produtos/novo', label: 'Novo produto',  icon: Package,      color: 'bg-blue-500' },
              { to: '/admin/clientes',      label: 'Ver clientes',  icon: Users,        color: 'bg-violet-500' },
            ].map(({ to, label, icon: Icon, color }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all group"
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
                  <Icon size={14} strokeWidth={2} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{label}</span>
                <ArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Últimos pedidos */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-bold text-gray-900">Últimos pedidos</p>
            <p className="text-xs text-gray-400 mt-0.5">Todos os status</p>
          </div>
          <Link to="/admin/pedidos"
            className="text-xs text-coffee-600 hover:text-coffee-700 font-semibold flex items-center gap-1 transition-colors">
            Ver todos <ArrowRight size={11} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ShoppingCart size={20} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-gray-500">Nenhum pedido ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['#', 'Cliente', 'Status', 'Total', 'Data'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((s, i) => {
                  const st = statusStyle[s.payment_status] ?? statusStyle.pendente
                  const StatusIcon = st.icon
                  const freight = s.total - (s.subtotal ?? s.total)
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-[11px] text-gray-400">{s.id.slice(-6).toUpperCase()}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900 text-sm">{s.client_name}</p>
                        {s.notes && (
                          <p className="text-[10px] text-gray-400 mt-0.5 max-w-[200px] truncate">
                            {(s.notes.match(/CEP:\s*([\d\-]+)/i) ?? [])[1] ?? ''}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold', st.bg, st.text)}>
                          <StatusIcon size={10} strokeWidth={2.5} />
                          {statusLabel[s.payment_status] ?? s.payment_status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-mono font-bold text-emerald-600">{formatPrice(s.total)}</p>
                        {freight > 0.5 && (
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            Frete: {formatPrice(freight)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(s.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
