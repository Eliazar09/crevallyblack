const benefits = [
  '100% Natural',
  'Sin Conservantes',
  'Calidad Premium',
  'Resultados Reales',
  'Envíos Venezuela',
  'Pago en Efectivo',
  'Fórmula Exclusiva',
  'Sin Colorantes',
  'Probado Clínicamente',
  'Bienestar Total',
]

const benefitsReverse = [
  'Suplementos Naturales',
  'Envío a Domicilio',
  'Sin Gluten',
  'Certificado GreenLife',
  'Stock Garantizado',
  'Soporte Directo',
  'Formulación Exclusiva',
  'Alta Concentración',
  'Sin Azúcar Añadida',
  'Resultados Comprobados',
]

export function BenefitsMarquee() {
  return (
    <div className="bg-forest-900 border-y border-white/8 py-3 overflow-hidden space-y-3">
      {/* Row 1 — forward */}
      <div className="marquee-track">
        {Array.from({ length: 4 }).map((_, gi) => (
          <div key={gi} className="flex items-center gap-0 pr-0">
            {benefits.map((b, i) => (
              <div
                key={`${gi}-${i}`}
                className="flex items-center gap-6 px-6 border-r border-white/8 last:border-r-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500 whitespace-nowrap">
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
                <span className="w-1.5 h-1.5 rounded-full bg-moss-400/60 flex-shrink-0" />
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
