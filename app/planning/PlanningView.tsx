'use client'

import { useState } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, parseISO, isSameWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AtelierCard from './AtelierCard'
import type { Atelier } from '@/types'

interface Props {
  ateliers: Atelier[]
  userReservations: string[]
  isLoggedIn: boolean
  userRole: string | null
  userId: string | null
  paypalClientId: string
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function PlanningView({ ateliers, userReservations, isLoggedIn, userRole, userId, paypalClientId }: Props) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const isCurrentWeek = isSameWeek(currentWeek, new Date(), { weekStartsOn: 1 })

  const getAteliersForDay = (day: Date) =>
    ateliers.filter(a => isSameDay(parseISO(a.date), day))

  return (
    <div>
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-8 bg-white rounded-2xl border border-[var(--border)] px-5 py-4">
        <button
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--background)] transition-colors border border-[var(--border)]"
        >
          <ChevronLeft className="w-4 h-4 text-[var(--muted)]" />
        </button>

        <div className="text-center">
          <p className="text-lg font-bold text-[var(--foreground)] capitalize">
            {format(weekStart, 'MMMM yyyy', { locale: fr })}
          </p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {format(weekStart, 'd')} – {format(addDays(weekStart, 6), 'd MMMM', { locale: fr })}
            {isCurrentWeek && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-medium">
                Cette semaine
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--background)] transition-colors border border-[var(--border)]"
        >
          <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
        </button>
      </div>

      {/* Week grid — toujours affiché */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, i) => {
          const dayAteliers = getAteliersForDay(day)
          const todayDay = isToday(day)

          return (
            <div key={day.toISOString()} className="flex flex-col gap-2 min-w-0">
              {/* Day header */}
              <div className={`text-center py-3 px-2 rounded-2xl border ${
                todayDay
                  ? 'bg-[var(--primary)] border-[var(--primary)]'
                  : 'bg-white border-[var(--border)]'
              }`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${
                  todayDay ? 'text-white/80' : 'text-[var(--muted)]'
                }`}>
                  {DAY_NAMES[i]}
                </p>
                <p className={`text-xl font-bold mt-0.5 ${
                  todayDay ? 'text-white' : 'text-[var(--foreground)]'
                }`}>
                  {format(day, 'd')}
                </p>
                {dayAteliers.length > 0 && (
                  <p className={`text-xs mt-0.5 ${todayDay ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                    {dayAteliers.length} atelier{dayAteliers.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Ateliers or empty slot */}
              <div className="flex flex-col gap-2 flex-1">
                {dayAteliers.length === 0 ? (
                  <div className="flex-1 min-h-[260px] rounded-2xl border-2 border-dashed border-[var(--border)] flex items-center justify-center">
                    <span className="text-xs text-[var(--muted)] opacity-40">Aucun atelier</span>
                  </div>
                ) : (
                  dayAteliers.map(atelier => (
                    <AtelierCard
                      key={atelier.id}
                      atelier={atelier}
                      isReserved={userReservations.includes(atelier.id)}
                      isLoggedIn={isLoggedIn}
                      userRole={userRole}
                      canViewParticipants={true}
                      canEdit={userRole === 'admin'}
                      canDelete={
                        userRole === 'admin' ||
                        (userRole === 'animateur' && atelier.animateur_id === userId)
                      }
                      paypalClientId={paypalClientId}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center flex-wrap gap-6 mt-6 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--travail)]" />
          <span className="text-xs text-[var(--muted)]">Atelier Travail</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--detente)]" />
          <span className="text-xs text-[var(--muted)]">Atelier Détente</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--accent)]" />
          <span className="text-xs text-[var(--muted)]">Moins de 3 places</span>
        </div>
        {!isLoggedIn && (
          <div className="w-full text-center mt-1">
            <a href="/connexion" className="text-xs text-[var(--primary)] font-medium hover:underline">Connectez-vous</a>
            <span className="text-xs text-[var(--muted)]"> pour réserver</span>
          </div>
        )}
      </div>
    </div>
  )
}
