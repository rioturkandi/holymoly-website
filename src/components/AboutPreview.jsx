
import { Link } from 'react-router-dom'

function AboutPreview() {
  return (
    <section className="bg-[#191919] py-10 min-[390px]:py-12 sm:py-14 md:py-16">
      <div className="page-container">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-center md:gap-12">

          {/* Left Content */}
          <div>
            <p className="mb-3 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:mb-4 sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              ABOUT US
            </p>

            <h2 className="text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
              This Is
              <br />
              HOLYMOLY.
            </h2>
          </div>

          {/* Right Content */}
          <div>
            <p className="max-w-xl text-[12px] min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:leading-8 md:text-base">
              We are driven by a passion for cars, creativity, and the art of customization. At HOLYMOLY, every project is a chance to bring fresh ideas to life and create something worth remembering. It's about exploring possibilities, enjoying the process, and putting our passion into every detail.
            </p>

            <Link
              to="/about"
              className="group mt-6 min-[390px]:mt-8 inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] px-5 py-2 min-[390px]:px-7 min-[390px]:py-2.5 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span>Get to Know Us</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default AboutPreview
