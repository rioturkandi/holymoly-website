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

  async function loadAchievements() {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/api/admin/achievements', {
        auth: true,
      })

      setAchievements(response.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAchievements()
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
    'mt-2 w-full rounded border border-white/10 bg-[#100C08] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-neutral-400'

  const labelClass = 'text-xs font-medium uppercase tracking-wider text-neutral-400'

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Content Management
        </p>

        <h1 className="mt-3 text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
          Achievements.
        </h1>

        <p className="mt-3 text-sm text-neutral-400">
          Manage awards and achievements displayed on the website.
        </p>
      </div>

      <section className="admin-card mb-12 p-5 sm:p-7">
        <div className="mb-7">
          <h2 className="text-xl font-bold uppercase text-[#E5E7EB]">
            {editingId ? 'Edit Achievement' : 'Add Achievement'}
          </h2>

          <p className="mt-1 text-xs text-neutral-500">
            {editingId
              ? 'Perbarui informasi penghargaan.'
              : 'Tambahkan penghargaan baru ke website.'}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
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
            <span className="mt-2 block text-right text-xs text-neutral-500">
              {form.description.length}/500 karakter
            </span>
          </label>

          <div className="grid gap-6 md:grid-cols-2">
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

                <div className="mt-2 flex min-h-48 items-center justify-center overflow-hidden rounded border border-dashed border-white/20 bg-[#100C08]">
                  {form[imageField.field] ? (
                    <img
                      src={form[imageField.field]}
                      alt={imageField.label}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <p className="px-4 text-center text-xs text-neutral-600">
                      Belum ada gambar
                    </p>
                  )}
                </div>

                <label className="mt-3 flex cursor-pointer items-center justify-center rounded border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition hover:border-neutral-400 hover:text-neutral-200">
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
              disabled={isSaving || Boolean(uploadingField)}
              className="rounded bg-neutral-200 text-black px-6 py-3 text-xs font-bold uppercase tracking-wider transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="rounded border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-300 transition hover:bg-white/10"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold uppercase text-[#E5E7EB]">
            Achievement Records
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Manage existing awards and achievements.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-neutral-500">Loading achievements...</p>
        ) : achievements.length === 0 ? (
          <p className="admin-card p-6 text-sm text-neutral-500">
            Belum ada data penghargaan.
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {achievements.map((achievement) => (
              <article
                key={achievement.id}
                className="admin-card overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-px bg-white/10">
                  <div className="flex h-40 items-center justify-center bg-[#100C08]">
                    {achievement.trophy_image_path ? (
                      <img
                        src={achievement.trophy_image_path}
                        alt={`${achievement.title} trophy`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-neutral-600">
                        No trophy photo
                      </span>
                    )}
                  </div>

                  <div className="flex h-40 items-center justify-center bg-[#100C08]">
                    {achievement.vehicle_image_path ? (
                      <img
                        src={achievement.vehicle_image_path}
                        alt={`${achievement.title} winning car`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-neutral-600">
                        No car photo
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold uppercase text-[#E5E7EB]">
                    {achievement.title}
                  </h3>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {achievement.event_name} / {achievement.achievement_year}
                  </p>

                  <p className="mt-4 line-clamp-5 break-words whitespace-pre-line text-sm leading-relaxed text-neutral-400">
                    {achievement.description || 'No description.'}
                  </p>

                  <div className="mt-6 flex gap-3 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(achievement)}
                      className="rounded border border-white/20 px-4 py-2 text-xs font-semibold uppercase text-neutral-300 transition hover:bg-neutral-300/10"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(achievement)}
                      disabled={deletingId === achievement.id}
                      className="rounded border border-red-500/40 px-4 py-2 text-xs font-semibold uppercase text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
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
