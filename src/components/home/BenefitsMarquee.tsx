const benefits = [
  '100% Algodão',
  'Estampa Premium',
  'Feito no Brasil',
  'Envio Rápido',
  'Troca Garantida',
  'Pix e Cartão',
  'Acabamento Fino',
  'Streetwear Autêntico',
  'Costura Reforçada',
  'Design Exclusivo',
]

const benefitsReverse = [
  'Crevally Black',
  'Streetwear Premium',
  'Tamanhos PP–XGG',
  'Cores Exclusivas',
  'Entrega Brasil',
  'Tecido de Qualidade',
  'Lavagem Fácil',
  'Identidade Própria',
  'Suporte via WhatsApp',
  'Edições Limitadas',
]

export function BenefitsMarquee() {
  return (
    <div className="bg-ink-900 border-y border-white/8 py-3 overflow-hidden space-y-3">
      {/* Row 1 — forward */}
      <div className="marquee-track">
        {Array.from({ length: 4 }).map((_, gi) => (
          <div key={gi} className="flex items-center gap-0 pr-0">
            {benefits.map((b, i) => (
              <div
                key={`${gi}-${i}`}
                className="flex items-center gap-6 px-6 border-r border-white/8 last:border-r-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-coffee-400 flex-shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400 whitespace-nowrap">
                  {b}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Row 2 — reverse direction */}
      <div className="marquee-track marquee-reverse">
        {Array.from({ length: 4 }).map((_, gi) => (
          <div key={gi} className="flex items-center gap-0 pr-0">
            {benefitsReverse.map((b, i) => (
              <div
                key={`${gi}-${i}`}
                className="flex items-center gap-6 px-6 border-r border-white/8 last:border-r-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-coffee-400/50 flex-shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500/70 whitespace-nowrap">
                  {b}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
