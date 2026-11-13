import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'

function WorkshopPreview() {
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
    <section className="bg-[#100C08] section-spacing">
      <div className="page-container">

        {/* Section Heading */}
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              Behind The Build
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
              Inside Our
              <br />
              Workshop.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-8 text-[#E5E7EB]/80 md:text-base">
            Take a closer look at the space where automotive ideas
            and customization projects come to life.
          </p>
        </div>

        {/* Workshop Image Grid */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
          {workshopImages.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
            >
              <img
                src={image.image_path}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-900 ease-in-out group-hover:scale-[1.02]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ))}
        </div>

        {/* About Workshop Link */}
        <div className="mt-10 md:mt-12">
          <Link
            to="/about#workshop"
            className="group inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] py-2.5 px-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span>Explore Our Workshop</span>
          </Link>
        </div>

      </div>
    </section>
  )
}

export default WorkshopPreview
