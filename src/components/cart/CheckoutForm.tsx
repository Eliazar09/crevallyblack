import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Loader } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../lib/currency'
import { supabase } from '../../lib/supabase'

interface CheckoutFormProps {
  onBack: () => void
  onClose: () => void
}

export function CheckoutForm({ onBack, onClose }: CheckoutFormProps) {
  const { items, total, clearCart } = useCart()
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [errors, setErrors] = useState<{ nome?: string; telefone?: string }>({})
  const [saving, setSaving] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  function validate() {
    const e: typeof errors = {}
    if (!nome.trim()) e.nome = 'Obrigatório'
    if (!telefone.trim()) e.telefone = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    try {
      const subtotal = total()

      // 1. Registra a venda
      const { data: sale, error: saleErr } = await supabase
        .from('sales')
        .insert({
          client_name: nome.trim(),
          subtotal,
          discount: 0,
          total: subtotal,
          payment_method: 'pix',
          payment_status: 'pendente',
          notes: `Tel: ${telefone.trim()} · Pedido pelo site`,
        })
        .select('id')
        .single()

      if (saleErr) throw saleErr

      // 2. Registra os itens (com tamanho/cor em product_name)
      const saleItems = items.map((item) => ({
        sale_id: sale.id,
        product_id: item.productId,
        product_name: item.selectedOption
          ? `${item.name} — ${item.selectedOption}`
          : item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }))
      const { error: itemsErr } = await supabase.from('sale_items').insert(saleItems)
      if (itemsErr) throw itemsErr

      // 3. Movimentação de estoque
      await supabase.from('inventory_movements').insert(
        items.map((item) => ({
          product_id: item.productId,
          type: 'saida',
          quantity: -Math.abs(item.quantity),
          reason: 'Pedido online',
          related_sale_id: sale.id,
        }))
      )

      // 4. Lança receita pendente no financeiro
      await supabase.from('transactions').insert({
        type: 'receita',
        category: 'Venda Online',
        amount: subtotal,
        description: `Pedido #${sale.id.slice(-6).toUpperCase()} — ${nome.trim()}`,
        related_sale_id: sale.id,
        date: new Date().toISOString().slice(0, 10),
      })

      setOrderId(sale.id)
      clearCart()
    } catch (err: any) {
      setSaveError('Não foi possível registrar o pedido. Tente novamente.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // ── Tela de sucesso ──────────────────────────────────────
  if (orderId) {
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

        <button
          onClick={onClose}
          className="text-xs text-ink-500 hover:text-ink-300 transition-colors py-2"
        >
          Fechar
        </button>
      </div>
    )
  }

  // ── Formulário ───────────────────────────────────────────
  return (
    <div className="p-5 space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs text-ink-500 hover:text-cream-200 transition-colors"
      >
        <ArrowLeft size={14} />
        Voltar ao carrinho
      </button>

      <div>
        <p className="font-display text-base font-semibold text-cream-100 mb-0.5">Finalizar pedido</p>
        <p className="text-xs text-ink-500">Confirme seus dados e registramos o pedido.</p>
      </div>

      {/* Resumo dos itens */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-4 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
            <span className="text-cream-200/80 leading-snug">
              {item.name}
              {item.selectedOption && (
                <span className="ml-1 text-coffee-400/80 font-mono">· {item.selectedOption}</span>
              )}
              <span className="text-ink-500 ml-1">×{item.quantity}</span>
            </span>
            <span className="font-mono text-cream-300 flex-shrink-0">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
        <div className="border-t border-white/8 pt-2.5 flex justify-between items-center">
          <span className="text-xs text-ink-500">Total</span>
          <span className="font-mono font-semibold text-coffee-400">{formatPrice(total())}</span>
        </div>
      </div>

      {/* Campos */}
      <div className="space-y-4">
        <Input
          label="Nome completo"
          value={nome}
          onChange={(e) => { setNome(e.target.value); setErrors((p) => ({ ...p, nome: undefined })) }}
          error={errors.nome}
          placeholder="Seu nome"
        />
        <Input
          label="WhatsApp / Telefone"
          type="tel"
          value={telefone}
          onChange={(e) => { setTelefone(e.target.value); setErrors((p) => ({ ...p, telefone: undefined })) }}
          error={errors.telefone}
          placeholder="(11) 99999-9999"
        />
      </div>

      {saveError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {saveError}
        </p>
      )}

      <div className="pt-1 space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          size="md"
          variant="primary"
          className="w-full justify-center"
        >
          {saving
            ? <><Loader size={14} className="animate-spin" /> Registrando…</>
            : 'Confirmar pedido'
          }
        </Button>
        <p className="text-center text-[11px] text-ink-500">
          Pix · Cartão · Transferência — entraremos em contato para combinar.
        </p>
      </div>
    </div>
  )
}
