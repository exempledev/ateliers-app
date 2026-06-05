'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Tag, Trash2, Send, ImagePlus } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Post {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
  author_id: string
  users: { full_name: string } | null
}

interface Props {
  posts: Post[]
  role: string | null
  userId: string | null
}

export default function BonPlansContent({ posts, role, userId }: Props) {
  const canPost = role === 'admin' || role === 'animateur'
  const canDelete = (authorId: string) =>
    role === 'admin' || (canPost && userId === authorId)

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function resetForm() {
    setTitle('')
    setContent('')
    removeImage()
    setError('')
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    let image_url: string | null = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('bon-plans')
        .upload(path, imageFile, { upsert: true })

      if (uploadError) {
        setError("Erreur lors de l'upload de l'image : " + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('bon-plans').getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const { error } = await supabase.from('bon_plans').insert({ title, content, image_url, author_id: userId })

    if (error) {
      setError(error.message)
    } else {
      resetForm()
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete(id: string, imageUrl: string | null) {
    if (imageUrl) {
      const path = imageUrl.split('/bon-plans/')[1]
      if (path) await supabase.storage.from('bon-plans').remove([path])
    }
    await supabase.from('bon_plans').delete().eq('id', id)
    router.refresh()
  }

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition'

  return (
    <div>
      {canPost && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ajouter un bon plan
        </button>
      )}

      {showForm && (
        <div className="mb-6 bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
            <span className="text-sm font-semibold text-[var(--foreground)]">Nouveau bon plan</span>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Titre du bon plan"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className={inputClass}
            />
            <textarea
              placeholder="Décrivez le bon plan, l'offre, la réduction..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={4}
              className={inputClass + ' resize-none'}
            />

            {/* Image picker */}
            <div>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[var(--border)]">
                  <img src={imagePreview} alt="Aperçu" className="w-full max-h-56 object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--border)] text-sm text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  <ImagePlus className="w-4 h-4" />
                  Ajouter une image
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:bg-[var(--background)] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Send className="w-3.5 h-3.5" /> Publier</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
            <Tag className="w-7 h-7 text-[var(--primary)]" />
          </div>
          <p className="text-[var(--foreground)] font-semibold">Aucun bon plan disponible</p>
          <p className="text-sm text-[var(--muted)] mt-1">Des offres exclusives seront publiées prochainement.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="h-1 bg-[var(--primary)]" />

              {post.image_url && (
                <div className="relative w-full h-48">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[var(--primary)]">
                        {post.users?.full_name.charAt(0).toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--foreground)]">{post.users?.full_name ?? 'Inconnu'}</p>
                      <p className="text-[10px] text-[var(--muted)]">
                        {formatDistanceToNow(parseISO(post.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>

                  {canDelete(post.author_id) && (
                    <button
                      onClick={() => handleDelete(post.id, post.image_url)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-[var(--foreground)] mb-1.5">{post.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
