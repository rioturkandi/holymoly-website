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
  const [message, setMessage] = useState('')

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

  async function loadImages() {
    setIsLoading(true)
    setError('')

    try {
      const response = await apiRequest('/api/admin/workshop/images', {
        auth: true,
      })

      setImages(
        Array.from(
          { length: 3 },
          (_, index) => response.data?.[index] || ''
        )
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [])

  function handleImageSelect(file, index) {
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
    setMessage('Crop berhasil diterapkan. Klik Save untuk menyimpan.')
  }

  function handleCancelCrop() {
    setIsCropOpen(false)
    setSelectedIndex(null)
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
    setMessage('')

    if (images.some((image, index) => !image && !cropBlobs[index])) {
      setError('Workshop wajib memiliki tepat 3 foto.')
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
        body: { images: savedImages },
        auth: true,
      })

      setImages(savedImages)
      setCropBlobs(emptyCrops)
      setPreviews(emptyImages)
      window.alert('Foto Workshop berhasil di-upload dan disimpan.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Workshop Gallery
        </p>

        <h1 className="mt-3 text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
          Workshop.
        </h1>

        <p className="mt-3 text-sm text-neutral-400">
          Manage the three workshop photos displayed on the website.
        </p>
      </div>

      {error && (
        <p className="mb-5 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-neutral-400">Loading workshop photos...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="rounded-lg border border-white/10 bg-[#101010] p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase">
                  Photo {String(index + 1).padStart(2, '0')}
                </h2>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">16:9</span>
                  <span
                    className={`text-xs font-semibold ${
                      images[index] && !cropBlobs[index]
                        ? 'text-green-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {images[index] && !cropBlobs[index]
                      ? '✓ Tersimpan'
                      : 'Belum disimpan'}
                  </span>
                </div>
              </div>

              <div className="aspect-[16/9] overflow-hidden rounded border border-white/10 bg-[#080808]">
                {previews[index] || image ? (
                  <img
                    src={previews[index] || image}
                    alt={`Workshop photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-600">
                    No photo selected
                  </div>
                )}
              </div>

              <label className="mt-4 flex cursor-pointer items-center justify-center rounded border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition hover:border-neutral-400 hover:text-neutral-200">
                Choose Image

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isSaving}
                  onChange={(event) => {
                    handleImageSelect(event.target.files?.[0], index)
                    event.target.value = ''
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || isSaving || isCropOpen}
          className="rounded bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
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
