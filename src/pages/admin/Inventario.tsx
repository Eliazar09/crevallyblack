import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Boxes, AlertTriangle, Plus } from 'lucide-react'
import { getProducts, type DbProduct } from '../../lib/queries/products'
import { getLowStock, getMovements, createMovement, type InventoryMovement, type LowStockProduct } from '../../lib/queries/inventory'
import { StockBadge } from '../../components/admin/inventory/StockBadge'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { Skeleton } from '../../components/admin/ui/Skeleton'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../hooks/useToast'

const field = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-cream-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 transition-colors'
const lbl = 'text-xs font-mono text-ink-500 uppercase tracking-wider'

export default function Inventario() {
  const [products, setProducts] = useState<DbProduct[]>([])
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selProduct, setSelProduct] = useState('')
  const [movType, setMovType] = useState<'entrada' | 'salida' | 'ajuste'>('entrada')
  const [movQty, setMovQty] = useState(1)
  const [movReason, setMovReason] = useState('')
  const [saving, setSaving] = useState(false)
  const { push } = useToast()

  async function load() {
    setLoading(true)
    try {
      const [p, ls, m] = await Promise.all([getProducts(), getLowStock(), getMovements()])
      setProducts(p); setLowStock(ls); setMovements(m)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleMovement() {
    if (!selProduct) { push('Selecciona un producto', 'error'); return }
    if (movQty < 1) { push('La cantidad debe ser mayor a 0', 'error'); return }
    setSaving(true)
    try {
      await createMovement({ product_id: selProduct, type: movType, quantity: movQty, reason: movReason || movType })
      push('Movimiento registrado')
      setModalOpen(false); setMovQty(1); setMovReason(''); setSelProduct('')
      load()
    } catch { push('Error al registrar movimiento', 'error') }
    finally { setSaving(false) }
  }

  const typeLabel: Record<string, string> = { entrada:'Entrada', salida:'Salida', ajuste:'Ajuste' }
  const typeColor: Record<string, string> = { entrada:'text-green-400', salida:'text-red-400', ajuste:'text-blue-400' }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-cream-50">Inventario</h1>
          <p className="text-sm text-ink-500">{products.length} productos</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold-400 text-forest-950 font-semibold text-sm hover:bg-gold-300 transition-colors">
          <Plus size={15} />Ajustar stock
        </button>
      </div>

      {/* Alerta de stock bajo */}
      {lowStock.length > 0 && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/20 rounded-2xl px-5 py-4">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Alerta de stock bajo ({lowStock.length} productos)</p>
            <p className="text-xs text-amber-400/70 mt-0.5">{lowStock.map(p=>p.name).join(', ')}</p>
          </div>
        </motion.div>
      )}

      {/* Tabla de productos */}
      {loading ? (
        <div className="space-y-2">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-14 w-full"/>)}</div>
      ) : products.length === 0 ? (
        <EmptyState icon={Boxes} title="Sin productos" description="Crea productos para gestionar el inventario." />
      ) : (
        <div className="rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                {['Producto','Categoría','Stock','Mín.','Estado'].map((h)=>(
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <motion.tr key={p.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.02}}
                  className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-forest-900 flex-shrink-0"/>}
                      <p className="text-cream-100 font-medium">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-500 capitalize text-xs">{p.category}</td>
                  <td className="px-4 py-3 font-mono text-cream-200">{p.stock_quantity}</td>
                  <td className="px-4 py-3 font-mono text-ink-500">{p.min_stock}</td>
                  <td className="px-4 py-3"><StockBadge stock={p.stock_quantity} minStock={p.min_stock} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Historial de movimientos */}
      <div>
        <p className="text-sm font-semibold text-cream-100 mb-3">Últimos movimientos</p>
        {movements.length === 0 ? (
          <p className="text-sm text-ink-500 text-center py-8">Sin movimientos registrados</p>
        ) : (
          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  {['Producto','Tipo','Cantidad','Motivo','Fecha'].map((h)=>(
                    <th key={h} className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-ink-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.slice(0,20).map((m) => (
                  <tr key={m.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2.5 text-cream-100">{m.product_name}</td>
                    <td className={`px-4 py-2.5 text-xs font-medium ${typeColor[m.type]}`}>{typeLabel[m.type]}</td>
                    <td className="px-4 py-2.5 font-mono text-cream-200">{m.quantity > 0 ? '+' : ''}{m.quantity}</td>
                    <td className="px-4 py-2.5 text-ink-500 text-xs">{m.reason ?? '—'}</td>
                    <td className="px-4 py-2.5 text-ink-500 text-xs">{new Date(m.created_at).toLocaleDateString('es-VE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal ajuste */}
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title="Ajustar stock">
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className={lbl}>Producto *</label>
            <select value={selProduct} onChange={(e)=>setSelProduct(e.target.value)} className={field}>
              <option value="">Selecciona un producto</option>
              {products.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={lbl}>Tipo</label>
              <select value={movType} onChange={(e)=>setMovType(e.target.value as any)} className={field}>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={lbl}>Cantidad</label>
              <input type="number" min="1" value={movQty} onChange={(e)=>setMovQty(Number(e.target.value))} className={field} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={lbl}>Motivo</label>
            <input value={movReason} onChange={(e)=>setMovReason(e.target.value)} className={field} placeholder="Ej: Compra proveedor, Merma…" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded-full text-sm text-ink-400 border border-white/10 hover:bg-white/5">Cancelar</button>
            <button onClick={handleMovement} disabled={saving} className="px-5 py-2 rounded-full text-sm font-semibold bg-gold-400 text-forest-950 hover:bg-gold-300 disabled:opacity-60">
              {saving ? 'Guardando…' : 'Registrar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
