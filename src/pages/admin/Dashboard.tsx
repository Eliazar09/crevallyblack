import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Users, Package, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard } from '../../components/admin/ui/StatCard'
import { StatCardSkeleton } from '../../components/admin/ui/Skeleton'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/currency'
import { useAuth } from '../../hooks/useAuth'

interface DashStats {
  receitas: number
  vendas: number
  clientes: number
  estoqueBaixo: number
}

interface RecentSale {
  id: string
  client_name: string
  total: number
  payment_method: string
  created_at: string
}

const methodLabels: Record<string, string> = {
  pix: 'Pix', cartao_credito: 'Cartão Créd.', cartao_debito: 'Cartão Déb.',
  dinheiro: 'Dinheiro', transferencia: 'Transf.', boleto: 'Boleto', outro: 'Outro',
}

const quickLinks = [
  { to: '/admin/vendas/nova',    label: 'Nova venda',     icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { to: '/admin/produtos/novo',  label: 'Novo produto',   icon: Package,      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { to: '/admin/clientes',       label: 'Ver clientes',   icon: Users,        color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Admin'
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

      const receitas = (salesRes.data ?? []).reduce((s, r) => s + (r.total ?? 0), 0)
      setStats({
        receitas,
        vendas: salesRes.data?.length ?? 0,
        clientes: clientsRes.count ?? 0,
        estoqueBaixo: stockRes.count ?? 0,
      })
      setRecent(recentRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-ink-900 overflow-hidden border border-white/10 flex-shrink-0">
          <img src="/logo.jpeg" alt="Crevally Black" className="w-full h-full object-cover object-center" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-gray-900 tracking-wide">
            BEM-VINDO, <span className="text-coffee-600 uppercase">{name}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Resumo do mês atual · Crevally Black</p>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Receita do mês"  value={formatPrice(stats?.receitas ?? 0)}    icon={DollarSign}  accent="green" delay={0} />
            <StatCard title="Vendas do mês"   value={String(stats?.vendas ?? 0)}            icon={ShoppingCart} accent="gold"  delay={0.05} />
            <StatCard title="Clientes"         value={String(stats?.clientes ?? 0)}          icon={Users}        accent="blue"  delay={0.1} />
            <StatCard title="Estoque baixo"    value={String(stats?.estoqueBaixo ?? 0)}      icon={Package}      accent="red"   delay={0.15} subtitle="produtos com alerta" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickLinks.map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to}
            className={`flex flex-col sm:flex-row items-center sm:gap-3 gap-1.5 p-4 rounded-2xl border transition-all font-medium text-sm ${color}`}>
            <Icon size={18} strokeWidth={1.8} />
            <span className="text-center sm:text-left text-xs sm:text-sm">{label}</span>
            <ArrowRight size={13} className="hidden sm:block ml-auto" />
          </Link>
        ))}
      </div>

      {/* Recent sales */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">Últimas vendas</p>
            <p className="text-xs text-gray-400 mt-0.5">Atividade recente</p>
          </div>
          <Link to="/admin/vendas"
            className="flex items-center gap-1.5 text-xs font-medium text-coffee-600 hover:text-coffee-500 transition-colors bg-coffee-50 px-3 py-1.5 rounded-full border border-coffee-200">
            Ver todas <ArrowRight size={11} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ShoppingCart size={20} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-gray-500">Sem vendas este mês</p>
            <Link to="/admin/vendas/nova" className="text-xs text-coffee-600 hover:underline font-medium">
              Registrar primeira venda →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Cliente', 'Método', 'Total', 'Data'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold text-[10px] uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{s.client_name}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                        {methodLabels[s.payment_method] ?? s.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-emerald-600">{formatPrice(s.total)}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(s.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
