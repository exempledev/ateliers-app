import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import AdminContent from '../AdminContent'

export default async function AdminUtilisateursPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const [
    { data: admins },
    { data: animateurs },
    { data: participants },
    { data: collaborateurs },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('role', 'admin').order('full_name'),
    supabase.from('users').select('*').eq('role', 'animateur').order('created_at', { ascending: false }),
    supabase.from('users').select('*').eq('role', 'participant').order('created_at', { ascending: false }),
    supabase.from('users').select('*').eq('role', 'collaborateur').order('created_at', { ascending: false }),
  ])

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AdminContent
          admins={admins ?? []}
          animateurs={animateurs ?? []}
          participants={participants ?? []}
          collaborateurs={collaborateurs ?? []}
          isSuperAdmin={profile?.is_super_admin ?? false}
          currentUserId={user.id}
        />
      </main>
    </>
  )
}
