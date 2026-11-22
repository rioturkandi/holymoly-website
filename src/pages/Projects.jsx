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
    <main className="min-h-screen bg-[#100C08] !pt-10 md:!pt-[104px] lg:!pt-28 pb-24 text-[#F2F2F2]">
      <div className="page-container">

        {/* PAGE INTRODUCTION */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <p className="mb-4 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            OUR AUTOMOTIVE PROJECTS
          </p>

          <h1 className="text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:text-5xl md:text-6xl font-bold uppercase leading-tight text-[#E5E7EB]">
            Every Build<br />Has Its Own Identity.
          </h1>

          <p className="mt-3 sm:mt-4 lg:mt-5 max-w-xl text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:text-base sm:leading-8">
            Every car has a different story, and every build starts with a different idea. From the concept and design direction to the finishing details, each project takes its own path. Explore our projects and discover the thought and work behind every build.
          </p>
        </div>

        {/* PROJECT GALLERY */}
        {isLoading ? (
          <div
            aria-hidden="true"
            className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] p-3 min-[390px]:p-4"
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
            No projects to show at the moment. We're looking forward to sharing more of our work with you. Check back soon for new builds.
          </p>
        ) : (
          <div className="content-fade-in grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group block min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] p-3 min-[390px]:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
              >
                {/* PROJECT TITLE */}
                <h2 className="mb-3 min-[390px]:mb-4 break-words text-[14px] min-[360px]:text-[15px] min-[390px]:text-[16px] sm:text-xl md:text-2xl font-bold uppercase text-[#E5E7EB] transition-colors group-hover:text-[#E5E7EB]">
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
                  <p className="w-full min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] line-clamp-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:text-base sm:leading-8">
                    {project.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-b border-neutral-800 pb-4">
                    <p className="text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500">
                      Project / {String(index + 1).padStart(2, '0')}
                    </p>

                    <span className="inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] px-3 py-1.5 min-[360px]:px-5 min-[360px]:py-2 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors group-hover:border-white group-hover:bg-white/[0.06]">
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
