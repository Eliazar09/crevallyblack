import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, DollarSign, TrendingUp, Trash2, RefreshCw,
  Copy, Truck, CheckCircle2, Package, X
} from 'lucide-react'
import { getSales, deleteSale, updateShipping, type DbSale, type ShippingStatus } from '../../lib/queries/sales'
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog'
import { formatPrice } from '../../lib/currency'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Skeleton } from '../../components/admin/ui/Skeleton'
import { StatCard } from '../../components/admin/ui/StatCard'
import { cn } from '../../lib/cn'
import { useToast } from '../../hooks/useToast'

/* ─── Helpers ──────────────────────────────────────────────── */

const statusPayColor: Record<string, string> = {
  pago:      'text-emerald-700 bg-emerald-50 border-emerald-200',
  pendente:  'text-amber-700 bg-amber-50 border-amber-200',
  parcial:   'text-blue-700 bg-blue-50 border-blue-200',
  cancelado: 'text-red-700 bg-red-50 border-red-200',
}
const statusPayLabel: Record<string, string> = {
  pago: 'Pago', pendente: 'Pendente', parcial: 'Parcial', cancelado: 'Cancelado',
}

function monthRange() {
  const now = new Date()
  return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() }
}

/** Extrai dados do campo notes para copiar no Melhor Envio */
function parseAddressFromNotes(sale: DbSale) {
  const notes = sale.notes ?? ''
  // formato: "Email: x · Tel: x · CPF: x · Rua, Num, Compl — Bairro, Cidade/UF · CEP: x [· Frete: ...]"
  const cepMatch    = notes.match(/CEP:\s*([\d\-]+)/i)
  const addrMatch   = notes.match(/CPF:[^·]+·\s*(.+?)\s*·\s*CEP:/i)
  const telMatch    = notes.match(/Tel:\s*([^·]+)/i)
  const emailMatch  = notes.match(/Email:\s*([^·]+)/i)

  const lines: string[] = [
    `📦 DADOS DE ENTREGA — Crevally Black`,
    `Nome: ${sale.client_name}`,
  ]
  if (emailMatch) lines.push(`Email: ${emailMatch[1].trim()}`)
  if (telMatch)   lines.push(`Tel: ${telMatch[1].trim()}`)
  if (cepMatch)   lines.push(`CEP: ${cepMatch[1].trim()}`)
  if (addrMatch)  lines.push(`Endereço: ${addrMatch[1].trim()}`)
  lines.push(`Valor do pedido: ${formatPrice(sale.total)}`)
  if (sale.tracking_code) lines.push(`Rastreio: ${sale.tracking_code}`)
  return lines.join('\n')
}

/* ─── LED de progresso ──────────────────────────────────────── */

type Step = { key: ShippingStatus | '_pag'; label: string; color: string; pulse: string }
const STEPS: Step[] = [
  { key: '_pag',      label: 'Pago',     color: 'bg-emerald-500',  pulse: 'shadow-[0_0_8px_3px_rgba(16,185,129,0.7)]' },
  { key: 'enviado',   label: 'Enviado',  color: 'bg-blue-500',     pulse: 'shadow-[0_0_8px_3px_rgba(59,130,246,0.7)]' },
  { key: 'entregue',  label: 'Entregue', color: 'bg-violet-500',   pulse: 'shadow-[0_0_8px_3px_rgba(139,92,246,0.7)]' },
]

function currentStepIndex(sale: DbSale) {
  if (sale.payment_status !== 'pago') return -1
  const s = sale.shipping_status ?? 'aguardando'
  if (s === 'entregue') return 2
  if (s === 'enviado')  return 1
  return 0 // pago mas não enviado ainda
}

function ShippingLED({ sale }: { sale: DbSale }) {
  if (sale.payment_status !== 'pago') {
    return (
      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
        {statusPayLabel[sale.payment_status] ?? sale.payment_status}
      </span>
    )
  }
  const cur = currentStepIndex(sale)
  return (
    <div className="flex items-start gap-0">
      {STEPS.map((step, i) => {
        const done    = i <= cur
        const active  = i === cur
        const lineAfter = i < STEPS.length - 1
        return (
          <div key={step.key} className="flex items-start">
            <div className="flex flex-col items-center gap-1 w-12">
              <div className={cn(
                'w-3 h-3 rounded-sm transition-all duration-500',
                done ? step.color : 'bg-gray-200',
                active && 'animate-pulse ' + step.pulse,
              )} />
              <span className={cn(
                'text-[9px] font-mono uppercase tracking-wider leading-none text-center',
                active ? 'text-gray-700 font-bold' : done ? 'text-gray-500' : 'text-gray-300',
              )}>
                {step.label}
              </span>
            </div>
            {lineAfter && (
              <div className={cn(
                'w-3 h-0.5 mt-[5px] transition-all duration-500',
                i < cur ? 'bg-gray-400' : 'bg-gray-200',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Modal rastreio ────────────────────────────────────────── */

function TrackingModal({
  sale,
  onClose,
  onConfirm,
}: {
  sale: DbSale
  onClose: () => void
  onConfirm: (code: string) => Promise<void>
}) {
  const [code, setCode] = useState(sale.tracking_code ?? '')
  const [busy, setBusy]  = useState(false)

  async function handle() {
    setBusy(true)
    try { await onConfirm(code) } finally { setBusy(false) }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm space-y-4"
        initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg text-gray-900 tracking-wide">MARCAR ENVIADO</p>
            <p className="text-xs text-gray-500 mt-0.5">{sale.client_name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
            Código de rastreio (opcional)
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BR123456789BR"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
            autoFocus
          />
          <p className="text-[10px] text-gray-400 mt-1.5">
            Pode deixar em branco e adicionar depois.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handle}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {busy ? <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <Truck size={14} />}
            Confirmar envio
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Componente principal ──────────────────────────────────── */

type Filter = 'pago' | 'pendente' | 'todos'

export default function Pedidos() {
  const [sales, setSales]           = useState<DbSale[]>([])
  const [loading, setLoading]       = useState(true)
  const [toDelete, setToDelete]     = useState<DbSale | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [trackModal, setTrackModal] = useState<DbSale | null>(null)
  const [filter, setFilter]         = useState<Filter>('pago')
  const { push } = useToast()
  function load() {
    setLoading(true)
    getSales()
      .then(setSales)
      .catch(() => push('Erro ao carregar pedidos', 'error'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try { await deleteSale(toDelete.id); push('Pedido excluído'); setToDelete(null); load() }
    catch { push('Erro ao excluir', 'error') }
    finally { setDeleting(false) }
  }

  async function handleMarkEnviado(sale: DbSale, trackingCode: string) {
    try {
      await updateShipping(sale.id, 'enviado', trackingCode || undefined)
      setSales((prev) => prev.map((s) => s.id === sale.id ? { ...s, shipping_status: 'enviado', tracking_code: trackingCode || s.tracking_code } : s))
      setTrackModal(null)
      push('Pedido marcado como enviado 🚚')
    } catch { push('Erro ao atualizar envio', 'error') }
  }

  async function handleMarkEntregue(sale: DbSale) {
    try {
      await updateShipping(sale.id, 'entregue')
      setSales((prev) => prev.map((s) => s.id === sale.id ? { ...s, shipping_status: 'entregue' } : s))
      push('Pedido marcado como entregue ✅')
    } catch { push('Erro ao atualizar entrega', 'error') }
  }

  function copyAddress(sale: DbSale) {
    const text = parseAddressFromNotes(sale)
    navigator.clipboard.writeText(text).then(() => {
      push('Endereço copiado! Cole no Melhor Envio 📋')
    })
  }

  const { from }      = monthRange()
  const monthly       = sales.filter((s) => s.created_at >= from)
  const monthPago     = monthly.filter((s) => s.payment_status === 'pago')
  const monthTotal    = monthPago.reduce((a, s) => a + s.total, 0)
  const avgTicket     = monthPago.length ? monthTotal / monthPago.length : 0

  const visible = filter === 'todos' ? sales
    : sales.filter((s) => s.payment_status === filter)

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-gray-900 tracking-wide">PEDIDOS</h1>
          <p className="text-sm text-gray-500">{visible.length} de {sales.length} pedido{sales.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtros */}
          {(['pago', 'pendente', 'todos'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-semibold border transition-colors',
                filter === f
                  ? f === 'pago'     ? 'bg-emerald-500 text-white border-emerald-500'
                  : f === 'pendente' ? 'bg-amber-400 text-white border-amber-400'
                  :                   'bg-gray-700 text-white border-gray-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              )}
            >
              {f === 'pago' ? '✅ Pagos' : f === 'pendente' ? '⏳ Pendentes' : '📋 Todos'}
            </button>
          ))}
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={13} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard title="Receita do mês"  value={formatPrice(monthTotal)}    icon={DollarSign}   accent="green" delay={0}    subtitle="pedidos pagos" />
        <StatCard title="Pedidos do mês"  value={String(monthly.length)}      icon={ShoppingCart} accent="gold"  delay={0.05} subtitle="todos os status" />
        <StatCard title="Ticket médio"    value={formatPrice(avgTicket)}      icon={TrendingUp}   accent="blue"  delay={0.1} />
      </div>

      {/* Legenda LED */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500">
        <span className="font-semibold text-gray-700">Status de envio:</span>
        {[
          { color: 'bg-emerald-500', label: 'Pago — aguardando envio' },
          { color: 'bg-blue-500',    label: 'Enviado' },
          { color: 'bg-violet-500',  label: 'Entregue' },
          { color: 'bg-gray-200',    label: 'Pendente/Cancelado' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-sm flex-shrink-0', color)} />
            {label}
          </span>
        ))}
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : visible.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Nenhum pedido aqui" description={filter === 'pago' ? 'Nenhum pedido pago ainda. Use "Todos" para ver pendentes.' : 'Nenhum pedido encontrado.'} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['#', 'Cliente', 'Total', 'Pagamento', 'Rastreio', 'Entrega', 'Data', 'Ações'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map((s, i) => {
                  const canMarkEnviado = s.payment_status === 'pago' && (s.shipping_status ?? 'aguardando') === 'aguardando'
                  const canMarkEntregue = s.payment_status === 'pago' && (s.shipping_status ?? 'aguardando') === 'enviado'
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.012 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-[11px] text-gray-400">{s.id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 font-medium whitespace-nowrap">{s.client_name}</p>
                        {s.notes && (
                          <p className="text-[10px] text-gray-400 mt-0.5 max-w-[180px] truncate" title={s.notes}>
                            {(s.notes.match(/CEP:\s*([\d\-]+)/i) ?? [])[1] ?? ''}
                            {' — '}
                            {(s.notes.match(/,\s*([^,·]+\/[A-Z]{2})/)?.[1] ?? '')}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-600 whitespace-nowrap">{formatPrice(s.total)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap', statusPayColor[s.payment_status] ?? 'text-gray-600 bg-gray-50 border-gray-200')}>
                          {statusPayLabel[s.payment_status] ?? s.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.tracking_code ? (
                          <button
                            onClick={() => navigator.clipboard.writeText(s.tracking_code!).then(() => push('Código copiado!'))}
                            className="font-mono text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            title="Clique para copiar"
                          >
                            {s.tracking_code}
                            <Copy size={10} />
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-300 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ShippingLED sale={s} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(s.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Copiar endereço para Melhor Envio */}
                          <button
                            onClick={() => copyAddress(s)}
                            title="Copiar endereço para Melhor Envio"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Package size={13} />
                          </button>
                          {/* Marcar como Enviado */}
                          {canMarkEnviado && (
                            <button
                              onClick={() => setTrackModal(s)}
                              title="Marcar como enviado"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Truck size={13} />
                            </button>
                          )}
                          {/* Marcar como Entregue */}
                          {canMarkEntregue && (
                            <button
                              onClick={() => handleMarkEntregue(s)}
                              title="Marcar como entregue"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          {/* Excluir */}
                          <button
                            onClick={() => setToDelete(s)}
                            title="Excluir pedido"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal rastreio */}
      <AnimatePresence>
        {trackModal && (
          <TrackingModal
            sale={trackModal}
            onClose={() => setTrackModal(null)}
            onConfirm={(code) => handleMarkEnviado(trackModal, code)}
          />
        )}
      </AnimatePresence>

      {/* Confirm excluir */}
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
