import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingDown, TrendingUp, Plus, BarChart2, Trash2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { getTransactions, getMonthlyFinance, createTransaction, getFinanceSummary, deleteTransaction, type Transaction, type MonthlyFinance } from '../../lib/queries/finance'
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog'
import { StatCard } from '../../components/admin/ui/StatCard'
import { StatCardSkeleton } from '../../components/admin/ui/Skeleton'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../hooks/useToast'
import { formatPrice } from '../../lib/currency'
import { cn } from '../../lib/cn'

const field = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-coffee-500/40 transition-colors'
const lbl = 'text-xs font-semibold text-gray-500 uppercase tracking-wider'

const INCOME_CATS = ['Venda','Abono','Outra receita']
const EXPENSE_CATS = ['Fornecedor','Marketing','Transporte','Operacional','Pessoal','Outra despesa']

export default function Financas() {
  const [summary, setSummary] = useState<{receitas:number;despesas:number;lucro:number}|null>(null)
  const [chart, setChart] = useState<MonthlyFinance[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [txType, setTxType] = useState<'receita'|'despesa'>('receita')
  const [txCat, setTxCat] = useState('Outra receita')
  const [txAmount, setTxAmount] = useState('')
  const [txDesc, setTxDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { push } = useToast()

  async function load() {
    setLoading(true)
    try {
      const [s, c, t] = await Promise.all([getFinanceSummary(), getMonthlyFinance(), getTransactions()])
      setSummary(s); setChart(c); setTransactions(t)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!txAmount || !txCat) { push('Preencha todos os campos', 'error'); return }
    setSaving(true)
    try {
      await createTransaction({ type: txType, category: txCat, amount: Number(txAmount), description: txDesc })
      push('Transação registrada')
      setModalOpen(false); setTxAmount(''); setTxDesc('')
      load()
    } catch { push('Erro ao registrar transação', 'error') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteTransaction(toDelete.id)
      push('Transação excluída')
      setToDelete(null)
      load()
    } catch { push('Erro ao excluir', 'error') }
    finally { setDeleting(false) }
  }

  const filtered = filterType === 'all' ? transactions : transactions.filter((t) => t.type === filterType)

  const shortMonth = (s: string) => {
    const [year, month] = s.split('-')
    const names = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    return `${names[Number(month)]} ${year.slice(2)}`
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-gray-900">FINANÇAS</h1>
          <p className="text-sm text-gray-500">Resumo do mês atual</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink-900 text-white font-semibold text-sm hover:bg-ink-700 transition-colors">
          <Plus size={15} />Nova transação
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          Array.from({length:3}).map((_,i)=><StatCardSkeleton key={i}/>)
        ) : (
          <>
            <StatCard title="Receitas do mês"  value={formatPrice(summary?.receitas??0)} icon={TrendingUp}   accent="green" delay={0} />
            <StatCard title="Despesas do mês"  value={formatPrice(summary?.despesas??0)} icon={TrendingDown} accent="red"   delay={0.05} />
            <StatCard title="Lucro líquido"    value={formatPrice(summary?.lucro??0)}    icon={DollarSign}   accent="gold"  delay={0.1}
              trend={(summary?.lucro??0) >= 0 ? 'up' : 'down'} />
          </>
        )}
      </div>

      {/* Gráfico */}
      {chart.length > 0 && (
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
          className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Evolução mensal</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chart.map((d) => ({ ...d, month: shortMonth(d.month) }))}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#6A6A6A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6A6A6A', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{ background: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: '#F5F4F0', fontSize: 12 }}
                formatter={(v) => [formatPrice(Number(v ?? 0)), '']}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#6A6A6A' }} />
              <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#4ade80" strokeWidth={2} fill="url(#gReceitas)" />
              <Area type="monotone" dataKey="despesas"  name="Despesas"  stroke="#f87171" strokeWidth={2} fill="url(#gDespesas)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Lista de transações */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900">Transações</p>
          <div className="flex gap-1.5">
            {(['all','receita','despesa'] as const).map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                className={cn('px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  filterType === t ? 'bg-coffee-400 text-white' : 'bg-gray-50 text-gray-500 hover:text-gray-700')}>
                {t === 'all' ? 'Todas' : t === 'receita' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={BarChart2} title="Sem transações" description="Registre receitas e despesas para ver o histórico." />
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Tipo','Categoria','Descrição','Valor','Data',''].map((h)=>(
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0,50).map((t, i) => (
                  <motion.tr key={t.id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.02}}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium',
                        t.type === 'receita' ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50')}>
                        {t.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.category}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{t.description ?? '—'}</td>
                    <td className={cn('px-4 py-3 font-mono font-medium', t.type === 'receita' ? 'text-emerald-600' : 'text-red-500')}>
                      {t.type === 'receita' ? '+' : '-'}{formatPrice(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setToDelete(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog open={!!toDelete} title="Excluir transação?"
        description={`A transação de ${toDelete ? formatPrice(toDelete.amount) : ''} será excluída permanentemente.`}
        onConfirm={handleDelete} onCancel={() => setToDelete(null)} loading={deleting} />

      {/* Modal nova transação */}
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title="Nova transação">
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['receita','despesa'] as const).map((t)=>(
              <button key={t} onClick={()=>{setTxType(t);setTxCat(t==='receita'?'Outra receita':'Outra despesa')}}
                className={cn('py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  txType===t ? (t==='receita'?'bg-green-500/20 text-green-600 border border-green-400/30':'bg-red-500/20 text-red-500 border border-red-400/30')
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:text-gray-700')}>
                {t==='receita'?'Receita':'Despesa'}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Categoria</label>
            <select value={txCat} onChange={(e)=>setTxCat(e.target.value)} className={field}>
              {(txType==='receita'?INCOME_CATS:EXPENSE_CATS).map((c)=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Valor (R$)</label>
            <input type="number" min="0" step="0.01" value={txAmount} onChange={(e)=>setTxAmount(e.target.value)} className={field} placeholder="0,00" />
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Descrição</label>
            <input value={txDesc} onChange={(e)=>setTxDesc(e.target.value)} className={field} placeholder="Detalhe da transação…" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded-full text-sm text-gray-400 border border-gray-200 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleCreate} disabled={saving} className="px-5 py-2 rounded-full text-sm font-semibold bg-ink-900 text-white hover:bg-ink-700 disabled:opacity-60">
              {saving?'Salvando…':'Registrar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
