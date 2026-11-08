
import heroImage from '../assets/images/hero-logo2.jpeg'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-start overflow-hidden bg-[#080808] bg-no-repeat px-6 pb-20 pt-[104px] sm:pt-[112px] md:pt-[120px]"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: '150% auto',
        backgroundPosition: '100% 50%',
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">
            Automotive Culture & Customization
          </p>

          <h1 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            Built
            <br />
            Different.
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-neutral-400 md:text-base">
            More than a vehicle. A statement of character.
            Discover a different perspective on automotive customization.
          </p>

          {/* Hero CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/projects"
              className="bg-white px-7 py-4 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-neutral-300"
            >
              Explore Projects
            </Link>

            <a
              href="https://wa.me/6282129841597?text=Halo%2C%20saya%20tertarik%20untuk%20mengetahui%20lebih%20lanjut%20tentang%20layanan%20HOLYMOLY."
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white px-7 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Bottom right information */}
      <div className="absolute bottom-8 right-6 hidden text-right md:block">
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
          HOLYMOLY Automotive
        </p>

        <p className="mt-2 text-xs text-neutral-400">
          Built with character.
        </p>
      </div>
    </section>
  )
}

export default Hero
