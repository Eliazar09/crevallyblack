import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
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
  image: string; price: string; category: ProductCategory
  featured: boolean; status: 'activo' | 'inactivo' | 'borrador'
  stock_quantity: string
  benefits: string[]
}

const empty: FormState = {
  name:'', short:'', description:'', how_to_use:'', image:'',
  price:'', category:'adelgazamiento',
  featured:false, status:'activo', stock_quantity:'0',
  benefits:[''],
}

function fromDb(p: DbProduct): FormState {
  return {
    name: p.name, short: p.short, description: p.description,
    how_to_use: p.how_to_use, image: p.image, price: String(p.price),
    category: p.category, featured: p.featured, status: p.status,
    stock_quantity: String(p.stock_quantity),
    benefits: p.benefits.length ? p.benefits : [''],
  }
}

const field = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-forest-600/50 focus:bg-white transition-colors'
const lbl = 'text-xs font-semibold text-gray-500 uppercase tracking-wider'

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
    if (!form.name.trim()) { push('El nombre es obligatorio', 'error'); return }
    if (!form.price) { push('El precio es obligatorio', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        short: form.short.trim(),
        description: form.description.trim(),
        how_to_use: form.how_to_use.trim(),
        image: form.image,
        images: [],
        price: Number(form.price),
        cost_price: 0,
        category: form.category,
        sku: null,
        featured: form.featured,
        status: form.status,
        stock_quantity: Number(form.stock_quantity),
        min_stock: 5,
        benefits: form.benefits.filter(Boolean),
        options: [],
      }
      if (isNew) await createProduct(payload as any)
      else await updateProduct(id!, payload)
      push(isNew ? '¡Producto creado!' : 'Producto actualizado')
      navigate('/admin/productos')
    } catch (err: any) {
      push(`Error: ${err?.message ?? 'No se pudo guardar'}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-forest-700 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors bg-white">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display text-xl font-semibold text-gray-900">
          {isNew ? 'Nuevo producto' : 'Editar producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Foto */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-3">
          <p className={lbl}>Foto del producto</p>
          <PhotoUploader value={form.image} onChange={(v) => set('image', v)} />
        </div>

        {/* Info básica */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900">Información general</p>
          <div className="space-y-1">
            <label className={lbl}>Nombre *</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)}
              className={field} placeholder="Nombre del producto" />
          </div>
          <div className="space-y-1">
            <label className={lbl}>Descripción corta</label>
            <input value={form.short} onChange={(e) => set('short', e.target.value)}
              className={field} placeholder="Una línea descriptiva" />
          </div>
          <div className="space-y-1">
            <label className={lbl}>Descripción completa</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              rows={3} className={field + ' resize-none'} placeholder="Descripción detallada…" />
          </div>
          <div className="space-y-1">
            <label className={lbl}>Modo de uso</label>
            <textarea value={form.how_to_use} onChange={(e) => set('how_to_use', e.target.value)}
              rows={2} className={field + ' resize-none'} placeholder="¿Cómo se usa?" />
          </div>
        </div>

        {/* Precio y stock */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900">Precio y stock</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={lbl}>Precio (USD) *</label>
              <input required type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => set('price', e.target.value)} className={field} placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Cantidad en stock</label>
              <input type="number" min="0" value={form.stock_quantity}
                onChange={(e) => set('stock_quantity', e.target.value)} className={field} />
            </div>
          </div>
        </div>

        {/* Categoría y estado */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900">Clasificación</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={lbl}>Categoría *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value as ProductCategory)}
                className={field}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel[c]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={lbl}>Estado</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value as any)} className={field}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="borrador">Borrador</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)}
              className="accent-forest-700 w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Destacado (aparece en la página de inicio)</span>
          </label>
        </div>

        {/* Beneficios */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Beneficios</p>
          {form.benefits.map((b, i) => (
            <div key={i} className="flex gap-2">
              <input value={b} onChange={(e) => {
                const nb = [...form.benefits]; nb[i] = e.target.value; set('benefits', nb)
              }} className={field} placeholder={`Beneficio ${i + 1}`} />
              {form.benefits.length > 1 && (
                <button type="button" onClick={() => set('benefits', form.benefits.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => set('benefits', [...form.benefits, ''])}
            className="text-xs text-forest-700 hover:text-forest-600 flex items-center gap-1 font-medium">
            <Plus size={12} />Agregar beneficio
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-full text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-forest-700 text-white hover:bg-forest-600 disabled:opacity-60 transition-colors">
            {saving ? 'Guardando…' : isNew ? 'Crear producto' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
