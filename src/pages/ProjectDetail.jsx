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
        const selectedProject = (response.data || []).find(
          (item) => String(item.id) === String(id)
        )

        if (isMounted) {
          setProject(selectedProject || null)
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
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-neutral-500">
        Loading project...
      </main>
    )
  }

  if (error || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            {error ? 'Unable To Load Project' : 'Project Not Found'}
          </h1>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}

          <Link
            to="/projects"
            className="mt-6 inline-block border border-neutral-600 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black"
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
    <main className="min-h-screen bg-[#080808] pb-24 pt-0 text-[#F2F2F2] page-top-spacing">
      <div className="page-container">

        {/* BACK NAVIGATION */}
        <Link
          to="/projects"
          className="mb-10 inline-block text-xs font-bold uppercase tracking-widest text-neutral-500 transition-colors hover:text-white"
        >
          ← Back To Projects
        </Link>

        {/* PROJECT INTRODUCTION */}
        <div className="mb-12">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            Project / {String(project.id).padStart(2, '0')}
          </p>

          <h1 className="max-w-5xl break-words text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            {project.vehicle_name}
          </h1>

          <p className="mt-8 w-full max-w-4xl min-w-0 whitespace-pre-line break-words [overflow-wrap:anywhere] text-sm leading-8 text-neutral-400 md:text-base">
            {project.description}
          </p>
        </div>

        {/* COVER IMAGE */}
        {cover?.image_path && (
          <div className="mx-auto mb-20 max-w-3xl overflow-hidden bg-neutral-900">
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
        <section className="mb-20">
          <div className="mb-8 border-b border-neutral-800 pb-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Visual Documentation
            </p>

            <h2 className="text-3xl font-bold uppercase leading-tight md:text-5xl">
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
                  className="group relative block min-w-0 overflow-hidden bg-neutral-900"
                  aria-label={`Enlarge project photo ${index + 1}`}
                >
                  <img
                    src={photo.image_path}
                    alt={`${project.vehicle_name} detail ${index + 1}`}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
        <div className="mt-20 border-t border-neutral-800 pt-8">
          <Link
            to="/projects"
            className="inline-block border border-neutral-600 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
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
            className="absolute right-6 top-6 z-10 border border-neutral-600 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black"
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
