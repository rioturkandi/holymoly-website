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

        if (isMounted) {
          setProjects(response.data || [])
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
    <main className="min-h-screen bg-[#080808] page-top-spacing pb-24 text-[#F2F2F2]">
      <div className="page-container">

        {/* PAGE INTRODUCTION */}
        <div className="mb-16 md:mb-20">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            Selected Works
          </p>

          <h1 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            Our<br />Projects.
          </h1>

          <p className="mt-8 max-w-xl text-sm leading-8 text-neutral-400 md:text-base">
            Every project has its own character and story.
            Explore the work and discover the details behind
            each automotive build.
          </p>
        </div>

        {/* PROJECT GALLERY */}
        {isLoading ? (
          <p className="text-sm text-neutral-500">
            Loading projects...
          </p>
        ) : error ? (
          <p className="text-sm text-red-400">
            {error}
          </p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No projects available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group block min-w-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-4 transition-colors hover:border-neutral-600"
              >
                {/* PROJECT TITLE */}
                <h2 className="mb-4 break-words text-xl font-bold uppercase text-white transition-colors group-hover:text-neutral-300 md:text-2xl">
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
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* PROJECT DESCRIPTION */}
                <div className="mt-4">
                  <p className="w-full min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] line-clamp-3 text-sm leading-7 text-neutral-400">
                    {project.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-b border-neutral-800 pb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                      Project / {String(index + 1).padStart(2, '0')}
                    </p>

                    <span className="text-xs text-neutral-500 transition-colors group-hover:text-white">
                      View Project ↗
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
