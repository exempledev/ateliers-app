import Navbar from '@/components/layout/Navbar'
import ProutContent from './ProutContent'

export default function ProutPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Nous rejoindre</h1>
          <p className="text-[var(--muted)] mt-1">Devenez animateur ou faites connaître votre entreprise</p>
        </div>
        <ProutContent />
      </main>
    </>
  )
}
