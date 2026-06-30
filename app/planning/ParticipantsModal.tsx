'use client'

import { useEffect, useState } from 'react'
import { X, Mail, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Atelier } from '@/types'

interface Participant {
  full_name: string
  email: string
}

interface Props {
  atelier: Atelier
  onClose: () => void
}

export default function ParticipantsModal({ atelier, onClose }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchParticipants() {
      const { data } = await supabase
        .from('reservations')
        .select('users(full_name, email)')
        .eq('atelier_id', atelier.id)
        .eq('status', 'confirmed')

      const list = (data ?? [])
        .map((r: any) => r.users)
        .filter(Boolean) as Participant[]

      setParticipants(list)
      setLoading(false)
    }
    fetchParticipants()
  }, [atelier.id])

  const isTravail = atelier.theme === 'travail'

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="animate-slide-up bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`h-1.5 ${isTravail ? 'bg-[var(--travail)]' : 'bg-[var(--detente)]'}`} />
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[var(--border)]">
          <div>
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5 ${
              isTravail
                ? 'bg-[var(--travail-light)] text-[var(--travail)]'
                : 'bg-[var(--detente-light)] text-[var(--detente)]'
            }`}>
              {isTravail ? 'Professionnel' : 'Bien-Être'}
            </span>
            <h2 className="font-semibold text-[var(--foreground)] text-sm leading-snug">{atelier.title}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {atelier.start_time.slice(0, 5)} – {atelier.end_time.slice(0, 5)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors ml-3 flex-shrink-0"
          >
            <X className="w-4 h-4 text-[var(--muted)]" />
          </button>
        </div>

        {/* Participants list */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[var(--muted)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              {loading ? 'Chargement…' : `${participants.length} participant${participants.length > 1 ? 's' : ''} inscrit${participants.length > 1 ? 's' : ''}`}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : participants.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-8">Aucun participant inscrit pour l'instant.</p>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[var(--primary)]">
                        {p.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{p.full_name}</p>
                      <p className="text-xs text-[var(--muted)] truncate">{p.email}</p>
                    </div>
                  </div>
                  <a
                    href={`mailto:${p.email}`}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--primary)]"
                    title={`Envoyer un mail à ${p.full_name}`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
