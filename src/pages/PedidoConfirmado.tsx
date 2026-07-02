import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, XCircle, ArrowRight, MessageCircle, ShoppingBag, Loader, MapPin } from 'lucide-react'
import { buildDirectWhatsAppLink } from '../lib/whatsapp'
import { useCart } from '../hooks/useCart'

type MPStatus = 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'failure' | null

export default function PedidoConfirmado() {
  const [params] = useSearchParams()
  const { clearCart } = useCart()

  const mpStatus   = (params.get('collection_status') ?? params.get('status')) as MPStatus
  const orderId    = params.get('external_reference') ?? params.get('id') ?? ''
  const payType    = params.get('payment_type') ?? ''
  const paymentId  = params.get('collection_id') ?? params.get('payment_id') ?? ''
  const shortId    = orderId ? `#${orderId.slice(-6).toUpperCase()}` : ''

  // Verifica se era entrega local (Piquete) via sessionStorage
  const isLocal = orderId
    ? sessionStorage.getItem('crevally_local_order') === orderId
    : false

  // Estado de polling: quando MP diz "pending" verificamos no banco
  const [confirmedStatus, setConfirmedStatus] = useState<'approved' | 'pending' | 'rejected' | null>(
    mpStatus === 'approved' ? 'approved'
    : (mpStatus === 'rejected' || mpStatus === 'cancelled' || mpStatus === 'failure') ? 'rejected'
    : 'pending'
  )
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (confirmedStatus === 'approved') {
      clearCart()
      if (isLocal) sessionStorage.removeItem('crevally_local_order')
      return
    }
    if (confirmedStatus === 'rejected' || !orderId) return

    // Polling: verifica status real no banco a cada 4 segundos por até 90 segundos
    setPolling(true)
    let tries = 0
    const max = 22

    const interval = setInterval(async () => {
      tries++
      try {
        const res = await fetch(`/api/order-status?id=${orderId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.payment_status === 'pago') {
            setConfirmedStatus('approved')
            clearCart()
            if (isLocal) sessionStorage.removeItem('crevally_local_order')
            clearInterval(interval)
            setPolling(false)
            return
          }
          if (data.payment_status === 'cancelado') {
            setConfirmedStatus('rejected')
            clearInterval(interval)
            setPolling(false)
            return
          }
        }
      } catch { /* ignora erros de rede */ }

      if (tries >= max) {
        clearInterval(interval)
        setPolling(false)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Aprovado / Confirmado ────────────────────────────────────────
  if (confirmedStatus === 'approved') {
    return (
      <PageShell>
        <IconCircle color="bg-green-50 border-green-200">
          <CheckCircle2 size={32} className="text-green-600" strokeWidth={1.5} />
        </IconCircle>

        <Badge color="bg-green-100 text-green-700">Pagamento confirmado</Badge>

        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ink-900 tracking-wide leading-tight">
          Pedido <em className="text-green-600">confirmado!</em>
        </h1>

        {isLocal ? (
          <>
            <p className="text-ink-500 text-base leading-relaxed max-w-[40ch] text-center">
              Seu pagamento foi aprovado! Como você é de <strong className="text-ink-800">Piquete/SP</strong>, entre em contato pelo WhatsApp para combinar a entrega com o vendedor.
            </p>

            {shortId && <OrderBadge shortId={shortId} payType={payType} />}

            <a
              href={buildDirectWhatsAppLink(`Olá! Acabei de realizar o pagamento do pedido ${shortId}. Gostaria de combinar a entrega. 😊`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-400 text-white font-bold text-base rounded-2xl transition-colors shadow-lg shadow-green-200"
            >
              <MessageCircle size={20} strokeWidth={2} />
              Combinar entrega pelo WhatsApp
            </a>

            <div className="flex items-center gap-2 text-xs text-ink-400">
              <MapPin size={12} />
              Entrega local Piquete/SP — frete a combinar com o vendedor
            </div>

            <Link
              to="/"
              className="text-sm text-ink-500 hover:text-ink-900 underline underline-offset-4 transition-colors"
            >
              Voltar à loja
            </Link>
          </>
        ) : (
          <>
            <p className="text-ink-500 text-base leading-relaxed max-w-[38ch] text-center">
              Seu pagamento foi aprovado. Em breve você receberá a confirmação e o rastreio pelo WhatsApp.
            </p>

            {shortId && <OrderBadge shortId={shortId} payType={payType} />}

            <InfoRow items={[
              'Confirmação enviada por WhatsApp',
              'Postagem em até 2 dias úteis',
              'Rastreio enviado após postagem',
            ]} />

            <Actions primary={{ href: '/', label: 'Voltar à loja' }} whatsapp />
          </>
        )}
      </PageShell>
    )
  }

  // ── Pendente / verificando ───────────────────────────────────────
  if (confirmedStatus === 'pending') {
    return (
      <PageShell>
        <IconCircle color={polling ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}>
          {polling
            ? <Loader size={32} className="text-blue-500 animate-spin" strokeWidth={1.5} />
            : <Clock size={32} className="text-amber-600" strokeWidth={1.5} />
          }
        </IconCircle>

        <Badge color={polling ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
          {polling ? 'Verificando pagamento…' : 'Pagamento em processamento'}
        </Badge>

        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ink-900 tracking-wide leading-tight">
          Pedido <em className="text-amber-600">recebido!</em>
        </h1>

        <p className="text-ink-500 text-base leading-relaxed max-w-[40ch] text-center">
          {polling
            ? 'Estamos verificando a confirmação do seu pagamento. Esta página atualiza automaticamente…'
            : 'Seu pedido foi registrado. Assim que o pagamento for confirmado, você receberá o aviso pelo WhatsApp.'
          }
        </p>

        {shortId && <OrderBadge shortId={shortId} />}

        {polling && (
          <div className="flex items-center gap-2 text-xs text-blue-500">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Atualizando a cada 4 segundos…
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

  // ── Rejeitado / Cancelado ────────────────────────────────────────
  if (confirmedStatus === 'rejected') {
    return (
      <PageShell>
        <IconCircle color="bg-red-50 border-red-200">
          <XCircle size={32} className="text-red-500" strokeWidth={1.5} />
        </IconCircle>

        <Badge color="bg-red-100 text-red-700">Pagamento não aprovado</Badge>

        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ink-900 tracking-wide leading-tight">
          Algo deu <em className="text-red-500">errado</em>
        </h1>

        <p className="text-ink-500 text-base leading-relaxed max-w-[40ch] text-center">
          O pagamento não foi aprovado. Tente novamente ou entre em contato pelo WhatsApp.
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

  // ── Fallback ─────────────────────────────────────────────────────
  return (
    <PageShell>
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
    pix: 'PIX', credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito', bank_transfer: 'Transferência', ticket: 'Boleto',
  }
  return map[type] ?? type
}

// ── Sub-components ─────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-cream-50 pt-28 pb-20 flex items-center justify-center px-4">
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

function OrderBadge({ shortId, payType }: { shortId: string; payType?: string }) {
  return (
    <div className="bg-white border border-ink-900/8 rounded-2xl px-10 py-4 text-center shadow-sm">
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-ink-400 mb-1">Número do pedido</p>
      <p className="font-mono text-3xl font-bold text-ink-900 tracking-widest">{shortId}</p>
      {payType && (
        <p className="text-[11px] font-mono text-ink-400 mt-1 uppercase tracking-wider">
          via {payTypeLabel(payType)}
        </p>
      )}
    </div>
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
