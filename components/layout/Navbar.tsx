'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, User, LogOut, LayoutDashboard, Users, CreditCard, Building2, CalendarPlus } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const adminRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoaded(true); return }
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      setRole(profile?.role ?? null)
      setLoaded(true)
    }
    fetchRole()
  }, [])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) setAdminOpen(false)
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const actualitesLink = { href: '/actualites', label: 'Actualités' }
  const bonPlansLink = { href: '/bon-plans', label: 'Bons Plans' }
  const contactLink = { href: '/contact', label: 'Contact' }

  const links = role === 'admin'
    ? [
        { href: '/planning', label: 'Planning' },
        { href: '/entreprises', label: 'Entreprises' },
        actualitesLink,
        bonPlansLink,
        contactLink,
      ]
    : role === 'animateur'
    ? [
        { href: '/dashboard', label: 'Tableau de bord' },
        { href: '/planning', label: 'Planning' },
        { href: '/entreprises', label: 'Entreprises' },
        actualitesLink,
        bonPlansLink,
        contactLink,
      ]
    : role === 'collaborateur'
    ? [
        { href: '/planning', label: 'Planning' },
        { href: '/entreprises', label: 'Entreprises' },
        actualitesLink,
        bonPlansLink,
        contactLink,
      ]
    : role === 'participant'
    ? [
        { href: '/planning', label: 'Planning' },
        { href: '/entreprises', label: 'Entreprises' },
        actualitesLink,
        contactLink,
      ]
    : [
        { href: '/planning', label: 'Planning' },
        { href: '/entreprises', label: 'Entreprises' },
        actualitesLink,
        contactLink,
      ]

  const isAdminSection = pathname.startsWith('/admin')

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/favicon.ico" alt="Logo" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-semibold text-[var(--foreground)]">Les Ateliers d'Émergence</span>
        </Link>

        <nav className="flex items-center gap-1">
          {/* Administration dropdown — admin only */}
          {loaded && role === 'admin' && (
            <div className="relative" ref={adminRef}>
              <button
                onClick={() => { setAdminOpen(o => !o); setAccountOpen(false) }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isAdminSection
                    ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]'
                )}
              >
                Administration
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', adminOpen && 'rotate-180')} />
              </button>

              {adminOpen && (
                <div className="animate-slide-up absolute left-0 top-full mt-2 w-56 bg-white rounded-xl border border-[var(--border)] shadow-lg overflow-hidden z-50">
                  <Link
                    href="/admin"
                    onClick={() => setAdminOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                      pathname === '/admin'
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--background)]'
                    )}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[var(--muted)]" />
                    Tableau de bord
                  </Link>
                  <div className="border-t border-[var(--border)]" />
                  <Link
                    href="/dashboard"
                    onClick={() => setAdminOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                      pathname === '/dashboard'
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--background)]'
                    )}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[var(--muted)]" />
                    Mes ateliers
                  </Link>
                  <div className="border-t border-[var(--border)]" />
                  <Link
                    href="/ateliers/nouveau"
                    onClick={() => setAdminOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                      pathname === '/ateliers/nouveau'
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--background)]'
                    )}
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[var(--muted)]" />
                    Créer un atelier
                  </Link>
                  <div className="border-t border-[var(--border)]" />
                  <Link
                    href="/admin/utilisateurs"
                    onClick={() => setAdminOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                      pathname === '/admin/utilisateurs'
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--background)]'
                    )}
                  >
                    <Users className="w-3.5 h-3.5 text-[var(--muted)]" />
                    Utilisateurs
                  </Link>
                  <div className="border-t border-[var(--border)]" />
                  <Link
                    href="/admin/entreprises"
                    onClick={() => setAdminOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                      pathname === '/admin/entreprises'
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--background)]'
                    )}
                  >
                    <Building2 className="w-3.5 h-3.5 text-[var(--muted)]" />
                    Entreprises
                  </Link>
                  <div className="border-t border-[var(--border)]" />
                  <Link
                    href="/admin/paiements"
                    onClick={() => setAdminOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                      pathname === '/admin/paiements'
                        ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--background)]'
                    )}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[var(--muted)]" />
                    Historique des paiements
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Regular links */}
          {loaded && links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]'
              )}
            >
              {label}
            </Link>
          ))}

          {/* Mon compte dropdown */}
          {loaded && role && (
            <div className="relative ml-2" ref={accountRef}>
              <button
                onClick={() => { setAccountOpen(o => !o); setAdminOpen(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Mon compte
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', accountOpen && 'rotate-180')} />
              </button>

              {accountOpen && (
                <div className="animate-slide-up absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-[var(--border)] shadow-lg overflow-hidden z-50">
                  <Link
                    href="/mon-compte"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[var(--muted)]" />
                    Profil
                  </Link>
                  <div className="border-t border-[var(--border)]" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Connexion button for guests */}
          {loaded && !role && (
            <Link
              href="/connexion"
              className="ml-2 px-4 py-1.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
