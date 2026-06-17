import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Package, Pencil, Trash2 } from 'lucide-react'
import { getProducts, deleteProduct, type DbProduct } from '../../lib/queries/products'
import { getActiveCollections, type DbCollection } from '../../lib/queries/collections'
import { formatPrice } from '../../lib/currency'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog'
import { Skeleton } from '../../components/admin/ui/Skeleton'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/cn'

const categories = ['all','camisetas','moletons','calcas','shorts','bones','conjuntos','acessorios'] as const
const catLabel: Record<string, string> = {
  all:'Todas', camisetas:'Camisetas', moletons:'Moletons', calcas:'Calças',
  shorts:'Shorts', bones:'Bonés', conjuntos:'Conjuntos', acessorios:'Acessórios',
}
const statusColors: Record<string, string> = {
  ativo:     'text-emerald-700 bg-emerald-50 border-emerald-200',
  inativo:   'text-gray-500 bg-gray-100 border-gray-200',
  rascunho:  'text-amber-700 bg-amber-50 border-amber-200',
}
const statusLabel: Record<string, string> = {
  ativo:'Ativo', inativo:'Inativo', rascunho:'Rascunho',
}

export default function Produtos() {
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [collectionId, setCollectionId] = useState<string>('all')
  const [collections, setCollections] = useState<DbCollection[]>([])
  const [toDelete, setToDelete] = useState<DbProduct | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { push } = useToast()

  useEffect(() => { getActiveCollections().then(setCollections).catch(() => {}) }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getProducts({ category: category as any, search, collection_id: collectionId as any })
      setProducts(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [category, search, collectionId])

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteProduct(toDelete.id)
      push('Produto excluído com sucesso')
      setToDelete(null)
      load()
    } catch {
      push('Erro ao excluir o produto', 'error')
    } finally { setDeleting(false) }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-gray-900 tracking-wide">PRODUTOS</h1>
          <p className="text-sm text-gray-500">{products.length} produtos no catálogo</p>
        </div>
        <Link to="/admin/produtos/novo"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink-900 text-white font-semibold text-sm hover:bg-ink-700 transition-colors">
          <Plus size={15} />Novo produto
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto…"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-coffee-500/40 transition-colors" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  category === c
                    ? 'bg-ink-900 text-white border-ink-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:text-gray-900 hover:border-gray-300')}>
                {catLabel[c]}
              </button>
            ))}
          </div>
        </div>
        {collections.length > 0 && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mr-1">Coleção:</span>
            <button onClick={() => setCollectionId('all')}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                collectionId === 'all'
                  ? 'bg-coffee-600 text-white border-coffee-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:text-gray-900 hover:border-gray-300')}>
              Todas
            </button>
            {collections.map((col) => (
              <button key={col.id} onClick={() => setCollectionId(col.id)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  collectionId === col.id
                    ? 'bg-coffee-600 text-white border-coffee-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:text-gray-900 hover:border-gray-300')}>
                {col.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="Sem produtos" description="Crie seu primeiro produto para começar."
          action={<Link to="/admin/produtos/novo" className="text-sm text-coffee-600 hover:text-coffee-500 font-medium">+ Novo produto</Link>} />
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
                    <p className="text-[11px] text-gray-400 capitalize mt-0.5">
                      {catLabel[p.category] ?? p.category}
                      {p.collection_name && <span className="ml-1 text-coffee-600">· {p.collection_name}</span>}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900 text-sm">{formatPrice(p.price)}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border', statusColors[p.status])}>
                      {statusLabel[p.status]}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{p.stock_quantity} em estoque</p>
                  <div className="flex gap-2 mt-auto pt-1">
                    <Link to={`/admin/produtos/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-coffee-50 text-coffee-700 text-xs font-semibold border border-coffee-100 hover:bg-coffee-100 transition-colors">
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
                  {['Produto','Categoria','Preço','Estoque','Status',''].map((h) => (
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
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <span className="capitalize">{catLabel[p.category] ?? p.category}</span>
                      {p.collection_name && <span className="ml-1 text-coffee-600 font-medium">· {p.collection_name}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{p.stock_quantity}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', statusColors[p.status])}>
                        {statusLabel[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link to={`/admin/produtos/${p.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-coffee-600 hover:bg-coffee-50 transition-colors">
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

      <ConfirmDialog open={!!toDelete} title="Excluir produto?"
        description={`"${toDelete?.name}" será excluído permanentemente.`}
        onConfirm={handleDelete} onCancel={() => setToDelete(null)} loading={deleting} />
    </div>
  )
}
