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
    q: '¿A dónde hacen envíos?',
    a: 'Enviamos a todo Venezuela. Caracas, Maracaibo, Valencia, Barquisimeto, Maracay y más ciudades. Consulta tiempos de entrega para tu zona por WhatsApp.',
  },
  {
    q: '¿Qué formas de pago aceptan?',
    a: 'Efectivo en dólares o bolívares, transferencia bancaria, pago móvil y Zelle. Confirma la disponibilidad con Jennifer al hacer tu pedido.',
  },
  {
    q: '¿Tienen política de devoluciones?',
    a: 'Si el producto llega en mal estado, te lo reemplazamos sin costo. Guarda el empaque y toma fotos al recibirlo para cualquier reclamo.',
  },
  {
    q: '¿Cómo funciona el programa mayorista?',
    a: 'Compras kits a precio mayorista y los revendes a tu precio. Cuantos más kits compres, mayor es tu margen. Visita la página de Mayorista para ver los tiers.',
  },
  {
    q: '¿Los productos tienen fecha de vencimiento?',
    a: 'Sí, todos los productos muestran claramente la fecha de vencimiento en el empaque. Garantizamos mínimo 6 meses de vida útil al momento del envío.',
  },
]

export default function Contact() {
  const { ref, isInView } = useScrollReveal()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const msg = `Hola! Soy ${form.nombre}. ${form.mensaje}\n\nTeléfono: ${form.telefono}\nEmail: ${form.email}`
    window.open(buildDirectWhatsAppLink(msg), '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="min-h-[100dvh] bg-cream-50">
      <Helmet>
        <title>Contacto — GreenLife</title>
        <meta name="description" content="Contacta a GreenLife Venezuela. WhatsApp: +58 412 859 0616. Instagram: @somosgreenlife. Atención lunes a sábado de 9am a 7pm." />
      </Helmet>
      {/* Page header */}
      <div className="bg-forest-950 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="section-eyebrow mb-3">Contacto</p>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light text-cream-50 tracking-tight">
            Escríbenos,
            <br />
            <em className="text-gold-400">respondemos</em> rápido
          </h1>
        </div>
      </div>

      {/* Split layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Form */}
        <div>
          <h2 className="font-display text-2xl font-medium text-ink-900 mb-8">
            Enviar mensaje
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
              placeholder="Tu nombre"
              className="!bg-white !text-ink-900 !border-ink-900/10 focus:!border-forest-800/40 placeholder:!text-ink-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="!bg-white !text-ink-900 !border-ink-900/10 focus:!border-forest-800/40 placeholder:!text-ink-400"
              />
              <Input
                label="Teléfono"
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="+58 412..."
                className="!bg-white !text-ink-900 !border-ink-900/10 focus:!border-forest-800/40 placeholder:!text-ink-400"
              />
            </div>
            <Textarea
              label="Mensaje"
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              required
              placeholder="¿En qué podemos ayudarte?"
              className="!bg-white !text-ink-900 !border-ink-900/10 focus:!border-forest-800/40 placeholder:!text-ink-400"
            />
            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full justify-center"
            >
              {sent ? 'Redirigiendo a WhatsApp...' : (
                <>
                  <Send size={16} strokeWidth={1.5} />
                  Enviar por WhatsApp
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Info */}
        <div ref={ref} className="space-y-10">
          <div>
            <h2 className="font-display text-2xl font-medium text-ink-900 mb-6">
              Contacto directo
            </h2>
            <div className="space-y-4">
              <motion.a
                href={buildDirectWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                className="flex items-start gap-4 p-4 rounded-2xl border border-ink-900/8 bg-white hover:border-forest-800/20 transition-colors group"
              >
                <div className="p-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20">
                  <MessageCircle size={18} strokeWidth={1.5} className="text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">WhatsApp</p>
                  <p className="text-sm text-ink-500">+58 412 859 0616</p>
                  <p className="text-xs text-forest-800 mt-1 group-hover:underline">Respuesta en minutos</p>
                </div>
              </motion.a>

              <motion.a
                href="https://instagram.com/somosgreenlife"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl border border-ink-900/8 bg-white hover:border-forest-800/20 transition-colors group"
              >
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                  <InstagramIcon size={18} strokeWidth={1.5} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Instagram</p>
                  <p className="text-sm text-ink-500">@somosgreenlife</p>
                  <p className="text-xs text-forest-800 mt-1 group-hover:underline">Ver catálogo visual</p>
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
                  <p className="text-sm font-semibold text-ink-900">Horario de atención</p>
                  <p className="text-sm text-ink-500">Lunes a sábado</p>
                  <p className="text-sm text-ink-500">9:00 am – 7:00 pm</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="font-display text-xl font-medium text-ink-900 mb-5">
              Preguntas frecuentes
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
