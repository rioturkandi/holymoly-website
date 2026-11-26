import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../services/api'

function ProjectDetail() {
  const { id } = useParams()

  const [project, setProject] = useState(null)
  const [loadedProjectId, setLoadedProjectId] = useState(null)
  const isLoading = loadedProjectId !== id
  const [error, setError] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  // Menggabungkan cover dan foto detail menjadi satu urutan galeri.
  const lightboxImages = [
    project?.cover?.image_path,
    ...(Array.isArray(project?.gallery)
      ? project.gallery.map((photo) => photo.image_path)
      : []),
  ].filter(Boolean)

  // Menyimpan posisi awal sentuhan untuk mendeteksi gesture swipe.
  const touchStartX = useRef(null)

  // Mengambil data proyek berdasarkan ID dari database.
  useEffect(() => {
    let isMounted = true

    async function loadProject() {
      try {
        const response = await apiRequest('/api/projects')

        if (!response?.success || !Array.isArray(response?.data)) {
          throw new Error('Format respons API Projects tidak valid.')
        }

        const projects = response.data
        const selectedIndex = projects.findIndex(
          (item) => String(item.id) === String(id)
        )
        const selectedProject =
          selectedIndex >= 0
            ? { ...projects[selectedIndex], display_number: selectedIndex + 1 }
            : null

        if (isMounted) {
          setError('')
          setSelectedImageIndex(null)
          setProject(selectedProject)
        }
      } catch (error) {
        if (isMounted) {
          setSelectedImageIndex(null)
          setError(error.message || 'Failed to load project.')
        }
      } finally {
        if (isMounted) {
          setLoadedProjectId(id)
        }
      }
    }

    loadProject()

    return () => {
      isMounted = false
    }
  }, [id])

  // Mengatur keyboard untuk menutup dan berpindah foto.
  useEffect(() => {
    function handleKeyDown(event) {
      if (selectedImageIndex === null) return

      if (event.key === 'Escape') {
        setSelectedImageIndex(null)
      }

      if (lightboxImages.length > 1 && event.key === 'ArrowRight') {
        event.preventDefault()
        setSelectedImageIndex((current) =>
          (current + 1) % lightboxImages.length
        )
      }

      if (lightboxImages.length > 1 && event.key === 'ArrowLeft') {
        event.preventDefault()
        setSelectedImageIndex((current) =>
          (current - 1 + lightboxImages.length) % lightboxImages.length
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImageIndex, lightboxImages.length])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#100C08] !pt-10 md:!pt-[104px] lg:!pt-28 pb-24 text-[#F2F2F2]">
        <div className="page-container animate-pulse">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="mb-5 h-3 w-28 rounded bg-[#E5E7EB]/20" />
            <div className="h-12 max-w-2xl rounded bg-[#E5E7EB]/20 sm:h-16" />
            <div className="mt-8 h-4 max-w-3xl rounded bg-[#E5E7EB]/10" />
            <div className="mt-3 h-4 max-w-2xl rounded bg-[#E5E7EB]/10" />
          </div>

          <div className="mx-auto mb-8 sm:mb-10 md:mb-12 aspect-square max-w-3xl rounded-xl border border-white/10 bg-[#E5E7EB]/10" />

          <div className="mb-8 sm:mb-10 md:mb-12 border-b border-neutral-800 pb-5">
            <div className="mb-3 h-3 w-36 rounded bg-[#E5E7EB]/20" />
            <div className="h-9 max-w-sm rounded bg-[#E5E7EB]/20" />
          </div>

          <div className="grid grid-cols-2 gap-2 min-[390px]:gap-3 sm:grid-cols-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="aspect-square rounded-xl border border-white/10 bg-[#E5E7EB]/10"
              />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#100C08] px-6 text-white">
        <div className="text-center">
          <h1 className="text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:text-5xl md:text-6xl font-bold uppercase leading-tight text-[#E5E7EB]">
            {error ? 'Unable To Load Project' : 'Project Not Found'}
          </h1>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}

          <Link
            to="/projects"
            className="group mt-6 inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] px-4 py-2 min-[390px]:px-5 min-[390px]:py-2.5 text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Back To Projects
          </Link>
        </div>
      </main>
    )
  }

  const cover = project.cover
  const gallery = project.gallery || []

  return (
    <main className="min-h-screen bg-[#100C08] pb-24 !pt-10 md:!pt-[104px] lg:!pt-28 text-[#F2F2F2]">
      <div className="page-container content-fade-in">

        {/* PROJECT INTRODUCTION */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <p className="mb-4 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            Project / {String(project.display_number).padStart(2, '0')}
          </p>

          <h1 className="max-w-5xl break-words text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:text-5xl md:text-6xl font-bold uppercase leading-tight text-[#E5E7EB]">
            {project.vehicle_name}
          </h1>

          <p className="mt-3 sm:mt-4 lg:mt-5 w-full max-w-4xl min-w-0 whitespace-pre-line break-words [overflow-wrap:anywhere] text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:text-base sm:leading-8">
            {project.description}
          </p>
        </div>

        {/* COVER IMAGE */}
        {cover?.image_path && (
          <div className="mx-auto mb-8 sm:mb-10 md:mb-12 max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
            <button
              type="button"
              onClick={() => setSelectedImageIndex(0)}
              className="block w-full cursor-zoom-in"
              aria-label="Enlarge project cover photo"
            >
              <img
                src={cover.image_path}
                alt={project.vehicle_name}
                loading="lazy"
                style={{
                  objectPosition: `${cover.position_x ?? 50}% ${cover.position_y ?? 50}%`,
                }}
                className="aspect-square w-full object-cover"
              />
            </button>
          </div>
        )}

        {/* PROJECT DETAIL PHOTOS */}
        <section className="mb-0">
          <div className="mb-8 sm:mb-10 md:mb-12 border-b border-neutral-800 pb-5">
            <p className="mb-4 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              PROJECT DETAILS
            </p>

            <h2 className="text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:text-5xl md:text-6xl font-bold uppercase leading-tight text-[#E5E7EB]">
              The Details Behind the Build.
            </h2>

            <p className="mt-3 max-w-2xl text-xs min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:text-base sm:leading-8">
              Explore the details of this project through the photo gallery. Each image offers another view of the work, design, and finishing touches.
            </p>
          </div>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 min-[390px]:gap-3 sm:grid-cols-3 sm:gap-4">
              {gallery.map((photo, index) => (
                <button
                  key={photo.id || photo.image_path}
                  type="button"
                  onClick={() => setSelectedImageIndex(index + (cover?.image_path ? 1 : 0))}
                  className="relative block min-w-0 cursor-zoom-in overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
                  aria-label={`Enlarge project photo ${index + 1}`}
                >
                  <img
                    src={photo.image_path}
                    alt={`${project.vehicle_name} detail ${index + 1}`}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />

                  <span className="absolute bottom-2 right-2 min-[390px]:bottom-3 min-[390px]:right-3 sm:bottom-4 sm:right-4 bg-black/70 px-2 py-1.5 min-[390px]:px-3 min-[390px]:py-2 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs uppercase tracking-widest text-white">
                    View Photo +
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="border border-neutral-800 p-4 min-[390px]:p-6 sm:p-8 text-xs min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-neutral-500">
              Project photos are not available at the moment. Check back soon for updates.
            </p>
          )}
        </section>

        {/* NEXT PROJECTS */}
        <div className="mt-8 sm:mt-10 md:mt-12 border-t border-neutral-800 pt-5 sm:pt-6">
          <Link
            to="/projects"
            className="group inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] px-4 py-2 min-[390px]:px-5 min-[390px]:py-2.5 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Explore More Projects
          </Link>
        </div>

      </div>

      {/* LIGHTBOX */}
      {selectedImageIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged project photo"
          onClick={() => setSelectedImageIndex(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-5"
        >
          <button
            type="button"
            onClick={() => setSelectedImageIndex(null)}
            className="absolute right-3 top-3 z-20 inline-flex items-center rounded-full border border-white/30 bg-black/40 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white min-[390px]:right-4 min-[390px]:top-4 sm:right-6 sm:top-6 sm:px-6 sm:py-2.5 sm:text-xs"
            aria-label="Close enlarged photo"
          >
            Close ×
          </button>

          <div
            className="relative flex h-full w-full items-center justify-center touch-pan-y"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0].clientX
            }}
            onTouchEnd={(event) => {
              const startX = touchStartX.current
              touchStartX.current = null

              if (startX === null || lightboxImages.length < 2) return

              const deltaX = startX - event.changedTouches[0].clientX
              if (Math.abs(deltaX) < 50) return

              setSelectedImageIndex((current) =>
                deltaX > 0
                  ? (current + 1) % lightboxImages.length
                  : (current - 1 + lightboxImages.length) % lightboxImages.length
              )
            }}
            onTouchCancel={() => {
              touchStartX.current = null
            }}
          >
            {lightboxImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImageIndex((current) =>
                      (current - 1 + lightboxImages.length) % lightboxImages.length
                    )
                  }
                  aria-label="Previous project photo"
                  className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-2xl text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-3 sm:h-12 sm:w-12"
                >
                  &#8249;
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedImageIndex((current) =>
                      (current + 1) % lightboxImages.length
                    )
                  }
                  aria-label="Next project photo"
                  className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-2xl text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-3 sm:h-12 sm:w-12"
                >
                  &#8250;
                </button>
              </>
            )}

            <img
              src={lightboxImages[selectedImageIndex]}
              alt={`${project.vehicle_name} photo ${selectedImageIndex + 1}`}
              className="max-h-[75vh] max-w-[84vw] rounded-sm object-contain sm:max-h-[80vh] sm:max-w-[90vw]"
              draggable="false"
            />

            {lightboxImages.length > 1 && (
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-[10px] font-semibold tracking-widest text-white sm:bottom-5 sm:text-xs">
                {selectedImageIndex + 1} / {lightboxImages.length}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default ProjectDetail
