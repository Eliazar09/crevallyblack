import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, XCircle, ArrowRight, MessageCircle, ShoppingBag } from 'lucide-react'
import { buildDirectWhatsAppLink } from '../lib/whatsapp'
import { useCart } from '../hooks/useCart'

// Mercado Pago adiciona esses parâmetros na URL de retorno:
// ?collection_status=approved&external_reference=<orderId>&payment_type=pix&...
type MPStatus = 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'failure' | null

export default function PedidoConfirmado() {
  const [params] = useSearchParams()
  const { clearCart } = useCart()

  const status    = (params.get('collection_status') ?? params.get('status')) as MPStatus
  const orderId   = params.get('external_reference') ?? params.get('id') ?? ''
  const payType   = params.get('payment_type') ?? ''
  const paymentId = params.get('collection_id') ?? params.get('payment_id') ?? ''

  const shortId   = orderId ? `#${orderId.slice(-6).toUpperCase()}` : ''

  // Só limpa o carrinho quando o pagamento for confirmado como aprovado
  useEffect(() => {
    if (status === 'approved') clearCart()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Approved ────────────────────────────────────────────────────
  if (status === 'approved') {
    return (
      <PageShell bg="bg-cream-50">
        <IconCircle color="bg-green-50 border-green-200">
          <CheckCircle2 size={32} className="text-green-600" strokeWidth={1.5} />
        </IconCircle>

        <Badge color="bg-green-100 text-green-700">Pagamento aprovado</Badge>

        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ink-900 tracking-wide leading-tight">
          Pedido <em className="text-green-600">confirmado!</em>
        </h1>

        <p className="text-ink-500 text-base leading-relaxed max-w-[38ch] text-center">
          Seu pagamento foi aprovado. Em breve você receberá a confirmação e o rastreio pelo WhatsApp.
        </p>

        {shortId && (
          <div className="bg-white border border-ink-900/8 rounded-2xl px-10 py-4 text-center shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-ink-400 mb-1">Número do pedido</p>
            <p className="font-mono text-3xl font-bold text-ink-900 tracking-widest">{shortId}</p>
            {payType && (
              <p className="text-[11px] font-mono text-ink-400 mt-1 uppercase tracking-wider">
                via {payTypeLabel(payType)}
              </p>
            )}
          </div>
        )}

        <InfoRow items={[
          'Confirmação enviada por WhatsApp',
          'Postagem em até 2 dias úteis',
          'Rastreio enviado após postagem',
        ]} />

        <Actions primary={{ href: '/', label: 'Voltar à loja' }} whatsapp />
      </PageShell>
    )
  }

  // ── Pending / In process ─────────────────────────────────────────
  if (status === 'pending' || status === 'in_process') {
    return (
      <PageShell bg="bg-cream-50">
        <IconCircle color="bg-amber-50 border-amber-200">
          <Clock size={32} className="text-amber-600" strokeWidth={1.5} />
        </IconCircle>

        <Badge color="bg-amber-100 text-amber-700">Pagamento em análise</Badge>

        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ink-900 tracking-wide leading-tight">
          Pedido <em className="text-amber-600">recebido!</em>
        </h1>

        <p className="text-ink-500 text-base leading-relaxed max-w-[40ch] text-center">
          Seu pedido foi registrado e o pagamento está sendo processado. Assim que for confirmado, você receberá o aviso pelo WhatsApp.
        </p>

        {shortId && (
          <div className="bg-white border border-ink-900/8 rounded-2xl px-10 py-4 text-center shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-ink-400 mb-1">Número do pedido</p>
            <p className="font-mono text-3xl font-bold text-ink-900 tracking-widest">{shortId}</p>
          </div>
        )}

        <InfoRow items={[
          'Guarde o número do pedido',
          'Você será avisado pelo WhatsApp',
          'Boleto: até 3 dias úteis para compensar',
        ]} />

        <Actions primary={{ href: '/', label: 'Voltar ao início' }} whatsapp />
      </PageShell>
    )
  }

  // ── Rejected / Cancelled / Failure ───────────────────────────────
  if (status === 'rejected' || status === 'cancelled' || status === 'failure') {
    return (
      <PageShell bg="bg-cream-50">
        <IconCircle color="bg-red-50 border-red-200">
          <XCircle size={32} className="text-red-500" strokeWidth={1.5} />
        </IconCircle>

        <Badge color="bg-red-100 text-red-700">Pagamento não aprovado</Badge>

        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ink-900 tracking-wide leading-tight">
          Algo deu <em className="text-red-500">errado</em>
        </h1>

        <p className="text-ink-500 text-base leading-relaxed max-w-[40ch] text-center">
          O pagamento não foi aprovado. Você pode tentar novamente com outro método de pagamento ou entrar em contato pelo WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link
            to="/carrinho"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ink-900 hover:bg-ink-700 text-cream-50 font-display text-sm tracking-[0.15em] rounded-2xl transition-colors"
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
            TENTAR NOVAMENTE
          </Link>
          <a
            href={buildDirectWhatsAppLink(`Olá! Tive um problema no pagamento do pedido ${shortId || paymentId}. Pode me ajudar?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-ink-900/15 text-ink-700 hover:bg-ink-900/5 font-medium text-sm rounded-2xl transition-colors"
          >
            <MessageCircle size={16} strokeWidth={1.5} />
            Falar pelo WhatsApp
          </a>
        </div>
      </PageShell>
    )
  }

  // ── Fallback: chegou na página sem parâmetros (acesso direto) ────
  return (
    <PageShell bg="bg-cream-50">
      <IconCircle color="bg-coffee-50 border-coffee-200">
        <CheckCircle2 size={32} className="text-coffee-500" strokeWidth={1.5} />
      </IconCircle>

      <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ink-900 tracking-wide">
        Pedido registrado
      </h1>

      <p className="text-ink-500 text-base leading-relaxed max-w-[38ch] text-center">
        Seu pedido foi salvo. Entraremos em contato pelo WhatsApp com as próximas etapas.
      </p>

      <Actions primary={{ href: '/', label: 'Voltar à loja' }} whatsapp />
    </PageShell>
  )
}

// ── Helpers ────────────────────────────────────────────────────────

function payTypeLabel(type: string) {
  const map: Record<string, string> = {
    pix: 'PIX',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    bank_transfer: 'Transferência',
    ticket: 'Boleto',
  }
  return map[type] ?? type
}

// ── Sub-components ─────────────────────────────────────────────────

function PageShell({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <div className={`min-h-[100dvh] ${bg} pt-28 pb-20 flex items-center justify-center px-4`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg flex flex-col items-center gap-6 text-center"
      >
        {children}
      </motion.div>
    </div>
  )
}

function IconCircle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
      className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${color}`}
    >
      {children}
    </motion.div>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest ${color}`}>
      {children}
    </span>
  )
}

function InfoRow({ items }: { items: string[] }) {
  return (
    <div className="bg-white border border-ink-900/8 rounded-2xl px-5 py-4 shadow-sm w-full max-w-sm space-y-2">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-coffee-400 flex-shrink-0 mt-1.5" />
          <p className="text-[12px] text-ink-500 text-left leading-snug">{item}</p>
        </div>
      ))}
    </div>
  )
}

function Actions({ primary, whatsapp }: {
  primary: { href: string; label: string }
  whatsapp?: boolean
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-2">
      <Link
        to={primary.href}
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-coffee-500 hover:bg-coffee-400 text-white font-display text-sm tracking-[0.15em] rounded-2xl transition-colors shadow-md shadow-coffee-500/20"
      >
        {primary.label}
        <ArrowRight size={15} />
      </Link>
      {whatsapp && (
        <a
          href={buildDirectWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-ink-900/15 text-ink-700 hover:bg-ink-900/5 font-medium text-sm rounded-2xl transition-colors"
        >
          <MessageCircle size={16} strokeWidth={1.5} />
          Falar pelo WhatsApp
        </a>
      )}
    </div>
  )
}
