import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader, CreditCard, QrCode, Lock, ShieldCheck, RefreshCw, Truck } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { formatPrice } from '../lib/currency'
import { supabase } from '../lib/supabase'

type Screen = 'form' | 'redirecting'
type FormData = {
  nome: string; cpf: string; email: string; telefone: string
  cep: string; rua: string; numero: string; complemento: string
  bairro: string; cidade: string; estado: string
}

const empty: FormData = {
  nome: '', cpf: '', email: '', telefone: '',
  cep: '', rua: '', numero: '', complemento: '',
  bairro: '', cidade: '', estado: '',
}

function fmtCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}
function fmtCEP(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`
}
function fmtPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const inp = 'w-full bg-gray-50 border border-ink-900/12 rounded-xl px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-coffee-500 focus:bg-white transition-all'
const lbl = 'block text-[10px] font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5'

export default function Checkout() {
  const { items, total } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [cepLoading, setCepLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>('form')
  const [orderId, setOrderId] = useState('')

  if (items.length === 0 && screen === 'form' && !orderId) {
    navigate('/carrinho', { replace: true })
    return null
  }

  function set<K extends keyof FormData>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  async function fetchCEP(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          rua: data.logradouro ?? f.rua,
          bairro: data.bairro ?? f.bairro,
          cidade: data.localidade ?? f.cidade,
          estado: data.uf ?? f.estado,
        }))
      }
    } catch (err) {
      console.warn('[checkout] ViaCEP falhou:', err)
    } finally {
      setCepLoading(false)
    }
  }

  function validate() {
    const e: typeof errors = {}
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (form.cpf.replace(/\D/g, '').length !== 11) e.cpf = 'CPF inválido'
    if (!form.email.includes('@')) e.email = 'E-mail inválido'
    if (form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Inválido'
    if (form.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP inválido'
    if (!form.rua.trim()) e.rua = 'Obrigatório'
    if (!form.numero.trim()) e.numero = 'Obrigatório'
    if (!form.cidade.trim()) e.cidade = 'Obrigatório'
    if (!form.estado.trim()) e.estado = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      const subtotal = total()
      const saleId = crypto.randomUUID()

      const { error: saleErr } = await supabase
        .from('sales')
        .insert({
          id: saleId,
          client_name: form.nome.trim(),
          subtotal,
          discount: 0,
          total: subtotal,
          payment_method: 'outro',
          payment_status: 'pendente',
          notes: `Email: ${form.email.trim()} · Tel: ${form.telefone} · CPF: ${form.cpf} · ${form.rua}, ${form.numero}${form.complemento ? `, ${form.complemento}` : ''} — ${form.bairro}, ${form.cidade}/${form.estado} · CEP: ${form.cep}`,
        })

      if (saleErr) throw new Error(`[sales] ${saleErr.message} (code: ${saleErr.code})`)

      const { error: itemsErr } = await supabase.from('sale_items').insert(
        items.map((item) => ({
          sale_id: saleId,
          product_id: item.productId,
          product_name: item.selectedOption ? `${item.name} — ${item.selectedOption}` : item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        }))
      )
      if (itemsErr) console.error('[checkout] sale_items error:', itemsErr.message)

      setOrderId(saleId)

      const pgRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: saleId,
          buyer: {
            nome:     form.nome.trim(),
            cpf:      form.cpf,
            email:    form.email.trim(),
            telefone: form.telefone,
          },
          items: items.map((item) => ({
            productId: item.productId,
            name: item.selectedOption ? `${item.name} — ${item.selectedOption}` : item.name,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      })

      let pgData: any = {}
      const rawText = await pgRes.text().catch(() => '')
      try {
        pgData = JSON.parse(rawText)
      } catch {
        setSaveError(`[${pgRes.status}] Resposta do servidor: ${rawText.slice(0, 300) || '(vazia)'}`)
        setSaving(false)
        return
      }

      if (!pgRes.ok) {
        const detail = pgData?.error?.message ?? pgData?.error ?? pgData?.detail ?? JSON.stringify(pgData)
        setSaveError(`Erro ao criar pagamento (${pgRes.status}): ${detail}`)
        setSaving(false)
        return
      }

      if (pgData.redirect_url) {
        setScreen('redirecting')
        setTimeout(() => { window.location.href = pgData.redirect_url }, 800)
      } else {
        setSaveError(`Mercado Pago não retornou URL de pagamento. Resposta: ${JSON.stringify(pgData).slice(0, 200)}`)
        setSaving(false)
      }

    } catch (err: unknown) {
      console.error('[checkout] Erro:', err)
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  // ── Redirecionando ────────────────────────────────────────
  if (screen === 'redirecting') {
    return (
      <div className="min-h-[100dvh] bg-ink-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="w-16 h-16 rounded-full border-2 border-coffee-500/50 border-t-coffee-500 animate-spin" />
          <div>
            <p className="font-display text-2xl text-cream-50 tracking-wider mb-2">REDIRECIONANDO</p>
            <p className="text-sm text-ink-400">Levando você para o pagamento seguro via Mercado Pago…</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Formulário ────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-cream-50 pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <Link
            to="/carrinho"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-ink-900 transition-colors mb-7 group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao carrinho
          </Link>
          <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-ink-900 tracking-wider leading-none">
            FINALIZAR PEDIDO
          </h1>
          <div className="h-px bg-ink-900/8 mt-5" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Pagamento seguro */}
            <div className="bg-white border border-ink-900/8 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <p className="font-display text-lg text-ink-900 tracking-wider">PAGAMENTO</p>
                <p className="text-xs text-ink-500 mt-0.5">Ambiente 100% seguro via Mercado Pago</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { icon: QrCode,     label: 'PIX Instantâneo' },
                  { icon: CreditCard, label: 'Cartão de Crédito' },
                  { icon: CreditCard, label: 'Cartão de Débito' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coffee-50 border border-coffee-200 text-coffee-700 text-xs font-medium">
                    <Icon size={11} strokeWidth={1.5} />
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Lock,        text: 'Dados criptografados' },
                  { icon: ShieldCheck, text: 'Compra garantida' },
                  { icon: RefreshCw,   text: 'Troca em até 7 dias' },
                  { icon: Truck,       text: 'Entrega para todo Brasil' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-coffee-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-coffee-600" strokeWidth={1.5} />
                    </div>
                    <p className="text-[11px] text-ink-600 leading-tight">{text}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-ink-900/8 pt-4">
                <p className="text-[11px] text-ink-500 leading-relaxed">
                  Ao clicar em <span className="text-coffee-600 font-semibold">IR PARA O PAGAMENTO</span>, você será redirecionado para o ambiente seguro do Mercado Pago. Seus dados pessoais são protegidos e nunca compartilhados com terceiros.
                </p>
              </div>
            </div>

            {/* Dados pessoais */}
            <div className="bg-white border border-ink-900/8 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <p className="font-display text-lg text-ink-900 tracking-wider">SEUS DADOS</p>
                <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                  Usamos seu nome e CPF para emitir a nota fiscal, e o WhatsApp para enviar a confirmação e o código de rastreio do pedido.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className={lbl}>Nome completo</label>
                <input value={form.nome} onChange={(e) => set('nome', e.target.value)} className={inp} placeholder="Seu nome completo" />
                {errors.nome && <p className="text-[10px] text-red-500 font-mono">{errors.nome}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={lbl}>CPF</label>
                  <input value={form.cpf} onChange={(e) => set('cpf', fmtCPF(e.target.value))} className={inp} placeholder="000.000.000-00" inputMode="numeric" />
                  {errors.cpf && <p className="text-[10px] text-red-500 font-mono">{errors.cpf}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className={lbl}>WhatsApp</label>
                  <input value={form.telefone} onChange={(e) => set('telefone', fmtPhone(e.target.value))} className={inp} placeholder="(11) 99999-9999" inputMode="tel" />
                  {errors.telefone && <p className="text-[10px] text-red-500 font-mono">{errors.telefone}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={lbl}>E-mail</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inp} placeholder="seu@email.com" />
                {errors.email && <p className="text-[10px] text-red-500 font-mono">{errors.email}</p>}
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-white border border-ink-900/8 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <p className="font-display text-lg text-ink-900 tracking-wider">ENDEREÇO DE ENTREGA</p>
                <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                  Precisamos do seu endereço completo para calcular o frete e garantir que seu pedido chegue até você. Digite o CEP e preenchemos o restante automaticamente.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className={lbl}>CEP</label>
                <div className="relative">
                  <input
                    value={form.cep}
                    onChange={(e) => {
                      const v = fmtCEP(e.target.value)
                      set('cep', v)
                      if (v.replace(/\D/g, '').length === 8) fetchCEP(v)
                    }}
                    className={inp}
                    placeholder="00000-000"
                    inputMode="numeric"
                  />
                  {cepLoading && <Loader size={13} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-coffee-500" />}
                </div>
                {errors.cep && <p className="text-[10px] text-red-500 font-mono">{errors.cep}</p>}
              </div>

              <div className="space-y-1.5">
                <label className={lbl}>Rua / Avenida</label>
                <input value={form.rua} onChange={(e) => set('rua', e.target.value)} className={inp} placeholder="Rua das Flores" />
                {errors.rua && <p className="text-[10px] text-red-500 font-mono">{errors.rua}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={lbl}>Número</label>
                  <input value={form.numero} onChange={(e) => set('numero', e.target.value)} className={inp} placeholder="123" />
                  {errors.numero && <p className="text-[10px] text-red-500 font-mono">{errors.numero}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className={lbl}>Complemento</label>
                  <input value={form.complemento} onChange={(e) => set('complemento', e.target.value)} className={inp} placeholder="Apto, bloco…" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={lbl}>Bairro</label>
                <input value={form.bairro} onChange={(e) => set('bairro', e.target.value)} className={inp} placeholder="Centro" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className={lbl}>Cidade</label>
                  <input value={form.cidade} onChange={(e) => set('cidade', e.target.value)} className={inp} placeholder="São Paulo" />
                  {errors.cidade && <p className="text-[10px] text-red-500 font-mono">{errors.cidade}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className={lbl}>Estado</label>
                  <input value={form.estado} onChange={(e) => set('estado', e.target.value.toUpperCase().slice(0, 2))} className={inp} placeholder="SP" maxLength={2} />
                  {errors.estado && <p className="text-[10px] text-red-500 font-mono">{errors.estado}</p>}
                </div>
              </div>
            </div>

            {saveError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 font-mono">
                {saveError}
              </p>
            )}
          </motion.div>

          {/* Resumo lateral */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-28"
          >
            <div className="bg-white border border-ink-900/8 rounded-3xl p-6 shadow-sm space-y-5">
              <p className="font-display text-xl text-ink-900 tracking-widest">RESUMO</p>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-ink-900 truncate font-medium">{item.name}</p>
                      {item.selectedOption && (
                        <p className="text-[10px] font-mono text-ink-400 uppercase">{item.selectedOption}</p>
                      )}
                    </div>
                    <span className="font-mono text-xs text-ink-700 flex-shrink-0 tabular-nums">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-ink-900/8" />

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-500">Total</span>
                <span className="font-mono text-2xl font-medium text-coffee-600 tabular-nums">
                  {formatPrice(total())}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full py-4 bg-coffee-500 hover:bg-coffee-400 disabled:opacity-60 active:scale-[0.98] text-white font-display text-sm tracking-[0.18em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-md shadow-coffee-500/20"
              >
                {saving
                  ? <><Loader size={15} className="animate-spin" /> PROCESSANDO…</>
                  : <><ArrowRight size={16} /> IR PARA O PAGAMENTO</>
                }
              </button>

              <p className="text-center text-[11px] font-mono text-ink-400 uppercase tracking-wider">
                Pagamento via Mercado Pago — 100% seguro
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
