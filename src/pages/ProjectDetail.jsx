
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import projects from '../data/projects'

function ProjectDetail() {
  const { id } = useParams()
  const [selectedImage, setSelectedImage] = useState(null)

  const project = projects.find(
    (item) => item.id === Number(id)
  )

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

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            Project Not Found
          </h1>

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

          <h1 className="max-w-5xl text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            {project.vehicle}
          </h1>

          <p className="mt-8 max-w-2xl text-sm leading-8 text-neutral-400 md:text-base">
            {project.description}
          </p>
        </div>

        {/* COVER IMAGE */}
        <div className="mx-auto mb-20 max-w-3xl overflow-hidden bg-neutral-900">
          <button
            type="button"
            onClick={() => setSelectedImage(project.image)}
            className="block w-full cursor-zoom-in"
            aria-label="Enlarge project cover photo"
          >
            <img
              src={project.image}
              alt={project.vehicle}
              className="aspect-[4/3] max-h-[480px] w-full object-cover"
            />
          </button>
        </div>

        {/* PROJECT GALLERY */}
        <section className="mb-20">
          <div className="mb-8 border-b border-neutral-800 pb-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Visual Documentation
            </p>

            <h2 className="text-3xl font-bold uppercase leading-tight md:text-5xl">
              Project Gallery.
            </h2>
          </div>

          {project.gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4">
              {project.gallery.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setSelectedImage(photo)}
                  className="group relative block overflow-hidden bg-neutral-900"
                  aria-label={`Enlarge project photo ${index + 1}`}
                >
                  <img
                    src={photo}
                    alt={`${project.vehicle} detail ${index + 1}`}
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

        {/* PROJECT DESCRIPTION */}
        <section className="mb-20 grid gap-8 border-t border-neutral-800 pt-10 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Behind The Build
            </p>

            <h2 className="text-3xl font-bold uppercase leading-tight md:text-5xl">
              The Story<br />Behind It.
            </h2>
          </div>

          <p className="text-sm leading-8 text-neutral-400 md:text-base">
            {project.description}
          </p>
        </section>

        {/* SPEC SHEET */}
        <section className="border-t border-neutral-800 pt-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            Project Details
          </p>

          <h2 className="mb-8 text-3xl font-bold uppercase leading-tight md:text-5xl">
            Spec-Sheet.
          </h2>

          {project.specs.length > 0 ? (
            <div className="divide-y divide-neutral-800 border-y border-neutral-800">
              {project.specs.map((spec, index) => (
                <div
                  key={`${spec.category}-${index}`}
                  className="grid gap-2 py-5 md:grid-cols-2"
                >
                  <h3 className="text-sm font-bold uppercase text-white">
                    {spec.category}
                  </h3>

                  <p className="text-sm leading-7 text-neutral-400">
                    {spec.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="border border-neutral-800 p-8 text-sm leading-7 text-neutral-500">
              Project specifications will be updated here.
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
