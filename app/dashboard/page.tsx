import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import DashboardContent from './DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/connexion')
  if (profile.role === 'admin') redirect('/admin')
  if (profile.role === 'participant') redirect('/planning')

  const { data: ateliers } = await supabase
    .from('ateliers_with_spots')
    .select('*, reservations(user_id, status, users(full_name, email))')
    .eq('animateur_id', profile.role === 'admin' ? undefined : user.id)
    .order('date', { ascending: false })

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <DashboardContent profile={profile} ateliers={ateliers ?? []} />
      </main>
    </>
  )
}
