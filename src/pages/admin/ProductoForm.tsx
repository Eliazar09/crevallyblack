import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getProductById, createProduct, updateProduct, type DbProduct } from '../../lib/queries/products'
import { getActiveCollections, type DbCollection } from '../../lib/queries/collections'
import { MultiPhotoUploader } from '../../components/admin/products/MultiPhotoUploader'
import { useToast } from '../../hooks/useToast'
import type { ProductCategory } from '../../data/products'

const CATEGORIES: ProductCategory[] = ['camisetas','moletons','calcas','shorts','bones','conjuntos','acessorios']
const catLabel: Record<string, string> = {
  camisetas:'Camisetas', moletons:'Moletons', calcas:'Calças',
  shorts:'Shorts', bones:'Bonés', conjuntos:'Conjuntos', acessorios:'Acessórios',
}

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

type FormState = {
  name: string; short: string; description: string
  composition: string; care: string; model_info: string
  images: string[]; price: string; category: ProductCategory
  featured: boolean; status: 'ativo' | 'inativo' | 'rascunho'
  stock_quantity: string
  sizes: string[]
  colors: string
  collection_id: string
}

const empty: FormState = {
  name:'', short:'', description:'', composition:'', care:'', model_info:'', images:[],
  price:'', category:'camisetas',
  featured:false, status:'ativo', stock_quantity:'0',
  sizes:[], colors:'', collection_id:'',
}

function fromDb(p: DbProduct): FormState {
  const allImages = p.image
    ? [p.image, ...(p.images ?? []).filter((u) => u !== p.image)]
    : (p.images ?? [])
  return {
    name: p.name, short: p.short, description: p.description,
    composition: p.composition ?? '', care: p.care ?? '', model_info: p.model_info ?? '',
    images: allImages, price: String(p.price),
    category: p.category, featured: p.featured, status: p.status,
    stock_quantity: String(p.stock_quantity),
    sizes: p.sizes ?? [],
    colors: (p.colors ?? []).join(', '),
    collection_id: p.collection_id ?? '',
  }
}

const field = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-coffee-500/50 focus:bg-white transition-colors'
const lbl = 'text-xs font-semibold text-gray-500 uppercase tracking-wider'

export default function ProdutoForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { push } = useToast()
  const isNew = !id
  const [form, setForm] = useState<FormState>(empty)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [collections, setCollections] = useState<DbCollection[]>([])

  useEffect(() => {
    getActiveCollections().then(setCollections).catch(() => {})
    if (!isNew) {
      getProductById(id!).then((p) => { setForm(fromDb(p)); setLoading(false) })
        .catch(() => { push('Produto não encontrado', 'error'); navigate('/admin/produtos') })
    }
  }, [id])

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function toggleSize(size: string) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { push('O nome é obrigatório', 'error'); return }
    if (!form.price) { push('O preço é obrigatório', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        short: form.short.trim(),
        description: form.description.trim(),
        composition: form.composition.trim(),
        care: form.care.trim(),
        model_info: form.model_info.trim(),
        image: form.images[0] ?? '',
        images: form.images,
        price: Number(form.price),
        cost_price: 0,
        category: form.category,
        sku: null,
        featured: form.featured,
        status: form.status,
        stock_quantity: Number(form.stock_quantity),
        min_stock: 5,
        sizes: form.sizes,
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        options: [],
        collection_id: form.collection_id || null,
      }
      if (isNew) await createProduct(payload as any)
      else await updateProduct(id!, payload)
      push(isNew ? 'Produto criado!' : 'Produto atualizado')
      navigate('/admin/produtos')
    } catch (err: any) {
      push(`Erro: ${err?.message ?? 'Não foi possível salvar'}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-coffee-600 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors bg-white">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display text-2xl text-gray-900 tracking-wide">
          {isNew ? 'NOVO PRODUTO' : 'EDITAR PRODUTO'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Fotos */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className={lbl}>Fotos do produto</p>
            <span className="text-[10px] text-gray-400 font-medium">Máx. 8 · A primeira vira capa</span>
          </div>
          <MultiPhotoUploader
            values={form.images}
            onChange={(urls) => set('images', urls)}
          />
        </div>

        {/* Info básica */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900">Informações gerais</p>
          <div className="space-y-1">
            <label className={lbl}>Nome *</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)}
              className={field} placeholder="Nome do produto" />
          </div>
          <div className="space-y-1">
            <label className={lbl}>Descrição curta</label>
            <input value={form.short} onChange={(e) => set('short', e.target.value)}
              className={field} placeholder="Uma linha descritiva" />
          </div>
          <div className="space-y-1">
            <label className={lbl}>Descrição completa</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              rows={3} className={field + ' resize-none'} placeholder="Descrição detalhada…" />
          </div>
          <div className="space-y-1">
            <label className={lbl}>Composição</label>
            <input value={form.composition} onChange={(e) => set('composition', e.target.value)}
              className={field} placeholder="Ex: 100% Algodão Penteado 300g" />
          </div>
          <div className="space-y-1">
            <label className={lbl}>Cuidados / Lavagem</label>
            <input value={form.care} onChange={(e) => set('care', e.target.value)}
              className={field} placeholder="Ex: Lavar a frio, não usar alvejante" />
          </div>
          <div className="space-y-1">
            <label className={lbl}>Info do modelo</label>
            <input value={form.model_info} onChange={(e) => set('model_info', e.target.value)}
              className={field} placeholder="Ex: Modelo 1,80m veste M" />
          </div>
        </div>

        {/* Tamanhos */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Tamanhos disponíveis</p>
          <div className="flex gap-2 flex-wrap">
            {SIZES.map((size) => (
              <button key={size} type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                  form.sizes.includes(size)
                    ? 'bg-ink-900 text-white border-ink-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Cores */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Cores disponíveis</p>
          <div className="space-y-1">
            <label className={lbl}>Cores (separadas por vírgula)</label>
            <input value={form.colors} onChange={(e) => set('colors', e.target.value)}
              className={field} placeholder="Ex: Preto, Branco, Chumbo" />
          </div>
        </div>

        {/* Preço e estoque */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900">Preço e estoque</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={lbl}>Preço (R$) *</label>
              <input required type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => set('price', e.target.value)} className={field} placeholder="0,00" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Quantidade em estoque</label>
              <input type="number" min="0" value={form.stock_quantity}
                onChange={(e) => set('stock_quantity', e.target.value)} className={field} />
            </div>
          </div>
        </div>

        {/* Categoria e status */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900">Classificação</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={lbl}>Categoria *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value as ProductCategory)}
                className={field}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel[c]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value as any)} className={field}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="rascunho">Rascunho</option>
              </select>
            </div>
          </div>
          {collections.length > 0 && (
            <div className="space-y-1">
              <label className={lbl}>Coleção</label>
              <select value={form.collection_id} onChange={(e) => set('collection_id', e.target.value)} className={field}>
                <option value="">Sem coleção</option>
                {collections.map((col) => <option key={col.id} value={col.id}>{col.name}</option>)}
              </select>
            </div>
          )}
          <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)}
              className="accent-coffee-600 w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Destaque (aparece na página inicial)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-full text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-ink-900 text-white hover:bg-ink-700 disabled:opacity-60 transition-colors">
            {saving ? 'Salvando…' : isNew ? 'Criar produto' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
