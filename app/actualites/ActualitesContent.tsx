'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Pencil, Trash2, Newspaper, ImagePlus } from 'lucide-react'
import ImageLightbox from '@/components/ui/ImageLightbox'

interface Post {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
  updated_at: string
  users?: { full_name: string } | null
}

interface Props {
  posts: Post[]
  isAdmin: boolean
}

const emptyForm = { title: '', content: '' }

const inputClass = 'w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function ActualitesContent({ posts, isAdmin }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setCurrentImageUrl(null)
    setImageFile(null)
    setImagePreview(null)
    setError('')
    setShowForm(true)
  }

  function openEdit(post: Post) {
    setForm({ title: post.title, content: post.content })
    setEditingId(post.id)
    setCurrentImageUrl(post.image_url)
    setImageFile(null)
    setImagePreview(post.image_url)
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setCurrentImageUrl(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setError('')
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    setCurrentImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    let image_url: string | null = currentImageUrl

    if (imageFile) {
      const ext = imageFile.name.split('.').pop() ?? 'jpg'
      const path = `${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('actualites')
        .upload(path, imageFile, { upsert: true })
      if (uploadError) { setError(uploadError.message); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('actualites').getPublicUrl(uploadData.path)
      image_url = urlData.publicUrl
    }

    if (editingId) {
      const { error: err } = await supabase
        .from('actualites')
        .update({ title: form.title.trim(), content: form.content.trim(), image_url, updated_at: new Date().toISOString() })
        .eq('id', editingId)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { error: err } = await supabase
        .from('actualites')
        .insert({ title: form.title.trim(), content: form.content.trim(), image_url, author_id: user?.id ?? null })
      if (err) { setError(err.message); setLoading(false); return }
    }

    setLoading(false)
    closeForm()
    router.refresh()
  }

  async function handleDelete(post: Post) {
    if (!confirm(`Supprimer "${post.title}" ?`)) return
    if (post.image_url) {
      const path = post.image_url.split('/actualites/')[1]
      if (path) await supabase.storage.from('actualites').remove([path])
    }
    await supabase.from('actualites').delete().eq('id', post.id)
    router.refresh()
  }

  return (
    <div>
      {isAdmin && !showForm && (
        <button
          onClick={openCreate}
          className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nouveau post
        </button>
      )}

      {/* Modal création / édition */}
      {showForm && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={closeForm}
        >
          <div
            className="animate-slide-up bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--foreground)]">
                {editingId ? 'Modifier le post' : 'Nouveau post'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors"
              >
                <X className="w-4 h-4 text-[var(--muted)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Titre de l'actualité"
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Contenu <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Rédigez votre actualité..."
                  required
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Image <span className="text-xs text-[var(--muted)] font-normal">(optionnelle)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[var(--border)]">
                    <img src={imagePreview} alt="Aperçu" className="w-full h-44 object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                      <ImagePlus className="w-4 h-4 text-[var(--muted)]" />
                    </div>
                    <span className="text-sm text-[var(--muted)]">Cliquer pour choisir une image</span>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:bg-[var(--background)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : editingId ? 'Enregistrer' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      {/* Liste des posts */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
            <Newspaper className="w-7 h-7 text-[var(--primary)]" />
          </div>
          <p className="text-[var(--foreground)] font-semibold">Aucune actualité pour le moment</p>
          <p className="text-sm text-[var(--muted)] mt-1">Revenez bientôt pour découvrir les dernières nouvelles.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {posts.map(post => (
            <article
              key={post.id}
              className="animate-fade-in bg-white rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow"
            >
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  onClick={() => setLightboxSrc(post.image_url)}
                  className="w-full h-52 object-cover cursor-zoom-in"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-[var(--foreground)] leading-snug">{post.title}</h2>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {post.users?.full_name && <span>{post.users.full_name} · </span>}
                      {formatDate(post.created_at)}
                      {post.updated_at !== post.created_at && ' (modifié)'}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(post)}
                        className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--primary)] transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        className="p-2 rounded-lg text-[var(--muted)] hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
