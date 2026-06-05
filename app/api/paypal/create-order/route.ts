import { NextRequest, NextResponse } from 'next/server'
import { PAYPAL_BASE, getPaypalAccessToken } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const { price, title } = await req.json()
    const token = await getPaypalAccessToken()

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'EUR', value: Number(price).toFixed(2) },
          description: `Réservation atelier : ${title}`,
        }],
      }),
    })

    const order = await res.json()
    return NextResponse.json({ id: order.id })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 })
  }
}
