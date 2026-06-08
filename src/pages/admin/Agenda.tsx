import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Trash2, Briefcase, User, Building2, ShoppingCart } from 'lucide-react'
import { cn } from '../../lib/cn'
import { getSales } from '../../lib/queries/sales'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_SHORT = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const STORAGE_KEY = 'gl_agenda_notes'

interface Note {
  id: string
  content: string
  type: 'personal' | 'trabajo' | 'empresa'
  createdAt: string
}

type Store = Record<string, Note[]>

const TYPE_META = {
  personal: { label: 'Personal', icon: User,      color: 'text-violet-700 bg-violet-50 border-violet-200' },
  trabajo:  { label: 'Trabajo',  icon: Briefcase,  color: 'text-blue-700 bg-blue-50 border-blue-200' },
  empresa:  { label: 'Empresa',  icon: Building2,  color: 'text-amber-700 bg-amber-50 border-amber-200' },
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function loadStore(): Store {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

function saveStore(s: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const total = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let i = 1; i <= total; i++) days.push(i)
  return days
}

function formatFullDate(y: number, m: number, d: number) {
  return new Date(y, m, d).toLocaleDateString('es-VE', { weekday:'long', day:'numeric', month:'long' })
}

export default function Agenda() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(now.getDate())
  const [store, setStore] = useState<Store>(loadStore)
  const [text, setText] = useState('')
  const [noteType, setNoteType] = useState<Note['type']>('trabajo')
  const [salesByDate, setSalesByDate] = useState<Record<string, number>>({})

  useEffect(() => { saveStore(store) }, [store])

  useEffect(() => {
    getSales().then((sales) => {
      const byDate: Record<string, number> = {}
      for (const s of sales) {
        const key = s.created_at.slice(0, 10)
        byDate[key] = (byDate[key] ?? 0) + 1
      }
      setSalesByDate(byDate)
    }).catch(() => {})
  }, [])

  const days = getCalendarDays(year, month)
  const today = todayKey()
  const selKey = dateKey(year, month, selectedDay)
  const selNotes = store[selKey] ?? []

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
    setSelectedDay(1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
    setSelectedDay(1)
  }

  function addNote() {
    if (!text.trim()) return
    const note: Note = { id: crypto.randomUUID(), content: text.trim(), type: noteType, createdAt: new Date().toISOString() }
    setStore(s => ({ ...s, [selKey]: [...(s[selKey] ?? []), note] }))
    setText('')
  }

  function deleteNote(key: string, id: string) {
    setStore(s => ({ ...s, [key]: (s[key] ?? []).filter(n => n.id !== id) }))
  }

  const allNotes = Object.entries(store)
    .flatMap(([k, notes]) => notes.map(n => ({ ...n, dateKey: k })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 30)

  const selDaySales = salesByDate[selKey] ?? 0

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-gray-900">Agenda</h1>
        <p className="text-sm text-gray-500 mt-0.5">Calendario y notas personales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
          {/* Nav mes */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <p className="font-semibold text-gray-900 text-sm">{MONTHS[month]} {year}</p>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Cabecera días */}
          <div className="grid grid-cols-7 text-center">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-[10px] font-semibold text-gray-400 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Días */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d, i) => {
              if (!d) return <div key={`e${i}`} />
              const key = dateKey(year, month, d)
              const isToday = key === today
              const isSel = d === selectedDay && selKey === key
              const hasNotes = (store[key] ?? []).length > 0
              const hasSales = (salesByDate[key] ?? 0) > 0
              return (
                <button key={d} onClick={() => setSelectedDay(d)}
                  className={cn('relative h-9 w-full rounded-xl text-sm font-medium transition-all',
                    isSel ? 'bg-forest-700 text-white' :
                    isToday ? 'bg-forest-100 text-forest-700 font-bold' :
                    'text-gray-700 hover:bg-gray-100')}>
                  {d}
                  {!isSel && (hasNotes || hasSales) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {hasNotes && <span className="w-1 h-1 rounded-full bg-forest-500" />}
                      {hasSales && <span className="w-1 h-1 rounded-full bg-blue-500" />}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-forest-500" />
              <span className="text-[10px] text-gray-400">Nota</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] text-gray-400">Venta</span>
            </div>
          </div>
        </div>

        {/* Panel notas del día */}
        <div className="lg:col-span-3 space-y-4">
          {/* Indicador de ventas del día */}
          {selDaySales > 0 && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <ShoppingCart size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  {selDaySales} {selDaySales === 1 ? 'venta realizada' : 'ventas realizadas'}
                </p>
                <p className="text-xs text-blue-600">Ver detalles en la sección de Ventas</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
            <p className="font-semibold text-gray-900 capitalize text-sm">
              {formatFullDate(year, month, selectedDay)}
            </p>

            {/* Tipo de nota */}
            <div className="flex gap-2">
              {(Object.entries(TYPE_META) as [Note['type'], typeof TYPE_META[keyof typeof TYPE_META]][]).map(([key, meta]) => (
                <button key={key} onClick={() => setNoteType(key)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                    noteType === key ? meta.color : 'text-gray-500 bg-gray-50 border-gray-200 hover:border-gray-300')}>
                  <meta.icon size={11} />
                  {meta.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote() } }}
                placeholder="Escribe una nota… (Enter para guardar)"
                rows={2}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-forest-600/40 resize-none transition-colors"
              />
              <button onClick={addNote} disabled={!text.trim()}
                className="px-4 py-2 rounded-xl bg-forest-700 text-white text-sm font-semibold hover:bg-forest-600 disabled:opacity-40 transition-colors self-start mt-0.5 flex items-center gap-1">
                <Plus size={14} />
              </button>
            </div>

            {/* Notas del día */}
            <div className="space-y-2">
              <AnimatePresence>
                {selNotes.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Sin notas para este día</p>
                ) : (
                  selNotes.map((n) => {
                    const meta = TYPE_META[n.type]
                    return (
                      <motion.div key={n.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 8 }}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 mt-0.5', meta.color)}>
                          <meta.icon size={9} />{meta.label}
                        </span>
                        <p className="text-sm text-gray-800 flex-1 leading-relaxed">{n.content}</p>
                        <button onClick={() => deleteNote(selKey, n.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Todas las notas recientes */}
      {allNotes.length > 0 && (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Notas recientes</p>
          <div className="space-y-2">
            {allNotes.map((n) => {
              const meta = TYPE_META[n.type]
              const [y, mo, d] = n.dateKey.split('-').map(Number)
              return (
                <div key={n.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0', meta.color)}>
                    <meta.icon size={9} />{meta.label}
                  </span>
                  <p className="text-sm text-gray-800 flex-1 truncate">{n.content}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(y, mo-1, d).toLocaleDateString('es-VE', { day:'numeric', month:'short' })}
                  </span>
                  <button onClick={() => deleteNote(n.dateKey, n.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
