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
    name: 'Revendedor Iniciante',
    tier: 'Iniciante',
    minQuantity: 5,
    pricePerUnit: 60,
    discount: 0,
    benefits: [
      'A partir de 5 peças',
      'Suporte básico por WhatsApp',
      'Material de divulgação digital',
      'Ideal para começar a revender',
    ],
  },
  {
    id: 'k2',
    name: 'Revendedor',
    tier: 'Revendedor',
    minQuantity: 15,
    pricePerUnit: 50,
    discount: 17,
    benefits: [
      'A partir de 15 peças',
      'Suporte contínuo por WhatsApp',
      'Material de marketing incluso',
      '17% de desconto sobre o preço inicial',
    ],
  },
  {
    id: 'k3',
    name: 'Atacadista',
    tier: 'Atacadista',
    minQuantity: 30,
    pricePerUnit: 45,
    discount: 25,
    benefits: [
      '30 peças ou mais',
      'Canal prioritário de atendimento',
      'Estratégias de vendas personalizadas',
      '25% de desconto sobre o preço inicial',
    ],
    featured: true,
  },
  {
    id: 'k4',
    name: 'Distribuidor',
    tier: 'Distribuidor',
    minQuantity: 50,
    pricePerUnit: 40,
    discount: 33,
    benefits: [
      '50 peças ou mais',
      'Linha direta com a equipe Crevally',
      'Capacitação em vendas digitais',
      '33% de desconto sobre o preço inicial',
    ],
  },
  {
    id: 'k5',
    name: 'Premium',
    tier: 'Premium',
    minQuantity: 100,
    pricePerUnit: 35,
    discount: 42,
    benefits: [
      '100 peças ou mais',
      'Benefícios exclusivos de sócio',
      'Produtos novos em pré-lançamento',
      'Máximo desconto: 42% sobre o inicial',
    ],
  },
]

export const RETAIL_PRICE_PER_KIT = 100

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
