import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Pencil, Trash2, Users } from 'lucide-react'
import { getClients, createClient, updateClient, deleteClient, type DbClient, type ClientInsert } from '../../lib/queries/clients'
import { EmptyState } from '../../components/admin/ui/EmptyState'
import { ConfirmDialog } from '../../components/admin/ui/ConfirmDialog'
import { Skeleton } from '../../components/admin/ui/Skeleton'
import { Modal } from '../../components/ui/Modal'
import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/cn'

const typeLabel: Record<string, string> = { cliente: 'Cliente', distribuidor: 'Distribuidor', mayorista: 'Mayorista' }
const typeColor: Record<string, string> = {
  cliente:     'text-gray-700 bg-gray-100 border-gray-200',
  distribuidor:'text-amber-700 bg-amber-50 border-amber-200',
  mayorista:   'text-violet-700 bg-violet-50 border-violet-200',
}

const emptyForm: ClientInsert = { name:'', phone:'', email:'', cedula:'', city:'', type:'cliente', notes:'' }
const field = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-forest-600/40 transition-colors'
const lbl = 'text-xs font-semibold text-gray-500 uppercase tracking-wider'

export default function Clientes() {
  const [clients, setClients] = useState<DbClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DbClient | null>(null)
  const [form, setForm] = useState<ClientInsert>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<DbClient | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { push } = useToast()

  async function load() {
    setLoading(true)
    try { setClients(await getClients(search)) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  function openNew() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(c: DbClient) {
    setEditing(c)
    setForm({ name:c.name, phone:c.phone??'', email:c.email??'', cedula:c.cedula??'', city:c.city??'', type:c.type, notes:c.notes??'' })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { push('El nombre es obligatorio', 'error'); return }
    setSaving(true)
    try {
      if (editing) await updateClient(editing.id, form)
      else await createClient(form)
      push(editing ? 'Cliente actualizado' : 'Cliente creado')
      setModalOpen(false)
      load()
    } catch { push('Error al guardar el cliente', 'error') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteClient(toDelete.id)
      push('Cliente eliminado')
      setToDelete(null)
      load()
    } catch { push('Error al eliminar el cliente', 'error') }
    finally { setDeleting(false) }
  }

  function set<K extends keyof ClientInsert>(k: K, v: ClientInsert[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">{clients.length} clientes registrados</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest-700 text-white font-semibold text-sm hover:bg-forest-600 transition-colors">
          <Plus size={15} />Nuevo cliente
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-forest-600/40" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-14 w-full"/>)}</div>
      ) : clients.length === 0 ? (
        <EmptyState icon={Users} title="Sin clientes" description="Agrega tu primer cliente."
          action={<button onClick={openNew} className="text-sm text-forest-700 font-medium">+ Nuevo cliente</button>} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Nombre','Teléfono','Ciudad','Tipo',''].map((h)=>(
                  <th key={h} className="px-4 py-3 text-left font-semibold text-[10px] uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map((c, i) => (
                <motion.tr key={c.id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium">{c.name}</p>
                    {c.email && <p className="text-[11px] text-gray-400">{c.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', typeColor[c.type])}>
                      {typeLabel[c.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={()=>openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-forest-700 hover:bg-forest-50 transition-colors"><Pencil size={13}/></button>
                      <button onClick={()=>setToDelete(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)}>
        <div className="p-5 space-y-4">
          <p className="font-semibold text-gray-900 pr-8">{editing ? 'Editar cliente' : 'Nuevo cliente'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className={lbl}>Nombre completo *</label>
              <input value={form.name} onChange={(e)=>set('name',e.target.value)} className={field} placeholder="María González" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Teléfono</label>
              <input value={form.phone??''} onChange={(e)=>set('phone',e.target.value)} className={field} placeholder="+58 412 000 0000" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Cédula</label>
              <input value={form.cedula??''} onChange={(e)=>set('cedula',e.target.value)} className={field} placeholder="V-12345678" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Correo</label>
              <input type="email" value={form.email??''} onChange={(e)=>set('email',e.target.value)} className={field} placeholder="correo@email.com" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Ciudad</label>
              <input value={form.city??''} onChange={(e)=>set('city',e.target.value)} className={field} placeholder="Caracas" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className={lbl}>Tipo</label>
              <select value={form.type} onChange={(e)=>set('type',e.target.value as any)} className={field}>
                <option value="cliente">Cliente</option>
                <option value="distribuidor">Distribuidor</option>
                <option value="mayorista">Mayorista</option>
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className={lbl}>Notas</label>
              <textarea value={form.notes??''} onChange={(e)=>set('notes',e.target.value)} rows={2} className={field+' resize-none'} placeholder="Observaciones…" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={()=>setModalOpen(false)} className="px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-200 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-full text-sm font-semibold bg-forest-700 text-white hover:bg-forest-600 disabled:opacity-60">
              {saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear cliente'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!toDelete} title="¿Eliminar cliente?" description={`"${toDelete?.name}" será eliminado.`}
        onConfirm={handleDelete} onCancel={()=>setToDelete(null)} loading={deleting} />
    </div>
  )
}
