
import { Link } from 'react-router-dom'

function AboutPreview() {
  return (
    <section className="bg-[#191919] section-spacing">
      <div className="page-container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center md:gap-12">

          {/* Left Content */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              About HOLYMOLY
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
              More Than
              <br />
              Just Cars.
            </h2>
          </div>

          {/* Right Content */}
          <div>
            <p className="max-w-xl text-sm leading-8 text-neutral-400 md:text-base">
              We see every vehicle as an opportunity to express character.
              Our approach to automotive customization is built around
              individuality, detail, and a distinct point of view.
            </p>

            <Link
              to="/about"
              className="mt-8 inline-block border border-neutral-500 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-white hover:bg-white hover:text-black"
            >
              Discover Our Story
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default AboutPreview
