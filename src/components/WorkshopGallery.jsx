import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'

function WorkshopGallery() {
  const [workshopImages, setWorkshopImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadWorkshopImages() {
      try {
        const response = await apiRequest('/api/workshop')

        if (!response?.success || !Array.isArray(response?.data)) {
          throw new Error('Format respons API Workshop tidak valid.')
        }

        if (isMounted) {
          setWorkshopImages(response.data?.[0]?.images || [])
        }
      } catch (error) {
        console.error('Gagal mengambil foto Workshop:', error.message)

        if (isMounted) {
          setHasError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadWorkshopImages()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section
      id="workshop"
      className="scroll-mt-24 bg-[#100C08] section-spacing pb-32 md:pb-12"
    >
      <div className="page-container">

        {/* WORKSHOP INTRODUCTION */}
        <div className="mb-12">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            The Space
          </p>

          <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
            Inside Our<br />Workshop.
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-8 text-[#E5E7EB]/80 md:text-base">
            Take a closer look at the space behind HOLYMOLY.
            Discover the environment where automotive projects
            take shape.
          </p>
        </div>

        {/* WORKSHOP IMAGE GALLERY */}
        {isLoading ? (
          <div
            aria-hidden="true"
            className="grid grid-cols-1 gap-4 md:grid-cols-3 animate-pulse"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="aspect-[16/9] rounded-xl border border-white/10 bg-[#E5E7EB]/10"
              />
            ))}
          </div>
        ) : hasError ? (
          <p className="text-sm text-[#E5E7EB]/70">
            Foto Workshop sementara tidak dapat dimuat.
          </p>
        ) : (
          <div className="content-fade-in grid grid-cols-1 gap-4 md:grid-cols-3">
            {workshopImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
              >
                <img
                  src={image.image_path}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

export default WorkshopGallery
