import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'
import ProjectShowcaseCard from './ProjectShowcaseCard'

function FeaturedProjects() {
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
    <section className="bg-[#100C08] py-10 min-[390px]:py-12 sm:py-14 md:py-16">
      <div className="page-container">

        {/* Section Heading */}
        <div className="mb-8 flex flex-col justify-between gap-3 sm:mb-10 md:mb-12 md:flex-row md:items-end md:gap-12">
          <div>
            <p className="mb-4 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              OUR PROJECTS
            </p>

            <h2 className="text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
              Every Build
              <br />
              Has Its Own Identity.
            </h2>
          </div>

          <p className="max-w-sm text-[12px] min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:leading-8 md:text-base">
            Every project starts with an idea and takes shape through creativity and attention to detail. From the overall concept to the smallest details, each build follows its own direction. Take a closer look at the cars and the work behind every project.
          </p>
        </div>

        {/* Project Cards */}
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
            No projects to show at the moment. We're looking forward to sharing more of our work with you. Check back soon for new builds.
          </p>
        ) : (
          <div
            className={
              projects.length === 1
                ? 'flex justify-center'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
            }
          >
            {projects.slice(0, 4).map((project) => (
              <ProjectShowcaseCard
                key={project.id}
                project={project}
                linkTo={`/projects/${project.id}`}
                clampDescription
                variant="featured"
                compactFeatured={projects.length === 1}
              />
            ))}
          </div>
        )}

        {/* View All Projects */}
        <div className="mt-6 flex justify-center sm:mt-8 md:mt-12">
          <Link
            to="/projects"
            className="group inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] px-5 py-2 text-[8px] min-[360px]:text-[9px] min-[390px]:px-7 min-[390px]:py-2.5 min-[390px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span>View All Projects</span>
          </Link>
        </div>

      </div>
    </section>
  )
}

export default FeaturedProjects
