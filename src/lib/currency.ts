export function formatPrice(amount: number): string {
  return `$${amount.toFixed(0)}`
}

export function formatPriceDetailed(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}
