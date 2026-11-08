
import { Link } from 'react-router-dom'

function WorkshopGallery() {
  const workshopImages = [
    {
      id: 1,
      src: '/images/workshop-01.jpg',
      label: 'Workshop Overview',
    },
    {
      id: 2,
      src: '/images/workshop-02.jpg',
      label: 'Work Area',
    },
    {
      id: 3,
      src: '/images/workshop-03.jpg',
      label: 'Behind The Build',
    },
  ]

  return (
    <section
      id="workshop"
      className="scroll-mt-24 bg-[#080808] section-spacing"
    >
      <div className="page-container">

        {/* WORKSHOP INTRODUCTION */}
        <div className="mb-12">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            The Space
          </p>

          <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            Inside Our<br />Workshop.
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-8 text-neutral-400 md:text-base">
            Take a closer look at the space behind HOLYMOLY.
            Discover the environment where automotive projects
            take shape.
          </p>
        </div>

        {/* WORKSHOP IMAGE GALLERY */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {workshopImages.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-[4/5] overflow-hidden bg-neutral-900"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-600">
                  {image.label}
                </span>
              </div>

              <img
                src={image.src}
                alt={image.label}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <p className="absolute bottom-6 left-6 text-sm font-bold uppercase tracking-widest text-white">
                {image.label}
              </p>
            </div>
          ))}
        </div>

        {/* WORKSHOP CTA */}
        <div className="mt-12 flex flex-col gap-5 border-t border-neutral-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg text-sm leading-8 text-neutral-400 md:text-base">
            Every project has its own story. Explore the work
            and discover more about HOLYMOLY.
          </p>

          <Link
            to="/projects"
            className="w-fit border border-neutral-600 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            Explore Projects
          </Link>
        </div>

      </div>
    </section>
  )
}

export default WorkshopGallery
