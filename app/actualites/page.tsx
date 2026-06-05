import Navbar from '@/components/layout/Navbar'
import { Newspaper } from 'lucide-react'

export default function ActualitesPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Actualités</h1>
          <p className="text-[var(--muted)] mt-1">Les dernières nouvelles de l'espace</p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
            <Newspaper className="w-7 h-7 text-[var(--primary)]" />
          </div>
          <p className="text-[var(--foreground)] font-semibold">Aucune actualité pour le moment</p>
          <p className="text-sm text-[var(--muted)] mt-1">Revenez bientôt pour découvrir les dernières nouvelles.</p>
        </div>
      </main>
    </>
  )
}
