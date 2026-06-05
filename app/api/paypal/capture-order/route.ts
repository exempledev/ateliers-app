import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PAYPAL_BASE, getPaypalAccessToken } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const { orderId, atelierId } = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const token = await getPaypalAccessToken()

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })

    const capture = await res.json()
    if (capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Paiement non complété' }, { status: 400 })
    }

    const { error } = await supabase.from('reservations').upsert({
      atelier_id: atelierId,
      user_id: user.id,
      status: 'confirmed',
      payment_id: orderId,
      payment_method: 'paypal',
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la capture du paiement' }, { status: 500 })
  }
}
