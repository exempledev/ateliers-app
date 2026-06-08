'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2, Mail, Phone, MapPin, Users, Plus, X, ChevronDown, ChevronUp, Trash2, ImagePlus, UserPlus, Search, Check, Loader2 } from 'lucide-react'

interface Entreprise {
  id: string
  name: string
  logo_url: string | null
  address: string | null
  contact_email: string | null
  contact_phone: string | null
  description: string | null
  created_at: string
}

interface Collaborateur {
  id: string
  full_name: string
  email: string
  phone?: string | null
  organisme?: string | null
}

interface Props {
  entreprises: Entreprise[]
  collaborateurs: Collaborateur[]
}

const emptyForm = { name: '', address: '', contact_email: '', contact_phone: '', description: '' }

const inputClass = 'w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition'

export default function EntreprisesContent({ entreprises, collaborateurs }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)

  // User search / add
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; full_name: string; email: string; role: string; organisme?: string | null }[]>([])
  const [searching, setSearching] = useState(false)
  const [addedIds, setAddedIds] = useState<string[]>([])

  function getEmployees(name: string) {
    return collaborateurs.filter(
      u => u.organisme?.trim().toLowerCase() === name.trim().toLowerCase()
    )
  }

  function set(field: keyof typeof emptyForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function resetForm() {
    setForm(emptyForm)
    setLogoFile(null)
    setLogoPreview('')
    setShowForm(false)
    setError('')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    let logo_url: string | null = null
    if (logoFile) {
      const ext = logoFile.name.split('.').pop() ?? 'png'
      const { data } = await supabase.storage
        .from('logos')
        .upload(`${Date.now()}.${ext}`, logoFile, { upsert: true })
      if (data) {
        const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.path)
        logo_url = urlData.publicUrl
      }
    }

    const { error: err } = await supabase.from('entreprises').insert({
      name: form.name.trim(),
      logo_url,
      address: form.address.trim() || null,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      description: form.description.trim() || null,
    })
    if (err) { setError(err.message); setLoading(false); return }
    resetForm()
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer l'entreprise "${name}" ?`)) return
    await supabase.from('entreprises').delete().eq('id', id)
    router.refresh()
  }

  function openSearch(companyId: string) {
    setAddingTo(companyId)
    setSearchQuery('')
    setSearchResults([])
    setAddedIds([])
  }

  function closeSearch() {
    setAddingTo(null)
    setSearchQuery('')
    setSearchResults([])
    setAddedIds([])
  }

  async function handleSearch(query: string, companyName: string) {
    setSearchQuery(query)
    if (query.trim().length < 1) { setSearchResults([]); return }
    setSearching(true)
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email, role, organisme')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10)
    const filtered = (data ?? []).filter(
      u => u.organisme?.trim().toLowerCase() !== companyName.trim().toLowerCase()
    )
    setSearchResults(filtered)
    setSearching(false)
  }

  async function addUserToCompany(userId: string, companyName: string) {
    await supabase
      .from('users')
      .update({ organisme: companyName, role: 'collaborateur' })
      .eq('id', userId)
    setAddedIds(ids => [...ids, userId])
    router.refresh()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Entreprises</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {entreprises.length} entreprise{entreprises.length !== 1 ? 's' : ''} partenaire{entreprises.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(''); setLogoFile(null); setLogoPreview('') }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nouvelle entreprise
        </button>
      </div>

      {/* Création modal */}
      {showForm && (
        <div
          className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={resetForm}
        >
          <div
            className="animate-slide-up bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            style={{ maxHeight: 'calc(100dvh - 2rem)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--foreground)]">Nouvelle entreprise</h2>
              <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors">
                <X className="w-4 h-4 text-[var(--muted)]" />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ overflowY: 'auto', maxHeight: 'calc(100dvh - 8rem)' }} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Nom <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={set('name')} placeholder="Acme Corp" required className={inputClass} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Logo <span className="text-xs text-[var(--muted)] font-normal">(optionnel)</span></label>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                >
                  {logoPreview
                    ? <img src={logoPreview} alt="Aperçu" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border)] flex items-center justify-center flex-shrink-0"><ImagePlus className="w-4 h-4 text-[var(--muted)]" /></div>
                  }
                  <span className="text-sm text-[var(--muted)]">{logoFile ? logoFile.name : 'Cliquer pour choisir un fichier'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Adresse</label>
                <input type="text" value={form.address} onChange={set('address')} placeholder="12 rue de la Paix, 75001 Paris" className={inputClass} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Description / Activité</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brève description de l'activité de l'entreprise..."
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--foreground)]">Email contact</label>
                  <input type="email" value={form.contact_email} onChange={set('contact_email')} placeholder="contact@acme.com" className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--foreground)]">Téléphone</label>
                  <input type="tel" value={form.contact_phone} onChange={set('contact_phone')} placeholder="+33 1 23 45 67 89" className={inputClass} />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:bg-[var(--background)] transition-colors">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste */}
      {entreprises.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[var(--border)] p-14 text-center">
          <Building2 className="w-8 h-8 text-[var(--muted)] mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-[var(--foreground)]">Aucune entreprise enregistrée</p>
          <p className="text-xs text-[var(--muted)] mt-1">Créez votre première entreprise partenaire</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {entreprises.map(e => {
            const employees = getEmployees(e.name)
            const isExpanded = expanded === e.id

            return (
              <div key={e.id} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">

                {/* Profil */}
                <div className="flex items-center gap-4 p-5">
                  {e.logo_url ? (
                    <img
                      src={e.logo_url}
                      alt={e.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-[var(--border)]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-bold text-[var(--primary)]">
                        {e.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--foreground)] truncate">{e.name}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      {e.address && (
                        <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {e.address}
                        </span>
                      )}
                      {e.contact_email && (
                        <a
                          href={`mailto:${e.contact_email}`}
                          className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                        >
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          {e.contact_email}
                        </a>
                      )}
                      {e.contact_phone && (
                        <a
                          href={`tel:${e.contact_phone}`}
                          className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                        >
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {e.contact_phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1.5 text-xs text-[var(--muted)] px-2.5 py-1 rounded-full bg-[var(--background)] border border-[var(--border)]">
                      <Users className="w-3.5 h-3.5" />
                      {employees.length} employé{employees.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : e.id)}
                      className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--muted)]"
                      title="Voir les employés"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(e.id, e.name)}
                      className="p-2 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Employés */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                        Collaborateurs inscrits
                      </p>
                      {addingTo !== e.id ? (
                        <button
                          onClick={() => openSearch(e.id)}
                          className="flex items-center gap-1.5 text-xs text-[var(--primary)] font-medium hover:opacity-80 transition-opacity"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Ajouter
                        </button>
                      ) : (
                        <button
                          onClick={closeSearch}
                          className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Fermer
                        </button>
                      )}
                    </div>

                    {/* Recherche */}
                    {addingTo === e.id && (
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={ev => handleSearch(ev.target.value, e.name)}
                            placeholder="Rechercher par nom ou email..."
                            autoFocus
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                          />
                          {searching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] animate-spin" />
                          )}
                        </div>

                        {searchResults.length > 0 && (
                          <div className="mt-2 rounded-xl border border-[var(--border)] overflow-hidden">
                            {searchResults.map(u => {
                              const alreadyAdded = addedIds.includes(u.id)
                              return (
                                <div
                                  key={u.id}
                                  className="flex items-center gap-3 px-3 py-2.5 border-b border-[var(--border)] last:border-0 bg-white"
                                >
                                  <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-bold text-[var(--primary)]">
                                      {u.full_name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{u.full_name}</p>
                                    <p className="text-xs text-[var(--muted)] truncate">{u.email}</p>
                                  </div>
                                  <button
                                    onClick={() => !alreadyAdded && addUserToCompany(u.id, e.name)}
                                    disabled={alreadyAdded}
                                    className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors flex-shrink-0 ${
                                      alreadyAdded
                                        ? 'bg-green-50 text-green-600 cursor-default'
                                        : 'bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white'
                                    }`}
                                  >
                                    {alreadyAdded
                                      ? <><Check className="w-3 h-3" /> Ajouté</>
                                      : <><UserPlus className="w-3 h-3" /> Ajouter</>}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {searchQuery.length >= 1 && !searching && searchResults.length === 0 && (
                          <p className="text-xs text-[var(--muted)] mt-2 text-center py-2">Aucun utilisateur trouvé.</p>
                        )}
                      </div>
                    )}

                    {employees.length === 0 ? (
                      <p className="text-sm text-[var(--muted)] py-2">
                        Aucun collaborateur inscrit sur la plateforme pour cette entreprise.
                      </p>
                    ) : (
                      <div className="flex flex-col divide-y divide-[var(--border)]">
                        {employees.map(u => (
                          <div key={u.id} className="flex items-center gap-3 py-2.5">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-green-700">
                                {u.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--foreground)] truncate">{u.full_name}</p>
                              <p className="text-xs text-[var(--muted)] truncate">{u.email}</p>
                            </div>
                            {u.phone && (
                              <a
                                href={`tel:${u.phone}`}
                                className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors flex-shrink-0"
                              >
                                <Phone className="w-3 h-3" />
                                {u.phone}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
