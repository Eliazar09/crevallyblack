import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Plus, Trash2, MessageCircle } from 'lucide-react'
import { getProducts, type DbProduct } from '../../lib/queries/products'
import { getClients, createClient, type DbClient } from '../../lib/queries/clients'
import { createSale, getExchangeRate, methodLabels, type PaymentMethod, type PaymentStatus, type SaleItem } from '../../lib/queries/sales'
import { formatPrice } from '../../lib/currency'
import { useToast } from '../../hooks/useToast'
import { buildWhatsAppLink } from '../../lib/whatsapp'

const methods = Object.keys(methodLabels) as PaymentMethod[]
const bsMetodos: PaymentMethod[] = ['pago_movil', 'transferencia']

const field = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-forest-600/40 transition-colors'
const lbl = 'text-xs font-semibold text-gray-500 uppercase tracking-wider'

interface CartEntry { product: DbProduct; quantity: number; unitPrice: number }

export default function VentaNueva() {
  const navigate = useNavigate()
  const { push } = useToast()

  // State
  const [products, setProducts] = useState<DbProduct[]>([])
  const [clients, setClients] = useState<DbClient[]>([])
  const [prodSearch, setProdSearch] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<DbClient | null>(null)
  const [guestName, setGuestName] = useState('')
  const [cart, setCart] = useState<CartEntry[]>([])
  const [discount, setDiscount] = useState(0)
  const [method, setMethod] = useState<PaymentMethod>('divisas')
  const [status, setStatus] = useState<PaymentStatus>('pagado')
  const [exchangeRate, setExchangeRate] = useState(40)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [showNewClient, setShowNewClient] = useState(false)

  useEffect(() => {
    getProducts({ status: 'activo' }).then(setProducts)
    getClients().then(setClients)
    getExchangeRate().then(setExchangeRate)
  }, [])

  const filteredProds = products.filter((p) =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
    (p.sku ?? '').toLowerCase().includes(prodSearch.toLowerCase())
  ).slice(0, 8)

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.phone ?? '').includes(clientSearch)
  ).slice(0, 5)

  function addToCart(p: DbProduct) {
    setCart((prev) => {
      const ex = prev.find((e) => e.product.id === p.id)
      if (ex) return prev.map((e) => e.product.id === p.id ? { ...e, quantity: e.quantity + 1 } : e)
      return [...prev, { product: p, quantity: 1, unitPrice: p.price }]
    })
    setProdSearch('')
  }

  function removeFromCart(id: string) { setCart((prev) => prev.filter((e) => e.product.id !== id)) }
  function setQty(id: string, qty: number) {
    if (qty < 1) return
    setCart((prev) => prev.map((e) => e.product.id === id ? { ...e, quantity: qty } : e))
  }
  function setPrice(id: string, price: number) {
    setCart((prev) => prev.map((e) => e.product.id === id ? { ...e, unitPrice: price } : e))
  }

  const subtotal = cart.reduce((s, e) => s + e.unitPrice * e.quantity, 0)
  const total = Math.max(0, subtotal - discount)
  const totalBs = bsMetodos.includes(method) ? total * exchangeRate : null

  async function createQuickClient() {
    if (!newClientName.trim()) return null
    try {
      const c = await createClient({ name: newClientName, phone: newClientPhone, email: '', cedula: '', city: '', type: 'cliente', notes: '' })
      setClients((prev) => [c, ...prev])
      setSelectedClient(c)
      setShowNewClient(false)
      setNewClientName(''); setNewClientPhone('')
      push('Cliente creado')
      return c
    } catch { push('Error al crear cliente', 'error'); return null }
  }

  async function handleSubmit() {
    if (cart.length === 0) { push('Agrega al menos un producto', 'error'); return }
    const clientName = selectedClient?.name ?? guestName.trim()
    if (!clientName) { push('Indica el nombre del cliente', 'error'); return }
    setSaving(true)
    try {
      const items: SaleItem[] = cart.map((e) => ({
        product_id: e.product.id,
        product_name: e.product.name,
        quantity: e.quantity,
        unit_price: e.unitPrice,
        subtotal: e.unitPrice * e.quantity,
      }))
      await createSale({
        client_id: selectedClient?.id ?? null,
        client_name: clientName,
        items, subtotal, discount, total,
        payment_method: method,
        payment_status: status,
        exchange_rate: bsMetodos.includes(method) ? exchangeRate : null,
        total_bs: totalBs,
        notes: notes || null,
      })
      push('¡Venta registrada exitosamente!')

      // Optional WhatsApp notification
      if (selectedClient?.phone) {
        const link = buildWhatsAppLink(
          items.map((i) => ({ id: i.product_id, productId: i.product_id, name: i.product_name, image: '', price: i.unit_price, quantity: i.quantity })),
          { nombre: clientName, telefono: selectedClient.phone, ciudad: selectedClient.city ?? '' }
        )
        window.open(link, '_blank')
      }
      navigate('/admin/ventas')
    } catch (e: any) {
      push(`Error: ${e.message}`, 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 transition-colors"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-2xl font-medium text-gray-900">Nueva venta</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: productos + cliente */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cliente */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-900">Cliente</p>
            {selectedClient ? (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm text-gray-900 font-medium">{selectedClient.name}</p>
                  <p className="text-xs text-gray-500">{selectedClient.phone}</p>
                </div>
                <button onClick={() => setSelectedClient(null)} className="text-gray-500 hover:text-red-400 text-xs">Cambiar</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Buscar cliente…" className={field + ' pl-9'} />
                </div>
                {clientSearch && filteredClients.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {filteredClients.map((c) => (
                      <button key={c.id} onClick={() => { setSelectedClient(c); setClientSearch('') }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
                        {c.name} <span className="text-gray-500 text-xs ml-2">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
                {!selectedClient && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">O ingresa el nombre directamente:</p>
                    <input value={guestName} onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Nombre del cliente" className={field} />
                  </div>
                )}
                <button onClick={() => setShowNewClient(!showNewClient)}
                  className="text-xs text-forest-700 hover:text-gold-300 flex items-center gap-1">
                  <Plus size={12} />Crear nuevo cliente
                </button>
                {showNewClient && (
                  <div className="space-y-2 border border-gray-200 rounded-xl p-3">
                    <input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className={field} placeholder="Nombre *" />
                    <input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className={field} placeholder="Teléfono" />
                    <button onClick={createQuickClient} className="px-4 py-2 rounded-xl bg-gold-400/20 text-forest-700 text-xs font-semibold hover:bg-gold-400/30">Guardar cliente</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Productos */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-900">Productos</p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={prodSearch} onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Buscar producto por nombre o SKU…" className={field + ' pl-9'} />
            </div>
            {prodSearch && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {filteredProds.map((p) => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors flex justify-between">
                    <span>{p.name}</span>
                    <span className="font-mono text-forest-700">{formatPrice(p.price)}</span>
                  </button>
                ))}
                {filteredProds.length === 0 && <p className="px-4 py-3 text-sm text-gray-500">Sin resultados</p>}
              </div>
            )}

            {/* Cart items */}
            {cart.length > 0 && (
              <div className="space-y-2 mt-2">
                {cart.map((e) => (
                  <div key={e.product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{e.product.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setQty(e.product.id, e.quantity - 1)} className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-sm flex items-center justify-center hover:bg-gray-200">−</button>
                      <span className="font-mono text-sm text-gray-900 w-6 text-center">{e.quantity}</span>
                      <button onClick={() => setQty(e.product.id, e.quantity + 1)} className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-sm flex items-center justify-center hover:bg-gray-200">+</button>
                    </div>
                    <input type="number" value={e.unitPrice} onChange={(ev) => setPrice(e.product.id, Number(ev.target.value))}
                      className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm font-mono text-gray-900 text-center focus:outline-none focus:border-gold-400/40" />
                    <span className="font-mono text-xs text-forest-700 w-16 text-right">{formatPrice(e.unitPrice * e.quantity)}</span>
                    <button onClick={() => removeFromCart(e.product.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={13}/></button>
                  </div>
                ))}
              </div>
            )}
            {cart.length === 0 && <p className="text-xs text-gray-500 text-center py-4">Busca y agrega productos al pedido</p>}
          </div>
        </div>

        {/* Right: resumen + pago */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-900">Resumen</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Descuento</span>
                <input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm font-mono text-gray-900 text-right focus:outline-none focus:border-gold-400/40" />
              </div>
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2">
                <span>Total USD</span><span className="font-mono text-forest-700">{formatPrice(total)}</span>
              </div>
              {totalBs && (
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>Total Bs (tasa {exchangeRate})</span>
                  <span className="font-mono">Bs {(totalBs).toLocaleString('es-VE', {maximumFractionDigits:2})}</span>
                </div>
              )}
            </div>

            {/* Método de pago */}
            <div className="space-y-1.5">
              <label className={lbl}>Método de pago</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={field}>
                {methods.map((m) => <option key={m} value={m}>{methodLabels[m]}</option>)}
              </select>
            </div>

            {bsMetodos.includes(method) && (
              <div className="space-y-1.5">
                <label className={lbl}>Tasa (Bs/$)</label>
                <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className={field} />
              </div>
            )}

            <div className="space-y-1.5">
              <label className={lbl}>Estado de pago</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus)} className={field}>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Parcial</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={lbl}>Notas</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                className={field + ' resize-none'} placeholder="Observaciones…" />
            </div>

            <button onClick={handleSubmit} disabled={saving || cart.length === 0}
              className="w-full py-3 rounded-xl bg-gold-400 text-forest-950 font-semibold text-sm hover:bg-gold-300 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {saving ? 'Registrando…' : <>Registrar venta</>}
            </button>

            {selectedClient?.phone && (
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <MessageCircle size={11} />Se enviará confirmación por WhatsApp
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
