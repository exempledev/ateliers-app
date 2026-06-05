'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import type { User } from '@/types'

interface Props {
  animateurs: User[]
  participants: User[]
  collaborateurs: User[]
}

export default function AdminContent({ animateurs, participants, collaborateurs }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function toggleActive(user: User) {
    await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', user.id)
    router.refresh()
  }

  async function changeRole(userId: string, newRole: 'animateur' | 'participant' | 'collaborateur') {
    await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-8">Administration</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Animateurs list */}
        <Card className="p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">
            Animateurs ({animateurs.length})
          </h2>
          <div className="flex flex-col gap-2">
            {animateurs.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Aucun animateur.</p>
            ) : (
              animateurs.map(user => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{user.full_name}</p>
                    <p className="text-xs text-[var(--muted)]">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(user)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        user.is_active
                          ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                          : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {user.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </button>
                    <RoleSelect
                      user={user}
                      onChangeRole={(newRole) => changeRole(user.id, newRole)}
                    />
                  </div>
                </div>
              ))

            )}
          </div>
        </Card>
      </div>

      {/* Collaborateurs */}
      <Card className="p-5 mt-6">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">
          Collaborateurs ({collaborateurs.length})
        </h2>
        <div className="flex flex-col gap-1">
          {collaborateurs.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Aucun collaborateur.</p>
          ) : (
            collaborateurs.map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-green-700">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{user.full_name}</p>
                    <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
                  </div>
                </div>
                <RoleSelect
                  user={user}
                  onChangeRole={(newRole) => changeRole(user.id, newRole)}
                />
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Participants */}
      <Card className="p-5 mt-6">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">
          Utilisateurs de la plateforme ({participants.length})
        </h2>
        <div className="flex flex-col gap-1">
          {participants.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Aucun participant.</p>
          ) : (
            participants.map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-[var(--primary)]">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{user.full_name}</p>
                    <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
                  </div>
                </div>
                <RoleSelect
                  user={user}
                  onChangeRole={(newRole) => changeRole(user.id, newRole)}
                />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

function RoleSelect({
  user,
  onChangeRole,
}: {
  user: User
  onChangeRole: (newRole: 'animateur' | 'participant' | 'collaborateur') => void
}) {
  const [value, setValue] = useState(user.role as 'animateur' | 'participant' | 'collaborateur')

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as 'animateur' | 'participant' | 'collaborateur'
    const confirmed = window.confirm(
      `Changer le rôle de ${user.full_name} en "${newRole}" ?`
    )
    if (!confirmed) return
    setValue(newRole)
    onChangeRole(newRole)
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className="text-xs px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition"
    >
      <option value="participant">Participant</option>
      <option value="collaborateur">Collaborateur</option>
      <option value="animateur">Animateur</option>
    </select>
  )
}
