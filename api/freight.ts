export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const { cep, itemCount = 1 } = req.body || {}
  const digits = String(cep ?? '').replace(/\D/g, '')

  if (digits.length !== 8) {
    res.status(400).json({ error: 'CEP inválido' }); return
  }

  const token     = process.env.MELHOR_ENVIO_TOKEN
  const originRaw = process.env.MELHOR_ENVIO_CEP_ORIGEM

  if (!token) {
    console.error('[freight] MELHOR_ENVIO_TOKEN não configurado na Vercel')
    res.status(500).json({ error: 'Token de frete não configurado' }); return
  }
  if (!originRaw) {
    console.error('[freight] MELHOR_ENVIO_CEP_ORIGEM não configurado na Vercel')
    res.status(500).json({ error: 'CEP de origem não configurado' }); return
  }

  const originCep = originRaw.replace(/\D/g, '')
  if (originCep.length !== 8) {
    console.error('[freight] MELHOR_ENVIO_CEP_ORIGEM inválido:', originRaw)
    res.status(500).json({ error: 'CEP de origem inválido no servidor' }); return
  }

  const weight = Math.max(0.3, Math.min(30, Number(itemCount) * 0.4))

  console.log(`[freight] CEP origem=${originCep} destino=${digits} peso=${weight}kg`)

  try {
    // Usar www para evitar redirect 301 que dropa o header Authorization
    const response = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Authorization':  `Bearer ${token}`,
        'Content-Type':   'application/json',
        'Accept':         'application/json',
        'User-Agent':     'Crevally Black devopsrl530@gmail.com',
      },
      body: JSON.stringify({
        from: { postal_code: originCep },
        to:   { postal_code: digits },
        package: { height: 10, width: 30, length: 20, weight },
        options: { insurance_value: 0, receipt: false, own_hand: false },
      }),
    })

    let data: any
    const text = await response.text()
    try { data = JSON.parse(text) } catch { data = text }

    console.log(`[freight] ME status=${response.status} body=${JSON.stringify(data).slice(0, 400)}`)

    if (!response.ok) {
      res.status(502).json({ error: 'Erro ao calcular frete', detail: data }); return
    }

    const options = (Array.isArray(data) ? data : [])
      .filter((s: any) => !s.error && s.price && parseFloat(s.price) > 0)
      .map((s: any) => ({
        id:             String(s.id),
        name:           s.name as string,
        company:        (s.company?.name ?? '') as string,
        price:          parseFloat(s.price),
        delivery_time:  s.delivery_time as number,
        delivery_range: s.delivery_range as { min: number; max: number } | undefined,
      }))
      .sort((a: any, b: any) => a.price - b.price)

    // Entrega local: CEPs de Piquete/SP começam com 1262
    if (digits.startsWith('1262')) {
      options.unshift({
        id:             'local',
        name:           'Entrega Local',
        company:        'Crevally Black',
        price:          10,
        delivery_time:  1,
        delivery_range: { min: 1, max: 2 },
      })
    }

    console.log(`[freight] opções válidas=${options.length}`)
    res.status(200).json({ options })
  } catch (err: any) {
    console.error('[freight] Erro de rede:', err?.message)
    res.status(500).json({ error: 'Erro interno ao calcular frete' })
  }
}
