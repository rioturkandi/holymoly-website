import { useEffect, useState } from 'react'
import { apiRequest } from '../../services/api'
import AdminMediaCoverage from './AdminMediaCoverage'

const initialForm = {
  title: '',
  event_name: '',
  achievement_year: String(new Date().getFullYear()),
  description: '',
  trophy_image_path: '',
  vehicle_image_path: '',
}

function AdminAchievements() {
  const [achievements, setAchievements] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function fetchAchievements() {
    const response = await apiRequest('/api/admin/achievements', {
      auth: true,
    })

    return response.data
  }

  async function loadAchievements() {
    setIsLoading(true)
    setError('')

    try {
      const data = await fetchAchievements()
      setAchievements(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialAchievements() {
      try {
        const data = await fetchAchievements()

        if (isMounted) {
          setAchievements(data)
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

    loadInitialAchievements()

    return () => {
      isMounted = false
    }
  }, [])

  function handleChange(event) {
    const { name } = event.target
    let { value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  async function handleImageUpload(fieldName, file) {
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

    setUploadingField(fieldName)

    try {
      const body = new FormData()
      body.append('image', file)

      const response = await apiRequest('/api/uploads/image', {
        method: 'POST',
        body,
        auth: true,
      })

      setForm((currentForm) => ({
        ...currentForm,
        [fieldName]: response.data.path,
      }))

      setMessage('Gambar berhasil diunggah.')
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setUploadingField('')
    }
  }

  function handleEdit(achievement) {
    setEditingId(achievement.id)
    setForm({
      title: achievement.title || '',
      event_name: achievement.event_name || '',
      achievement_year: String(achievement.achievement_year || ''),
      description: achievement.description || '',
      trophy_image_path: achievement.trophy_image_path || '',
      vehicle_image_path: achievement.vehicle_image_path || '',
    })

    setError('')
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(initialForm)
    setError('')
    setMessage('')
  }

  async function handleSave(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.title.trim() || !form.event_name.trim() || !form.achievement_year) {
      setError('Achievement Name, Event Name, dan Year wajib diisi.')
      return
    }

    if (!form.trophy_image_path || !form.vehicle_image_path) {
      setError('Trophy Photo dan Winning Car Photo wajib diunggah.')
      return
    }

    if (form.trophy_image_path === form.vehicle_image_path) {
      setError('Trophy Photo dan Winning Car Photo harus berbeda.')
      return
    }

    if (form.description.length > 500) {
      setError('Description maksimal 500 karakter.')
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        title: form.title.trim(),
        event_name: form.event_name.trim(),
        achievement_year: Number(form.achievement_year),
        description: form.description,
        trophy_image_path: form.trophy_image_path,
        vehicle_image_path: form.vehicle_image_path,
      }

      if (editingId) {
        await apiRequest(`/api/admin/achievements/${editingId}`, {
          method: 'PUT',
          body: payload,
          auth: true,
        })

        setMessage('Penghargaan berhasil diperbarui.')
      } else {
        await apiRequest('/api/admin/achievements', {
          method: 'POST',
          body: payload,
          auth: true,
        })

        setMessage('Penghargaan berhasil ditambahkan.')
      }

      setEditingId(null)
      setForm(initialForm)
      await loadAchievements()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(achievement) {
    const confirmed = window.confirm(
      `Hapus penghargaan "${achievement.title}"?`
    )

    if (!confirmed) return

    setDeletingId(achievement.id)
    setError('')
    setMessage('')

    try {
      await apiRequest(`/api/admin/achievements/${achievement.id}`, {
        method: 'DELETE',
        auth: true,
      })

      if (editingId === achievement.id) {
        handleCancelEdit()
      }

      setMessage('Penghargaan berhasil dihapus.')
      await loadAchievements()
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setDeletingId(null)
    }
  }

  const inputClass =
    'mt-2 min-h-11 w-full min-w-0 rounded border border-white/10 bg-[#100C08] px-3 py-2.5 text-xs text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-400 min-[360px]:text-[13px] min-[390px]:px-4 min-[390px]:py-3 min-[390px]:text-sm'

  const labelClass = 'text-[10px] font-medium uppercase tracking-wider text-neutral-400 min-[360px]:text-[11px] min-[390px]:text-xs'

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl">
      <div className="mb-8 min-[390px]:mb-10">
        <p className="text-[8px] uppercase tracking-[0.25em] text-neutral-400 min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs sm:tracking-[0.3em]">
          Content Management
        </p>

        <h1 className="mt-2 text-[28px] font-bold uppercase leading-tight text-[#E5E7EB] min-[360px]:text-[30px] min-[390px]:mt-3 min-[390px]:text-[34px] sm:text-5xl md:text-6xl">
          Achievements.
        </h1>

        <p className="mt-2 max-w-xl text-xs leading-relaxed text-neutral-400 min-[360px]:text-[13px] min-[390px]:mt-3 min-[390px]:text-sm">
          Manage awards and achievements displayed on the website.
        </p>
      </div>

      <section className="admin-card mb-8 min-w-0 p-4 min-[390px]:mb-12 min-[390px]:p-5 sm:p-7">
        <div className="mb-5 min-[390px]:mb-7">
          <h2 className="text-base font-bold uppercase leading-snug text-[#E5E7EB] min-[390px]:text-lg sm:text-xl">
            {editingId ? 'Edit Achievement' : 'Add Achievement'}
          </h2>

          <p className="mt-1 text-[11px] leading-relaxed text-neutral-500 min-[390px]:text-xs">
            {editingId
              ? 'Perbarui informasi penghargaan.'
              : 'Tambahkan penghargaan baru ke website.'}
          </p>
        </div>

        <form onSubmit={handleSave} className="min-w-0 space-y-5 min-[390px]:space-y-6">
          <div className="grid min-w-0 gap-4 min-[390px]:gap-5 md:grid-cols-2">
            <label className={labelClass}>
              Achievement Name
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={255}
                placeholder="Nama penghargaan"
                className={inputClass}
                required
              />
            </label>

            <label className={labelClass}>
              Event Name
              <input
                type="text"
                name="event_name"
                value={form.event_name}
                onChange={handleChange}
                maxLength={255}
                placeholder="Nama event"
                className={inputClass}
                required
              />
            </label>

            <label className={labelClass}>
              Year
              <input
                type="number"
                name="achievement_year"
                value={form.achievement_year}
                onChange={handleChange}
                min="1901"
                max="2155"
                placeholder="Tahun penghargaan"
                className={inputClass}
                required
              />
            </label>
          </div>

          <label className={`${labelClass} block`}>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={500}
              rows={5}
              placeholder="Deskripsi penghargaan..."
              className={`${inputClass} resize-y`}
            />
            <span className="mt-2 block text-right text-[11px] text-neutral-500 min-[390px]:text-xs">
              {form.description.length}/500 karakter
            </span>
          </label>

          <div className="grid min-w-0 gap-5 min-[390px]:gap-6 md:grid-cols-2">
            {[
              {
                label: 'Trophy Photo',
                field: 'trophy_image_path',
              },
              {
                label: 'Winning Car Photo',
                field: 'vehicle_image_path',
              },
            ].map((imageField) => (
              <div key={imageField.field}>
                <p className={labelClass}>{imageField.label}</p>

                <div className="mt-2 flex min-h-40 items-center justify-center overflow-hidden rounded border border-dashed border-white/20 bg-[#100C08] min-[390px]:min-h-44 sm:min-h-48">
                  {form[imageField.field] ? (
                    <img
                      src={form[imageField.field]}
                      alt={imageField.label}
                      className="h-40 w-full object-cover min-[390px]:h-44 sm:h-48"
                    />
                  ) : (
                    <p className="px-3 text-center text-[11px] leading-relaxed text-neutral-600 min-[390px]:px-4 min-[390px]:text-xs">
                      Belum ada gambar
                    </p>
                  )}
                </div>

                <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center rounded border border-white/15 px-3 py-3 text-[11px] font-semibold uppercase tracking-wider transition hover:border-neutral-400 hover:text-neutral-200 min-[390px]:px-4 min-[390px]:text-xs">
                  {uploadingField === imageField.field
                    ? 'Uploading...'
                    : 'Choose Image'}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={Boolean(uploadingField)}
                    onChange={(event) => {
                      handleImageUpload(
                        imageField.field,
                        event.target.files?.[0]
                      )
                      event.target.value = ''
                    }}
                  />
                </label>
              </div>
            ))}
          </div>

          {error && (
            <p className="rounded border border-red-500/30 bg-red-500/10 p-3 text-xs leading-relaxed text-red-400 min-[390px]:text-sm">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded border border-green-500/30 bg-green-500/10 p-3 text-xs leading-relaxed text-green-400 min-[390px]:text-sm">
              {message}
            </p>
          )}

          <div className="flex flex-col gap-2 min-[390px]:flex-row min-[390px]:gap-3">
            <button
              type="submit"
              disabled={isSaving || Boolean(uploadingField)}
              className="min-h-11 w-full rounded bg-neutral-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 min-[390px]:w-auto min-[390px]:px-6"
            >
              {isSaving
                ? 'Saving...'
                : editingId
                  ? 'Update Achievement'
                  : 'Save Achievement'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="min-h-11 w-full rounded border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-neutral-300 transition hover:bg-white/10 min-[390px]:w-auto min-[390px]:px-6"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="min-w-0">
        <div className="mb-5 min-[390px]:mb-6">
          <h2 className="text-base font-bold uppercase leading-snug text-[#E5E7EB] min-[390px]:text-lg sm:text-xl">
            Achievement Records
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-neutral-500 min-[390px]:text-xs">
            Manage existing awards and achievements.
          </p>
        </div>

        {isLoading ? (
          <p className="text-xs text-neutral-500 min-[390px]:text-sm">Loading achievements...</p>
        ) : achievements.length === 0 ? (
          <p className="admin-card p-4 text-xs leading-relaxed text-neutral-500 min-[390px]:p-6 min-[390px]:text-sm">
            Belum ada data penghargaan.
          </p>
        ) : (
          <div className="grid min-w-0 gap-3 min-[390px]:gap-5 lg:grid-cols-2">
            {achievements.map((achievement) => (
              <article
                key={achievement.id}
                className="admin-card min-w-0 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-px bg-white/10">
                  <div className="flex h-32 min-w-0 items-center justify-center bg-[#100C08] min-[390px]:h-36 sm:h-40">
                    {achievement.trophy_image_path ? (
                      <img
                        src={achievement.trophy_image_path}
                        alt={`${achievement.title} trophy`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-1 text-center text-[10px] text-neutral-600 min-[390px]:text-xs">
                        No trophy photo
                      </span>
                    )}
                  </div>

                  <div className="flex h-32 min-w-0 items-center justify-center bg-[#100C08] min-[390px]:h-36 sm:h-40">
                    {achievement.vehicle_image_path ? (
                      <img
                        src={achievement.vehicle_image_path}
                        alt={`${achievement.title} winning car`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-1 text-center text-[10px] text-neutral-600 min-[390px]:text-xs">
                        No car photo
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-w-0 p-3 min-[390px]:p-4 sm:p-5">
                  <h3 className="break-words text-base font-bold uppercase leading-snug text-[#E5E7EB] min-[390px]:text-lg">
                    {achievement.title}
                  </h3>

                  <p className="mt-1 break-words text-[10px] font-semibold uppercase tracking-wider text-neutral-400 min-[360px]:text-[11px] min-[390px]:text-xs">
                    {achievement.event_name} / {achievement.achievement_year}
                  </p>

                  <p className="mt-3 line-clamp-5 break-words whitespace-pre-line text-xs leading-relaxed text-neutral-400 min-[390px]:mt-4 min-[390px]:text-[13px] sm:text-sm">
                    {achievement.description || 'No description.'}
                  </p>

                  <div className="mt-5 flex gap-2 border-t border-white/10 pt-3 min-[390px]:mt-6 min-[390px]:gap-3 min-[390px]:pt-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(achievement)}
                      className="min-h-11 flex-1 rounded border border-white/20 px-3 py-2 text-[11px] font-semibold uppercase text-neutral-300 transition hover:bg-neutral-300/10 min-[390px]:flex-none min-[390px]:px-4 min-[390px]:text-xs"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(achievement)}
                      disabled={deletingId === achievement.id}
                      className="min-h-11 flex-1 rounded border border-red-500/40 px-3 py-2 text-[11px] font-semibold uppercase text-red-400 transition hover:bg-red-500/10 disabled:opacity-50 min-[390px]:flex-none min-[390px]:px-4 min-[390px]:text-xs"
                    >
                      {deletingId === achievement.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <AdminMediaCoverage />
    </div>
  )
}

export default AdminAchievements
