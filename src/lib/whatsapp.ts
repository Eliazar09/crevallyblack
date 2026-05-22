import type { CartItem } from '../hooks/useCart'

const WHATSAPP_NUMBER = '584128590616'

export interface CustomerData {
  nombre: string
  telefono: string
  ciudad: string
}

export function buildWhatsAppLink(items: CartItem[], customer: CustomerData): string {
  const lines: string[] = []

  lines.push('*🌿 PEDIDO GREENLIFE*')
  lines.push('─────────────────')
  lines.push(`*Cliente:* ${customer.nombre}`)
  lines.push(`*Teléfono:* ${customer.telefono}`)
  lines.push(`*Ciudad:* ${customer.ciudad}`)
  lines.push('─────────────────')
  lines.push('*PRODUCTOS:*')

  let total = 0
  items.forEach((item) => {
    const subtotal = item.price * item.quantity
    total += subtotal
    const optionLabel = item.selectedOption ? ` (${item.selectedOption})` : ''
    lines.push(`• ${item.name}${optionLabel} x${item.quantity} = $${subtotal}`)
  })

  lines.push('─────────────────')
  lines.push(`*TOTAL: $${total}*`)
  lines.push('')
  const appUrl = (import.meta.env.VITE_APP_URL as string | undefined) ?? 'greenlife.com.ve'
  lines.push(`_Enviado desde ${appUrl.replace('https://', '')}_`)

  const message = lines.join('\n')
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildKitWhatsAppLink(tierName: string, quantity: number, pricePerUnit: number): string {
  const total = quantity * pricePerUnit
  const message = [
    '*🌿 CONSULTA MAYORISTA GREENLIFE*',
    '─────────────────',
    `*Tier:* ${tierName}`,
    `*Cantidad:* ${quantity} kits`,
    `*Precio por unidad:* $${pricePerUnit}`,
    `*Total estimado:* $${total}`,
    '─────────────────',
    'Quiero información para comenzar como distribuidor GreenLife.',
  ].join('\n')

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildDirectWhatsAppLink(message?: string): string {
  const defaultMsg = '¡Hola! Quiero información sobre los productos GreenLife.'
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message ?? defaultMsg)}`
}
