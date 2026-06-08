'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, Save } from 'lucide-react'

interface Entreprise {
  id: string
  name: string
  logo_url: string | null
  banner_url: string | null
  address: string | null
  contact_email: string | null
  contact_phone: string | null
  description: string | null
}

interface Props {
  entreprise: Entreprise
}

const inputClass = 'w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition'

export default function CompanyEditor({ entreprise }: Props) {
  const supabase = createClient()

  const [description, setDescription] = useState(entreprise.description ?? '')
  const [address, setAddress]         = useState(entreprise.address ?? '')
  const [contactEmail, setContactEmail] = useState(entreprise.contact_email ?? '')
  const [contactPhone, setContactPhone] = useState(entreprise.contact_phone ?? '')

  const [logoPreview, setLogoPreview]     = useState<string | null>(entreprise.logo_url)
  const [bannerPreview, setBannerPreview] = useState<string | null>(entreprise.banner_url)
  const [logoFile, setLogoFile]           = useState<File | null>(null)
  const [bannerFile, setBannerFile]       = useState<File | null>(null)

  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const logoRef   = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function handleBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error || !data) return null
    return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)

    const ext = (f: File) => f.name.split('.').pop() ?? 'png'
    const updates: Record<string, string | null> = {
      description: description.trim() || null,
      address: address.trim() || null,
      contact_email: contactEmail.trim() || null,
      contact_phone: contactPhone.trim() || null,
    }

    if (logoFile) {
      const url = await uploadFile(logoFile, 'logos', `${entreprise.id}/logo.${ext(logoFile)}`)
      if (url) updates.logo_url = url
    }

    if (bannerFile) {
      const url = await uploadFile(bannerFile, 'banners', `${entreprise.id}/banner.${ext(bannerFile)}`)
      if (url) updates.banner_url = url
    }

    const { error: err } = await supabase.from('entreprises').update(updates).eq('id', entreprise.id)

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden mb-6">
      {/* Bannière */}
      <div
        className="relative h-32 bg-[var(--primary-light)] cursor-pointer group"
        onClick={() => bannerRef.current?.click()}
      >
        {bannerPreview && (
          <img src={bannerPreview} alt="Bannière" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
            <ImagePlus className="w-3.5 h-3.5" />
            {bannerPreview ? 'Changer la bannière' : 'Ajouter une bannière'}
          </div>
        </div>
        {bannerPreview && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setBannerPreview(null); setBannerFile(null) }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBanner} />
      </div>

      {/* Logo + nom */}
      <div className="px-5 pb-5">
        <div className="-mt-8 mb-4 flex items-end gap-3">
          <div
            className="relative cursor-pointer group flex-shrink-0"
            onClick={() => logoRef.current?.click()}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center border-4 border-white shadow-sm">
                <span className="text-xl font-bold text-white">
                  {entreprise.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
              <ImagePlus className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </div>
          <div>
            <p className="font-bold text-[var(--foreground)] text-lg">{entreprise.name}</p>
            <p className="text-xs text-[var(--muted)]">Cliquez sur le logo ou la bannière pour les modifier</p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Description / Activité</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez l'activité de votre entreprise..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Adresse</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="12 rue de la Paix, 75001 Paris"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Email contact</label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="contact@entreprise.com"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--foreground)]">Téléphone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+33 1 23 45 67 89"
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">Modifications enregistrées.</p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="self-end flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Save className="w-4 h-4" /> Enregistrer</>}
          </button>
        </div>
      </div>
    </div>
  )
}
