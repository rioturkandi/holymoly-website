
import { Link } from 'react-router-dom'

function WorkshopPreview() {
  const workshopImages = [
    { id: 1, label: 'Workshop Area 01' },
    { id: 2, label: 'Workshop Area 02' },
    { id: 3, label: 'Workshop Area 03' },
  ]

  return (
    <section className="bg-[#080808] section-spacing">
      <div className="page-container">

        {/* Section Heading */}
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Behind The Build
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
              Inside Our
              <br />
              Workshop.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-8 text-neutral-400 md:text-base">
            Take a closer look at the space where automotive ideas
            and customization projects come to life.
          </p>
        </div>

        {/* Workshop Image Grid */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
          {workshopImages.map((image) => (
            <div
              key={image.id}
              className="group relative flex aspect-[4/5] items-end overflow-hidden bg-neutral-900 p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              <p className="relative z-10 text-sm font-bold uppercase tracking-widest text-white">
                {image.label}
              </p>
            </div>
          ))}
        </div>

        {/* About Workshop Link */}
        <div className="mt-10 md:mt-12">
          <Link
            to="/about#workshop"
            className="inline-block border border-neutral-600 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            Explore Our Workshop
          </Link>
        </div>

      </div>
    </section>
  )
}

export default WorkshopPreview
