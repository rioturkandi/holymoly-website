
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
              className="group mt-8 inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] py-2.5 px-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span>Discover Our Story</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default AboutPreview
