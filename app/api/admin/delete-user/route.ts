import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { userId } = await req.json()

  if (!userId || userId === user.id) {
    return NextResponse.json({ error: 'Impossible de supprimer cet utilisateur' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Récupérer les ateliers de cet utilisateur
  const { data: ateliers } = await admin.from('ateliers').select('id').eq('animateur_id', userId)
  if (ateliers && ateliers.length > 0) {
    const atelierIds = ateliers.map(a => a.id)
    // Supprimer les réservations sur ces ateliers
    await admin.from('reservations').delete().in('atelier_id', atelierIds)
    // Supprimer les ateliers
    await admin.from('ateliers').delete().in('id', atelierIds)
  }

  // Supprimer les réservations de l'utilisateur
  await admin.from('reservations').delete().eq('user_id', userId)

  // Supprimer le profil public
  const { error: profileError } = await admin.from('users').delete().eq('id', userId)
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Supprimer le compte auth
  const { error: authError } = await admin.auth.admin.deleteUser(userId)
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
