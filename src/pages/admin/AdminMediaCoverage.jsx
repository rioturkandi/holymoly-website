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
    'mt-2 min-h-11 w-full min-w-0 rounded border border-white/10 bg-[#100C08] px-3 py-2.5 text-xs text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-400 min-[360px]:px-4 min-[390px]:text-[13px] sm:text-sm'

  const labelClass =
    'text-[10px] font-medium uppercase tracking-wider text-neutral-400 min-[360px]:text-[11px] min-[390px]:text-xs'

  async function fetchMediaCoverage() {
    const response = await apiRequest('/api/admin/media-coverage', {
      auth: true,
    })

    return response.data
  }

  async function loadMediaCoverage() {
    setIsLoading(true)
    setError('')

    try {
      const data = await fetchMediaCoverage()
      setMediaItems(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialMediaCoverage() {
      try {
        const data = await fetchMediaCoverage()

        if (isMounted) {
          setMediaItems(data)
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialMediaCoverage()

    return () => {
      isMounted = false
    }
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
    <section className="mt-10 min-w-0 border-t border-white/10 pt-8 min-[390px]:mt-12 min-[390px]:pt-10 sm:mt-16 sm:pt-12">
      <div className="mb-6 min-[390px]:mb-8">
        <p className="text-[8px] uppercase tracking-[0.25em] text-neutral-400 min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs sm:tracking-[0.3em]">
          Press & Publications
        </p>

        <h2 className="mt-2 text-[28px] font-bold uppercase leading-tight text-[#E5E7EB] min-[360px]:text-[30px] min-[390px]:mt-3 min-[390px]:text-[34px] sm:text-3xl">
          Media Coverage.
        </h2>

        <p className="mt-2 text-xs leading-relaxed text-neutral-400 min-[360px]:text-[13px] min-[390px]:text-sm">
          Manage articles and media coverage featuring HOLYMOLY.
        </p>
      </div>

      <div className="admin-card mb-8 min-w-0 p-4 min-[390px]:mb-10 min-[390px]:p-5 sm:p-7">
        <div className="mb-5 min-[390px]:mb-7">
          <h3 className="text-base font-bold uppercase text-[#E5E7EB] min-[390px]:text-lg sm:text-xl">
            {editingId ? 'Edit Media Coverage' : 'Add Media Coverage'}
          </h3>

          <p className="mt-1 text-[11px] leading-relaxed text-neutral-500 min-[390px]:text-xs">
            {editingId
              ? 'Perbarui informasi artikel atau liputan.'
              : 'Tambahkan artikel atau liputan yang mengangkat HOLYMOLY.'}
          </p>
        </div>

        <form onSubmit={handleSave} className="min-w-0 space-y-5 min-[390px]:space-y-6">
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

            <div className="mt-2 flex min-h-40 w-full items-center justify-center overflow-hidden rounded border border-dashed border-white/20 bg-[#100C08] min-[390px]:min-h-44 sm:min-h-48 md:w-[calc(50%-0.75rem)]">
              {imagePreview || form.image_path ? (
                <img
                  src={imagePreview || form.image_path}
                  alt="Media Coverage Preview"
                  className="h-40 w-full object-cover min-[390px]:h-44 sm:h-48"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="px-4 text-center text-xs text-neutral-600">
                    Belum ada foto
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2">
              <label className="flex min-h-11 cursor-pointer items-center justify-center rounded border border-white/15 px-3 py-3 text-[11px] font-semibold uppercase tracking-wider transition hover:border-neutral-400 hover:text-neutral-200 min-[390px]:px-4 min-[390px]:text-xs">
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
                className="min-h-11 rounded border border-white/15 px-3 py-3 text-[11px] font-semibold uppercase tracking-wider transition hover:border-neutral-400 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 min-[390px]:px-4 min-[390px]:text-xs"
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
            <p className="break-words rounded border border-red-500/30 bg-red-500/10 p-3 text-xs leading-relaxed text-red-400 min-[390px]:text-sm">
              {error}
            </p>
          )}

          {message && (
            <p className="break-words rounded border border-green-500/30 bg-green-500/10 p-3 text-xs leading-relaxed text-green-400 min-[390px]:text-sm">
              {message}
            </p>
          )}

          <div className="flex flex-col gap-3 min-[390px]:flex-row min-[390px]:flex-wrap">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="min-h-11 w-full rounded bg-neutral-200 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-black transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 min-[390px]:w-auto min-[390px]:px-6 min-[390px]:text-xs"
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
                className="min-h-11 w-full rounded border border-white/20 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 min-[390px]:w-auto min-[390px]:px-6 min-[390px]:text-xs"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mb-5 min-[390px]:mb-6">
        <h3 className="text-base font-bold uppercase text-[#E5E7EB] min-[390px]:text-lg sm:text-xl">
          Media Coverage Records
        </h3>

        <p className="mt-1 text-[11px] text-neutral-500 min-[390px]:text-xs">
          Manage existing articles and media coverage.
        </p>
      </div>

      {isLoading ? (
        <p className="text-xs text-neutral-500 min-[390px]:text-sm">
          Loading Media Coverage...
        </p>
      ) : mediaItems.length === 0 ? (
        <p className="admin-card p-4 text-xs text-neutral-500 min-[390px]:p-6 min-[390px]:text-sm">
          Belum ada data Media Coverage.
        </p>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-3 min-[390px]:gap-4 lg:grid-cols-2 lg:gap-5">
          {mediaItems.map((item) => (
            <article
              key={item.id}
              className="admin-card min-w-0 overflow-hidden"
            >
              <img
                src={item.image_path}
                alt={item.title}
                className="aspect-[16/9] w-full object-cover"
              />

              <div className="min-w-0 p-3 min-[390px]:p-4 sm:p-5">
                <h4 className="break-words text-base font-bold uppercase text-[#E5E7EB] min-[390px]:text-lg">
                  {item.title}
                </h4>

                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 min-[360px]:text-[11px] min-[390px]:text-xs">
                  {String(item.publication_date || '').slice(0, 10)}
                </p>

                <a
                  href={item.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block min-h-11 max-w-full break-all py-2 text-[11px] text-neutral-400 underline transition hover:text-neutral-200 min-[390px]:text-xs"
                >
                  Open Article
                </a>

                <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 min-[390px]:mt-6 min-[390px]:flex-row min-[390px]:gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="min-h-11 w-full rounded border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase text-neutral-300 transition hover:bg-neutral-300/10 min-[390px]:w-auto min-[390px]:text-xs"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="min-h-11 w-full rounded border border-red-500/40 px-4 py-2 text-[11px] font-semibold uppercase text-red-400 transition hover:bg-red-500/10 disabled:opacity-50 min-[390px]:w-auto min-[390px]:text-xs"
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
