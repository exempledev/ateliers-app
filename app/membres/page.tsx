import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { Mail, Phone } from 'lucide-react'

export default async function MembresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const canSeeDetails = profile?.role === 'admin' || profile?.role === 'animateur'

  const { data: membres } = await supabase
    .from('users')
    .select('id, full_name, email, role, phone')
    .order('full_name', { ascending: true })

  const list = membres ?? []

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Membres</h1>
          <p className="text-[var(--muted)] mt-1">{list.length} participant{list.length > 1 ? 's' : ''} inscrit{list.length > 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
          {list.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-12">Aucun membre pour l'instant.</p>
          ) : (
            list.map(membre => (
              <div key={membre.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[var(--primary)]">
                    {membre.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{membre.full_name}</p>

                  {canSeeDetails && (
                    <div className="flex items-center flex-wrap gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                        <Mail className="w-3 h-3" />
                        {membre.email}
                      </span>
                      {membre.phone && (
                        <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          <Phone className="w-3 h-3" />
                          {membre.phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  )
}
