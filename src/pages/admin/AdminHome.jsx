import { useEffect, useState } from 'react'
import { apiRequest } from '../../services/api'

function AdminHome() {
  const [hero, setHero] = useState(null)

  const [heroForm, setHeroForm] = useState({
    eyebrow: '',
    title: '',
    description: '',
    button_text: '',
    button_url: '/projects',
    image_path: '',
    is_active: true,
  })

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
          setHero(heroResponse.data)

          setHeroForm({
            eyebrow: heroResponse.data?.eyebrow || '',
            title: heroResponse.data?.title || '',
            description: heroResponse.data?.description || '',
            button_text: heroResponse.data?.button_text || '',
            button_url: heroResponse.data?.button_url || '/projects',
            image_path: heroResponse.data?.image_path || '',
            is_active: heroResponse.data
              ? Boolean(heroResponse.data.is_active)
              : true,
          })

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

  async function handleImageUpload(event) {
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

    const formData = new FormData()
    formData.append('image', file)

    setIsUploading(true)

    try {
      const response = await apiRequest('/api/uploads/image', {
        method: 'POST',
        body: formData,
        auth: true,
      })

      setHeroForm((current) => ({
        ...current,
        image_path: response.data.path,
      }))

      setFormMessage('Gambar berhasil diunggah.')
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
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

    setIsSaving(true)

    try {
      const response = await apiRequest('/api/admin/home/hero', {
        method: 'PUT',
        body: heroForm,
        auth: true,
      })

      setHero(response.data)
      setHeroForm({
        eyebrow: response.data.eyebrow || '',
        title: response.data.title || '',
        description: response.data.description || '',
        button_text: response.data.button_text || '',
        button_url: response.data.button_url || '/projects',
        image_path: response.data.image_path || '',
        is_active: Boolean(response.data.is_active),
      })

      setFormMessage('Hero berhasil disimpan.')
    } catch (error) {
      setFormError(error.message)
    } finally {
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

      setHero((current) => current
        ? { ...current, image_path: null }
        : current
      )
      setHeroForm((current) => ({
        ...current,
        image_path: '',
      }))

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

      setHero(null)
      setHeroForm({
        eyebrow: '',
        title: '',
        description: '',
        button_text: '',
        button_url: '/projects',
        image_path: '',
        is_active: true,
      })

      setFormMessage('Seluruh konten Hero berhasil dihapus. Konten default akan digunakan.')
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

    if (
      !Number.isSafeInteger(serviceForm.display_order) ||
      serviceForm.display_order < 0
    ) {
      setServiceError('Display Order harus berupa bilangan bulat minimal 0.')
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

  async function handleToggleServiceStatus(service) {
    if (
      updatingServiceId !== null ||
      isServiceSaving ||
      isServiceUploading
    ) {
      return
    }

    const isCurrentlyActive = Boolean(service.is_active)

    const confirmed = window.confirm(
      isCurrentlyActive
        ? `Nonaktifkan layanan "${service.title}"?`
        : `Aktifkan kembali layanan "${service.title}"?`
    )

    if (!confirmed) return

    setUpdatingServiceId(service.id)
    setServiceMessage('')
    setServiceError('')

    try {
      if (isCurrentlyActive) {
        await apiRequest(`/api/admin/home/services/${service.id}`, {
          method: 'DELETE',
          auth: true,
        })
      } else {
        await apiRequest(`/api/admin/home/services/${service.id}`, {
          method: 'PUT',
          body: {
            title: service.title,
            description: service.description || '',
            image_path: service.image_path || null,
            is_active: true,
            display_order: Number(service.display_order),
          },
          auth: true,
        })
      }

      setServiceMessage(
        isCurrentlyActive
          ? 'Layanan berhasil dinonaktifkan.'
          : 'Layanan berhasil diaktifkan.'
      )

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

  function renderStatus(isActive) {
    return isActive
      ? 'Active'
      : 'Inactive'
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Content Management
          </p>
          <h1 className="mt-3 text-4xl font-bold uppercase leading-tight sm:text-5xl">
            Home.
          </h1>
          <p className="mt-3 text-sm text-neutral-400">
            Manage your homepage hero and services content.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="border border-white/20 px-5 py-3 text-sm transition hover:bg-white hover:text-black disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {isLoading && (
        <p className="mt-10 text-sm text-neutral-400">
          Loading Home content...
        </p>
      )}

      {!isLoading && errorMessage && (
        <div className="mt-10 border border-red-500/30 bg-red-500/5 p-5">
          <p className="text-sm text-red-400">
            Failed to load Home content.
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 text-sm underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <div className="mt-10 space-y-10">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Hero Section</h2>
              <span className="text-xs text-neutral-500">Homepage</span>
            </div>

            <form
              onSubmit={handleSaveHero}
              className="space-y-6 border border-white/10 bg-[#101010] p-6"
            >
              <div>
                <label className="mb-2 block text-sm text-neutral-300">
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
                  className="w-full border border-white/20 bg-[#080808] px-4 py-3 text-sm outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
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
                  required
                  className="w-full border border-white/20 bg-[#080808] px-4 py-3 text-sm outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Description
                </label>
                <textarea
                  value={heroForm.description}
                  onChange={(event) => setHeroForm({
                    ...heroForm,
                    description: event.target.value,
                  })}
                  rows={4}
                  className="w-full border border-white/20 bg-[#080808] px-4 py-3 text-sm outline-none focus:border-white"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-neutral-300">
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
                    className="w-full border border-white/20 bg-[#080808] px-4 py-3 text-sm outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-neutral-300">
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
                    className="w-full border border-white/20 bg-[#080808] px-4 py-3 text-sm outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Hero Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploading || isSaving}
                  className="block w-full text-sm text-neutral-400 file:mr-4 file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black disabled:opacity-50"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Format JPEG, PNG, atau WebP. Maksimal 5 MB.
                </p>

                {isUploading && (
                  <p className="mt-3 text-sm text-neutral-400">
                    Mengunggah gambar...
                  </p>
                )}

                {heroForm.image_path && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs text-neutral-500">
                      Image Preview
                    </p>
                    <img
                      src={heroForm.image_path}
                      alt="Hero preview"
                      className="max-h-64 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleDeleteHeroImage}
                      disabled={isDeletingHero || isSaving || isUploading}
                      className="mt-3 border border-red-500 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete Hero Image
                    </button>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  checked={heroForm.is_active}
                  onChange={(event) => setHeroForm({
                    ...heroForm,
                    is_active: event.target.checked,
                  })}
                  className="h-4 w-4 accent-white"
                />
                Aktifkan Hero Section
              </label>

              {formMessage && (
                <p className="text-sm text-green-400">{formMessage}</p>
              )}

              {formError && (
                <p className="text-sm text-red-400">{formError}</p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSaving || isUploading || isDeletingHero}
                  className="border border-white bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-transparent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Hero'}
                </button>

                {hero && (
                  <button
                    type="button"
                    onClick={handleDeleteHero}
                    disabled={isSaving || isUploading || isDeletingHero}
                    className="border border-red-500 px-6 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeletingHero ? 'Deleting...' : 'Delete Hero Content'}
                  </button>
                )}
              </div>
            </form>
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Services</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {services.length} items
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddService}
                disabled={isServiceSaving || isServiceUploading || updatingServiceId !== null}
                className="border border-white px-5 py-3 text-sm transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Service
              </button>
            </div>

            {serviceMessage && (
              <p className="mb-4 border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                {serviceMessage}
              </p>
            )}

            {serviceError && (
              <p className="mb-4 border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {serviceError}
              </p>
            )}

            {isServiceFormOpen && (
              <form
                onSubmit={handleSaveService}
                className="mb-8 space-y-5 border border-white/20 bg-[#101010] p-6"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    {editingServiceId !== null ? 'Edit Service' : 'Add New Service'}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    Isi informasi layanan di bawah ini.
                  </p>
                </div>

                <div>
                  <label htmlFor="service-title" className="mb-2 block text-sm">
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
                    className="w-full border border-white/20 bg-black px-4 py-3 text-sm outline-none focus:border-white"
                    placeholder="Contoh: Custom Modification"
                  />
                </div>

                <div>
                  <label htmlFor="service-description" className="mb-2 block text-sm">
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
                    className="w-full border border-white/20 bg-black px-4 py-3 text-sm outline-none focus:border-white"
                    placeholder="Jelaskan layanan yang ditawarkan..."
                  />
                </div>

                <div>
                  <label htmlFor="service-image" className="mb-2 block text-sm">
                    Service Image
                  </label>
                  <input
                    id="service-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleServiceImageUpload}
                    disabled={isServiceUploading}
                    className="block w-full text-sm text-neutral-400 file:mr-4 file:border file:border-white/30 file:bg-transparent file:px-4 file:py-2 file:text-white"
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
                        className="h-48 w-full max-w-sm object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="service-order" className="mb-2 block text-sm">
                    Display Order
                  </label>
                  <input
                    id="service-order"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={serviceForm.display_order}
                    onChange={(event) =>
                      setServiceForm((current) => ({
                        ...current,
                        display_order: event.target.value === ''
                          ? ''
                          : Number(event.target.value),
                      }))
                    }
                    className="w-full border border-white/20 bg-black px-4 py-3 text-sm outline-none focus:border-white"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={serviceForm.is_active}
                    onChange={(event) =>
                      setServiceForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-white"
                  />
                  Active
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isServiceSaving || isServiceUploading || updatingServiceId !== null}
                    className="bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isServiceSaving ? 'Saving...' : 'Save Service'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelServiceForm}
                    disabled={isServiceSaving || isServiceUploading || updatingServiceId !== null}
                    className="border border-white/20 px-6 py-3 text-sm transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {services.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border border-white/10 bg-[#101010] p-6"
                  >
                    {service.image_path && (
                      <img
                        src={service.image_path}
                        alt={service.title}
                        className="mb-4 h-48 w-full object-cover"
                      />
                    )}

                    <h3 className="font-semibold">{service.title}</h3>

                    <p className="mt-2 text-sm text-neutral-400">
                      {service.description || 'No description'}
                    </p>

                    <div className="mt-5 flex justify-between text-xs text-neutral-500">
                      <span>Order: {service.display_order}</span>
                      <span>{renderStatus(service.is_active)}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleEditService(service)}
                        disabled={isServiceSaving || isServiceUploading || updatingServiceId !== null}
                        className="border border-white/30 px-4 py-2 text-xs transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleServiceStatus(service)}
                        disabled={isServiceSaving || isServiceUploading || updatingServiceId !== null}
                        className="border border-white/30 px-4 py-2 text-xs transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingServiceId === service.id
                          ? 'Updating...'
                          : service.is_active
                            ? 'Deactivate'
                            : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-white/20 p-6">
                <p className="text-sm text-neutral-400">
                  No services have been created yet.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminHome
