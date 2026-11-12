import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'

function WorkshopGallery() {
  const [workshopImages, setWorkshopImages] = useState([])

  useEffect(() => {
    let isMounted = true

    async function loadWorkshopImages() {
      try {
        const response = await apiRequest('/api/workshop')

        if (isMounted) {
          setWorkshopImages(response.data?.[0]?.images || [])
        }
      } catch (error) {
        console.error('Gagal mengambil foto Workshop:', error.message)
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
      className="scroll-mt-24 bg-[#080808] section-spacing pb-32 md:pb-12"
    >
      <div className="page-container">

        {/* WORKSHOP INTRODUCTION */}
        <div className="mb-12">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            The Space
          </p>

          <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            Inside Our<br />Workshop.
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-8 text-neutral-400 md:text-base">
            Take a closer look at the space behind HOLYMOLY.
            Discover the environment where automotive projects
            take shape.
          </p>
        </div>

        {/* WORKSHOP IMAGE GALLERY */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

      </div>
    </section>
  )
}

export default WorkshopGallery
