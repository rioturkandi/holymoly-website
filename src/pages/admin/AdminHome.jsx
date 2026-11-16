import { useEffect, useState } from 'react'
import { apiRequest } from '../../services/api'
import ImageCropEditor from '../../components/ImageCropEditor'

function AdminHome() {

  const [heroForm, setHeroForm] = useState({
    eyebrow: '',
    title: '',
    description: '',
    button_text: '',
    button_url: '/projects',
    image_path: '',
    original_image_path: '',
  })

  const [cropSource, setCropSource] = useState('')
  const [isCropOpen, setIsCropOpen] = useState(false)
  const [pendingOriginalFile, setPendingOriginalFile] = useState(null)
  const [pendingCropBlob, setPendingCropBlob] = useState(null)
  const [originalImagePath, setOriginalImagePath] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingHero, setIsDeletingHero] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')

  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // State untuk mengelola form Services
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    image_path: '',
    is_active: true,
    display_order: 0,
  })
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false)
  const [isServiceUploading, setIsServiceUploading] = useState(false)
  const [isServiceSaving, setIsServiceSaving] = useState(false)
  const [updatingServiceId, setUpdatingServiceId] = useState(null)
  const [serviceMessage, setServiceMessage] = useState('')
  const [serviceError, setServiceError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadHomeData() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [heroResponse, servicesResponse] = await Promise.all([
          apiRequest('/api/admin/home/hero', { auth: true }),
          apiRequest('/api/admin/home/services', { auth: true }),
        ])

        if (isMounted) {

          setHeroForm({
            eyebrow: heroResponse.data?.eyebrow || '',
            title: heroResponse.data?.title || '',
            description: heroResponse.data?.description || '',
            button_text: heroResponse.data?.button_text || '',
            button_url: heroResponse.data?.button_url || '/projects',
            image_path: heroResponse.data?.image_path || '',
            original_image_path: heroResponse.data?.original_image_path || '',
          })

          const savedOriginal =
            heroResponse.data?.original_image_path ||
            heroResponse.data?.image_path ||
            ''

          setOriginalImagePath(savedOriginal)
          setCropSource(savedOriginal)
          setImagePreview(heroResponse.data?.image_path || '')

          setServices(servicesResponse.data)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadHomeData()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  useEffect(() => {
    if (!cropSource.startsWith('blob:')) return

    return () => {
      URL.revokeObjectURL(cropSource)
    }
  }, [cropSource])

  useEffect(() => {
    if (!imagePreview.startsWith('blob:')) return

    return () => {
      URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function resetServiceForm() {
    setServiceForm({
      title: '',
      description: '',
      image_path: '',
      is_active: true,
      display_order: services.length,
    })
    setEditingServiceId(null)
  }

  function handleAddService() {
    resetServiceForm()
    setServiceMessage('')
    setServiceError('')
    setIsServiceFormOpen(true)
  }

  function handleEditService(service) {
    setServiceForm({
      title: service.title || '',
      description: service.description || '',
      image_path: service.image_path || '',
      is_active: Boolean(service.is_active),
      display_order: Number(service.display_order),
    })
    setEditingServiceId(service.id)
    setServiceMessage('')
    setServiceError('')
    setIsServiceFormOpen(true)
  }

  function handleCancelServiceForm() {
    resetServiceForm()
    setIsServiceFormOpen(false)
    setServiceMessage('')
    setServiceError('')
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setFormMessage('')
    setFormError('')

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setFormError('Format gambar harus JPEG, PNG, atau WebP.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Ukuran gambar maksimal 5 MB.')
      event.target.value = ''
      return
    }

    setPendingOriginalFile(file)
    setPendingCropBlob(null)
    setCropSource(URL.createObjectURL(file))
    setIsCropOpen(true)
    event.target.value = ''
  }

  function handleApplyCrop(blob) {
    setPendingCropBlob(blob)
    setImagePreview(URL.createObjectURL(blob))
    setIsCropOpen(false)
    setFormMessage('Crop gambar siap disimpan.')
  }

  function handleCancelCrop() {
    setIsCropOpen(false)

    if (pendingOriginalFile) {
      setPendingOriginalFile(null)
      setPendingCropBlob(null)
      setCropSource(originalImagePath || heroForm.image_path || '')
      setImagePreview(heroForm.image_path || '')
    }
  }

  function handleOpenCropEditor() {
    const sourceImage = originalImagePath || heroForm.image_path

    if (!sourceImage) {
      setFormError('Pilih gambar terlebih dahulu.')
      return
    }

    setCropSource(sourceImage)
    setIsCropOpen(true)
    setFormMessage('')
    setFormError('')
  }

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

  async function handleServiceImageUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setServiceMessage('')
    setServiceError('')

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setServiceError('Format gambar harus JPEG, PNG, atau WebP.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setServiceError('Ukuran gambar maksimal 5 MB.')
      event.target.value = ''
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    setIsServiceUploading(true)

    try {
      const response = await apiRequest('/api/uploads/image', {
        method: 'POST',
        body: formData,
        auth: true,
      })

      setServiceForm((current) => ({
        ...current,
        image_path: response.data.path,
      }))

      setServiceMessage('Gambar layanan berhasil diunggah.')
    } catch (error) {
      setServiceError(error.message)
    } finally {
      setIsServiceUploading(false)
      event.target.value = ''
    }
  }

  async function handleSaveHero(event) {
    event.preventDefault()

    setFormMessage('')
    setFormError('')

    if (isUploading) {
      setFormError('Tunggu sampai upload gambar selesai.')
      return
    }

    if (isCropOpen) {
      setFormError('Terapkan atau batalkan crop gambar terlebih dahulu.')
      return
    }

    if (pendingOriginalFile && !pendingCropBlob) {
      setFormError('Terapkan crop gambar terlebih dahulu.')
      return
    }

    setIsSaving(true)

    try {
      let savedOriginalPath =
        originalImagePath || heroForm.image_path || null

      let savedImagePath = heroForm.image_path || null

      if (pendingOriginalFile || pendingCropBlob) {
        setIsUploading(true)

        if (pendingOriginalFile) {
          savedOriginalPath = await uploadImage(pendingOriginalFile)
        }

        if (pendingCropBlob) {
          const croppedFile = new File(
            [pendingCropBlob],
            'hero-crop.webp',
            { type: 'image/webp' }
          )

          savedImagePath = await uploadImage(croppedFile)
        }
      }

      const response = await apiRequest('/api/admin/home/hero', {
        method: 'PUT',
        body: {
          ...heroForm,
          image_path: savedImagePath,
          original_image_path: savedOriginalPath,
        },
        auth: true,
      })

      setHeroForm({
        eyebrow: response.data.eyebrow || '',
        title: response.data.title || '',
        description: response.data.description || '',
        button_text: response.data.button_text || '',
        button_url: response.data.button_url || '/projects',
        image_path: response.data.image_path || '',
        original_image_path: response.data.original_image_path || '',
      })

      const savedOriginal =
        response.data.original_image_path ||
        response.data.image_path ||
        ''

      setOriginalImagePath(savedOriginal)
      setCropSource(savedOriginal)
      setImagePreview(response.data.image_path || '')
      setPendingOriginalFile(null)
      setPendingCropBlob(null)

      setFormMessage('Konten berhasil disimpan dan ditampilkan.')
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIsUploading(false)
      setIsSaving(false)
    }
  }

  async function handleDeleteHeroImage() {
    const confirmed = window.confirm(
      'Hapus gambar Hero? Website akan menggunakan gambar default.'
    )

    if (!confirmed) return

    setIsDeletingHero(true)
    setFormMessage('')
    setFormError('')

    try {
      await apiRequest('/api/admin/home/hero/image', {
        method: 'DELETE',
        auth: true,
      })

      setHeroForm((current) => ({
        ...current,
        image_path: '',
        original_image_path: '',
      }))

      setOriginalImagePath('')
      setCropSource('')
      setImagePreview('')
      setPendingOriginalFile(null)
      setPendingCropBlob(null)
      setIsCropOpen(false)

      setFormMessage('Gambar Hero berhasil dihapus. Gambar default akan digunakan.')
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIsDeletingHero(false)
    }
  }

  async function handleDeleteHero() {
    const confirmed = window.confirm(
      'Hapus seluruh konten Hero? Website akan kembali menggunakan konten default.'
    )

    if (!confirmed) return

    setIsDeletingHero(true)
    setFormMessage('')
    setFormError('')

    try {
      await apiRequest('/api/admin/home/hero', {
        method: 'DELETE',
        auth: true,
      })

      setHeroForm({
        eyebrow: '',
        title: '',
        description: '',
        button_text: '',
        button_url: '/projects',
        image_path: '',
        original_image_path: '',
      })

      setOriginalImagePath('')
      setCropSource('')
      setImagePreview('')
      setPendingOriginalFile(null)
      setPendingCropBlob(null)
      setIsCropOpen(false)

      setFormMessage('Konten admin di hapus, Tampilan automatis konten default')
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIsDeletingHero(false)
    }
  }

  async function handleSaveService(event) {
    event.preventDefault()

    if (updatingServiceId !== null) return

    setServiceMessage('')
    setServiceError('')

    if (isServiceUploading) {
      setServiceError('Tunggu sampai upload gambar selesai.')
      return
    }

    if (!serviceForm.title.trim()) {
      setServiceError('Judul layanan wajib diisi.')
      return
    }

    setIsServiceSaving(true)

    try {
      const isEditing = editingServiceId !== null
      const endpoint = isEditing
        ? `/api/admin/home/services/${editingServiceId}`
        : '/api/admin/home/services'

      await apiRequest(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        body: serviceForm,
        auth: true,
      })

      setServiceMessage(
        isEditing
          ? 'Layanan berhasil diperbarui.'
          : 'Layanan berhasil ditambahkan.'
      )

      resetServiceForm()
      setIsServiceFormOpen(false)
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setServiceError(error.message)
    } finally {
      setIsServiceSaving(false)
    }
  }

  async function handleDeleteService(service) {
    if (
      updatingServiceId !== null ||
      isServiceSaving ||
      isServiceUploading
    ) {
      return
    }

    const confirmed = window.confirm(
      `Hapus layanan "${service.title}" secara permanen?`
    )

    if (!confirmed) return

    setUpdatingServiceId(service.id)
    setServiceMessage('')
    setServiceError('')

    try {
      await apiRequest(`/api/admin/home/services/${service.id}`, {
        method: 'DELETE',
        auth: true,
      })

      setServiceMessage('Layanan berhasil dihapus.')
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setServiceError(error.message)
    } finally {
      setUpdatingServiceId(null)
    }
  }

  function handleRefresh() {
    setRefreshKey((current) => current + 1)
  }

  return (
    <div>
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-[8px] uppercase tracking-[0.25em] text-neutral-500 min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs sm:tracking-[0.3em]">
            Content Management
          </p>
          <h1 className="mt-2 text-[28px] font-bold uppercase leading-tight text-[#E5E7EB] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:mt-3 sm:text-5xl md:text-6xl">
            Home.
          </h1>
          <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-neutral-400 min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base sm:mt-3">
            Manage your homepage hero and services content.
          </p>
        </div>

      </div>

      {isLoading && (
        <p className="mt-8 text-xs text-neutral-400 min-[390px]:mt-10 min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base">
          Loading Home content...
        </p>
      )}

      {!isLoading && errorMessage && (
        <div className="mt-8 border border-red-500/30 bg-red-500/5 p-4 min-[390px]:mt-10 min-[390px]:p-5">
          <p className="text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-red-400">
            Failed to load Home content.
          </p>
          <p className="mt-2 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-400">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 underline underline-offset-4 text-[11px] min-[360px]:text-xs min-[390px]:text-[13px] sm:text-sm min-h-11"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <div className="mt-8 space-y-8 min-[390px]:mt-10 min-[390px]:space-y-10">
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 min-[390px]:mb-4">
              <h2 className="text-lg font-semibold text-[#E5E7EB] min-[390px]:text-xl">Hero Section</h2>
              <span className="text-xs text-neutral-500">Homepage</span>
            </div>

            <form
              onSubmit={handleSaveHero}
              className="admin-card min-w-0 space-y-5 p-4 min-[390px]:space-y-6 min-[390px]:p-5 sm:p-6"
            >
              <div>
                <label className="mb-2 block text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-300">
                  Eyebrow
                </label>
                <input
                  type="text"
                  value={heroForm.eyebrow}
                  onChange={(event) => setHeroForm({
                    ...heroForm,
                    eyebrow: event.target.value,
                  })}
                  maxLength={150}
                  className="w-full border border-white/20 bg-[#100C08] px-4 py-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-300">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={heroForm.title}
                  onChange={(event) => setHeroForm({
                    ...heroForm,
                    title: event.target.value,
                  })}
                  maxLength={255}
                  className="w-full border border-white/20 bg-[#100C08] px-4 py-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-300">
                  Description
                </label>
                <textarea
                  value={heroForm.description}
                  onChange={(event) => setHeroForm({
                    ...heroForm,
                    description: event.target.value,
                  })}
                  rows={4}
                  className="w-full border border-white/20 bg-[#100C08] px-4 py-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base outline-none focus:border-white"
                />
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
                <div>
                  <label className="mb-2 block text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-300">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={heroForm.button_text}
                    onChange={(event) => setHeroForm({
                      ...heroForm,
                      button_text: event.target.value,
                    })}
                    maxLength={100}
                    className="w-full border border-white/20 bg-[#100C08] px-4 py-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-300">
                    Button URL
                  </label>
                  <input
                    type="text"
                    value={heroForm.button_url}
                    onChange={(event) => setHeroForm({
                      ...heroForm,
                      button_url: event.target.value,
                    })}
                    maxLength={500}
                    placeholder="/projects"
                    className="w-full border border-white/20 bg-[#100C08] px-4 py-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-300">
                  Hero Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={isSaving || isDeletingHero}
                  className="block w-full text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-400 file:mr-4 file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black disabled:opacity-50"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Format JPEG, PNG, atau WebP. Maksimal 5 MB.
                  Rasio crop 16:9.
                </p>

                {isUploading && (
                  <p className="mt-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-400">
                    Mengunggah gambar Hero...
                  </p>
                )}

                {(imagePreview || heroForm.image_path) && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs text-neutral-500">
                      Image Preview (16:9)
                    </p>

                    <div className="aspect-[16/9] w-full overflow-hidden border border-white/10 bg-[#100C08]">
                      <img
                        src={imagePreview || heroForm.image_path}
                        alt="Hero preview"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={handleOpenCropEditor}
                        disabled={isSaving || isUploading || isDeletingHero}
                        className="border border-white/30 px-4 py-2 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50 text-[11px] min-[360px]:text-xs min-[390px]:text-[13px] sm:text-sm min-h-11"
                      >
                        Adjust Crop
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteHeroImage}
                        disabled={isDeletingHero || isSaving || isUploading}
                        className="border border-red-500 px-4 py-2 text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 text-[11px] min-[360px]:text-xs min-[390px]:text-[13px] sm:text-sm min-h-11"
                      >
                        Delete Hero Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {formMessage && (
                <p className="text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-green-400">{formMessage}</p>
              )}

              {formError && (
                <p className="text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-red-400">{formError}</p>
              )}

              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  type="submit"
                  disabled={isSaving || isUploading || isDeletingHero}
                  className="border border-white bg-white px-6 py-3 font-semibold text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-50 text-[11px] min-[360px]:text-xs min-[390px]:text-[13px] sm:text-sm min-h-11"
                >
                  {isSaving ? 'Saving...' : 'Save Hero'}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteHero}
                  disabled={isSaving || isUploading || isDeletingHero}
                  className="border border-red-500 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 text-[11px] min-[360px]:text-xs min-[390px]:text-[13px] sm:text-sm min-h-11"
                >
                  {isDeletingHero ? 'Deleting...' : 'Delete Hero Content'}
                </button>
              </div>
            </form>
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#E5E7EB] min-[390px]:text-xl">Services</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {services.length} items
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddService}
                disabled={isServiceSaving || isServiceUploading || updatingServiceId !== null}
                className="border border-white px-5 py-3 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50 text-[11px] min-[360px]:text-xs min-[390px]:text-[13px] sm:text-sm min-h-11"
              >
                Add Service
              </button>
            </div>

            {serviceMessage && (
              <p className="mb-4 border border-green-500/30 bg-green-500/10 p-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-green-400">
                {serviceMessage}
              </p>
            )}

            {serviceError && (
              <p className="mb-4 border border-red-500/30 bg-red-500/10 p-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-red-400">
                {serviceError}
              </p>
            )}

            {isServiceFormOpen && (
              <form
                onSubmit={handleSaveService}
                className="admin-card mb-6 min-w-0 space-y-5 p-4 min-[390px]:mb-8 min-[390px]:p-5 sm:p-6"
              >
                <div>
                  <h3 className="text-base font-semibold text-[#E5E7EB] min-[390px]:text-lg sm:text-xl">
                    {editingServiceId !== null ? 'Edit Service' : 'Add New Service'}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    Isi informasi layanan di bawah ini.
                  </p>
                </div>

                <div>
                  <label htmlFor="service-title" className="mb-2 block text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base">
                    Service Title
                  </label>
                  <input
                    id="service-title"
                    type="text"
                    maxLength={255}
                    required
                    value={serviceForm.title}
                    onChange={(event) =>
                      setServiceForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    className="w-full border border-white/20 bg-black px-4 py-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base outline-none focus:border-white"
                    placeholder="Contoh: Custom Modification"
                  />
                </div>

                <div>
                  <label htmlFor="service-description" className="mb-2 block text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base">
                    Description
                  </label>
                  <textarea
                    id="service-description"
                    rows={4}
                    value={serviceForm.description}
                    onChange={(event) =>
                      setServiceForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="w-full border border-white/20 bg-black px-4 py-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base outline-none focus:border-white"
                    placeholder="Jelaskan layanan yang ditawarkan..."
                  />
                </div>

                <div>
                  <label htmlFor="service-image" className="mb-2 block text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base">
                    Service Image
                  </label>
                  <input
                    id="service-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleServiceImageUpload}
                    disabled={isServiceUploading}
                    className="block w-full text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-400 file:mr-4 file:border file:border-white/30 file:bg-transparent file:px-4 file:py-2 file:text-white"
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    Format JPEG, PNG, WebP. Maksimal 5 MB.
                  </p>

                  {isServiceUploading && (
                    <p className="mt-2 text-xs text-neutral-400">
                      Uploading image...
                    </p>
                  )}

                  {serviceForm.image_path && (
                    <div className="mt-4">
                      <img
                        src={serviceForm.image_path}
                        alt="Service preview"
                        className="aspect-[16/9] w-full max-w-sm object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={isServiceSaving || isServiceUploading || updatingServiceId !== null}
                    className="bg-white px-6 py-3 font-semibold text-black transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 text-[11px] min-[360px]:text-xs min-[390px]:text-[13px] sm:text-sm min-h-11"
                  >
                    {isServiceSaving ? 'Saving...' : 'Save Service'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelServiceForm}
                    disabled={isServiceSaving || isServiceUploading || updatingServiceId !== null}
                    className="border border-white/20 px-6 py-3 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50 text-[11px] min-[360px]:text-xs min-[390px]:text-[13px] sm:text-sm min-h-11"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {services.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 min-[390px]:gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="admin-card min-w-0 p-4 min-[390px]:p-5 sm:p-6"
                  >
                    {service.image_path && (
                      <img
                        src={service.image_path}
                        alt={service.title}
                        className="mb-4 aspect-[16/9] w-full object-cover"
                      />
                    )}

                    <h3 className="text-base font-semibold text-[#E5E7EB] min-[390px]:text-lg">{service.title}</h3>

                    <p className="mt-2 max-w-full break-words [overflow-wrap:anywhere] text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-400">
                      {service.description || 'No description'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 min-[390px]:mt-5 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => handleEditService(service)}
                        disabled={isServiceSaving || isServiceUploading || updatingServiceId !== null}
                        className="border border-white/30 px-4 py-2 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50 text-[11px] min-[360px]:text-xs min-[390px]:text-[13px] sm:text-sm min-h-11"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteService(service)}
                        disabled={isServiceSaving || isServiceUploading || updatingServiceId !== null}
                        className="border border-red-500/50 px-4 py-2 text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 text-[11px] min-[360px]:text-xs min-[390px]:text-[13px] sm:text-sm min-h-11"
                      >
                        {updatingServiceId === service.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-white/20 p-6">
                <p className="text-xs min-[360px]:text-[13px] min-[390px]:text-sm sm:text-base text-neutral-400">
                  No services have been created yet.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {isCropOpen && cropSource && (
        <ImageCropEditor
          src={cropSource}
          onApply={handleApplyCrop}
          onCancel={handleCancelCrop}
        />
      )}
    </div>
  )
}

export default AdminHome
