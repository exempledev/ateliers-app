'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, ChevronDown, ChevronUp, UserCheck, Building2 } from 'lucide-react'

const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition'

type Form = 'animateur' | 'entreprise' | null

export default function ProutContent() {
  const [openForm, setOpenForm] = useState<Form>(null)

  function toggle(form: Form) {
    setOpenForm(prev => prev === form ? null : form)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Formulaire Entreprise */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <button
          onClick={() => toggle('entreprise')}
          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[var(--background)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--foreground)]">Ajouter mon entreprise</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Inscrivez votre entreprise comme partenaire</p>
            </div>
          </div>
          {openForm === 'entreprise'
            ? <ChevronUp className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />}
        </button>
        {openForm === 'entreprise' && (
          <div className="border-t border-[var(--border)] px-6 pb-6 pt-5">
            <EntrepriseForm />
          </div>
        )}
      </div>

      {/* Formulaire Animateur */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <button
          onClick={() => toggle('animateur')}
          className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[var(--background)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--forezzground)]">Devenir animateur d'ateliers</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Proposez vos compétences et animez des ateliers</p>
            </div>
          </div>
          {openForm === 'animateur'
            ? <ChevronUp className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />}
        </button>
        {openForm === 'animateur' && (
          <div className="border-t border-[var(--border)] px-6 pb-6 pt-5">
            <AnimateurForm />
          </div>
        )}
      </div>
    </div>
  )
}

function AnimateurForm() {
  const supabase = createClient()
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', specialite: '', motivation: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('candidatures').insert({
      type: 'animateur',
      nom: form.nom,
      email: form.email,
      data: { telephone: form.telephone, specialite: form.specialite, motivation: form.motivation },
    })

    if (err) { setError('Une erreur est survenue.'); setLoading(false); return }

    await supabase.from('notifications').insert({
      type: 'candidature_animateur',
      title: 'Candidature animateur',
      message: `${form.nom} souhaite devenir animateur d'ateliers.`,
      metadata: {
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        specialite: form.specialite,
        motivation: form.motivation,
      },
    })

    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
        <CheckCircle2 className="w-6 h-6 text-green-500" />
      </div>
      <p className="font-semibold text-[var(--foreground)]">Candidature envoyée !</p>
      <p className="text-sm text-[var(--muted)]">Nous reviendrons vers vous rapidement.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">Nom complet <span className="text-red-400">*</span></label>
          <input type="text" value={form.nom} onChange={set('nom')} placeholder="Jean Dupont" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">Email <span className="text-red-400">*</span></label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="jean@exemple.com" required className={inputClass} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">Téléphone <span className="text-xs text-[var(--muted)] font-normal">(optionnel)</span></label>
        <input type="tel" value={form.telephone} onChange={set('telephone')} placeholder="+33 6 12 34 56 78" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">Spécialité / Domaine d'expertise <span className="text-red-400">*</span></label>
        <input type="text" value={form.specialite} onChange={set('specialite')} placeholder="Yoga, gestion du stress, communication..." required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">Motivation <span className="text-red-400">*</span></label>
        <textarea value={form.motivation} onChange={set('motivation')} placeholder="Pourquoi souhaitez-vous animer des ateliers ?" rows={4} required className={`${inputClass} resize-none`} />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
      <button type="submit" disabled={loading} className="py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Envoyer ma candidature'}
      </button>
    </form>
  )
}

function EntrepriseForm() {
  const supabase = createClient()
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', adresse: '', site_web: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('candidatures').insert({
      type: 'entreprise',
      nom: form.nom,
      email: form.email,
      data: { telephone: form.telephone, adresse: form.adresse, site_web: form.site_web, description: form.description },
    })

    if (err) { setError('Une erreur est survenue.'); setLoading(false); return }

    await supabase.from('notifications').insert({
      type: 'candidature_entreprise',
      title: 'Demande entreprise partenaire',
      message: `${form.nom} souhaite rejoindre les entreprises partenaires.`,
      metadata: {
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        adresse: form.adresse,
        site_web: form.site_web,
        description: form.description,
      },
    })

    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
        <CheckCircle2 className="w-6 h-6 text-green-500" />
      </div>
      <p className="font-semibold text-[var(--foreground)]">Demande envoyée !</p>
      <p className="text-sm text-[var(--muted)]">Nous examinerons votre demande et vous contacterons.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">Nom de l'entreprise <span className="text-red-400">*</span></label>
          <input type="text" value={form.nom} onChange={set('nom')} placeholder="Acme Corp" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">Email de contact <span className="text-red-400">*</span></label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="contact@entreprise.com" required className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">Téléphone <span className="text-xs text-[var(--muted)] font-normal">(optionnel)</span></label>
          <input type="tel" value={form.telephone} onChange={set('telephone')} placeholder="+33 1 23 45 67 89" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">Site web <span className="text-xs text-[var(--muted)] font-normal">(optionnel)</span></label>
          <input type="text" value={form.site_web} onChange={set('site_web')} placeholder="www.entreprise.com" className={inputClass} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">Adresse <span className="text-xs text-[var(--muted)] font-normal">(optionnel)</span></label>
        <input type="text" value={form.adresse} onChange={set('adresse')} placeholder="12 rue de la Paix, 75001 Paris" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">Description de l'entreprise <span className="text-red-400">*</span></label>
        <textarea value={form.description} onChange={set('description')} placeholder="Décrivez votre activité..." rows={4} required className={`${inputClass} resize-none`} />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
      <button type="submit" disabled={loading} className="py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Envoyer ma demande'}
      </button>
    </form>
  )
}
