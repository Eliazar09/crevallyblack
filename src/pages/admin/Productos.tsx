import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Package, Pencil, Trash2 } from 'lucide-react'
import { getProducts, deleteProduct, type DbProduct } from '../../lib/queries/products'
import { formatPrice } from '../../lib/currency'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog'
import { Skeleton } from '../../components/admin/ui/Skeleton'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/cn'

const categories = ['all','adelgazamiento','detox','fitness','belleza','descanso','vitaminas','masculino'] as const
const catLabel: Record<string, string> = {
  all:'Todas', adelgazamiento:'Adelgazamiento', detox:'Detox', fitness:'Fitness',
  belleza:'Belleza', descanso:'Descanso', vitaminas:'Vitaminas', masculino:'Masculino',
}
const statusColors: Record<string, string> = {
  activo:   'text-emerald-700 bg-emerald-50 border-emerald-200',
  inactivo: 'text-gray-500 bg-gray-100 border-gray-200',
  borrador: 'text-amber-700 bg-amber-50 border-amber-200',
}
const statusLabel: Record<string, string> = {
  activo:'Activo', inactivo:'Inactivo', borrador:'Borrador',
}

export default function Productos() {
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [toDelete, setToDelete] = useState<DbProduct | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { push } = useToast()

  async function load() {
    setLoading(true)
    try {
      const data = await getProducts({ category: category as any, search })
      setProducts(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [category, search])

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteProduct(toDelete.id)
      push('Producto eliminado correctamente')
      setToDelete(null)
      load()
    } catch {
      push('Error al eliminar el producto', 'error')
    } finally { setDeleting(false) }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500">{products.length} productos en catálogo</p>
        </div>
        <Link to="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest-700 text-white font-semibold text-sm hover:bg-forest-600 transition-colors">
          <Plus size={15} />Nuevo producto
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-forest-600/40 transition-colors" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                category === c
                  ? 'bg-forest-700 text-white border-forest-700'
                  : 'bg-white text-gray-500 border-gray-200 hover:text-gray-900 hover:border-gray-300')}>
              {catLabel[c]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="Sin productos" description="Crea tu primer producto para empezar."
          action={<Link to="/admin/productos/nuevo" className="text-sm text-forest-700 hover:text-forest-600 font-medium">+ Nuevo producto</Link>} />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden grid grid-cols-2 gap-3">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-32 object-cover bg-gray-100" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <Package size={24} className="text-gray-300" />
                  </div>
                )}
                <div className="p-3 flex flex-col flex-1 gap-2">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm leading-tight line-clamp-2">{p.name}</p>
                    <p className="text-[11px] text-gray-400 capitalize mt-0.5">{catLabel[p.category] ?? p.category}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900 text-sm">{formatPrice(p.price)}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border', statusColors[p.status])}>
                      {statusLabel[p.status]}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{p.stock_quantity} en stock</p>
                  <div className="flex gap-2 mt-auto pt-1">
                    <Link to={`/admin/productos/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-forest-50 text-forest-700 text-xs font-semibold border border-forest-100 hover:bg-forest-100 transition-colors">
                      <Pencil size={11} /> Editar
                    </Link>
                    <button onClick={() => setToDelete(p)}
                      className="p-2 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Producto','Categoría','Precio','Stock','Estado',''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-[10px] uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image && <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-gray-100" />}
                        <p className="text-gray-900 font-medium truncate max-w-[200px]">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs capitalize">{catLabel[p.category] ?? p.category}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{p.stock_quantity}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', statusColors[p.status])}>
                        {statusLabel[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link to={`/admin/productos/${p.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-forest-700 hover:bg-forest-50 transition-colors">
                          <Pencil size={13} />
                        </Link>
                        <button onClick={() => setToDelete(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog open={!!toDelete} title="¿Eliminar producto?"
        description={`"${toDelete?.name}" será eliminado permanentemente.`}
        onConfirm={handleDelete} onCancel={() => setToDelete(null)} loading={deleting} />
    </div>
  )
}
