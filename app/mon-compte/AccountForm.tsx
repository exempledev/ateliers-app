'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Check, X, CheckCircle2 } from 'lucide-react'

interface Props {
  currentEmail: string
  currentName: string
  currentPhone: string | null
  currentBio: string | null
  currentOrganisme?: string | null
  role?: string
  entreprises?: { id: string; name: string }[]
  userId: string
}

export default function AccountForm({ currentEmail, currentName, currentPhone, currentBio, currentOrganisme, role, entreprises = [], userId }: Props) {
  const [editingField, setEditingField] = useState<'name' | 'email' | 'phone' | null>(null)
  const [name, setName] = useState(currentName)
  const [email, setEmail] = useState(currentEmail)
  const [phone, setPhone] = useState(currentPhone ?? '')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const [bio, setBio] = useState(currentBio ?? '')
  const [editingBio, setEditingBio] = useState(false)
  const [bioDraft, setBioDraft] = useState('')
  const [bioLoading, setBioLoading] = useState(false)

  const [organisme, setOrganisme] = useState(currentOrganisme ?? '')
  const [editingOrganisme, setEditingOrganisme] = useState(false)
  const [organismeDraft, setOrganismeDraft] = useState('')
  const [organismeLoading, setOrganismeLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const matchedCompany = entreprises.find(
    c => c.name.trim().toLowerCase() === organismeDraft.trim().toLowerCase()
  ) ?? null

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function handleOrganismeChange(value: string) {
    setOrganismeDraft(value)
    if (value.trim().length >= 2) {
      const filtered = entreprises.filter(c => c.name.toLowerCase().includes(value.trim().toLowerCase()))
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  async function saveOrganisme() {
    setOrganismeLoading(true)
    const { error } = await supabase.from('users').update({ organisme: organismeDraft.trim() || null }).eq('id', userId)
    if (!error) {
      setOrganisme(organismeDraft.trim())
      setEditingOrganisme(false)
      router.refresh()
    }
    setOrganismeLoading(false)
  }

  const supabase = createClient()

  function startEdit(field: 'name' | 'email' | 'phone') {
    setEditingField(field)
    setMessage(null)
    setDraft(field === 'name' ? name : field === 'email' ? email : phone)
  }

  function cancelEdit() {
    setEditingField(null)
    setMessage(null)
  }

  async function saveField() {
    if (editingField === 'email') {
      if (draft === email) { cancelEdit(); return }
      setLoading(true)
      const { error } = await supabase.auth.updateUser({ email: draft })
      if (error) {
        setMessage({ text: error.message, ok: false })
      } else {
        setMessage({ text: 'Un lien de confirmation a été envoyé à votre nouvelle adresse.', ok: true })
        setEditingField(null)
      }
      setLoading(false)
      return
    }

    const field = editingField
    const current = field === 'name' ? name : phone
    if (draft === current) { cancelEdit(); return }

    setLoading(true)
    const update = field === 'name' ? { full_name: draft } : { phone: draft }
    const { error } = await supabase.from('users').update(update).eq('id', userId)
    if (error) {
      setMessage({ text: error.message, ok: false })
    } else {
      if (field === 'name') setName(draft)
      else setPhone(draft)
      setMessage({ text: 'Modification enregistrée.', ok: true })
      setEditingField(null)
    }
    setLoading(false)
  }

  async function saveBio() {
    setBioLoading(true)
    const { error } = await supabase.from('users').update({ bio: bioDraft.trim() || null }).eq('id', userId)
    if (!error) { setBio(bioDraft.trim()); setEditingBio(false) }
    setBioLoading(false)
  }

  const inputClass = 'flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition'

  function FieldRow({ label, field, value, type = 'text' }: {
    label: string
    field: 'name' | 'email' | 'phone'
    value: string
    type?: string
  }) {
    const isEditing = editingField === field
    const isLast = field === 'phone'
    return (
      <div className={`flex items-center justify-between py-2.5 ${!isLast ? 'border-b border-[var(--border)]' : ''}`}>
        <span className="text-sm text-[var(--muted)] w-20 flex-shrink-0">{label}</span>
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type={type}
              className={inputClass}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') saveField(); if (e.key === 'Escape') cancelEdit() }}
            />
            <button
              onClick={saveField}
              disabled={loading}
              className="p-1.5 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading
                ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                : <Check className="w-3.5 h-3.5" />}
            </button>
            <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {value || <span className="text-[var(--muted)] italic text-xs">Non renseigné</span>}
            </span>
            <button
              onClick={() => startEdit(field)}
              className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-6 border-t border-[var(--border)] pt-5 flex flex-col gap-5">
      {/* Bio */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-[var(--foreground)] text-sm">Bio</h2>
          {!editingBio && (
            <button
              onClick={() => { setEditingBio(true); setBioDraft(bio) }}
              className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {editingBio ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={bioDraft}
              onChange={e => setBioDraft(e.target.value)}
              placeholder="Parlez de vous en quelques mots..."
              rows={3}
              autoFocus
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingBio(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--muted)] hover:bg-[var(--background)] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveBio}
                disabled={bioLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {bioLoading
                  ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Check className="w-3.5 h-3.5" /> Enregistrer</>}
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-sm leading-relaxed ${bio ? 'text-[var(--foreground)]' : 'text-[var(--muted)] italic'}`}>
            {bio || 'Aucune bio renseignée.'}
          </p>
        )}
      </div>

      {/* Entreprise (admin uniquement) */}
      {role === 'admin' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-[var(--foreground)] text-sm">Entreprise</h2>
            {!editingOrganisme && (
              <button
                onClick={() => { setEditingOrganisme(true); setOrganismeDraft(organisme) }}
                className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {editingOrganisme ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--muted)] -mt-1">Êtes-vous employé d'une entreprise partenaire ?</p>
              <div className="relative" ref={suggestionsRef}>
                <input
                  type="text"
                  value={organismeDraft}
                  onChange={e => handleOrganismeChange(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                  placeholder="Nom de l'entreprise partenaire"
                  autoFocus
                  autoComplete="off"
                  className={`w-full px-3 py-2 rounded-xl border text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition ${matchedCompany ? 'border-green-400 ring-2 ring-green-200' : 'border-[var(--border)]'}`}
                />
                {showSuggestions && (
                  <div className="animate-scale-in absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[var(--border)] shadow-lg overflow-hidden z-20">
                    {suggestions.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setOrganismeDraft(c.name); setSuggestions([]); setShowSuggestions(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--background)] transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-[var(--primary)]">{c.name.charAt(0).toUpperCase()}</span>
                        </div>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {matchedCompany && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Entreprise partenaire reconnue
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingOrganisme(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--muted)] hover:bg-[var(--background)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={saveOrganisme}
                  disabled={organismeLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {organismeLoading
                    ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Check className="w-3.5 h-3.5" /> Enregistrer</>}
                </button>
              </div>
            </div>
          ) : (
            <p className={`text-sm leading-relaxed ${organisme ? 'text-[var(--foreground)]' : 'text-[var(--muted)] italic'}`}>
              {organisme || 'Aucune entreprise renseignée.'}
            </p>
          )}
        </div>
      )}

      {/* Informations du compte */}
      <div>
        <h2 className="font-semibold text-[var(--foreground)] text-sm mb-4">Informations du compte</h2>
        <div className="flex flex-col gap-1">
          <FieldRow label="Nom" field="name" value={name} />
          <FieldRow label="Email" field="email" value={email} type="email" />
          <FieldRow label="Téléphone" field="phone" value={phone} type="tel" />
        </div>
        {message && (
          <p className={`text-xs px-3 py-2 rounded-xl mt-3 ${message.ok ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}
