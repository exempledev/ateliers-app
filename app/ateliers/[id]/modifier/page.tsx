import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import EditAtelierForm from './EditAtelierForm'

export default async function ModifierAtelierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/planning')

  const { data: atelier } = await supabase
    .from('ateliers')
    .select('*')
    .eq('id', id)
    .single()

  if (!atelier) notFound()

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
        <EditAtelierForm atelier={atelier} profile={profile} animateurs={animateurs} />
      </main>
    </>
  )
}
