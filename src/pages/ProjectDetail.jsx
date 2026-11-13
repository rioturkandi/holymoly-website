import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../services/api'

function ProjectDetail() {
  const { id } = useParams()

  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)

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
          setProject(selectedProject)
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message || 'Failed to load project.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    setIsLoading(true)
    setProject(null)
    setError('')
    setSelectedImage(null)

    loadProject()

    return () => {
      isMounted = false
    }
  }, [id])

  // Menutup lightbox ketika tombol Escape ditekan.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#100C08] page-top-spacing pb-24 text-[#F2F2F2]">
        <div className="page-container animate-pulse">
          <div className="mb-8">
            <div className="mb-5 h-3 w-28 rounded bg-[#E5E7EB]/20" />
            <div className="h-12 max-w-2xl rounded bg-[#E5E7EB]/20 sm:h-16" />
            <div className="mt-8 h-4 max-w-3xl rounded bg-[#E5E7EB]/10" />
            <div className="mt-3 h-4 max-w-2xl rounded bg-[#E5E7EB]/10" />
          </div>

          <div className="mx-auto mb-12 aspect-square max-w-3xl rounded-xl border border-white/10 bg-[#E5E7EB]/10" />

          <div className="mb-8 border-b border-neutral-800 pb-5">
            <div className="mb-3 h-3 w-36 rounded bg-[#E5E7EB]/20" />
            <div className="h-9 max-w-sm rounded bg-[#E5E7EB]/20" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4">
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
          <h1 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
            {error ? 'Unable To Load Project' : 'Project Not Found'}
          </h1>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}

          <Link
            to="/projects"
            className="group mt-6 inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] px-7 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
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
    <main className="min-h-screen bg-[#100C08] pb-24 pt-0 text-[#F2F2F2] page-top-spacing">
      <div className="page-container content-fade-in">

        {/* PROJECT INTRODUCTION */}
        <div className="mb-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            Project / {String(project.display_number).padStart(2, '0')}
          </p>

          <h1 className="max-w-5xl break-words text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
            {project.vehicle_name}
          </h1>

          <p className="mt-8 w-full max-w-4xl min-w-0 whitespace-pre-line break-words [overflow-wrap:anywhere] text-sm leading-8 text-[#E5E7EB]/80 md:text-base">
            {project.description}
          </p>
        </div>

        {/* COVER IMAGE */}
        {cover?.image_path && (
          <div className="mx-auto mb-12 max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
            <button
              type="button"
              onClick={() => setSelectedImage(cover.image_path)}
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
          <div className="mb-8 border-b border-neutral-800 pb-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              Visual Documentation
            </p>

            <h2 className="text-3xl font-bold uppercase leading-tight md:text-5xl text-[#E5E7EB]">
              Project Detail.
            </h2>
          </div>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4">
              {gallery.map((photo, index) => (
                <button
                  key={photo.id || photo.image_path}
                  type="button"
                  onClick={() => setSelectedImage(photo.image_path)}
                  className="relative block min-w-0 cursor-zoom-in overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
                  aria-label={`Enlarge project photo ${index + 1}`}
                >
                  <img
                    src={photo.image_path}
                    alt={`${project.vehicle_name} detail ${index + 1}`}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />

                  <span className="absolute bottom-4 right-4 bg-black/70 px-3 py-2 text-xs uppercase tracking-widest text-white">
                    View Photo +
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="border border-neutral-800 p-8 text-sm leading-7 text-neutral-500">
              Additional project photos will be displayed here.
            </p>
          )}
        </section>

        {/* NEXT PROJECTS */}
        <div className="mt-8 border-t border-neutral-800 pt-5">
          <Link
            to="/projects"
            className="group inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Explore More Projects
          </Link>
        </div>

      </div>

      {/* LIGHTBOX */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged project photo"
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-5"
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-6 top-6 z-10 inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Close ×
          </button>

          <div
            className="flex h-full w-full items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Enlarged project"
              className="max-h-[80vh] max-w-[90vw] rounded-sm object-contain"
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default ProjectDetail
