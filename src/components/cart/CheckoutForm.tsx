import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Copy, Loader, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../lib/currency'
import { supabase } from '../../lib/supabase'

interface CheckoutFormProps {
  onBack: () => void
  onClose: () => void
}

type Screen = 'form' | 'pix' | 'confirmed'

type FormData = {
  nome: string; cpf: string; email: string; telefone: string
  cep: string; rua: string; numero: string; complemento: string
  bairro: string; cidade: string; estado: string
}

const empty: FormData = {
  nome: '', cpf: '', email: '', telefone: '',
  cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
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

export function CheckoutForm({ onBack, onClose }: CheckoutFormProps) {
  const { items, total, clearCart } = useCart()
  const [form, setForm] = useState<FormData>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [cepLoading, setCepLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>('form')
  const [orderId, setOrderId] = useState('')
  const [pixKey, setPixKey] = useState<string | null>(null)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
    } catch { /* ignora erros de CEP */ }
    finally { setCepLoading(false) }
  }

  function validate() {
    const e: typeof errors = {}
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (form.cpf.replace(/\D/g, '').length !== 11) e.cpf = 'CPF inválido'
    if (!form.email.includes('@')) e.email = 'E-mail inválido'
    if (form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido'
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

      // 1. Salva pedido no Supabase
      const { data: sale, error: saleErr } = await supabase
        .from('sales')
        .insert({
          client_name: form.nome.trim(),
          subtotal,
          discount: 0,
          total: subtotal,
          payment_method: 'pix',
          payment_status: 'pendente',
          notes: `Tel: ${form.telefone} · CPF: ${form.cpf} · ${form.rua}, ${form.numero}${form.complemento ? `, ${form.complemento}` : ''} — ${form.cidade}/${form.estado}`,
        })
        .select('id')
        .single()

      if (saleErr) throw saleErr

      // 2. Itens
      await supabase.from('sale_items').insert(
        items.map((item) => ({
          sale_id: sale.id,
          product_id: item.productId,
          product_name: item.selectedOption ? `${item.name} — ${item.selectedOption}` : item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        }))
      )

      // 3. Estoque
      await supabase.from('inventory_movements').insert(
        items.map((item) => ({
          product_id: item.productId,
          type: 'saida',
          quantity: -Math.abs(item.quantity),
          reason: 'Pedido online',
          related_sale_id: sale.id,
        }))
      )

      // 4. Financeiro
      await supabase.from('transactions').insert({
        type: 'receita',
        category: 'Venda Online',
        amount: subtotal,
        description: `Pedido #${sale.id.slice(-6).toUpperCase()} — ${form.nome.trim()}`,
        related_sale_id: sale.id,
        date: new Date().toISOString().slice(0, 10),
      })

      setOrderId(sale.id)
      clearCart()

      // 5. Gera PIX via PagSeguro
      try {
        const pgRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: sale.id,
            customer: {
              name: form.nome.trim(),
              email: form.email.trim(),
              cpf: form.cpf,
              phone: form.telefone,
            },
            items: items.map((item) => ({
              name: item.selectedOption ? `${item.name} — ${item.selectedOption}` : item.name,
              quantity: item.quantity,
              unit_price: item.price,
            })),
            total: subtotal,
            address: {
              street: form.rua,
              number: form.numero,
              complement: form.complemento,
              neighborhood: form.bairro,
              city: form.cidade,
              state: form.estado,
              cep: form.cep,
            },
          }),
        })

        if (pgRes.ok) {
          const pgData = await pgRes.json()
          setPixKey(pgData.pix_key ?? null)
          setQrImage(pgData.qr_image ?? null)
          setScreen('pix')
        } else {
          // PagSeguro falhou mas pedido foi salvo — mostra confirmação simples
          setScreen('confirmed')
        }
      } catch {
        setScreen('confirmed')
      }
    } catch (err: any) {
      setSaveError('Não foi possível registrar o pedido. Tente novamente.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function copyPix() {
    if (!pixKey) return
    await navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // ── Tela PIX ─────────────────────────────────────────────
  if (screen === 'pix') {
    return (
      <div className="p-5 flex flex-col items-center text-center gap-5">
        <div className="w-14 h-14 rounded-full bg-coffee-400/15 border border-coffee-400/25 flex items-center justify-center">
          <CheckCircle2 size={26} className="text-coffee-400" strokeWidth={1.5} />
        </div>

        <div>
          <p className="font-display text-lg font-semibold text-cream-100 mb-0.5">Pedido registrado!</p>
          <p className="text-xs text-ink-500 max-w-[28ch] leading-relaxed">
            Escaneie o QR code ou copie a chave PIX para pagar.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-ink-500 mb-0.5">Pedido</p>
          <p className="font-mono text-xl font-bold text-coffee-400 tracking-widest">
            #{orderId.slice(-6).toUpperCase()}
          </p>
          <p className="text-[10px] text-ink-600 mt-1">{formatPrice(total())}</p>
        </div>

        {qrImage && (
          <div className="bg-white rounded-2xl p-3 shadow-sm">
            <img src={qrImage} alt="QR Code PIX" className="w-44 h-44 object-contain" />
          </div>
        )}

        {pixKey && (
          <div className="w-full space-y-2">
            <p className="text-[10px] text-ink-500 uppercase tracking-widest">Chave PIX (copia e cola)</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
              <p className="text-[10px] font-mono text-ink-400 break-all leading-relaxed">{pixKey}</p>
            </div>
            <button
              onClick={copyPix}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-coffee-500 hover:bg-coffee-400 text-white text-sm font-semibold transition-colors"
            >
              {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar chave PIX</>}
            </button>
          </div>
        )}

        <p className="text-[11px] text-ink-600 leading-relaxed max-w-[30ch]">
          O QR code expira em 3 horas. Após o pagamento entraremos em contato pelo WhatsApp.
        </p>

        <button onClick={onClose} className="text-xs text-ink-500 hover:text-ink-300 transition-colors py-1">
          Fechar
        </button>
      </div>
    )
  }

  // ── Tela confirmação simples (fallback sem PIX) ───────────
  if (screen === 'confirmed') {
    return (
      <div className="p-5 flex flex-col items-center text-center gap-5 py-10">
        <div className="w-16 h-16 rounded-full bg-coffee-400/15 border border-coffee-400/25 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-coffee-400" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-cream-100 mb-1">Pedido registrado!</p>
          <p className="text-xs text-ink-500 max-w-[26ch] leading-relaxed">
            Entraremos em contato pelo número informado para confirmar pagamento e entrega.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-ink-500 mb-1">Número do pedido</p>
          <p className="font-mono text-2xl font-bold text-coffee-400 tracking-widest">
            #{orderId.slice(-6).toUpperCase()}
          </p>
        </div>
        <button onClick={onClose} className="text-xs text-ink-500 hover:text-ink-300 transition-colors py-2">
          Fechar
        </button>
      </div>
    )
  }

  // ── Formulário ───────────────────────────────────────────
  const field = 'w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-cream-100 placeholder:text-ink-600 focus:outline-none focus:border-coffee-500/50 transition-colors'
  const lbl = 'text-[10px] font-semibold text-ink-500 uppercase tracking-wider'

  return (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[80dvh]">
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-ink-500 hover:text-cream-200 transition-colors">
        <ArrowLeft size={14} />
        Voltar ao carrinho
      </button>

      <div>
        <p className="font-display text-base font-semibold text-cream-100 mb-0.5">Finalizar pedido</p>
        <p className="text-xs text-ink-500">Preencha seus dados para gerar o PIX.</p>
      </div>

      {/* Resumo */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
            <span className="text-cream-200/80 leading-snug">
              {item.name}
              {item.selectedOption && <span className="ml-1 text-coffee-400/80 font-mono">· {item.selectedOption}</span>}
              <span className="text-ink-500 ml-1">×{item.quantity}</span>
            </span>
            <span className="font-mono text-cream-300 flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-white/8 pt-2.5 flex justify-between items-center">
          <span className="text-xs text-ink-500">Total</span>
          <span className="font-mono font-semibold text-coffee-400">{formatPrice(total())}</span>
        </div>
      </div>

      {/* Dados pessoais */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">Seus dados</p>

        <div className="space-y-1">
          <label className={lbl}>Nome completo *</label>
          <input value={form.nome} onChange={(e) => set('nome', e.target.value)} className={field} placeholder="Seu nome completo" />
          {errors.nome && <p className="text-[10px] text-red-400">{errors.nome}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={lbl}>CPF *</label>
            <input value={form.cpf} onChange={(e) => set('cpf', fmtCPF(e.target.value))} className={field} placeholder="000.000.000-00" inputMode="numeric" />
            {errors.cpf && <p className="text-[10px] text-red-400">{errors.cpf}</p>}
          </div>
          <div className="space-y-1">
            <label className={lbl}>WhatsApp *</label>
            <input value={form.telefone} onChange={(e) => set('telefone', fmtPhone(e.target.value))} className={field} placeholder="(11) 99999-9999" inputMode="tel" />
            {errors.telefone && <p className="text-[10px] text-red-400">{errors.telefone}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className={lbl}>E-mail *</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={field} placeholder="seu@email.com" />
          {errors.email && <p className="text-[10px] text-red-400">{errors.email}</p>}
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">Endereço de entrega</p>

        <div className="space-y-1">
          <label className={lbl}>CEP *</label>
          <div className="relative">
            <input
              value={form.cep}
              onChange={(e) => {
                const v = fmtCEP(e.target.value)
                set('cep', v)
                if (v.replace(/\D/g, '').length === 8) fetchCEP(v)
              }}
              className={field}
              placeholder="00000-000"
              inputMode="numeric"
            />
            {cepLoading && <Loader size={13} className="absolute right-3 top-3 animate-spin text-coffee-400" />}
          </div>
          {errors.cep && <p className="text-[10px] text-red-400">{errors.cep}</p>}
        </div>

        <div className="space-y-1">
          <label className={lbl}>Rua / Avenida *</label>
          <input value={form.rua} onChange={(e) => set('rua', e.target.value)} className={field} placeholder="Rua das Flores" />
          {errors.rua && <p className="text-[10px] text-red-400">{errors.rua}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={lbl}>Número *</label>
            <input value={form.numero} onChange={(e) => set('numero', e.target.value)} className={field} placeholder="123" />
            {errors.numero && <p className="text-[10px] text-red-400">{errors.numero}</p>}
          </div>
          <div className="space-y-1">
            <label className={lbl}>Complemento</label>
            <input value={form.complemento} onChange={(e) => set('complemento', e.target.value)} className={field} placeholder="Apto, bloco…" />
          </div>
        </div>

        <div className="space-y-1">
          <label className={lbl}>Bairro</label>
          <input value={form.bairro} onChange={(e) => set('bairro', e.target.value)} className={field} placeholder="Centro" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={lbl}>Cidade *</label>
            <input value={form.cidade} onChange={(e) => set('cidade', e.target.value)} className={field} placeholder="São Paulo" />
            {errors.cidade && <p className="text-[10px] text-red-400">{errors.cidade}</p>}
          </div>
          <div className="space-y-1">
            <label className={lbl}>Estado *</label>
            <input value={form.estado} onChange={(e) => set('estado', e.target.value.toUpperCase().slice(0, 2))} className={field} placeholder="SP" maxLength={2} />
            {errors.estado && <p className="text-[10px] text-red-400">{errors.estado}</p>}
          </div>
        </div>
      </div>

      {saveError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {saveError}
        </p>
      )}

      <div className="pt-1 space-y-3 pb-4">
        <Button onClick={handleSubmit} disabled={saving} size="md" variant="primary" className="w-full justify-center">
          {saving
            ? <><Loader size={14} className="animate-spin" /> Gerando PIX…</>
            : 'Gerar PIX e confirmar pedido'
          }
        </Button>
        <p className="text-center text-[11px] text-ink-500">
          Pagamento 100% seguro via PagSeguro · PIX
        </p>
      </div>
    </div>
  )
}
