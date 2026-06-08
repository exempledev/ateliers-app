import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import Navbar from '@/components/layout/Navbar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import AccountForm from './AccountForm'
import AvatarUpload from './AvatarUpload'
import CompanyEditor from './CompanyEditor'

export default async function MonComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!profile) redirect('/connexion')

  const isAnimateur = profile.role === 'admin' || profile.role === 'animateur'
  const today = new Date().toISOString().split('T')[0]

  const ateliersQuery = isAnimateur
    ? (profile.role === 'admin'
        ? supabase.from('ateliers_with_spots').select('*').gte('date', today).order('date', { ascending: true })
        : supabase.from('ateliers_with_spots').select('*').eq('animateur_id', user.id).gte('date', today).order('date', { ascending: true }))
    : null

  const [entrepriseResult, reservationsResult, ateliersResult] = await Promise.all([
    profile.role === 'collaborateur' && profile.organisme
      ? supabase.from('entreprises').select('*').ilike('name', profile.organisme.trim()).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from('reservations').select('*, ateliers(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
    ateliersQuery ?? Promise.resolve({ data: null, error: null }),
  ])

  const entreprise = entrepriseResult.data
  const reservations = reservationsResult.data
  const createdAteliers = ateliersResult.data

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
        {/* Profil */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <AvatarUpload
              userId={user.id}
              initialLetter={profile.full_name?.charAt(0).toUpperCase() ?? '?'}
              currentAvatarUrl={profile.avatar_url ?? null}
            />
            <div>
              <h1 className="text-lg font-bold text-[var(--foreground)]">{profile.full_name}</h1>
              <p className="text-sm text-[var(--muted)]">{user.email}</p>
            </div>
          </div>
          <AccountForm
            currentEmail={user.email ?? ''}
            currentName={profile.full_name ?? ''}
            currentPhone={profile.phone ?? null}
            currentBio={profile.bio ?? null}
            userId={user.id}
          />
        </Card>

        {/* Entreprise (collaborateurs) */}
        {entreprise && (
          <div className="mb-6">
            <h2 className="font-semibold text-[var(--foreground)] mb-3">Mon entreprise</h2>
            <CompanyEditor entreprise={entreprise} />
          </div>
        )}

        {/* Ateliers animés (admin / animateur) */}
        {isAnimateur && (
          <div className="mb-6">
            <h2 className="font-semibold text-[var(--foreground)] mb-3">
              {profile.role === 'admin' ? 'Tous les ateliers à venir' : 'Mes ateliers à venir'} ({createdAteliers?.length ?? 0})
            </h2>
            {!createdAteliers?.length ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-[var(--muted)]">Aucun atelier planifié.</p>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {createdAteliers.map((a: any) => (
                  <Card key={a.id} className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge theme={a.theme} label={a.theme === 'travail' ? 'Travail' : 'Détente'} />
                        <span className="font-medium text-sm truncate">{a.title}</span>
                      </div>
                      <p className="text-xs text-[var(--muted)] capitalize">
                        {format(parseISO(a.date), 'EEEE d MMMM', { locale: fr })} · {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}
                        {a.location && ` · ${a.location}`}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--border)] text-[var(--muted)] font-medium flex-shrink-0">
                      {a.spots_taken ?? 0}/{a.max_participants} inscrits
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Réservations à venir */}
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

        {/* Historique */}
        {past.length > 0 && (
          <div>
            <h2 className="font-semibold text-[var(--foreground)] mb-3">Historique ({past.length})</h2>
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
