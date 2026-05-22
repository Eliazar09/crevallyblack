export interface Kit {
  id: string
  name: string
  tier: string
  minQuantity: number
  pricePerUnit: number
  discount: number
  benefits: string[]
  featured?: boolean
}

export const kits: Kit[] = [
  {
    id: 'k1',
    name: 'Kit Inicial',
    tier: 'Inicial',
    minQuantity: 1,
    pricePerUnit: 100,
    discount: 0,
    benefits: [
      'A partir de 1 kit (Té + Cápsulas)',
      'Soporte básico por WhatsApp',
      'Material de presentación digital',
      'Ideal para empezar a vender',
    ],
  },
  {
    id: 'k2',
    name: 'Distribuidor',
    tier: 'Distribuidor',
    minQuantity: 10,
    pricePerUnit: 80,
    discount: 20,
    benefits: [
      'A partir de 10 kits',
      'Soporte continuo por WhatsApp',
      'Material de marketing incluido',
      'Descuento de 20% sobre precio inicial',
    ],
  },
  {
    id: 'k3',
    name: 'Mayorista',
    tier: 'Mayorista',
    minQuantity: 20,
    pricePerUnit: 75,
    discount: 25,
    benefits: [
      '20 kits o más',
      'Canal prioritario de atención',
      'Estrategias de venta personalizadas',
      'Descuento de 25% sobre precio inicial',
    ],
    featured: true,
  },
  {
    id: 'k4',
    name: 'Negocio',
    tier: 'Negocio',
    minQuantity: 30,
    pricePerUnit: 70,
    discount: 30,
    benefits: [
      '30 kits o más',
      'Línea directa con Jennifer',
      'Capacitación en ventas digitales',
      'Descuento de 30% sobre precio inicial',
    ],
  },
  {
    id: 'k5',
    name: 'Premium',
    tier: 'Premium',
    minQuantity: 50,
    pricePerUnit: 60,
    discount: 40,
    benefits: [
      '50 kits o más',
      'Beneficios exclusivos de socio',
      'Productos nuevos en pre-lanzamiento',
      'Máximo descuento: 40% sobre inicial',
    ],
  },
]

export const RETAIL_PRICE_PER_KIT = 160

export function calculateProfit(kit: Kit, quantity: number): {
  investment: number
  revenue: number
  profit: number
  margin: number
} {
  const investment = kit.pricePerUnit * quantity
  const revenue = RETAIL_PRICE_PER_KIT * quantity
  const profit = revenue - investment
  const margin = Math.round((profit / revenue) * 100)
  return { investment, revenue, profit, margin }
}
