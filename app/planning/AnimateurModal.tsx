'use client'

import { X, Mail, Phone, Building2 } from 'lucide-react'

interface AnimateurInfo {
  full_name: string
  email?: string | null
  phone?: string | null
  organisme?: string | null
}

interface Props {
  animateur: AnimateurInfo
  theme: 'travail' | 'detente'
  onClose: () => void
}

export default function AnimateurModal({ animateur, theme, onClose }: Props) {
  const isTravail = theme === 'travail'
  const initial = animateur.full_name.charAt(0).toUpperCase()

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-slide-up bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header strip */}
        <div className={`h-2 ${isTravail ? 'bg-[var(--travail)]' : 'bg-[var(--detente)]'}`} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                isTravail ? 'bg-[var(--travail)]' : 'bg-[var(--detente)]'
              }`}>
                {initial}
              </div>
              <div>
                <p className="font-bold text-[var(--foreground)]">{animateur.full_name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">Animateur</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {animateur.organisme && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <Building2 className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide font-medium mb-0.5">Organisme / Entreprise</p>
                  <p className="text-sm text-[var(--foreground)] truncate">{animateur.organisme}</p>
                </div>
              </div>
            )}

            {animateur.email && (
              <a
                href={`mailto:${animateur.email}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors group"
              >
                <Mail className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide font-medium mb-0.5">Email</p>
                  <p className="text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] truncate transition-colors">{animateur.email}</p>
                </div>
              </a>
            )}

            {animateur.phone && (
              <a
                href={`tel:${animateur.phone}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors group"
              >
                <Phone className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide font-medium mb-0.5">Téléphone</p>
                  <p className="text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] truncate transition-colors">{animateur.phone}</p>
                </div>
              </a>
            )}

            {!animateur.email && !animateur.phone && !animateur.organisme && (
              <p className="text-sm text-[var(--muted)] text-center py-4">Aucune information de contact disponible.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
