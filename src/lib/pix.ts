// Gerador de payload PIX BR Code (EMV) — padrão Banco Central do Brasil
// Funciona 100% no frontend, sem backend

function crc16(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
    crc &= 0xffff
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function f(id: string, v: string): string {
  return `${id}${String(v.length).padStart(2, '0')}${v}`
}

function ascii(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
}

export function buildPixPayload(
  pixKey: string,
  merchantName: string,
  merchantCity: string,
  amount: number,
  txId: string,
): string {
  const txIdClean = txId.replace(/[^A-Za-z0-9]/g, '').slice(0, 25).padStart(5, '0')
  const acc = f('00', 'BR.GOV.BCB.PIX') + f('01', pixKey)
  const addl = f('05', txIdClean)

  const body = [
    f('00', '01'),             // Payload Format Indicator
    f('01', '12'),             // Point of Initiation: 12 = dinâmico (uso único)
    f('26', acc),              // Merchant Account Information (chave PIX)
    f('52', '0000'),           // Merchant Category Code
    f('53', '986'),            // Currency = BRL
    f('54', amount.toFixed(2)), // Valor
    f('58', 'BR'),             // Country Code
    f('59', ascii(merchantName).slice(0, 25)), // Nome do recebedor
    f('60', ascii(merchantCity).slice(0, 15)), // Cidade do recebedor
    f('62', addl),             // Additional Data (referência do pedido)
    '6304',                    // CRC placeholder
  ].join('')

  return body + crc16(body)
}

export function pixQrUrl(payload: string, size = 240): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=png&margin=10&data=${encodeURIComponent(payload)}`
}
