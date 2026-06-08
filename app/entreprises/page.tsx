import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import EntreprisesPublicContent from './EntreprisesPublicContent'

export default async function EntreprisesPage() {
  const supabase = await createClient()

  const [{ data: entreprises }, { data: collaborateurs }, { data: intervenants }] = await Promise.all([
    supabase.from('entreprises').select('*').order('name'),
    supabase
      .from('users')
      .select('id, full_name, email, phone, organisme, avatar_url, role')
      .eq('role', 'collaborateur')
      .order('full_name'),
    supabase
      .from('users')
      .select('id, full_name, email, avatar_url, bio, role')
      .in('role', ['animateur', 'admin'])
      .eq('is_active', true)
      .order('full_name'),
  ])

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <EntreprisesPublicContent
          entreprises={entreprises ?? []}
          collaborateurs={collaborateurs ?? []}
          intervenants={intervenants ?? []}
        />
      </main>
    </>
  )
}
