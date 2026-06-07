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
  activo: 'text-green-400 bg-green-400/10',
  inactivo: 'text-ink-500 bg-white/5',
  agotado: 'text-red-400 bg-red-400/10',
}
const statusLabel: Record<string, string> = {
  activo:'Activo', inactivo:'Inactivo', agotado:'Agotado',
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
    } finally {
      setLoading(false)
    }
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
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium text-cream-50">Productos</h1>
          <p className="text-sm text-ink-500">{products.length} productos en catálogo</p>
        </div>
        <Link
          to="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold-400 text-forest-950 font-semibold text-sm hover:bg-gold-300 transition-colors"
        >
          <Plus size={15} />Nuevo producto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-cream-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                category === c
                  ? 'bg-gold-400 text-forest-950'
                  : 'bg-white/5 text-ink-500 hover:text-cream-200 hover:bg-white/8'
              )}
            >
              {catLabel[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="Sin productos" description="Crea tu primer producto para empezar."
          action={<Link to="/admin/productos/nuevo" className="text-sm text-gold-400 hover:text-gold-300">+ Nuevo producto</Link>} />
      ) : (
        <div className="rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                {['Producto','Categoría','Precio','Stock','Estado',''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-ink-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-forest-900" />}
                      <div className="min-w-0">
                        <p className="text-cream-100 font-medium truncate max-w-[200px]">{p.name}</p>
                        {p.sku && <p className="text-[10px] text-ink-500 font-mono">{p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-500 text-xs capitalize">{catLabel[p.category] ?? p.category}</td>
                  <td className="px-4 py-3 font-mono text-cream-100">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 font-mono text-cream-200">{p.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium', statusColors[p.status])}>
                      {statusLabel[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/admin/productos/${p.id}`}
                        className="p-1.5 rounded-lg text-ink-500 hover:text-gold-400 hover:bg-gold-400/10 transition-colors">
                        <Pencil size={13} />
                      </Link>
                      <button onClick={() => setToDelete(p)}
                        className="p-1.5 rounded-lg text-ink-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="¿Eliminar producto?"
        description={`"${toDelete?.name}" será eliminado permanentemente.`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
