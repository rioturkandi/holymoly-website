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
    <section className="bg-[#100C08] section-spacing">
      <div className="page-container">

        {/* Section Heading */}
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              Our Selected Works
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
              Featured
              <br />
              Projects.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-8 text-[#E5E7EB]/80 md:text-base">
            A closer look at selected automotive projects.
            Every build has its own character and story.
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
            No projects available yet.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,32rem),1fr))] gap-4">
            {projects.slice(0, 4).map((project) => (
              <ProjectShowcaseCard
                key={project.id}
                project={project}
                linkTo={`/projects/${project.id}`}
                clampDescription
              />
            ))}
          </div>
        )}

        {/* View All Projects */}
        <div className="mt-10 flex justify-center md:mt-12">
          <Link
            to="/projects"
            className="group inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] py-2.5 px-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span>View All Projects</span>
          </Link>
        </div>

      </div>
    </section>
  )
}

export default FeaturedProjects
