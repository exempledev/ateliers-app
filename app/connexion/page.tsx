import Link from 'next/link'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/favicon.ico" alt="Logo" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-semibold text-lg">Les Ateliers d'Émergence</span>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Bon retour</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-4">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-[var(--primary)] font-medium hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
