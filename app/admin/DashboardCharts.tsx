'use client'

import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { Users, UserCog, CalendarDays, BookCheck, TrendingUp, Building2, BarChart2, Activity } from 'lucide-react'

const C = {
  primary: '#6366f1',
  travail: '#3b82f6',
  detente: '#10b981',
  accent: '#f59e0b',
  muted: '#94a3b8',
  border: '#e2e8f0',
}

interface Props {
  stats: {
    totalParticipants: number
    totalAnimateurs: number
    totalAteliers: number
    totalReservations: number
  }
  activityByDay: { date: string; connexions: number; inscriptions: number }[]
  usersByOrganisme: { organisme: string; count: number }[]
  participationByOrganisme: { organisme: string; taux: number }[]
  atelierFillRates: { title: string; fillRate: number; spotsTaken: number; max: number; theme: string }[]
  themeDistribution: { name: string; value: number; color: string }[]
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-[var(--primary)]" />
      </div>
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)]">{title}</h2>
        {subtitle && <p className="text-xs text-[var(--muted)]">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function DashboardCharts({
  stats,
  activityByDay,
  usersByOrganisme,
  participationByOrganisme,
  atelierFillRates,
  themeDistribution,
}: Props) {
  const kpis = [
    { label: 'Participants', value: stats.totalParticipants, icon: Users, color: C.primary, bg: '#eef2ff' },
    { label: 'Animateurs', value: stats.totalAnimateurs, icon: UserCog, color: C.accent, bg: '#fef3c7' },
    { label: 'Ateliers créés', value: stats.totalAteliers, icon: CalendarDays, color: C.travail, bg: '#eff6ff' },
    { label: 'Réservations', value: stats.totalReservations, icon: BookCheck, color: C.detente, bg: '#ecfdf5' },
  ]

  const totalTheme = themeDistribution.reduce((s, t) => s + t.value, 0)

  return (
    <div className="flex flex-col gap-8">

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-[var(--border)] p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
              <p className="text-sm text-[var(--muted)] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activité + Thèmes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area chart: connexions + inscriptions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--border)] p-6">
          <SectionTitle icon={Activity} title="Activité — 30 derniers jours" subtitle="Connexions et nouvelles inscriptions" />
          {activityByDay.every(d => d.connexions === 0 && d.inscriptions === 0) ? (
            <div className="flex items-center justify-center h-52 text-sm text-[var(--muted)]">Aucune donnée sur cette période</div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={activityByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gConn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.primary} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gInsc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.detente} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.detente} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="connexions" name="Connexions" stroke={C.primary} fill="url(#gConn)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="inscriptions" name="Inscriptions" stroke={C.detente} fill="url(#gInsc)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut: thèmes */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
          <SectionTitle icon={BarChart2} title="Répartition des thèmes" />
          {totalTheme === 0 ? (
            <div className="flex items-center justify-center h-52 text-sm text-[var(--muted)]">Aucun atelier</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={themeDistribution}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {themeDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12 }}
                    formatter={(value) => { const v = Number(value); return [`${v} atelier${v > 1 ? 's' : ''}`, ''] }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-2">
                {themeDistribution.map(t => (
                  <div key={t.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                      <span className="text-[var(--muted)]">{t.name}</span>
                    </div>
                    <span className="font-semibold text-[var(--foreground)]">
                      {t.value} <span className="text-xs font-normal text-[var(--muted)]">({Math.round((t.value / totalTheme) * 100)}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Participants par entreprise */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
        <SectionTitle icon={Building2} title="Participants par entreprise" subtitle="Nombre d'inscrits par organisation" />
        {usersByOrganisme.length === 0 ? (
          <div className="flex items-center justify-center h-52 text-sm text-[var(--muted)]">Aucune donnée d'entreprise renseignée</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, usersByOrganisme.length * 44)}>
            <BarChart data={usersByOrganisme} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis dataKey="organisme" type="category" tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} width={120} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12 }}
                formatter={(value) => { const v = Number(value); return [`${v} participant${v > 1 ? 's' : ''}`, 'Effectif'] }}
              />
              <Bar dataKey="count" name="Participants" fill={C.primary} radius={[0, 6, 6, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Taux de participation + Taux remplissage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Taux participation par entreprise */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
          <SectionTitle icon={TrendingUp} title="Taux de participation" subtitle="% de participants ayant réservé un atelier" />
          {participationByOrganisme.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-sm text-[var(--muted)]">Aucune réservation pour le moment</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, participationByOrganisme.length * 44)}>
              <BarChart data={participationByOrganisme} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} unit="%" />
                <YAxis dataKey="organisme" type="category" tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} width={120} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12 }}
                  formatter={(value) => [`${Number(value)} %`, 'Taux']}
                />
                <Bar dataKey="taux" name="Taux" fill={C.accent} radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Taux de remplissage par atelier */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6">
          <SectionTitle icon={CalendarDays} title="Taux de remplissage" subtitle="Places occupées par atelier (récents)" />
          {atelierFillRates.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-sm text-[var(--muted)]">Aucun atelier</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, atelierFillRates.length * 44)}>
              <BarChart data={atelierFillRates} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} unit="%" />
                <YAxis dataKey="title" type="category" tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} width={140} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12 }}
                  formatter={(value, _name, props) => {
                    const v = Number(value)
                    const p = props.payload as { spotsTaken?: number; max?: number } | undefined
                    return [`${v}% (${p?.spotsTaken ?? 0}/${p?.max ?? 0} places)`, 'Remplissage']
                  }}
                />
                <Bar dataKey="fillRate" name="Remplissage" radius={[0, 6, 6, 0]} barSize={24}>
                  {atelierFillRates.map((entry, i) => (
                    <Cell key={i} fill={entry.theme === 'travail' ? C.travail : C.detente} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  )
}
