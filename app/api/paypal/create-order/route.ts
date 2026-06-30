import { NextRequest, NextResponse } from 'next/server'
import { PAYPAL_BASE, getPaypalAccessToken } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const { price, title, atelierId } = await req.json()
    const token = await getPaypalAccessToken()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'EUR', value: Number(price).toFixed(2) },
          description: `Réservation atelier : ${title}`,
          custom_id: atelierId,
        }],
        application_context: {
          return_url: `${siteUrl}/paypal/success`,
          cancel_url: `${siteUrl}/planning`,
          brand_name: "Les Ateliers d'Émergence",
          locale: 'fr-FR',
          user_action: 'PAY_NOW',
        },
      }),
    })

    const order = await res.json()
    const approveUrl = order.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')?.href
    return NextResponse.json({ id: order.id, approveUrl })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 })
  }
}
