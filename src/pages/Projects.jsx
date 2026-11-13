import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'

function Projects() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      try {
        const response = await apiRequest('/api/projects')

        if (!response?.success || !Array.isArray(response?.data)) {
          throw new Error('Format respons API Projects tidak valid.')
        }

        if (isMounted) {
          setProjects(response.data)
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message || 'Failed to load projects.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#100C08] page-top-spacing lg:pt-28 pb-24 text-[#F2F2F2]">
      <div className="page-container">

        {/* PAGE INTRODUCTION */}
        <div className="mb-8 md:mb-10">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            Selected Works
          </p>

          <h1 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
            Our<br />Projects.
          </h1>

          <p className="mt-8 max-w-xl text-sm leading-8 text-[#E5E7EB]/80 md:text-base">
            Every project has its own character and story.
            Explore the work and discover the details behind
            each automotive build.
          </p>
        </div>

        {/* PROJECT GALLERY */}
        {isLoading ? (
          <div
            aria-hidden="true"
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] p-4"
              >
                <div className="mb-4 h-7 w-3/4 rounded bg-[#E5E7EB]/20" />
                <div className="aspect-square bg-[#E5E7EB]/10" />
                <div className="mt-5 h-3 w-full rounded bg-[#E5E7EB]/10" />
                <div className="mt-3 h-3 w-2/3 rounded bg-[#E5E7EB]/10" />
                <div className="mt-6 border-b border-white/10 pb-4">
                  <div className="h-3 w-1/3 rounded bg-[#E5E7EB]/10" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-400">
            {error}
          </p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No projects available yet.
          </p>
        ) : (
          <div className="content-fade-in grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group block min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
              >
                {/* PROJECT TITLE */}
                <h2 className="mb-4 break-words text-xl font-bold uppercase text-[#E5E7EB] transition-colors group-hover:text-[#E5E7EB] md:text-2xl">
                  {project.vehicle_name}
                </h2>

                {/* PROJECT COVER */}
                {project.cover?.image_path && (
                  <div className="aspect-square overflow-hidden bg-neutral-900">
                    <img
                      src={project.cover.image_path}
                      alt={`${project.vehicle_name} Cover`}
                      loading="lazy"
                      style={{
                        objectPosition: `${project.cover.position_x ?? 50}% ${project.cover.position_y ?? 50}%`,
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* PROJECT DESCRIPTION */}
                <div className="mt-4">
                  <p className="w-full min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] line-clamp-3 text-sm leading-7 text-[#E5E7EB]/80">
                    {project.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-b border-neutral-800 pb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                      Project / {String(index + 1).padStart(2, '0')}
                    </p>

                    <span className="inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors group-hover:border-white group-hover:bg-white/[0.06]">
                      View Project
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Projects
