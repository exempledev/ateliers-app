'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera } from 'lucide-react'

interface Props {
  userId: string
  initialLetter: string
  currentAvatarUrl: string | null
}

export default function AvatarUpload({ userId, initialLetter, currentAvatarUrl }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)

    const preview = URL.createObjectURL(file)
    setAvatarUrl(preview)

    const ext = file.name.split('.').pop() ?? 'png'
    const { data } = await supabase.storage
      .from('avatars')
      .upload(`${userId}/avatar.${ext}`, file, { upsert: true })

    if (data) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path)
      await supabase.from('users').update({ avatar_url: urlData.publicUrl }).eq('id', userId)
      setAvatarUrl(urlData.publicUrl)
    } else {
      setAvatarUrl(currentAvatarUrl)
    }
    setLoading(false)
  }

  return (
    <div
      className="relative w-12 h-12 rounded-2xl flex-shrink-0 cursor-pointer group"
      onClick={() => inputRef.current?.click()}
      title="Changer la photo de profil"
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover" />
      ) : (
        <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center">
          <span className="text-lg font-bold text-[var(--primary)]">{initialLetter}</span>
        </div>
      )}
      <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {loading
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <Camera className="w-4 h-4 text-white" />}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
