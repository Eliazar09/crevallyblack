import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, DollarSign, TrendingUp, Trash2, RefreshCw,
  Copy, Truck, CheckCircle2, Package, X, MapPin, Phone, Mail,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { getSales, deleteSale, updateShipping, type DbSale, type ShippingStatus } from '../../lib/queries/sales'
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog'
import { formatPrice } from '../../lib/currency'
import { StatCard } from '../../components/admin/ui/StatCard'
import { cn } from '../../lib/cn'
import { useToast } from '../../hooks/useToast'

/* ─── Helpers ──────────────────────────────────────────────── */

const payBorder: Record<string, string> = {
  pago:      'border-l-emerald-500',
  pendente:  'border-l-amber-400',
  parcial:   'border-l-blue-400',
  cancelado: 'border-l-red-400',
}
const payBadge: Record<string, string> = {
  pago:      'bg-emerald-500 text-white',
  pendente:  'bg-amber-400 text-white',
  parcial:   'bg-blue-500 text-white',
  cancelado: 'bg-red-500 text-white',
}
const payLabel: Record<string, string> = {
  pago: 'Pago', pendente: 'Pendente', parcial: 'Parcial', cancelado: 'Cancelado',
}

function monthRange() {
  const now = new Date()
  return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() }
}

function parseNotes(notes: string) {
  return {
    email:   (notes.match(/Email:\s*([^·]+)/i)   ?? [])[1]?.trim() ?? '',
    tel:     (notes.match(/Tel:\s*([^·]+)/i)     ?? [])[1]?.trim() ?? '',
    cep:     (notes.match(/CEP:\s*([\d\-]+)/i)   ?? [])[1]?.trim() ?? '',
    addr:    (notes.match(/CPF:[^·]+·\s*(.+?)\s*·\s*CEP:/i) ?? [])[1]?.trim() ?? '',
    cidade:  (notes.match(/,\s*([^,·]+\/[A-Z]{2})/)?.[1] ?? '').trim(),
    frete:   (notes.match(/Frete:\s*([^·\n]+)/i) ?? [])[1]?.trim() ?? '',
  }
}

function buildClipboard(sale: DbSale) {
  const n = parseNotes(sale.notes ?? '')
  const lines = [
    '📦 DADOS DE ENTREGA — Crevally Black',
    `Nome: ${sale.client_name}`,
  ]
  if (n.email)  lines.push(`Email: ${n.email}`)
  if (n.tel)    lines.push(`Tel: ${n.tel}`)
  if (n.cep)    lines.push(`CEP: ${n.cep}`)
  if (n.addr)   lines.push(`Endereço: ${n.addr}`)
  lines.push(`Valor do pedido: ${formatPrice(sale.total)}`)
  if (sale.tracking_code) lines.push(`Rastreio: ${sale.tracking_code}`)
  return lines.join('\n')
}

/* ─── Shipping steps ──────────────────────────────────────── */

type Step = { key: ShippingStatus | '_pag'; label: string; color: string; bg: string }
const STEPS: Step[] = [
  { key: '_pag',     label: 'Pago',     color: 'text-emerald-600', bg: 'bg-emerald-500' },
  { key: 'enviado',  label: 'Enviado',  color: 'text-blue-600',    bg: 'bg-blue-500'    },
  { key: 'entregue', label: 'Entregue', color: 'text-violet-600',  bg: 'bg-violet-500'  },
]

function stepIndex(sale: DbSale) {
  if (sale.payment_status !== 'pago') return -1
  const s = sale.shipping_status ?? 'aguardando'
  if (s === 'entregue') return 2
  if (s === 'enviado')  return 1
  return 0
}

function ShippingProgress({ sale }: { sale: DbSale }) {
  if (sale.payment_status !== 'pago') return null
  const cur = stepIndex(sale)
  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, i) => {
        const done   = i <= cur
        const active = i === cur
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all',
                done
                  ? `${step.bg} border-transparent`
                  : 'bg-white border-gray-200',
                active && 'ring-2 ring-offset-1 ring-current ' + step.color,
              )}>
                {done && <CheckCircle2 size={12} strokeWidth={2.5} className="text-white" />}
              </div>
              <span className={cn(
                'text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap',
                active ? step.color : done ? 'text-gray-500' : 'text-gray-300',
              )}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-1 mb-3.5 rounded-full transition-all',
                i < cur ? 'bg-gray-400' : 'bg-gray-150',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Modal rastreio ────────────────────────────────────────── */

function TrackingModal({ sale, onClose, onConfirm }: {
  sale: DbSale; onClose: () => void; onConfirm: (code: string) => Promise<void>
}) {
  const [code, setCode] = useState(sale.tracking_code ?? '')
  const [busy, setBusy] = useState(false)
  async function handle() {
    setBusy(true)
    try { await onConfirm(code) } finally { setBusy(false) }
  }
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm space-y-5"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center">
              <Truck size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-gray-900">Marcar como enviado</p>
              <p className="text-xs text-gray-400">{sale.client_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            Código de rastreio <span className="text-gray-300 font-normal normal-case">(opcional)</span>
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BR123456789BR"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
            autoFocus
          />
          <p className="text-[10px] text-gray-400 mt-2">Pode deixar em branco e adicionar depois.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-semibold">
            Cancelar
          </button>
          <button
            onClick={handle} disabled={busy}
            className="flex-1 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-lg shadow-blue-200"
          >
            {busy
              ? <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              : <Truck size={15} />
            }
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Order Card ────────────────────────────────────────────── */

function OrderCard({ sale, index, onCopy, onMarkEntregue, onDelete, onTrack }: {
  sale: DbSale
  index: number
  onCopy: () => void
  onMarkEntregue: () => void
  onDelete: () => void
  onTrack: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const n = parseNotes(sale.notes ?? '')
  const freight = sale.total - (sale.subtotal ?? sale.total)
  const canEnviado  = sale.payment_status === 'pago' && (sale.shipping_status ?? 'aguardando') === 'aguardando'
  const canEntregue = sale.payment_status === 'pago' && (sale.shipping_status ?? 'aguardando') === 'enviado'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden border-l-4 hover:shadow-md transition-shadow',
        payBorder[sale.payment_status] ?? 'border-l-gray-200',
      )}
    >
      {/* Card header */}
      <div className="px-5 pt-4 pb-3 flex items-start gap-4">
        {/* Avatar inicial */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
          sale.payment_status === 'pago'      ? 'bg-emerald-500' :
          sale.payment_status === 'pendente'  ? 'bg-amber-400' :
          sale.payment_status === 'cancelado' ? 'bg-red-500' : 'bg-gray-400'
        )}>
          {sale.client_name[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 text-sm">{sale.client_name}</p>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide', payBadge[sale.payment_status])}>
              {payLabel[sale.payment_status]}
            </span>
          </div>
          {n.cidade && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-400 truncate">{n.cep ? `${n.cep} — ` : ''}{n.cidade}</p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="font-mono font-bold text-lg text-gray-900">{formatPrice(sale.total)}</p>
          {freight > 0.5 && (
            <p className="text-[10px] text-gray-400 font-mono">+{formatPrice(freight)} frete</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-50 mx-5" />

      {/* Footer info */}
      <div className="px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 text-[11px] text-gray-400 flex-wrap">
          <span className="font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-semibold">
            #{sale.id.slice(-6).toUpperCase()}
          </span>
          <span>{new Date(sale.created_at).toLocaleDateString('pt-BR')}</span>
          {sale.tracking_code && (
            <button
              onClick={() => navigator.clipboard.writeText(sale.tracking_code!)}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-mono font-semibold hover:underline transition-colors"
            >
              <Copy size={10} />
              {sale.tracking_code}
            </button>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1.5">
          <button onClick={onCopy} title="Copiar endereço" className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Package size={14} />
          </button>
          {canEnviado && (
            <button onClick={onTrack} title="Marcar como enviado" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition-colors shadow-sm">
              <Truck size={12} />
              Enviado
            </button>
          )}
          {canEntregue && (
            <button onClick={onMarkEntregue} title="Marcar como entregue" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold transition-colors shadow-sm">
              <CheckCircle2 size={12} />
              Entregue
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={onDelete} title="Excluir" className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Shipping progress */}
      {sale.payment_status === 'pago' && (
        <div className="px-5 pb-4">
          <ShippingProgress sale={sale} />
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-50 mx-5 pt-3 pb-4 space-y-2">
              {n.email && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={11} className="text-gray-400" />
                  {n.email}
                </div>
              )}
              {n.tel && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={11} className="text-gray-400" />
                  {n.tel}
                </div>
              )}
              {n.addr && (
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <MapPin size={11} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{n.addr}{n.cep ? ` · CEP ${n.cep}` : ''}</span>
                </div>
              )}
              {n.frete && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck size={11} className="text-gray-400" />
                  {n.frete}
                </div>
              )}
              {freight > 0.5 && (
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <span className="text-gray-400">Produto: <span className="font-mono font-semibold text-gray-700">{formatPrice(sale.subtotal)}</span></span>
                  <span className="text-gray-300">+</span>
                  <span className="text-gray-400">Frete: <span className="font-mono font-semibold text-blue-600">{formatPrice(freight)}</span></span>
                  <span className="text-gray-300">=</span>
                  <span className="text-gray-400">Total: <span className="font-mono font-semibold text-emerald-600">{formatPrice(sale.total)}</span></span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Componente principal ──────────────────────────────────── */

type Filter = 'pago' | 'pendente' | 'todos'

export default function Pedidos() {
  const [sales, setSales]         = useState<DbSale[]>([])
  const [loading, setLoading]     = useState(true)
  const [toDelete, setToDelete]   = useState<DbSale | null>(null)
  const [deleting, setDeleting]   = useState(false)
  const [trackModal, setTrackModal] = useState<DbSale | null>(null)
  const [filter, setFilter]       = useState<Filter>('pago')
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
      setSales((prev) => prev.map((s) => s.id === sale.id
        ? { ...s, shipping_status: 'enviado', tracking_code: trackingCode || s.tracking_code }
        : s))
      setTrackModal(null)
      push('Pedido marcado como enviado!')
    } catch { push('Erro ao atualizar envio', 'error') }
  }

  async function handleMarkEntregue(sale: DbSale) {
    try {
      await updateShipping(sale.id, 'entregue')
      setSales((prev) => prev.map((s) => s.id === sale.id ? { ...s, shipping_status: 'entregue' } : s))
      push('Pedido marcado como entregue!')
    } catch { push('Erro ao atualizar entrega', 'error') }
  }

  function copyAddress(sale: DbSale) {
    navigator.clipboard.writeText(buildClipboard(sale))
      .then(() => push('Endereço copiado para a área de transferência!'))
  }

  const { from }   = monthRange()
  const monthly    = sales.filter((s) => s.created_at >= from)
  const monthPago  = monthly.filter((s) => s.payment_status === 'pago')
  const monthTotal = monthPago.reduce((a, s) => a + s.total, 0)
  const avgTicket  = monthPago.length ? monthTotal / monthPago.length : 0

  const visible = filter === 'todos' ? sales : sales.filter((s) => s.payment_status === filter)

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0e1420] to-[#1a2540] p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-coffee-600 flex items-center justify-center flex-shrink-0">
          <ShoppingCart size={18} strokeWidth={2} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-xl text-white tracking-wide">PEDIDOS</h1>
          <p className="text-xs text-neutral-400 mt-0.5">{visible.length} de {sales.length} pedido{sales.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
        >
          <RefreshCw size={13} />
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard title="Receita do mês" value={formatPrice(monthTotal)}  icon={DollarSign}   accent="green" delay={0}    subtitle="pedidos pagos" />
        <StatCard title="Pedidos do mês" value={String(monthly.length)}   icon={ShoppingCart} accent="gold"  delay={0.06} subtitle="todos os status" />
        <StatCard title="Ticket médio"   value={formatPrice(avgTicket)}   icon={TrendingUp}   accent="blue"  delay={0.12} />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['pago', 'pendente', 'todos'] as Filter[]).map((f) => {
          const counts = { pago: sales.filter(s => s.payment_status === 'pago').length, pendente: sales.filter(s => s.payment_status === 'pendente').length, todos: sales.length }
          return (
            <button key={f} onClick={() => setFilter(f)} className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
              filter === f
                ? f === 'pago'     ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                : f === 'pendente' ? 'bg-amber-400 text-white border-amber-400 shadow-md shadow-amber-200'
                :                   'bg-gray-800 text-white border-gray-800'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 bg-white'
            )}>
              {f === 'pago' ? 'Pagos' : f === 'pendente' ? 'Pendentes' : 'Todos'}
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                filter === f ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
              )}>
                {counts[f]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ShoppingCart size={22} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-gray-700">Nenhum pedido aqui</p>
          <p className="text-xs text-gray-400">
            {filter === 'pago' ? 'Nenhum pedido pago ainda. Veja "Pendentes" ou "Todos".' : 'Nenhum pedido encontrado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((s, i) => (
            <OrderCard
              key={s.id}
              sale={s}
              index={i}
              onCopy={() => copyAddress(s)}
              onMarkEntregue={() => handleMarkEntregue(s)}
              onDelete={() => setToDelete(s)}
              onTrack={() => setTrackModal(s)}
            />
          ))}
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
