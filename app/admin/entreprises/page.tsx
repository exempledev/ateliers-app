import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import EntreprisesContent from './EntreprisesContent'

export default async function EntreprisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ data: entreprises }, { data: collaborateurs }] = await Promise.all([
    supabase.from('entreprises').select('*').order('name'),
    supabase.from('users').select('id, full_name, email, phone, organisme').eq('role', 'collaborateur').order('full_name'),
  ])

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <EntreprisesContent
          entreprises={entreprises ?? []}
          collaborateurs={collaborateurs ?? []}
        />
      </main>
    </>
  )
}
