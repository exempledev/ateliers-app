import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import { CreditCard } from 'lucide-react'

export default async function AdminPaiementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Historique des paiements</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Suivi des transactions et paiements de la plateforme</p>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
            <CreditCard className="w-7 h-7 text-[var(--primary)]" />
          </div>
          <p className="text-[var(--foreground)] font-semibold">Aucun paiement enregistré</p>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-xs">
            L'historique des transactions apparaîtra ici une fois le module de paiement activé.
          </p>
        </div>
      </main>
    </>
  )
}
