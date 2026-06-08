'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Tag, Trash2, Send, ImagePlus, User, Pencil } from 'lucide-react'
import ImageLightbox from '@/components/ui/ImageLightbox'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface PostUser {
  full_name: string
  avatar_url?: string | null
  role?: string | null
  organisme?: string | null
}

interface Post {
  id: string
  title: string
  content: string
  image_url: string | null
  anonymous: boolean
  created_at: string
  author_id: string
  users: PostUser | null
}

interface Props {
  posts: Post[]
  role: string | null
  userId: string | null
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  animateur: 'Animateur',
  collaborateur: 'Collaborateur',
  participant: 'Inscrit',
}

export default function BonPlansContent({ posts, role, userId }: Props) {
  const canPost = role === 'admin' || role === 'animateur'
  const canEdit  = (authorId: string) => role === 'admin' || (canPost && userId === authorId)
  const canDelete = (authorId: string) => role === 'admin' || (canPost && userId === authorId)

  const [showForm, setShowForm]         = useState(false)
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [title, setTitle]               = useState('')
  const [content, setContent]           = useState('')
  const [anonymous, setAnonymous]       = useState(false)
  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [profilePost, setProfilePost]   = useState<Post | null>(null)
  const [lightboxSrc, setLightboxSrc]   = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  function openCreate() {
    setEditingId(null)
    setExistingImageUrl(null)
    setTitle('')
    setContent('')
    setAnonymous(false)
    setImageFile(null)
    setImagePreview(null)
    setError('')
    setShowForm(true)
  }

  function openEdit(post: Post) {
    setEditingId(post.id)
    setExistingImageUrl(post.image_url)
    setTitle(post.title)
    setContent(post.content)
    setAnonymous(post.anonymous)
    setImageFile(null)
    setImagePreview(post.image_url)
    setError('')
    setShowForm(true)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setExistingImageUrl(null)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    setExistingImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function resetForm() {
    setEditingId(null)
    setExistingImageUrl(null)
    setTitle('')
    setContent('')
    setAnonymous(false)
    setImageFile(null)
    setImagePreview(null)
    setError('')
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Resolve image URL
    let image_url: string | null = existingImageUrl

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

    if (editingId) {
      const { error: err } = await supabase
        .from('bon_plans')
        .update({ title, content, image_url, anonymous })
        .eq('id', editingId)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase
        .from('bon_plans')
        .insert({ title, content, image_url, author_id: userId, anonymous })
      if (err) { setError(err.message); setLoading(false); return }
    }

    resetForm()
    router.refresh()
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
          onClick={openCreate}
          className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ajouter un bon plan
        </button>
      )}

      {showForm && (
        <div className="mb-6 bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {editingId ? 'Modifier le bon plan' : 'Nouveau bon plan'}
            </span>
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

            {/* Anonymat */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={e => setAnonymous(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--primary)] cursor-pointer"
              />
              <span className="text-sm text-[var(--foreground)]">Publier anonymement</span>
            </label>

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
                  : editingId
                    ? <><Pencil className="w-3.5 h-3.5" /> Enregistrer</>
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
          {posts.map(post => {
            const isAnon = post.anonymous
            const author = post.users

            return (
              <div key={post.id} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="h-1 bg-[var(--primary)]" />

                {post.image_url && (
                  <div
                    className="relative w-full h-48 cursor-zoom-in"
                    onClick={() => setLightboxSrc(post.image_url)}
                  >
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      {isAnon ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-[var(--muted)]" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[var(--muted)] italic">Anonyme</p>
                            <p className="text-[10px] text-[var(--muted)]">
                              {formatDistanceToNow(parseISO(post.created_at), { addSuffix: true, locale: fr })}
                            </p>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => setProfilePost(post)}
                          className="flex items-center gap-2.5 group"
                        >
                          {author?.avatar_url ? (
                            <img src={author.avatar_url} alt={author.full_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[var(--border)]" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-[var(--primary)]">
                                {author?.full_name.charAt(0).toUpperCase() ?? '?'}
                              </span>
                            </div>
                          )}
                          <div className="text-left">
                            <p className="text-xs font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] group-hover:underline transition-colors">
                              {author?.full_name ?? 'Inconnu'}
                            </p>
                            <p className="text-[10px] text-[var(--muted)]">
                              {formatDistanceToNow(parseISO(post.created_at), { addSuffix: true, locale: fr })}
                            </p>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {canEdit(post.author_id) && (
                        <button
                          onClick={() => openEdit(post)}
                          className="p-1.5 rounded-lg hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete(post.author_id) && (
                        <button
                          onClick={() => handleDelete(post.id, post.image_url)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-[var(--foreground)] mb-1.5">{post.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      {/* Modale profil */}
      {profilePost && !profilePost.anonymous && profilePost.users && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setProfilePost(null)}
        >
          <div
            className="animate-slide-up bg-white rounded-2xl shadow-xl w-full max-w-xs overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setProfilePost(null)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors"
            >
              <X className="w-4 h-4 text-[var(--muted)]" />
            </button>

            <div className="bg-[var(--primary-light)] h-16" />
            <div className="px-5 pb-5">
              <div className="-mt-8 mb-3">
                {profilePost.users.avatar_url ? (
                  <img
                    src={profilePost.users.avatar_url}
                    alt={profilePost.users.full_name}
                    className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center border-4 border-white shadow-sm">
                    <span className="text-xl font-bold text-white">
                      {profilePost.users.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <p className="font-bold text-[var(--foreground)] text-lg leading-tight">{profilePost.users.full_name}</p>
              {profilePost.users.role && (
                <p className="text-xs text-[var(--primary)] font-medium mt-0.5">
                  {ROLE_LABELS[profilePost.users.role] ?? profilePost.users.role}
                </p>
              )}
              {profilePost.users.organisme && (
                <p className="text-xs text-[var(--muted)] mt-2">{profilePost.users.organisme}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
