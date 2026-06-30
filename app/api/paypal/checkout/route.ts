import { NextRequest, NextResponse } from 'next/server'
import { PAYPAL_BASE, getPaypalAccessToken } from '@/lib/paypal'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const atelierId = searchParams.get('atelierId')
  const price = searchParams.get('price')
  const title = searchParams.get('title') ?? 'Atelier'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  if (!atelierId || !price) {
    return NextResponse.redirect(`${siteUrl}/planning`)
  }

  try {
    const token = await getPaypalAccessToken()

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

    if (!approveUrl) return NextResponse.redirect(`${siteUrl}/planning`)

    return NextResponse.redirect(approveUrl)
  } catch {
    return NextResponse.redirect(`${siteUrl}/planning`)
  }
}
