import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PAYPAL_BASE, getPaypalAccessToken } from '@/lib/paypal'

export default async function PaypalSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const orderId = params.token

  if (!orderId) redirect('/planning')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const token = await getPaypalAccessToken()
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  })

  const capture = await res.json()
  if (capture.status !== 'COMPLETED') redirect('/planning')

  const atelierId = capture.purchase_units?.[0]?.custom_id
  if (!atelierId) redirect('/planning')

  await supabase.from('reservations').upsert({
    atelier_id: atelierId,
    user_id: user.id,
    status: 'confirmed',
    payment_id: orderId,
    payment_method: 'paypal',
  })

  redirect('/planning')
}
