import { useEffect, useState } from 'react'
import { apiRequest } from '../../services/api'
import ImageCropEditor from '../../components/ImageCropEditor'

const emptyImages = ['', '', '']
const emptyCrops = [null, null, null]

function AdminWorkshop() {
  const [images, setImages] = useState(emptyImages)
  const [cropBlobs, setCropBlobs] = useState(emptyCrops)
  const [previews, setPreviews] = useState(emptyImages)
  const [cropSource, setCropSource] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isCropOpen, setIsCropOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!cropSource.startsWith('blob:')) return

    return () => URL.revokeObjectURL(cropSource)
  }, [cropSource])

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview)
        }
      })
    }
  }, [previews])

  async function fetchImages() {
    const response = await apiRequest('/api/admin/workshop/images', {
      auth: true,
    })

    return Array.from(
      { length: 3 },
      (_, index) => response.data?.[index] || ''
    )
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialImages() {
      try {
        const data = await fetchImages()

        if (isMounted) {
          setImages(data)
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

    loadInitialImages()

    return () => {
      isMounted = false
    }
  }, [])

  function handleImageSelect(file, index) {
    if (!file) return

    setError('')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Format gambar harus JPEG, PNG, atau WebP.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5 MB.')
      return
    }

    setSelectedIndex(index)
    setCropSource(URL.createObjectURL(file))
    setIsCropOpen(true)
  }

  function handleApplyCrop(blob) {
    if (selectedIndex === null) return

    setCropBlobs((current) =>
      current.map((item, index) =>
        index === selectedIndex ? blob : item
      )
    )

    setPreviews((current) =>
      current.map((item, index) =>
        index === selectedIndex ? URL.createObjectURL(blob) : item
      )
    )

    setIsCropOpen(false)
    setSelectedIndex(null)
  }

  function handleCancelCrop() {
    setIsCropOpen(false)
    setSelectedIndex(null)
  }

  function handleDeleteImage(index) {
    if (isSaving || isCropOpen) return

    const confirmed = window.confirm(
      `Hapus foto Workshop pada slot ${index + 1}? Perubahan akan diterapkan ke website setelah kamu menekan Save Workshop Photos.`
    )

    if (!confirmed) return

    setImages((current) =>
      current.map((image, itemIndex) =>
        itemIndex === index ? '' : image
      )
    )

    setCropBlobs((current) =>
      current.map((blob, itemIndex) =>
        itemIndex === index ? null : blob
      )
    )

    setPreviews((current) =>
      current.map((preview, itemIndex) =>
        itemIndex === index ? '' : preview
      )
    )

    setError('')
  }

  async function uploadImage(blob, index) {
    const file = new File(
      [blob],
      `workshop-photo-${index + 1}.webp`,
      { type: 'image/webp' }
    )

    const body = new FormData()
    body.append('image', file)

    const response = await apiRequest('/api/uploads/image', {
      method: 'POST',
      body,
      auth: true,
    })

    return response.data.path
  }

  async function handleSave() {
    setError('')

    const filledCount = images.filter(
      (image, index) => Boolean(image || cropBlobs[index])
    ).length

    if (filledCount !== 0 && filledCount !== 3) {
      setError(
        'Workshop hanya boleh disimpan dengan 0 atau tepat 3 foto.'
      )
      return
    }

    if (isCropOpen) {
      setError('Selesaikan crop foto terlebih dahulu.')
      return
    }

    setIsSaving(true)

    try {
      const savedImages = [...images]

      for (let index = 0; index < cropBlobs.length; index += 1) {
        if (cropBlobs[index]) {
          savedImages[index] = await uploadImage(cropBlobs[index], index)
        }
      }

      await apiRequest('/api/admin/workshop/images', {
        method: 'PUT',
        body: { images: filledCount === 0 ? [] : savedImages },
        auth: true,
      })

      setImages(savedImages)
      setCropBlobs(emptyCrops)
      setPreviews(emptyImages)
      window.alert(
        filledCount === 0
          ? 'Semua foto Workshop berhasil dihapus.'
          : 'Tiga foto Workshop berhasil di-upload dan disimpan.'
      )
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const filledCount = images.filter(
    (image, index) => Boolean(image || cropBlobs[index])
  ).length

  const isEmpty = filledCount === 0
  const isComplete = filledCount === 3
  const hasPartialImages = !isEmpty && !isComplete

  return (
    <section className="min-w-0">
      <div className="mb-6 min-[390px]:mb-8">
        <p className="text-[8px] uppercase tracking-[0.25em] text-neutral-400 min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs sm:tracking-[0.3em]">
          Workshop Gallery
        </p>

        <h1 className="mt-2 text-[28px] font-bold uppercase leading-tight text-[#E5E7EB] min-[360px]:text-[30px] min-[390px]:mt-3 min-[390px]:text-[34px] sm:text-5xl md:text-6xl">
          Workshop.
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-neutral-400 min-[360px]:text-[13px] min-[390px]:mt-3 min-[390px]:text-sm">
          Manage the three workshop photos displayed on the website.
        </p>
      </div>

      {error && (
        <p className="mb-4 break-words rounded border border-red-500/30 bg-red-500/10 p-3 text-xs leading-relaxed text-red-300 min-[390px]:mb-5 min-[390px]:text-sm">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-xs text-neutral-400 min-[390px]:text-sm">
          Loading workshop photos...
        </p>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-3 min-[390px]:gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {images.map((image, index) => {
            const currentPreview = previews[index] || image
            const hasPhoto = Boolean(currentPreview)

            return (
              <div
                key={index}
                className="admin-card min-w-0 p-3 min-[390px]:p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 min-[390px]:mb-4">
                  <h2 className="text-xs font-bold uppercase text-[#E5E7EB] min-[390px]:text-sm">
                    Photo {String(index + 1).padStart(2, '0')}
                  </h2>

                  <div className="flex min-w-0 flex-wrap items-center gap-2 min-[390px]:gap-3">
                    <span className="text-[10px] text-neutral-500 min-[390px]:text-xs">
                      16:9
                    </span>

                    <span
                      className={`text-[10px] font-semibold min-[390px]:text-xs ${
                        hasPhoto && !cropBlobs[index]
                          ? 'text-green-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {hasPhoto
                        ? cropBlobs[index]
                          ? 'Belum disimpan'
                          : '✓ Tersimpan'
                        : 'Empty Slot'}
                    </span>
                  </div>
                </div>

                <div className="aspect-[16/9] w-full overflow-hidden rounded border border-white/10 bg-[#100C08]">
                  {currentPreview ? (
                    <img
                      src={currentPreview}
                      alt={`Workshop photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-[11px] text-amber-400 min-[390px]:text-xs">
                      No photo selected
                    </div>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 min-[390px]:mt-4">
                  <label className="flex min-h-11 cursor-pointer items-center justify-center rounded border border-white/15 px-3 py-3 text-[11px] font-semibold uppercase tracking-wider transition hover:border-neutral-400 hover:text-neutral-200 min-[390px]:px-4 min-[390px]:text-xs">
                    {hasPhoto ? 'Replace Photo' : 'Choose Replacement'}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={isSaving || isCropOpen}
                      onChange={(event) => {
                        handleImageSelect(event.target.files?.[0], index)
                        event.target.value = ''
                      }}
                    />
                  </label>

                  {hasPhoto && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      disabled={isSaving || isCropOpen}
                      className="min-h-10 rounded border border-red-500/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-red-400 transition hover:border-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 min-[390px]:text-xs"
                    >
                      Delete Photo
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 min-[390px]:mt-5 min-[390px]:flex-row min-[390px]:items-center min-[390px]:justify-between">
        <p className="text-[11px] leading-relaxed text-neutral-500 min-[390px]:text-xs">
          {isEmpty
            ? 'All workshop photos will be removed from the public website.'
            : hasPartialImages
              ? `You have ${filledCount} photo(s). Fill all three slots or clear all photos before saving.`
              : 'All three workshop photo slots are ready.'}
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={
            isLoading ||
            isSaving ||
            isCropOpen ||
            hasPartialImages
          }
          className="min-h-11 w-full rounded bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-black transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 min-[390px]:w-auto min-[390px]:px-5 min-[390px]:py-2 min-[390px]:text-xs"
        >
          {isSaving ? 'Saving...' : 'Save Workshop Photos'}
        </button>
      </div>

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

export default AdminWorkshop
