export function formatPrice(amount: number): string {
  return `R$ ${amount.toFixed(0)}`
}

export function formatPriceDetailed(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(amount)
}
