
import { Link } from 'react-router-dom'

const projects = [
  {
    id: 1,
    number: '01',
    title: 'Featured Project 01',
    category: 'Project Preview',
  },
  {
    id: 2,
    number: '02',
    title: 'Featured Project 02',
    category: 'Project Preview',
  },
  {
    id: 3,
    number: '03',
    title: 'Featured Project 03',
    category: 'Project Preview',
  },
]

function FeaturedProjects() {
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
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.id} className="group">
              {/* Image Placeholder */}
              <div className="relative flex aspect-[4/5] items-end overflow-hidden bg-neutral-900 p-6">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="relative z-10">
                  <p className="mb-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
                    {project.category}
                  </p>

                  <h3 className="text-2xl font-bold uppercase text-white">
                    {project.title}
                  </h3>
                </div>

                <span className="absolute right-6 top-6 text-sm text-neutral-400">
                  {project.number}
                </span>
              </div>
            </article>
          ))}
        </div>

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
