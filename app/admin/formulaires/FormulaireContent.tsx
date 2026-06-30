'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { UserCheck, Building2, Mail, Phone, MapPin, Globe, FileText, X, User, ChevronRight } from 'lucide-react'
import Card from '@/components/ui/Card'

interface Candidature {
  id: string
  type: 'animateur' | 'entreprise'
  nom: string
  email: string
  data: Record<string, string>
  created_at: string
}

type Tab = 'animateur' | 'entreprise'

export default function FormulaireContent({ candidatures }: { candidatures: Candidature[] }) {
  const [tab, setTab] = useState<Tab>('animateur')
  const [selected, setSelected] = useState<Candidature | null>(null)

  const animateurs = candidatures.filter(c => c.type === 'animateur')
  const entreprises = candidatures.filter(c => c.type === 'entreprise')
  const list = tab === 'animateur' ? animateurs : entreprises

  // Grouper par date
  const grouped = list.reduce<Record<string, Candidature[]>>((acc, c) => {
    const date = format(parseISO(c.created_at), 'EEEE d MMMM yyyy', { locale: fr })
    if (!acc[date]) acc[date] = []
    acc[date].push(c)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Formulaires</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{candidatures.length} formulaire{candidatures.length !== 1 ? 's' : ''} reçu{candidatures.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-white border border-[var(--border)] rounded-2xl p-1 w-fit mb-8">
        {([
          { key: 'animateur', label: `Devenir animateur (${animateurs.length})`, icon: UserCheck },
          { key: 'entreprise', label: `Entreprises partenaires (${entreprises.length})`, icon: Building2 },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Liste groupée par date */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
            {tab === 'animateur'
              ? <UserCheck className="w-7 h-7 text-[var(--primary)]" />
              : <Building2 className="w-7 h-7 text-[var(--primary)]" />}
          </div>
          <p className="font-semibold text-[var(--foreground)]">Aucun formulaire</p>
          <p className="text-sm text-[var(--muted)] mt-1">Les candidatures apparaîtront ici.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3 capitalize">{date}</p>
              <Card className="divide-y divide-[var(--border)] overflow-hidden">
                {items.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-[var(--background)] transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      c.type === 'animateur' ? 'bg-purple-50' : 'bg-orange-50'
                    }`}>
                      <span className={`text-base font-bold ${c.type === 'animateur' ? 'text-purple-500' : 'text-orange-500'}`}>
                        {c.nom.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--foreground)] truncate">{c.nom}</p>
                      <p className="text-xs text-[var(--muted)] truncate">{c.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-[var(--muted)]">
                        {format(parseISO(c.created_at), 'HH:mm')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
                    </div>
                  </button>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Modale détail */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-black/30 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selected.type === 'animateur' ? 'bg-purple-50' : 'bg-orange-50'}`}>
                  {selected.type === 'animateur'
                    ? <UserCheck className="w-4 h-4 text-purple-500" />
                    : <Building2 className="w-4 h-4 text-orange-500" />}
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{selected.nom}</p>
                  <p className="text-xs text-[var(--muted)] capitalize">
                    {format(parseISO(selected.created_at), "d MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
              <InfoLine icon={Mail} label="Email" value={selected.email} href={`mailto:${selected.email}`} />
              {selected.data.telephone && <InfoLine icon={Phone} label="Téléphone" value={selected.data.telephone} href={`tel:${selected.data.telephone}`} />}
              {selected.data.specialite && <InfoLine icon={UserCheck} label="Spécialité" value={selected.data.specialite} />}
              {selected.data.adresse && <InfoLine icon={MapPin} label="Adresse" value={selected.data.adresse} />}
              {selected.data.site_web && <InfoLine icon={Globe} label="Site web" value={selected.data.site_web} href={selected.data.site_web} />}
              {selected.data.motivation && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-[var(--muted)]" /><span className="text-xs font-medium text-[var(--muted)]">Motivation</span></div>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--background)] rounded-xl px-3 py-2.5">{selected.data.motivation}</p>
                </div>
              )}
              {selected.data.description && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-[var(--muted)]" /><span className="text-xs font-medium text-[var(--muted)]">Description</span></div>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--background)] rounded-xl px-3 py-2.5">{selected.data.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoLine({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-[var(--muted)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[var(--muted)]">{label}</p>
        {href ? (
          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm text-[var(--primary)] hover:underline truncate block">{value}</a>
        ) : (
          <p className="text-sm text-[var(--foreground)] truncate">{value}</p>
        )}
      </div>
    </div>
  )
}
