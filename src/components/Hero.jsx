
import heroImage from '../assets/images/hero-logo2.jpeg'
import { Link } from 'react-router-dom'

function Hero({ content }) {
  // Menggunakan data database jika tersedia.
  // Jika belum tersedia, gunakan konten fallback.
  const eyebrow =
    content?.eyebrow || 'Automotive Culture & Customization'

  const title =
    content?.title || 'Built Different.'

  const description =
    content?.description ||
    'More than a vehicle. A statement of character. Discover a different perspective on automotive customization.'

  const buttonText =
    content?.button_text || 'Explore Projects'

  const buttonUrl =
    content?.button_url || '/projects'

  // Gunakan gambar upload dari database jika tersedia.
  // Jika belum ada, gunakan gambar lokal sebagai fallback.
  const backgroundImage =
    content?.image_path || heroImage

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-start overflow-hidden bg-[#080808] pb-20 pt-[104px] sm:pt-[112px] md:pt-[120px]"
    >
      {/* Hero image: memenuhi area Hero tanpa mengubah proporsi gambar */}
      <img
        src={backgroundImage}
        alt="HOLYMOLY automotive"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

      {/* Hero content */}
      <div className="relative z-10 page-container">
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">
            {eyebrow}
          </p>

          <h1 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            {title}
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-neutral-400 md:text-base">
            {description}
          </p>

          {/* Hero CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={buttonUrl}
              className="group inline-flex items-center rounded-full bg-white py-2.5 px-7 text-xs font-bold uppercase tracking-[0.16em] text-black shadow-[0_2px_12px_rgba(255,255,255,0.08)] transition-all duration-500 ease-out hover:bg-neutral-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.16)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span>{buttonText}</span>
            </Link>

            <a
              href="https://wa.me/6282129841597?text=Halo%2C%20saya%20tertarik%20untuk%20mengetahui%20lebih%20lanjut%20tentang%20layanan%20HOLYMOLY."
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center rounded-full border border-white/30 bg-white/[0.02] py-2.5 px-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span>Contact Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom right information */}
      <div className="absolute inset-x-0 bottom-8 page-container hidden text-right md:block">
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
