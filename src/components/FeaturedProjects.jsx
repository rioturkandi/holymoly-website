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
    <section className="bg-[#080808] section-spacing">
      <div className="page-container">

        {/* Section Heading */}
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Our Selected Works
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
              Featured
              <br />
              Projects.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-8 text-neutral-400 md:text-base">
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
            className="border border-neutral-600 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            View All Projects
          </Link>
        </div>

      </div>
    </section>
  )
}

export default FeaturedProjects
