import { useEffect, useState } from 'react'
import { apiRequest } from '../../services/api'
import ImageCropEditor from '../../components/ImageCropEditor'

const initialForm = {
  title: '',
  image_path: '',
  publication_date: '',
  article_url: '',
}

function AdminMediaCoverage() {
  const [mediaItems, setMediaItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [cropSource, setCropSource] = useState('')
  const [isCropOpen, setIsCropOpen] = useState(false)
  const [pendingOriginalFile, setPendingOriginalFile] = useState(null)
  const [pendingCropBlob, setPendingCropBlob] = useState(null)
  const [originalImagePath, setOriginalImagePath] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (!cropSource.startsWith('blob:')) return

    return () => URL.revokeObjectURL(cropSource)
  }, [cropSource])

  useEffect(() => {
    if (!imagePreview.startsWith('blob:')) return

    return () => URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  const inputClass =
    'mt-2 w-full rounded border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-400'

  const labelClass =
    'text-xs font-medium uppercase tracking-wider text-neutral-400'

  async function loadMediaCoverage() {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/api/admin/media-coverage', {
        auth: true,
      })

      setMediaItems(response.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMediaCoverage()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function handleImageSelect(file) {
    if (!file) return

    setError('')
    setMessage('')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Format gambar harus JPEG, PNG, atau WebP.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5 MB.')
      return
    }

    setPendingOriginalFile(file)
    setPendingCropBlob(null)
    setOriginalImagePath('')
    setCropSource(URL.createObjectURL(file))
    setIsCropOpen(true)
  }

  function handleApplyCrop(blob) {
    setPendingCropBlob(blob)
    setImagePreview(URL.createObjectURL(blob))
    setIsCropOpen(false)
    setMessage('Crop berhasil diterapkan. Klik Save untuk menyimpan.')
  }

  function handleCancelCrop() {
    setIsCropOpen(false)

    if (pendingOriginalFile) {
      setPendingOriginalFile(null)
      setCropSource(originalImagePath || form.image_path || '')
      setImagePreview(form.image_path || '')
      setPendingCropBlob(null)
    }
  }

  function handleOpenCropEditor() {
    if (cropSource) {
      setIsCropOpen(true)
    }
  }

  async function uploadImage(file) {
    const body = new FormData()
    body.append('image', file)

    const response = await apiRequest('/api/uploads/image', {
      method: 'POST',
      body,
      auth: true,
    })

    return response.data.path
  }

  function handleEdit(item) {
    const sourcePath = item.original_image_path || item.image_path || ''

    setEditingId(item.id)
    setForm({
      title: item.title || '',
      image_path: item.image_path || '',
      publication_date: String(item.publication_date || '').slice(0, 10),
      article_url: item.article_url || '',
    })

    setOriginalImagePath(sourcePath)
    setCropSource(sourcePath)
    setImagePreview(item.image_path || '')
    setPendingOriginalFile(null)
    setPendingCropBlob(null)
    setIsCropOpen(false)
    setError('')
    setMessage('')
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(initialForm)
    setOriginalImagePath('')
    setCropSource('')
    setImagePreview('')
    setPendingOriginalFile(null)
    setPendingCropBlob(null)
    setIsCropOpen(false)
    setError('')
    setMessage('')
  }

  async function handleSave(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (
      !form.title.trim() ||
      (!form.image_path && !pendingCropBlob) ||
      (pendingOriginalFile && !pendingCropBlob) ||
      !form.publication_date ||
      !form.article_url.trim()
    ) {
      setError('Semua field Media Coverage wajib diisi dan foto harus sudah di-crop.')
      return
    }

    setIsSaving(true)

    try {
      let savedImagePath = form.image_path
      let savedOriginalPath = originalImagePath || form.image_path

      if (pendingOriginalFile || pendingCropBlob) {
        setIsUploading(true)

        if (pendingOriginalFile) {
          savedOriginalPath = await uploadImage(pendingOriginalFile)
        }

        if (pendingCropBlob) {
          const croppedFile = new File(
            [pendingCropBlob],
            'media-coverage-crop.webp',
            { type: 'image/webp' }
          )

          savedImagePath = await uploadImage(croppedFile)
        }
      }

      const payload = {
        title: form.title.trim(),
        image_path: savedImagePath,
        original_image_path: savedOriginalPath || savedImagePath,
        image_position_x: 50,
        image_position_y: 50,
        publication_date: form.publication_date,
        article_url: form.article_url.trim(),
      }

      if (editingId) {
        await apiRequest(`/api/admin/media-coverage/${editingId}`, {
          method: 'PUT',
          body: payload,
          auth: true,
        })

        setMessage('Media Coverage berhasil diperbarui.')
      } else {
        await apiRequest('/api/admin/media-coverage', {
          method: 'POST',
          body: payload,
          auth: true,
        })

        setMessage('Media Coverage berhasil ditambahkan.')
      }

      setEditingId(null)
      setForm(initialForm)
      setOriginalImagePath('')
      setCropSource('')
      setImagePreview('')
      setPendingOriginalFile(null)
      setPendingCropBlob(null)
      setIsCropOpen(false)

      await loadMediaCoverage()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsUploading(false)
      setIsSaving(false)
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Hapus Media Coverage "${item.title}"?`
    )

    if (!confirmed) return

    setDeletingId(item.id)
    setError('')
    setMessage('')

    try {
      await apiRequest(`/api/admin/media-coverage/${item.id}`, {
        method: 'DELETE',
        auth: true,
      })

      if (editingId === item.id) {
        handleCancelEdit()
      }

      setMessage('Media Coverage berhasil dihapus.')
      await loadMediaCoverage()
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="mt-16 border-t border-white/10 pt-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Press & Publications
        </p>

        <h2 className="mt-3 text-2xl font-bold uppercase sm:text-3xl">
          Media Coverage.
        </h2>

        <p className="mt-2 text-sm text-neutral-400">
          Manage articles and media coverage featuring HOLYMOLY.
        </p>
      </div>

      <div className="admin-card mb-10 p-5 sm:p-7">
        <div className="mb-7">
          <h3 className="text-lg font-bold uppercase">
            {editingId ? 'Edit Media Coverage' : 'Add Media Coverage'}
          </h3>

          <p className="mt-1 text-xs text-neutral-500">
            {editingId
              ? 'Perbarui informasi artikel atau liputan.'
              : 'Tambahkan artikel atau liputan yang mengangkat HOLYMOLY.'}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <label className={`${labelClass} block`}>
            Article Title
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={255}
              placeholder="Judul artikel atau liputan"
              className={inputClass}
              required
            />
          </label>

          <div>
            <p className={labelClass}>Article Photo (16:9)</p>

            <div className="mt-2 aspect-[16/9] w-full overflow-hidden rounded border border-dashed border-white/20 bg-[#080808]">
              {imagePreview || form.image_path ? (
                <img
                  src={imagePreview || form.image_path}
                  alt="Media Coverage Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="px-4 text-center text-xs text-neutral-600">
                    Belum ada foto
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-center rounded border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition hover:border-neutral-400 hover:text-neutral-200">
                Choose Image

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isUploading || isSaving}
                  onChange={(event) => {
                    handleImageSelect(event.target.files?.[0])
                    event.target.value = ''
                  }}
                />
              </label>

              <button
                type="button"
                onClick={handleOpenCropEditor}
                disabled={!cropSource || isUploading || isSaving}
                className="rounded border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition hover:border-neutral-400 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Adjust Crop
              </button>
            </div>
          </div>

          <label className={`${labelClass} block`}>
            Publication Date
            <input
              type="date"
              name="publication_date"
              value={form.publication_date}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </label>

          <label className={`${labelClass} block`}>
            Article URL
            <input
              type="url"
              name="article_url"
              value={form.article_url}
              onChange={handleChange}
              maxLength={2048}
              placeholder="https://example.com/article"
              className={inputClass}
              required
            />
          </label>

          {error && (
            <p className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              {message}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="rounded bg-neutral-200 text-black px-6 py-3 text-xs font-bold uppercase tracking-wider transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? 'Saving...'
                : editingId
                  ? 'Update Media Coverage'
                  : 'Save Media Coverage'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-300 transition hover:bg-white/10"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold uppercase">
          Media Coverage Records
        </h3>

        <p className="mt-1 text-xs text-neutral-500">
          Manage existing articles and media coverage.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">
          Loading Media Coverage...
        </p>
      ) : mediaItems.length === 0 ? (
        <p className="admin-card p-6 text-sm text-neutral-500">
          Belum ada data Media Coverage.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {mediaItems.map((item) => (
            <article
              key={item.id}
              className="admin-card overflow-hidden"
            >
              <img
                src={item.image_path}
                alt={item.title}
                className="aspect-[16/9] w-full object-cover"
              />

              <div className="p-5">
                <h4 className="text-lg font-bold uppercase">
                  {item.title}
                </h4>

                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  {String(item.publication_date || '').slice(0, 10)}
                </p>

                <a
                  href={item.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block break-all text-xs text-neutral-400 underline transition hover:text-neutral-200"
                >
                  Open Article
                </a>

                <div className="mt-6 flex gap-3 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="rounded border border-white/20 px-4 py-2 text-xs font-semibold uppercase text-neutral-300 transition hover:bg-neutral-300/10"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="rounded border border-red-500/40 px-4 py-2 text-xs font-semibold uppercase text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {isCropOpen && cropSource && (
        <ImageCropEditor
          src={cropSource}
          onApply={handleApplyCrop}
          onCancel={handleCancelCrop}
        />
      )}
    </section>
  )
}

export default AdminMediaCoverage
