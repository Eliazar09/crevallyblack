import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Layers2, Check, X, GripVertical, Upload, Loader, ImageIcon } from 'lucide-react'
import {
  getCollections, createCollection, updateCollection, deleteCollection, slugify,
  type DbCollection,
} from '../../lib/queries/collections'
import { uploadProductPhoto } from '../../lib/queries/products'
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog'
import { Skeleton } from '../../components/admin/ui/Skeleton'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/cn'

const field = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-coffee-500/50 focus:bg-white transition-colors'
const lbl  = 'text-xs font-semibold text-gray-500 uppercase tracking-wider'

// ── Single image uploader ─────────────────────────────────────────

interface SingleImageProps {
  value: string
  onChange: (url: string) => void
}

function SingleImageUpload({ value, onChange }: SingleImageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const url = await uploadProductPhoto(file)
      onChange(url)
    } catch {
      // silently fail — toast handled by parent
    } finally {
      setUploading(false)
    }
  }

  if (value) {
    return (
      <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
        <img src={value} alt="capa da coleção" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-white/90 text-gray-700 text-xs font-semibold hover:bg-white transition-colors flex items-center gap-1.5"
          >
            <Upload size={11} />Trocar
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-1.5 rounded-lg bg-red-500/90 text-white text-xs font-semibold hover:bg-red-500 transition-colors flex items-center gap-1.5"
          >
            <X size={11} />Remover
          </button>
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader size={20} className="animate-spin text-coffee-600" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = '' }}
        />
      </div>
    )
  }

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      className="w-full aspect-[3/2] rounded-xl border-2 border-dashed border-gray-200 hover:border-coffee-400 hover:bg-coffee-50/30 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-400"
    >
      {uploading ? (
        <Loader size={20} className="animate-spin text-coffee-600" />
      ) : (
        <>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <ImageIcon size={18} />
          </div>
          <p className="text-xs font-medium">Clique ou arraste a capa da coleção</p>
          <p className="text-[10px] text-gray-300">PNG, JPG, WEBP</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = '' }}
      />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

interface EditState {
  id: string | null
  name: string
  description: string
  sort_order: string
  image_url: string
  show_on_home: boolean
}

const emptyEdit: EditState = { id: null, name: '', description: '', sort_order: '0', image_url: '', show_on_home: false }

export default function Colecoes() {
  const [collections, setCollections] = useState<DbCollection[]>([])
  const [loading, setLoading]         = useState(true)
  const [toDelete, setToDelete]       = useState<DbCollection | null>(null)
  const [deleting, setDeleting]       = useState(false)
  const [edit, setEdit]               = useState<EditState | null>(null)
  const [saving, setSaving]           = useState(false)
  const { push } = useToast()

  async function load() {
    setLoading(true)
    try { setCollections(await getCollections()) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function startNew() { setEdit({ ...emptyEdit }) }

  function startEdit(col: DbCollection) {
    setEdit({
      id:           col.id,
      name:         col.name,
      description:  col.description ?? '',
      sort_order:   String(col.sort_order),
      image_url:    col.image_url ?? '',
      show_on_home: col.show_on_home ?? false,
    })
  }

  async function handleSave() {
    if (!edit) return
    if (!edit.name.trim()) { push('O nome é obrigatório', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        name:         edit.name.trim(),
        slug:         slugify(edit.name.trim()),
        description:  edit.description.trim() || null,
        sort_order:   Number(edit.sort_order) || 0,
        active:       true,
        image_url:    edit.image_url || null,
        show_on_home: edit.show_on_home,
      }
      if (edit.id) {
        await updateCollection(edit.id, payload)
        push('Coleção atualizada')
      } else {
        await createCollection(payload)
        push('Coleção criada!')
      }
      setEdit(null)
      await load()
    } catch (err: any) {
      push(`Erro: ${err?.message ?? 'Não foi possível salvar'}`, 'error')
    } finally { setSaving(false) }
  }

  async function handleToggleActive(col: DbCollection) {
    try {
      await updateCollection(col.id, { active: !col.active })
      setCollections((prev) => prev.map((c) => c.id === col.id ? { ...c, active: !c.active } : c))
    } catch { push('Erro ao alterar status', 'error') }
  }

  async function handleDelete() {
    if (!toDelete) return
    if ((toDelete.product_count ?? 0) > 0) {
      push(`Desvincule os ${toDelete.product_count} produtos antes de excluir.`, 'error')
      setToDelete(null)
      return
    }
    setDeleting(true)
    try {
      await deleteCollection(toDelete.id)
      push('Coleção excluída')
      setToDelete(null)
      await load()
    } catch { push('Erro ao excluir coleção', 'error') }
    finally { setDeleting(false) }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-gray-900 tracking-wide">COLEÇÕES</h1>
          <p className="text-sm text-gray-500">{collections.length} coleções cadastradas</p>
        </div>
        <button onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink-900 text-white font-semibold text-sm hover:bg-ink-700 transition-colors">
          <Plus size={15} />Nova coleção
        </button>
      </div>

      {/* Inline form */}
      {edit && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-coffee-200 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <p className="text-sm font-semibold text-gray-900">
            {edit.id ? 'Editar coleção' : 'Nova coleção'}
          </p>

          {/* Image upload */}
          <div className="space-y-1.5">
            <label className={lbl}>Foto da coleção (capa)</label>
            <SingleImageUpload
              value={edit.image_url}
              onChange={(url) => setEdit({ ...edit, image_url: url })}
            />
          </div>

          {/* Name + order */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={lbl}>Nome *</label>
              <input
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                className={field}
                placeholder="Ex: Inverno 2025"
              />
              {edit.name && (
                <p className="text-[10px] text-gray-400 font-mono">
                  /colecao/{slugify(edit.name)}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className={lbl}>Ordem de exibição</label>
              <input
                type="number"
                min="0"
                value={edit.sort_order}
                onChange={(e) => setEdit({ ...edit, sort_order: e.target.value })}
                className={field}
                placeholder="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className={lbl}>Descrição</label>
            <textarea
              value={edit.description}
              onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              rows={2}
              className={field + ' resize-none'}
              placeholder="Descrição curta da coleção…"
            />
          </div>

          {/* Show on home toggle */}
          <div className={cn(
            'flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer',
            edit.show_on_home
              ? 'bg-coffee-50 border-coffee-200'
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          )} onClick={() => setEdit({ ...edit, show_on_home: !edit.show_on_home })}>
            <div className={cn(
              'w-10 h-6 rounded-full flex-shrink-0 relative transition-colors mt-0.5',
              edit.show_on_home ? 'bg-coffee-500' : 'bg-gray-300'
            )}>
              <div className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                edit.show_on_home ? 'translate-x-4' : 'translate-x-0.5'
              )} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Mostrar na página inicial</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Esta coleção aparecerá em destaque na home do site. Use a descrição como texto apresentação.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setEdit(null)}
              className="px-4 py-2 rounded-full text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <X size={13} />Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-coffee-600 text-white hover:bg-coffee-700 disabled:opacity-60 transition-colors flex items-center gap-1.5">
              <Check size={13} />{saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          icon={Layers2}
          title="Sem coleções"
          description="Crie sua primeira coleção para organizar os produtos."
          action={
            <button onClick={startNew} className="text-sm text-coffee-600 hover:text-coffee-500 font-medium">
              + Nova coleção
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {collections.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors"
            >
              <GripVertical size={14} className="text-gray-300 flex-shrink-0 hidden sm:block" />

              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                {col.image_url
                  ? <img src={col.image_url} alt={col.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-gray-300" /></div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={cn('font-medium text-sm truncate', !col.active && 'text-gray-400 line-through')}>
                    {col.name}
                  </p>
                  {col.show_on_home && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-coffee-100 text-coffee-700 font-semibold flex-shrink-0">
                      home
                    </span>
                  )}
                  {!col.active && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-400 font-medium flex-shrink-0">
                      inativa
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 font-mono truncate">/colecao/{col.slug}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400 font-medium hidden sm:block">
                  {col.product_count} prod.
                </span>
                <button
                  onClick={() => handleToggleActive(col)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors',
                    col.active
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                      : 'text-gray-500 bg-gray-100 border-gray-200 hover:bg-gray-200'
                  )}
                >
                  {col.active ? 'Ativa' : 'Ativar'}
                </button>
                <button
                  onClick={() => startEdit(col)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setToDelete(col)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir coleção?"
        description={`"${toDelete?.name}"${
          (toDelete?.product_count ?? 0) > 0
            ? ` tem ${toDelete?.product_count} produto(s) — ficarão sem coleção.`
            : ' será excluída permanentemente.'
        }`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
