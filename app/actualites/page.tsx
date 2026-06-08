import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import ActualitesContent from './ActualitesContent'

export default async function ActualitesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: posts }, { data: profile }] = await Promise.all([
    supabase
      .from('actualites')
      .select('id, title, content, image_url, created_at, updated_at, users(full_name)')
      .order('created_at', { ascending: false }),
    user
      ? supabase.from('users').select('role').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Actualités</h1>
          <p className="text-[var(--muted)] mt-1">Les dernières nouvelles de l'espace</p>
        </div>
        <ActualitesContent posts={posts ?? []} isAdmin={isAdmin} />
      </main>
    </>
  )
}
