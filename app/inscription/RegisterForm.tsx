'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function RegisterForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [organisme, setOrganisme] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const isCollaborateur = organisme.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const role = isCollaborateur ? 'collaborateur' : 'participant'
    const digits = phone.trim().replace(/^0/, '')
    const fullPhone = digits ? `+33${digits}` : null

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone: fullPhone,
          organisme: organisme.trim() || null,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.session && data.user) {
      await supabase.from('users').update({
        phone: fullPhone,
        organisme: organisme.trim() || null,
        role,
      }).eq('id', data.user.id)
      window.location.href = '/planning'
      return
    }

    setError('Vérifiez votre boîte mail pour confirmer votre compte.')
    setLoading(false)
  }

  const inputClass = 'w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">Nom complet</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Jean Dupont"
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">
          Téléphone <span className="text-[var(--muted)] font-normal">(optionnel)</span>
        </label>
        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:border-transparent transition">
          <span className="flex items-center px-3 bg-[var(--border)] text-sm text-[var(--muted)] border-r border-[var(--border)] select-none whitespace-nowrap">
            +33
          </span>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="6 12 34 56 78"
            className="flex-1 px-3 py-2 text-sm bg-[var(--background)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">
          Employé au sein d'une entreprise partenaire ?
        </label>
        <p className="text-xs text-[var(--muted)] -mt-0.5">
          Si oui, indiquez-la ci-dessous :
        </p>
        <input
          type="text"
          value={organisme}
          onChange={e => setOrganisme(e.target.value)}
          placeholder="Nom de l'entreprise partenaire"
          className={inputClass}
        />
        {isCollaborateur && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-medium">
            <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] flex-shrink-0">✓</span>
            Rôle Collaborateur attribué — accès gratuit aux ateliers
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--foreground)]">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          minLength={8}
          required
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button type="submit" loading={loading} className="w-full mt-1">
        Créer mon compte
      </Button>
    </form>
  )
}
