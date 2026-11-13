import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '../../services/api'
import ProjectShowcaseCard from '../../components/ProjectShowcaseCard'

function AdminProjects() {
  // Menyimpan daftar proyek dari backend
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const coverPreviewRef = useRef(null)
  const coverImageRef = useRef(null)
  const coverDragRef = useRef(null)

  // Menyimpan isi form proyek
  const [form, setForm] = useState({
    vehicle_name: '',
    description: '',
    cover_image_path: '',
    cover_position_x: 50,
    cover_position_y: 50,
    detail_image_paths: [],
  })

  // Status upload, penyimpanan, dan penghapusan
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Pesan hasil proses
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Mengambil daftar proyek dari backend
  async function loadProjects() {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/api/admin/projects', {
        auth: true,
      })

      setProjects(response.data || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  // Mengunggah satu foto ke server
  async function uploadImage(file) {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiRequest('/api/uploads/image', {
      method: 'POST',
      body: formData,
      auth: true,
    })

    return response.data.path
  }

  // Mengunggah cover photo
  async function handleCoverUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    setError('')
    setMessage('')

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format foto harus JPEG, PNG, atau WebP.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal 5 MB.')
      event.target.value = ''
      return
    }

    setIsUploading(true)

    try {
      const imagePath = await uploadImage(file)

      setForm((current) => ({
        ...current,
        cover_image_path: imagePath,
        cover_position_x: 50,
        cover_position_y: 50,
      }))

      setMessage('Cover photo berhasil diunggah.')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  // Memulai penggeseran foto cover di dalam preview persegi
  function handleCoverPointerDown(event) {
    const image = coverImageRef.current
    const container = coverPreviewRef.current

    if (!image || !container || !image.naturalWidth || !image.naturalHeight) {
      return
    }

    const bounds = container.getBoundingClientRect()
    const scale = Math.max(
      bounds.width / image.naturalWidth,
      bounds.height / image.naturalHeight
    )

    coverDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      positionX: Number(form.cover_position_x),
      positionY: Number(form.cover_position_y),
      overflowX: image.naturalWidth * scale - bounds.width,
      overflowY: image.naturalHeight * scale - bounds.height,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  // Memperbarui posisi foto sesuai arah geseran
  function handleCoverPointerMove(event) {
    const drag = coverDragRef.current

    if (!drag || drag.pointerId !== event.pointerId) return

    const nextX = drag.overflowX > 0
      ? Math.min(100, Math.max(0,
          drag.positionX -
          ((event.clientX - drag.startX) / drag.overflowX) * 100
        ))
      : drag.positionX

    const nextY = drag.overflowY > 0
      ? Math.min(100, Math.max(0,
          drag.positionY -
          ((event.clientY - drag.startY) / drag.overflowY) * 100
        ))
      : drag.positionY

    setForm((current) => ({
      ...current,
      cover_position_x: Number(nextX.toFixed(2)),
      cover_position_y: Number(nextY.toFixed(2)),
    }))
  }

  // Mengakhiri penggeseran foto cover
  function handleCoverPointerEnd(event) {
    coverDragRef.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  // Mengunggah 3 sampai 8 detail photos
  async function handleDetailUpload(event) {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    setError('')
    setMessage('')

    if (form.detail_image_paths.length + files.length > 8) {
      setError('Detail photos maksimal 8 foto.')
      event.target.value = ''
      return
    }

    const invalidFile = files.find(
      (file) =>
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 5 * 1024 * 1024
    )

    if (invalidFile) {
      setError('Gunakan JPEG, PNG, atau WebP dengan ukuran maksimal 5 MB.')
      event.target.value = ''
      return
    }

    setIsUploading(true)

    try {
      const uploadedPaths = await Promise.all(
        files.map((file) => uploadImage(file))
      )

      setForm((current) => ({
        ...current,
        detail_image_paths: [
          ...current.detail_image_paths,
          ...uploadedPaths,
        ],
      }))

      setMessage('Detail photos berhasil diunggah.')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  // Menyimpan proyek baru
  async function handleSave(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.cover_image_path) {
      setError('Cover Photo wajib diunggah.')
      return
    }

    if (form.detail_image_paths.length < 3 ||
        form.detail_image_paths.length > 8) {
      setError('Detail Photos harus berjumlah 3 sampai 8.')
      return
    }

    setIsSaving(true)

    try {
      await apiRequest('/api/admin/projects', {
        method: 'POST',
        auth: true,
        body: form,
      })

      setForm({
        vehicle_name: '',
        description: '',
        cover_image_path: '',
        cover_position_x: 50,
        cover_position_y: 50,
        detail_image_paths: [],
      })

      setMessage('Proyek berhasil ditambahkan.')
      await loadProjects()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Menghapus proyek
  async function handleDelete(projectId) {
    const confirmed = window.confirm('Yakin ingin menghapus proyek ini?')
    if (!confirmed) return

    setError('')
    setMessage('')
    setDeletingId(projectId)

    try {
      await apiRequest(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        auth: true,
      })

      setMessage('Proyek berhasil dihapus.')
      await loadProjects()
    } catch (error) {
      setError(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  // Memperbarui isi field form
  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  // Menghapus foto dari daftar detail photos
  function removeDetailPhoto(index) {
    setForm((current) => ({
      ...current,
      detail_image_paths: current.detail_image_paths.filter(
        (_, photoIndex) => photoIndex !== index
      ),
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Content Management
        </p>
        <h1 className="text-3xl font-bold uppercase text-[#E5E7EB]">
          Projects
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Tambahkan dan kelola project HOLYMOLY.
        </p>
      </div>

      <form onSubmit={handleSave} className="admin-card space-y-6 p-6">
        <h2 className="text-xl font-bold uppercase text-[#E5E7EB]">Add New Project</h2>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">Title</label>
          <input
            type="text"
            name="vehicle_name"
            value={form.vehicle_name}
            onChange={handleChange}
            maxLength={255}
            required
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">Cover Photo</label>
          <input
            id="cover-photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverUpload}
            disabled={isUploading}
            className="peer sr-only"
          />
          <label
            htmlFor="cover-photo-input"
            className={`inline-flex cursor-pointer items-center rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600 peer-focus-visible:ring-2 peer-focus-visible:ring-white ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            Choose File
          </label>
          {form.cover_image_path && (
            <div className="mt-3 space-y-2">
              <div
                ref={coverPreviewRef}
                onPointerDown={handleCoverPointerDown}
                onPointerMove={handleCoverPointerMove}
                onPointerUp={handleCoverPointerEnd}
                onPointerCancel={handleCoverPointerEnd}
                className="aspect-square w-full max-w-sm touch-none select-none overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 cursor-grab active:cursor-grabbing"
              >
                <img
                  ref={coverImageRef}
                  src={form.cover_image_path}
                  alt="Preview Cover Photo"
                  draggable="false"
                  style={{
                    objectPosition: `${form.cover_position_x}% ${form.cover_position_y}%`,
                  }}
                  className="h-full w-full pointer-events-none object-cover"
                />
              </div>
              <p className="text-xs text-zinc-400">
                Geser foto di dalam kotak untuk mengatur bagian yang terlihat.
              </p>
              <p className="text-sm text-green-400">
                Cover photo berhasil diunggah.
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">Detail Photos (3–8 photos)</label>
          <input
            id="detail-photos-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleDetailUpload}
            disabled={isUploading || form.detail_image_paths.length >= 8}
            className="peer sr-only"
          />
          <label
            htmlFor="detail-photos-input"
            className={`inline-flex cursor-pointer items-center rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600 peer-focus-visible:ring-2 peer-focus-visible:ring-white ${isUploading || form.detail_image_paths.length >= 8 ? 'pointer-events-none opacity-50' : ''}`}
          >
            Choose File
          </label>
          <p className="mt-2 text-xs text-zinc-500">
            {form.detail_image_paths.length}/8 foto dipilih
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {form.detail_image_paths.map((imagePath, index) => (
              <div
                key={imagePath}
                className="admin-card overflow-hidden"
              >
                <img
                  src={imagePath}
                  alt={`Detail Photo ${index + 1}`}
                  className="h-32 w-full object-cover"
                />
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="text-xs text-zinc-300">
                    Detail {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDetailPhoto(index)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={500}
            rows={5}
            required
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
          />
          <p className="mt-1 text-xs text-zinc-500">
            {form.description.length}/500 karakter
          </p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-400">{message}</p>}

        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-300 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Project'}
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="text-xl font-bold uppercase text-[#E5E7EB]">
          Existing Projects
        </h2>

        {isLoading && (
          <p className="text-sm text-zinc-400">Loading projects...</p>
        )}

        {!isLoading && projects.length === 0 && (
          <p className="rounded-lg border border-zinc-800 p-5 text-sm text-zinc-400">
            Belum ada project yang ditambahkan.
          </p>
        )}

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,32rem),1fr))] gap-4">
          {projects.map((project) => (
            <ProjectShowcaseCard
              key={project.id}
              project={project}
              onDelete={() => handleDelete(project.id)}
              isDeleting={deletingId === project.id}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
export default AdminProjects
