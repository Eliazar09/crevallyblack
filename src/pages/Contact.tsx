import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { MessageCircle, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { InstagramIcon } from '../components/ui/InstagramIcon'
import { Input, Textarea } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { buildDirectWhatsAppLink } from '../lib/whatsapp'
import { useScrollReveal } from '../hooks/useScrollReveal'

const faqs = [
  {
    q: 'Para onde vocês enviam?',
    a: 'Enviamos para todo o Brasil via Correios e transportadoras parceiras. São Paulo, Rio de Janeiro, Belo Horizonte, Brasília e todas as regiões. Consulte o prazo para sua cidade pelo WhatsApp.',
  },
  {
    q: 'Quais formas de pagamento aceitam?',
    a: 'Aceitamos Pix (com desconto), cartão de crédito em até 12x, cartão de débito, transferência bancária e boleto. Os detalhes são confirmados pelo WhatsApp ao fazer o pedido.',
  },
  {
    q: 'Qual a política de troca e devolução?',
    a: 'Você tem 7 dias corridos após o recebimento para solicitar troca ou devolução. A peça deve estar sem uso e com etiqueta. Guarde o empaque ao receber para qualquer reclamação.',
  },
  {
    q: 'Como funciona o programa de atacado?',
    a: 'Você compra kits a preço de atacado e revende pelo seu preço. Quanto mais peças, maior seu desconto. Acesse a página Atacado para ver os tiers disponíveis.',
  },
  {
    q: 'Quero saber meu tamanho, como faço?',
    a: 'Cada produto tem tabela de medidas na foto. Mas pode perguntar pelo WhatsApp — nossa equipe te ajuda a escolher o tamanho certo baseado nas suas medidas.',
  },
]

export default function Contact() {
  const { ref, isInView } = useScrollReveal()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const msg = `Olá! Sou ${form.nome}. ${form.mensagem}\n\nTelefone: ${form.telefone}\nEmail: ${form.email}`
    window.open(buildDirectWhatsAppLink(msg), '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="min-h-[100dvh] bg-cream-50">
      <Helmet>
        <title>Contato — Crevally Black</title>
        <meta name="description" content="Entre em contato com a Crevally Black. WhatsApp, Instagram @crevallyblack. Atendimento de segunda a sábado das 9h às 19h." />
      </Helmet>
      {/* Page header */}
      <div className="bg-ink-900 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="section-eyebrow mb-3">Contato</p>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light text-cream-50 tracking-tight">
            Fale com a gente,
            <br />
            <em className="text-coffee-400">respondemos</em> rápido
          </h1>
        </div>
      </div>

      {/* Split layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Form */}
        <div>
          <h2 className="font-display text-2xl font-medium text-ink-900 mb-8">
            Enviar mensagem
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
              placeholder="Seu nome"
              className="!bg-white !text-ink-900 !border-ink-900/10 focus:!border-coffee-500/40 placeholder:!text-ink-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="!bg-white !text-ink-900 !border-ink-900/10 focus:!border-coffee-500/40 placeholder:!text-ink-400"
              />
              <Input
                label="Telefone"
                type="tel"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="+55 11 9..."
                className="!bg-white !text-ink-900 !border-ink-900/10 focus:!border-coffee-500/40 placeholder:!text-ink-400"
              />
            </div>
            <Textarea
              label="Mensagem"
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              required
              placeholder="Como podemos ajudar?"
              className="!bg-white !text-ink-900 !border-ink-900/10 focus:!border-coffee-500/40 placeholder:!text-ink-400"
            />
            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full justify-center"
            >
              {sent ? 'Redirecionando para WhatsApp…' : (
                <>
                  <Send size={16} strokeWidth={1.5} />
                  Enviar pelo WhatsApp
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Info */}
        <div ref={ref} className="space-y-10">
          <div>
            <h2 className="font-display text-2xl font-medium text-ink-900 mb-6">
              Contato direto
            </h2>
            <div className="space-y-4">
              <motion.a
                href={buildDirectWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                className="flex items-start gap-4 p-4 rounded-2xl border border-ink-900/8 bg-white hover:border-coffee-400/30 transition-colors group"
              >
                <div className="p-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20">
                  <MessageCircle size={18} strokeWidth={1.5} className="text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">WhatsApp</p>
                  <p className="text-sm text-ink-500">Resposta em minutos</p>
                  <p className="text-xs text-coffee-600 mt-1 group-hover:underline">Clique para abrir a conversa</p>
                </div>
              </motion.a>

              <motion.a
                href="https://instagram.com/crevallyblack"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl border border-ink-900/8 bg-white hover:border-coffee-400/30 transition-colors group"
              >
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                  <InstagramIcon size={18} strokeWidth={1.5} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Instagram</p>
                  <p className="text-sm text-ink-500">@crevallyblack</p>
                  <p className="text-xs text-coffee-600 mt-1 group-hover:underline">Ver catálogo visual</p>
                </div>
              </motion.a>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4 p-4 rounded-2xl border border-ink-900/8 bg-white"
              >
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                  <Clock size={18} strokeWidth={1.5} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Horário de atendimento</p>
                  <p className="text-sm text-ink-500">Segunda a sábado</p>
                  <p className="text-sm text-ink-500">9h – 19h</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="font-display text-xl font-medium text-ink-900 mb-5">
              Perguntas frequentes
            </h3>
            <div className="divide-y divide-ink-900/8">
              {faqs.map((faq, i) => (
                <div key={i} className="py-3.5">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left"
                  >
                    <span className="text-sm font-medium text-ink-900">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp size={15} className="text-ink-400 flex-shrink-0" strokeWidth={1.5} />
                    ) : (
                      <ChevronDown size={15} className="text-ink-400 flex-shrink-0" strokeWidth={1.5} />
                    )}
                  </button>
                  {openFaq === i && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2.5 text-sm text-ink-500 leading-relaxed"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
