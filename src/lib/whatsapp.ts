import type { CartItem } from '../hooks/useCart'

const WHATSAPP_NUMBER = '584128590616'

export interface CustomerData {
  nome: string
  telefone: string
  cidade: string
}

export function buildWhatsAppLink(items: CartItem[], customer: CustomerData): string {
  const lines: string[] = []

  lines.push('*🖤 PEDIDO CREVALLY BLACK*')
  lines.push('─────────────────')
  lines.push(`*Cliente:* ${customer.nome}`)
  lines.push(`*Telefone:* ${customer.telefone}`)
  lines.push(`*Cidade:* ${customer.cidade}`)
  lines.push('─────────────────')
  lines.push('*PRODUTOS:*')

  let total = 0
  items.forEach((item) => {
    const subtotal = item.price * item.quantity
    total += subtotal
    const optionLabel = item.selectedOption ? ` (${item.selectedOption})` : ''
    lines.push(`• ${item.name}${optionLabel} x${item.quantity} = R$${subtotal.toFixed(2)}`)
  })

  lines.push('─────────────────')
  lines.push(`*TOTAL: R$${total.toFixed(2)}*`)
  lines.push('')
  const appUrl = (import.meta.env.VITE_APP_URL as string | undefined) ?? 'crevallyblack.com.br'
  lines.push(`_Enviado pelo site ${appUrl.replace('https://', '')}_`)

  const message = lines.join('\n')
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildKitWhatsAppLink(tierName: string, quantity: number, pricePerUnit: number): string {
  const total = quantity * pricePerUnit
  const message = [
    '*🖤 CONSULTA ATACADO CREVALLY BLACK*',
    '─────────────────',
    `*Tier:* ${tierName}`,
    `*Quantidade:* ${quantity} peças`,
    `*Preço por unidade:* R$${pricePerUnit.toFixed(2)}`,
    `*Total estimado:* R$${total.toFixed(2)}`,
    '─────────────────',
    'Quero informações para me tornar revendedor Crevally Black.',
  ].join('\n')

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildDirectWhatsAppLink(message?: string): string {
  const defaultMsg = 'Olá! Quero informações sobre os produtos Crevally Black.'
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message ?? defaultMsg)}`
}
