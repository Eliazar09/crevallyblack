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

const field = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-forest-600/40 transition-colors'
const lbl = 'text-xs font-semibold text-gray-500 uppercase tracking-wider'

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
  const typeColor: Record<string, string> = { entrada:'text-emerald-600 bg-emerald-50', salida:'text-red-600 bg-red-50', ajuste:'text-blue-600 bg-blue-50' }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500">{products.length} productos</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest-700 text-white font-semibold text-sm hover:bg-forest-600 transition-colors">
          <Plus size={15} />Ajustar stock
        </button>
      </div>

      {lowStock.length > 0 && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Alerta de stock bajo ({lowStock.length} productos)</p>
            <p className="text-xs text-amber-700 mt-0.5">{lowStock.map(p=>p.name).join(', ')}</p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-14 w-full"/>)}</div>
      ) : products.length === 0 ? (
        <EmptyState icon={Boxes} title="Sin productos" description="Crea productos para gestionar el inventario." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Producto','Categoría','Stock','Mín.','Estado'].map((h)=>(
                  <th key={h} className="px-4 py-3 text-left font-semibold text-[10px] uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p, i) => (
                <motion.tr key={p.id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.02}}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100 flex-shrink-0"/>}
                      <p className="text-gray-900 font-medium">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize text-xs">{p.category}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">{p.stock_quantity}</td>
                  <td className="px-4 py-3 font-mono text-gray-400">{p.min_stock}</td>
                  <td className="px-4 py-3"><StockBadge stock={p.stock_quantity} minStock={p.min_stock} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Últimos movimientos</p>
        {movements.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sin movimientos registrados</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Producto','Tipo','Cantidad','Motivo','Fecha'].map((h)=>(
                    <th key={h} className="px-4 py-2.5 text-left font-semibold text-[10px] uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {movements.slice(0,20).map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-900">{m.product_name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor[m.type]}`}>{typeLabel[m.type]}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-gray-900">{m.quantity > 0 ? '+' : ''}{m.quantity}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{m.reason ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{new Date(m.created_at).toLocaleDateString('es-VE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title="Ajustar stock">
        <div className="p-5 space-y-4">
          <p className="font-semibold text-gray-900 pr-8">Ajustar stock</p>
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
            <button onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-200 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleMovement} disabled={saving} className="px-5 py-2 rounded-full text-sm font-semibold bg-forest-700 text-white hover:bg-forest-600 disabled:opacity-60">
              {saving ? 'Guardando…' : 'Registrar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
