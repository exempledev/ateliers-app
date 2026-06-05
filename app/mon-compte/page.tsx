import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import Navbar from '@/components/layout/Navbar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import AccountForm from './AccountForm'

export default async function MonComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, ateliers(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const upcoming = reservations?.filter(r =>
    r.status === 'confirmed' && r.ateliers?.date && new Date(r.ateliers.date) >= new Date()
  ) ?? []

  const past = reservations?.filter(r =>
    r.status === 'confirmed' && r.ateliers?.date && new Date(r.ateliers.date) < new Date()
  ) ?? []

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-[var(--primary)]">
                {profile?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--foreground)]">{profile?.full_name}</h1>
              <p className="text-sm text-[var(--muted)]">{user.email}</p>
            </div>
          </div>
          <AccountForm
            currentEmail={user.email ?? ''}
            currentName={profile?.full_name ?? ''}
            currentPhone={profile?.phone ?? null}
            userId={user.id}
          />
        </Card>

        {/* Upcoming reservations */}
        <div className="mb-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-3">
            Mes prochains ateliers ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-[var(--muted)]">Aucune réservation à venir.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map(r => (
                <Card key={r.id} className="p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge theme={r.ateliers.theme} label={r.ateliers.theme === 'travail' ? 'Travail' : 'Détente'} />
                      <span className="font-medium text-sm">{r.ateliers.title}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] capitalize">
                      {format(parseISO(r.ateliers.date), 'EEEE d MMMM', { locale: fr })} · {r.ateliers.start_time.slice(0, 5)}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-medium">
                    Confirmé
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past reservations */}
        {past.length > 0 && (
          <div>
            <h2 className="font-semibold text-[var(--foreground)] mb-3">
              Historique ({past.length})
            </h2>
            <div className="flex flex-col gap-2">
              {past.map(r => (
                <Card key={r.id} className="p-3 flex items-center gap-3 opacity-60">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge theme={r.ateliers.theme} label={r.ateliers.theme === 'travail' ? 'Travail' : 'Détente'} />
                      <span className="text-sm text-[var(--muted)]">{r.ateliers.title}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] capitalize">
                      {format(parseISO(r.ateliers.date), 'EEEE d MMMM', { locale: fr })}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
