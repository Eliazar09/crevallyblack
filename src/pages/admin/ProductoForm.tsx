import { useEffect, useState, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { getProductById, createProduct, updateProduct, type DbProduct } from '../../lib/queries/products'
import { PhotoUploader } from '../../components/admin/products/PhotoUploader'
import { useToast } from '../../hooks/useToast'
import type { ProductCategory } from '../../data/products'

const CATEGORIES: ProductCategory[] = ['adelgazamiento','detox','fitness','belleza','descanso','vitaminas','masculino']
const catLabel: Record<string, string> = {
  adelgazamiento:'Adelgazamiento', detox:'Detox', fitness:'Fitness',
  belleza:'Belleza', descanso:'Descanso', vitaminas:'Vitaminas', masculino:'Masculino',
}

type FormState = {
  name: string; short: string; description: string; how_to_use: string
  image: string; price: string; cost_price: string; category: ProductCategory
  sku: string; featured: boolean; status: 'activo' | 'inactivo' | 'agotado'
  stock_quantity: string; min_stock: string
  benefits: string[]
  options: Array<{ label: string; value: string; price: string }>
}

const empty: FormState = {
  name:'', short:'', description:'', how_to_use:'', image:'',
  price:'', cost_price:'', category:'adelgazamiento', sku:'',
  featured:false, status:'activo', stock_quantity:'0', min_stock:'5',
  benefits:[''], options:[],
}

function fromDb(p: DbProduct): FormState {
  return {
    name: p.name, short: p.short, description: p.description,
    how_to_use: p.how_to_use, image: p.image, price: String(p.price),
    cost_price: String(p.cost_price ?? ''), category: p.category,
    sku: p.sku ?? '', featured: p.featured, status: p.status,
    stock_quantity: String(p.stock_quantity), min_stock: String(p.min_stock),
    benefits: p.benefits.length ? p.benefits : [''],
    options: (p.options ?? []).map((o) => ({ ...o, price: String(o.price ?? '') })),
  }
}

const field = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-cream-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-400/40 transition-colors'
const label = 'text-xs font-mono text-ink-500 uppercase tracking-wider'

export default function ProductoForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { push } = useToast()
  const isNew = !id
  const [form, setForm] = useState<FormState>(empty)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      getProductById(id!).then((p) => { setForm(fromDb(p)); setLoading(false) })
        .catch(() => { push('Producto no encontrado', 'error'); navigate('/admin/productos') })
    }
  }, [id])

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name, short: form.short, description: form.description,
        how_to_use: form.how_to_use, image: form.image, images: [],
        price: Number(form.price), cost_price: form.cost_price ? Number(form.cost_price) : null,
        category: form.category, sku: form.sku || null,
        featured: form.featured, status: form.status,
        stock_quantity: Number(form.stock_quantity), min_stock: Number(form.min_stock),
        benefits: form.benefits.filter(Boolean),
        options: form.options.length
          ? form.options.map((o) => ({ label: o.label, value: o.value, price: o.price ? Number(o.price) : undefined }))
          : null,
      }
      if (isNew) await createProduct(payload as any)
      else await updateProduct(id!, payload)
      push(isNew ? 'Producto creado' : 'Producto actualizado')
      navigate('/admin/productos')
    } catch {
      push('Error al guardar el producto', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-ink-500 hover:text-cream-200 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-2xl font-medium text-cream-50">
          {isNew ? 'Nuevo producto' : 'Editar producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto */}
        <div className="bg-forest-900/60 border border-white/5 rounded-2xl p-5 space-y-3">
          <p className={label}>Foto del producto</p>
          <PhotoUploader value={form.image} onChange={(v) => set('image', v)} />
        </div>

        {/* Info básica */}
        <div className="bg-forest-900/60 border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-cream-100">Información general</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className={label}>Nombre *</label>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={field} placeholder="Nombre del producto" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className={label}>Descripción corta *</label>
              <input required value={form.short} onChange={(e) => set('short', e.target.value)} className={field} placeholder="Una línea descriptiva" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className={label}>Descripción completa</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4}
                className={field + ' resize-none'} placeholder="Descripción detallada…" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className={label}>Modo de uso</label>
              <textarea value={form.how_to_use} onChange={(e) => set('how_to_use', e.target.value)} rows={2}
                className={field + ' resize-none'} placeholder="¿Cómo se usa?" />
            </div>
          </div>
        </div>

        {/* Precios y stock */}
        <div className="bg-forest-900/60 border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-cream-100">Precios y stock</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className={label}>Precio ($) *</label>
              <input required type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => set('price', e.target.value)} className={field} placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className={label}>Costo ($)</label>
              <input type="number" min="0" step="0.01" value={form.cost_price}
                onChange={(e) => set('cost_price', e.target.value)} className={field} placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className={label}>Stock actual</label>
              <input type="number" min="0" value={form.stock_quantity}
                onChange={(e) => set('stock_quantity', e.target.value)} className={field} />
            </div>
            <div className="space-y-1">
              <label className={label}>Stock mínimo</label>
              <input type="number" min="0" value={form.min_stock}
                onChange={(e) => set('min_stock', e.target.value)} className={field} />
            </div>
          </div>
        </div>

        {/* Clasificación */}
        <div className="bg-forest-900/60 border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-cream-100">Clasificación</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className={label}>Categoría *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value as ProductCategory)}
                className={field}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel[c]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={label}>Estado</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value as any)} className={field}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={label}>SKU</label>
              <input value={form.sku} onChange={(e) => set('sku', e.target.value)} className={field} placeholder="GL-001" />
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)}
              className="accent-gold-400 w-4 h-4" />
            <span className="text-sm text-cream-200">Destacado (aparece en Inicio)</span>
          </label>
        </div>

        {/* Beneficios */}
        <div className="bg-forest-900/60 border border-white/5 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-cream-100">Beneficios</p>
          {form.benefits.map((b, i) => (
            <div key={i} className="flex gap-2">
              <input value={b} onChange={(e) => {
                const nb = [...form.benefits]; nb[i] = e.target.value; set('benefits', nb)
              }} className={field} placeholder={`Beneficio ${i + 1}`} />
              {form.benefits.length > 1 && (
                <button type="button" onClick={() => set('benefits', form.benefits.filter((_, j) => j !== i))}
                  className="text-ink-500 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => set('benefits', [...form.benefits, ''])}
            className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
            <Plus size={12} />Agregar beneficio
          </button>
        </div>

        {/* Variantes */}
        <div className="bg-forest-900/60 border border-white/5 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-cream-100">Variantes (opcional)</p>
          {form.options.map((opt, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 items-center">
              <input value={opt.label} onChange={(e) => {
                const no = [...form.options]; no[i] = { ...no[i], label: e.target.value }; set('options', no)
              }} className={field} placeholder="Etiqueta (ej: 30 Caps)" />
              <input value={opt.value} onChange={(e) => {
                const no = [...form.options]; no[i] = { ...no[i], value: e.target.value }; set('options', no)
              }} className={field} placeholder="Valor (ej: 30caps)" />
              <div className="flex gap-2">
                <input type="number" value={opt.price} onChange={(e) => {
                  const no = [...form.options]; no[i] = { ...no[i], price: e.target.value }; set('options', no)
                }} className={field} placeholder="Precio" />
                <button type="button" onClick={() => set('options', form.options.filter((_, j) => j !== i))}
                  className="text-ink-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button type="button"
            onClick={() => set('options', [...form.options, { label:'', value:'', price:'' }])}
            className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
            <Plus size={12} />Agregar variante
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-full text-sm text-ink-400 border border-white/10 hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gold-400 text-forest-950 hover:bg-gold-300 disabled:opacity-60 transition-colors">
            {saving ? 'Guardando…' : isNew ? 'Crear producto' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
