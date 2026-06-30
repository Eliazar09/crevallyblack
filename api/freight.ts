export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const { cep, itemCount = 1 } = req.body || {}
  const digits = String(cep ?? '').replace(/\D/g, '')

  if (digits.length !== 8) {
    res.status(400).json({ error: 'CEP inválido' }); return
  }

  const token     = process.env.MELHOR_ENVIO_TOKEN
  const originCep = (process.env.MELHOR_ENVIO_CEP_ORIGEM || '12620000').replace(/\D/g, '')

  if (!token) {
    res.status(500).json({ error: 'MELHOR_ENVIO_TOKEN não configurado' }); return
  }

  // Peso estimado: 0.4kg por item (roupas), mínimo 0.3kg, máximo 30kg
  const weight = Math.max(0.3, Math.min(30, Number(itemCount) * 0.4))

  try {
    const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
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

    const data = await response.json()
    console.log('[freight] ME status:', response.status, 'options:', Array.isArray(data) ? data.length : '?')

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

    res.status(200).json({ options })
  } catch (err: any) {
    console.error('[freight] Erro:', err?.message)
    res.status(500).json({ error: 'Erro interno ao calcular frete' })
  }
}
