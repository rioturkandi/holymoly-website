
import { Link } from 'react-router-dom'
import WorkshopGallery from '../components/WorkshopGallery'

function About() {
  return (
    <main className="bg-[#080808] text-[#F2F2F2]">

      {/* ABOUT INTRODUCTION */}
      <section className="page-top-spacing px-6 pb-16 md:pb-24">
        <div className="page-container">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            Get To Know Us
          </p>

          <h1 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            More Than
            <br />
            Just Cars.
          </h1>

          <div className="mt-10 grid gap-8 border-t border-neutral-800 pt-8 md:grid-cols-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
              About HOLYMOLY
            </p>

            <p className="max-w-xl text-sm leading-8 text-neutral-400 md:text-base">
              An introduction to HOLYMOLY, its identity, and the
              automotive culture behind the brand. This space will
              tell the story of who we are and what drives us.
            </p>
          </div>
        </div>
      </section>

      {/* OUR JOURNEY */}
      <section className="border-t border-neutral-800 section-spacing px-6">
        <div className="page-container grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              The Story
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
              Our Journey.
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="max-w-xl text-sm leading-8 text-neutral-400 md:text-base">
              Every brand has a story. This section will introduce
              the beginning of HOLYMOLY, its development, and the
              milestones that have shaped its journey.
            </p>
          </div>
        </div>
      </section>

      {/* VISION & PHILOSOPHY */}
      <section className="bg-[#191919] section-spacing px-6">
        <div className="page-container">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            What Drives Us
          </p>

          <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            Driven By<br />Our Philosophy.
          </h2>

          <div className="mt-14 grid gap-10 border-t border-neutral-700 pt-8 md:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
                01 / Vision
              </p>

              <h3 className="mb-4 text-2xl font-bold uppercase text-white">
                Our Vision
              </h3>

              <p className="max-w-md text-sm leading-8 text-neutral-400">
                The long-term direction and aspirations of
                HOLYMOLY will be presented here.
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
                02 / Philosophy
              </p>

              <h3 className="mb-4 text-2xl font-bold uppercase text-white">
                Our Philosophy
              </h3>

              <p className="max-w-md text-sm leading-8 text-neutral-400">
                The values, principles, and approach that define
                the character of HOLYMOLY will be presented here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKSHOP GALLERY */}
      <WorkshopGallery />

      {/* ABOUT PAGE CTA */}
      <section className="border-t border-neutral-800 section-spacing px-6">
        <div className="page-container flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Discover More
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
              Explore<br />Our Projects.
            </h2>
          </div>

          <Link
            to="/projects"
            className="w-fit border border-neutral-600 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            View Projects
          </Link>
        </div>
      </section>

    </main>
  )
}

export default About
