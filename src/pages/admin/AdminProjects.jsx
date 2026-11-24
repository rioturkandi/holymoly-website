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

  // ID proyek yang sedang diedit; null berarti mode Create
  const [editingProjectId, setEditingProjectId] = useState(null)

  // Status upload, penyimpanan, dan penghapusan
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Pesan hasil proses
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Mengambil daftar proyek dari backend tanpa mengubah state.
  async function fetchProjects() {
    const response = await apiRequest('/api/admin/projects', {
      auth: true,
    })

    return response.data || []
  }

  // Memuat ulang daftar proyek setelah proses tambah atau hapus.
  async function loadProjects() {
    setIsLoading(true)
    setError('')

    try {
      const data = await fetchProjects()
      setProjects(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Memuat proyek pertama kali dan mencegah update setelah komponen dilepas.
  useEffect(() => {
    let isMounted = true

    async function loadInitialProjects() {
      try {
        const data = await fetchProjects()

        if (isMounted) {
          setProjects(data)
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialProjects()

    return () => {
      isMounted = false
    }
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

  // Mengisi form dengan data proyek yang dipilih untuk diedit
  function handleEdit(project) {
    setEditingProjectId(project.id)

    setForm({
      vehicle_name: project.vehicle_name || '',
      description: project.description || '',
      cover_image_path: project.cover?.image_path || '',
      cover_position_x: project.cover?.position_x ?? 50,
      cover_position_y: project.cover?.position_y ?? 50,
      detail_image_paths: (project.gallery || []).map(
        (photo) => photo.image_path
      ),
    })

    setError('')
    setMessage('')
  }

  // Membatalkan mode edit dan mengembalikan form ke kondisi awal
  function handleCancelEdit() {
    setEditingProjectId(null)
    setForm({
      vehicle_name: '',
      description: '',
      cover_image_path: '',
      cover_position_x: 50,
      cover_position_y: 50,
      detail_image_paths: [],
    })
    setError('')
    setMessage('')
  }

  // Menyimpan proyek baru atau memperbarui proyek yang sedang diedit
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

    const isEditing = editingProjectId !== null
    const endpoint = isEditing
      ? `/api/admin/projects/${editingProjectId}`
      : '/api/admin/projects'

    setIsSaving(true)

    try {
      await apiRequest(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        auth: true,
        body: form,
      })

      setEditingProjectId(null)
      setForm({
        vehicle_name: '',
        description: '',
        cover_image_path: '',
        cover_position_x: 50,
        cover_position_y: 50,
        detail_image_paths: [],
      })

      setMessage(
        isEditing
          ? 'Proyek berhasil diperbarui.'
          : 'Proyek berhasil ditambahkan.'
      )
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
    <div className="min-w-0 space-y-8">
      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-zinc-500 min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs sm:tracking-[0.3em]">
          Content Management
        </p>
        <h1 className="mt-2 text-[28px] font-bold uppercase leading-tight text-[#E5E7EB] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:mt-3 sm:text-5xl md:text-6xl">
          Projects
        </h1>
        <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-zinc-400 min-[360px]:text-[13px] min-[390px]:text-sm sm:mt-3">
          Tambahkan dan kelola project HOLYMOLY.
        </p>
      </div>

      <form onSubmit={handleSave} className="admin-card min-w-0 space-y-5 p-3 min-[390px]:space-y-6 min-[390px]:p-4 sm:p-6">
        <h2 className="text-base font-bold uppercase leading-snug text-[#E5E7EB] min-[390px]:text-lg sm:text-xl">
          {editingProjectId !== null ? 'Edit Project' : 'Add New Project'}
        </h2>

        <div>
          <label className="mb-2 block text-xs text-zinc-300 min-[360px]:text-[13px] min-[390px]:text-sm">Title</label>
          <input
            type="text"
            name="vehicle_name"
            value={form.vehicle_name}
            onChange={handleChange}
            maxLength={255}
            required
            className="min-h-11 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-xs text-white min-[360px]:text-[13px] min-[390px]:px-4 min-[390px]:py-3 min-[390px]:text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-zinc-300 min-[360px]:text-[13px] min-[390px]:text-sm">Cover Photo</label>
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
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-zinc-700 px-3 py-2.5 text-xs font-medium min-[360px]:text-[13px] min-[390px]:px-4 min-[390px]:text-sm text-white hover:bg-zinc-600 peer-focus-visible:ring-2 peer-focus-visible:ring-white ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
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
              <p className="text-[11px] leading-relaxed text-zinc-400 min-[390px]:text-xs">
                Geser foto di dalam kotak untuk mengatur bagian yang terlihat.
              </p>
              <p className="text-xs text-green-400 min-[390px]:text-sm">
                Cover photo berhasil diunggah.
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs text-zinc-300 min-[360px]:text-[13px] min-[390px]:text-sm">Detail Photos (3–8 photos)</label>
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
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-zinc-700 px-3 py-2.5 text-xs font-medium min-[360px]:text-[13px] min-[390px]:px-4 min-[390px]:text-sm text-white hover:bg-zinc-600 peer-focus-visible:ring-2 peer-focus-visible:ring-white ${isUploading || form.detail_image_paths.length >= 8 ? 'pointer-events-none opacity-50' : ''}`}
          >
            Choose File
          </label>
          <p className="mt-2 text-[11px] text-zinc-500 min-[390px]:text-xs">
            {form.detail_image_paths.length}/8 foto dipilih
          </p>
          <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 min-[390px]:gap-3 sm:grid-cols-3">
            {form.detail_image_paths.map((imagePath, index) => (
              <div
                key={imagePath}
                className="admin-card overflow-hidden"
              >
                <img
                  src={imagePath}
                  alt={`Detail Photo ${index + 1}`}
                  className="h-24 w-full object-cover min-[390px]:h-28 sm:h-32"
                />
                <div className="flex min-h-11 items-center justify-between gap-1 p-2 min-[390px]:gap-2">
                  <span className="text-[10px] text-zinc-300 min-[360px]:text-[11px] min-[390px]:text-xs">
                    Detail {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDetailPhoto(index)}
                    className="min-h-11 px-2 text-[11px] text-red-400 hover:text-red-300 min-[390px]:text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs text-zinc-300 min-[360px]:text-[13px] min-[390px]:text-sm">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={500}
            rows={5}
            required
            className="min-h-11 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-xs text-white min-[360px]:text-[13px] min-[390px]:px-4 min-[390px]:py-3 min-[390px]:text-sm"
          />
          <p className="mt-1 text-[11px] text-zinc-500 min-[390px]:text-xs">
            {form.description.length}/500 karakter
          </p>
        </div>

        {error && <p className="text-xs leading-relaxed text-red-400 min-[390px]:text-sm">{error}</p>}
        {message && <p className="text-xs text-green-400 min-[390px]:text-sm">{message}</p>}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="min-h-11 w-full rounded-lg bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-zinc-300 disabled:opacity-50 min-[390px]:text-sm sm:w-auto sm:px-6"
          >
            {isSaving
              ? 'Saving...'
              : editingProjectId !== null
                ? 'Update Project'
                : 'Save Project'}
          </button>

          {editingProjectId !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving || isUploading}
              className="min-h-11 w-full rounded-lg border border-zinc-600 px-5 py-3 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50 min-[390px]:text-sm sm:w-auto"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <section className="min-w-0 space-y-4">
        <h2 className="text-base font-bold uppercase leading-snug text-[#E5E7EB] min-[390px]:text-lg sm:text-xl">
          Existing Projects
        </h2>

        {isLoading && (
          <p className="text-xs text-zinc-400 min-[390px]:text-sm">Loading projects...</p>
        )}

        {!isLoading && projects.length === 0 && (
          <p className="rounded-lg border border-zinc-800 p-4 text-xs leading-relaxed text-zinc-400 min-[390px]:p-5 min-[390px]:text-sm">
            Belum ada project yang ditambahkan.
          </p>
        )}

        <div
          className={
            projects.length === 1
              ? 'flex min-w-0 justify-center'
              : 'grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 min-[390px]:gap-4'
          }
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className={projects.length === 1 ? 'w-full max-w-sm' : 'min-w-0'}
            >
              <ProjectShowcaseCard
                project={project}
                onEdit={() => handleEdit(project)}
                onDelete={() => handleDelete(project.id)}
                isDeleting={deletingId === project.id}
                variant="featured"
                compactFeatured
                clampDescription
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
export default AdminProjects
