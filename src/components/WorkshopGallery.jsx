import { useEffect, useState } from 'react'
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
      className="scroll-mt-24 bg-[#100C08] pt-10 min-[390px]:pt-12 sm:pt-14 md:pt-16 pb-10 min-[390px]:pb-12 sm:pb-14 md:pb-16"
    >
      <div className="page-container">

        {/* WORKSHOP INTRODUCTION */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <p className="mb-4 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            OUR WORKSHOP
          </p>

          <h2 className="text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:text-5xl md:text-6xl font-bold uppercase leading-tight text-[#E5E7EB]">
            Inside Our Workshop.
          </h2>

          <p className="mt-3 sm:mt-4 lg:mt-5 max-w-xl text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:text-base sm:leading-8">
            Every project needs a place where ideas can be explored and brought to life. Our workshop is where the tools, space, and hands-on process come together. Take a closer look at the environment behind HOLYMOLY's automotive projects.
          </p>
        </div>

        {/* WORKSHOP IMAGE GALLERY */}
        {isLoading ? (
          <div
            aria-hidden="true"
            className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 animate-pulse"
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
            Workshop images are temporarily unavailable.
          </p>
        ) : (
          <div className="content-fade-in grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
            {workshopImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
              >
                <img
                  src={image.image_path}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-900 ease-in-out group-hover:scale-[1.02]"
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
