
import { Link } from 'react-router-dom'
import projects from '../data/projects'

function Projects() {
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
          {projects.map((project, index) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group block"
            >
              {/* PROJECT IMAGE */}
              <div className="relative aspect-square overflow-hidden bg-neutral-900">
                <img
                  src={project.image}
                  alt={project.vehicle}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* PROJECT INFORMATION */}
              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                    Project / {String(index + 1).padStart(2, '0')}
                  </p>

                  <span className="text-xs text-neutral-500 transition-colors group-hover:text-white">
                    View Project ↗
                  </span>
                </div>

                <h2 className="mb-3 text-2xl font-bold uppercase text-white md:text-3xl">
                  {project.vehicle}
                </h2>

                <p className="max-w-xl text-sm leading-7 text-neutral-400">
                  {project.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

export default Projects
