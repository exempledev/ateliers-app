import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import CreateAtelierForm from './CreateAtelierForm'

export default async function NouvelAtelierPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/planning')

  let animateurs: { id: string; full_name: string; email: string }[] = []
  if (profile.role === 'admin') {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('role', ['animateur', 'admin'])
      .eq('is_active', true)
      .order('full_name')
    animateurs = data ?? []
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <CreateAtelierForm profile={profile} animateurs={animateurs} />
      </main>
    </>
  )
}
