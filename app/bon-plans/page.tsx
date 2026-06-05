import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import BonPlansContent from './BonPlansContent'

export default async function BonPlansPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? null
  }

  const { data: rawPosts } = await supabase
    .from('bon_plans')
    .select('id, title, content, image_url, created_at, author_id, users(full_name)')
    .order('created_at', { ascending: false })

  const posts = (rawPosts ?? []).map(p => ({
    ...p,
    users: Array.isArray(p.users) ? (p.users[0] ?? null) : (p.users as { full_name: string } | null),
  }))

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Bons Plans</h1>
          <p className="text-[var(--muted)] mt-1">Offres et réductions exclusives pour nos membres</p>
        </div>

        <BonPlansContent
          posts={posts}
          role={role}
          userId={user?.id ?? null}
        />
      </main>
    </>
  )
}
