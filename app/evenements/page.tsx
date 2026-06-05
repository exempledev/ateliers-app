import Navbar from '@/components/layout/Navbar'
import { CalendarDays } from 'lucide-react'

export default function EvenementsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Évènements</h1>
          <p className="text-[var(--muted)] mt-1">Découvrez les prochains évènements organisés</p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
            <CalendarDays className="w-7 h-7 text-[var(--primary)]" />
          </div>
          <p className="text-[var(--foreground)] font-semibold">Aucun évènement à venir</p>
          <p className="text-sm text-[var(--muted)] mt-1">Les prochains évènements apparaîtront ici.</p>
        </div>
      </main>
    </>
  )
}
