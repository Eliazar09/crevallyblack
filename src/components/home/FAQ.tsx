import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { cn } from '../../lib/cn'

type TabKey = 'produto' | 'entrega' | 'cuidados'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'produto', label: 'Produto' },
  { key: 'entrega', label: 'Entrega & Troca' },
  { key: 'cuidados', label: 'Cuidados' },
]

const faqs: Record<TabKey, { q: string; a: string }[]> = {
  produto: [
    {
      q: 'Quais tamanhos estão disponíveis?',
      a: 'A maioria das peças vai de PP a XGG. Cada produto indica na página os tamanhos disponíveis. Se tiver dúvida sobre qual pedir, manda mensagem no WhatsApp com suas medidas.',
    },
    {
      q: 'O tecido encolhe depois de lavar?',
      a: 'Usamos algodão pré-lavado e tecidos de alto gramado que não encolhem. Seguindo as instruções de lavagem na etiqueta, a peça mantém o caimento original.',
    },
    {
      q: 'As cores são as mesmas das fotos?',
      a: 'Fazemos o máximo para que as fotos representem fielmente as cores. Pode haver pequena variação dependendo da tela. Em caso de dúvida, envie uma mensagem antes de comprar.',
    },
    {
      q: 'Vocês fazem peças personalizadas?',
      a: 'Para compras em volume (atacado), podemos discutir personalização de bordado ou estampa. Entre em contato pelo WhatsApp para mais detalhes sobre essa opção.',
    },
  ],
  entrega: [
    {
      q: 'Qual é o prazo de entrega?',
      a: 'Enviamos para todo o Brasil. O prazo varia de 3 a 10 dias úteis dependendo da sua região. Você recebe o código de rastreio por WhatsApp após a confirmação do pagamento.',
    },
    {
      q: 'Como faço para trocar de tamanho?',
      a: 'Aceitamos troca em até 7 dias após o recebimento. A peça deve estar sem uso e com a etiqueta. O frete de retorno é por conta do cliente, e nós arcamos com o envio da nova peça.',
    },
    {
      q: 'E se a peça chegar com defeito?',
      a: 'Nesse caso, a troca é 100% por nossa conta. Documente o defeito com fotos ao abrir o pacote e entre em contato pelo WhatsApp. Resolvemos em até 48 horas.',
    },
    {
      q: 'Vocês enviam para fora do Brasil?',
      a: 'No momento atendemos apenas território nacional. Acompanhe nossas redes para novidades sobre envios internacionais.',
    },
  ],
  cuidados: [
    {
      q: 'Como lavar as camisetas sem desbotarem?',
      a: 'Lave sempre ao avesso em água fria ou morna. Use sabão neutro e evite alvejante. A estampa e a cor se preservam muito mais quando você não usa ciclo quente.',
    },
    {
      q: 'Posso usar secadora?',
      a: 'Prefira secar à sombra para preservar o tecido e a estampa. Se precisar da secadora, use temperatura baixa. Evite exposição prolongada ao sol direto.',
    },
    {
      q: 'Como cuidar do moletom para durar mais?',
      a: 'Lave ao avesso em ciclo delicado. Evite torcer ou espremer o tecido. Seque estendido ou pendurado para manter o caimento. Não use secadora em temperatura alta.',
    },
    {
      q: 'Com que frequência devo lavar?',
      a: 'Depende do uso. Para peças do dia a dia, a cada 2 ou 3 usos é o ideal para preservar o tecido. Lavar com muita frequência desnecessária desgasta o algodão mais rápido.',
    },
  ],
}

export function FAQ() {
  const { ref, isInView } = useScrollReveal()
  const [activeTab, setActiveTab] = useState<TabKey>('produto')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const items = faqs[activeTab]

  return (
    <section className="py-24 bg-cream-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div ref={ref} className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-coffee-500 mb-3"
          >
            Perguntas frequentes
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(2rem,4vw,3rem)] font-medium text-ink-900 tracking-tight"
          >
            Tudo que você precisa
            <br />
            <em className="text-coffee-600">saber</em>
          </motion.h2>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mt-8 flex-wrap"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setOpenIndex(0) }}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                  activeTab === tab.key
                    ? 'bg-ink-900 text-cream-50 border-ink-900'
                    : 'bg-white text-ink-500 border-ink-900/10 hover:border-ink-900/30 hover:text-ink-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Content: image + accordion */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          {/* Left: photo */}
          <div className="relative rounded-3xl overflow-hidden bg-ink-100 aspect-[4/5] lg:aspect-auto lg:h-[540px]">
            <img
              src="/images/fotos%20de%20parte%20do%20site/w.jpeg"
              alt="Crevally Black — streetwear premium"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/20 to-transparent" />
            {/* Floating stat card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur rounded-2xl p-4 flex items-center gap-4 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-coffee-400/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🖤</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">+2.000 clientes satisfeitos</p>
                <p className="text-xs text-ink-500">Qualidade comprovada em todo o Brasil</p>
              </div>
            </div>
          </div>

          {/* Right: accordion */}
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                {items.map((item, i) => {
                  const isOpen = openIndex === i
                  return (
                    <div
                      key={i}
                      className={cn(
                        'rounded-2xl border transition-all duration-200 overflow-hidden',
                        isOpen
                          ? 'border-coffee-400/30 bg-white shadow-sm shadow-coffee-400/5'
                          : 'border-ink-900/8 bg-white hover:border-coffee-400/20'
                      )}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                      >
                        <span className={cn(
                          'text-sm font-semibold leading-snug transition-colors',
                          isOpen ? 'text-coffee-600' : 'text-ink-900'
                        )}>
                          {item.q}
                        </span>
                        <span className={cn(
                          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200',
                          isOpen
                            ? 'bg-coffee-400 text-white'
                            : 'bg-ink-900/6 text-ink-500'
                        )}>
                          {isOpen
                            ? <Minus size={13} strokeWidth={2.5} />
                            : <Plus size={13} strokeWidth={2.5} />
                          }
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
                          >
                            <p className="px-5 pb-5 text-sm text-ink-500 leading-relaxed">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
