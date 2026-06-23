import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, DollarSign, TrendingUp, Trash2, RefreshCw } from 'lucide-react'
import { getSales, deleteSale, methodLabels, type DbSale } from '../../lib/queries/sales'
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog'
import { formatPrice } from '../../lib/currency'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Skeleton } from '../../components/admin/ui/Skeleton'
import { StatCard } from '../../components/admin/ui/StatCard'
import { cn } from '../../lib/cn'
import { useToast } from '../../hooks/useToast'

const statusLabel: Record<string, string> = {
  pago:      'Pago',
  pendente:  'Pendente',
  parcial:   'Parcial',
  cancelado: 'Cancelado',
}
const statusColor: Record<string, string> = {
  pago:      'text-emerald-700 bg-emerald-50 border-emerald-200',
  pendente:  'text-amber-700 bg-amber-50 border-amber-200',
  parcial:   'text-blue-700 bg-blue-50 border-blue-200',
  cancelado: 'text-red-700 bg-red-50 border-red-200',
}

function monthRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  return { from }
}

export default function Pedidos() {
  const [sales, setSales] = useState<DbSale[]>([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState<DbSale | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { push } = useToast()

  function load() {
    setLoading(true)
    getSales().then(setSales).catch(() => push('Erro ao carregar pedidos', 'error')).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteSale(toDelete.id)
      push('Pedido excluído')
      setToDelete(null)
      load()
    } catch { push('Erro ao excluir', 'error') }
    finally { setDeleting(false) }
  }

  const { from } = monthRange()
  const monthlySales   = sales.filter((s) => s.created_at >= from)
  const monthPago      = monthlySales.filter((s) => s.payment_status === 'pago')
  const monthTotal     = monthPago.reduce((a, s) => a + s.total, 0)
  const avgTicket      = monthPago.length ? monthTotal / monthPago.length : 0

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-gray-900 tracking-wide">PEDIDOS</h1>
          <p className="text-sm text-gray-500">{sales.length} pedido{sales.length !== 1 ? 's' : ''} no total</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard title="Receita do mês"    value={formatPrice(monthTotal)}          icon={DollarSign}   accent="green" delay={0}    subtitle="pedidos pagos" />
        <StatCard title="Pedidos do mês"    value={String(monthlySales.length)}       icon={ShoppingCart} accent="gold"  delay={0.05} subtitle="todos os status" />
        <StatCard title="Ticket médio"      value={formatPrice(avgTicket)}            icon={TrendingUp}   accent="blue"  delay={0.1} />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : sales.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Sem pedidos" description="Nenhum pedido registrado ainda." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['#', 'Cliente / Endereço', 'Método', 'Total', 'Status', 'Data', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-[10px] uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-400">{s.id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900 font-medium">{s.client_name}</p>
                      {s.notes && (
                        <p className="text-[11px] text-gray-400 mt-0.5 max-w-[220px] truncate" title={s.notes}>
                          {s.notes.replace('Email: ', '').split(' · ').slice(1).join(' · ')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                        {methodLabels[s.payment_method] ?? s.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-600">{formatPrice(s.total)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', statusColor[s.payment_status] ?? 'text-gray-600 bg-gray-50 border-gray-200')}>
                        {statusLabel[s.payment_status] ?? s.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(s.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setToDelete(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir pedido?"
        description={`O pedido de ${toDelete?.client_name} no valor de ${toDelete ? formatPrice(toDelete.total) : ''} será excluído permanentemente.`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
