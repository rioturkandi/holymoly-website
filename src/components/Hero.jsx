
import heroImage from '../assets/images/hero-logo2.jpeg'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function Hero({ content, isLoading = false, hasError = false }) {
  const [isContactHovered, setIsContactHovered] = useState(false)
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const [imageSrc, setImageSrc] = useState(null)
  const [isImageReady, setIsImageReady] = useState(false)

  const ctaRef = useRef(null)
  const exploreRef = useRef(null)
  const contactRef = useRef(null)

  // Mengatur posisi pill berdasarkan tombol yang sedang dituju.
  const movePill = (button) => {
    if (!button) return

    setPillStyle({
      left: button.offsetLeft,
      width: button.offsetWidth,
    })
  }

  // Mengatur posisi awal pill dan menyesuaikannya saat ukuran layar berubah.
  useEffect(() => {
    const updatePill = () => movePill(exploreRef.current)

    updatePill()
    window.addEventListener('resize', updatePill)

    return () => window.removeEventListener('resize', updatePill)
  }, [])
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


  // Memuat gambar hanya setelah data Hero selesai diterima.
  useEffect(() => {
    if (isLoading || hasError) return

    let cancelled = false
    let frameId

    setIsImageReady(false)
    setImageSrc(null)

    const loadImage = (src) => {
      const image = new Image()

      image.onload = () => {
        if (!cancelled) {
          setImageSrc(src)
          frameId = requestAnimationFrame(() => {
            if (!cancelled) setIsImageReady(true)
          })
        }
      }

      image.onerror = () => {
        if (src !== heroImage) {
          loadImage(heroImage)
        } else if (!cancelled) {
          setIsImageReady(true)
        }
      }

      image.src = src
    }

    loadImage(backgroundImage)

    return () => {
      cancelled = true
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [backgroundImage, isLoading, hasError])

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#100C08] pb-20 pt-8 md:pt-[120px]"
    >
      {/* Hero image: memenuhi area Hero tanpa mengubah proporsi gambar */}
      {!hasError && imageSrc && (
        <img
          src={imageSrc}
          alt="HOLYMOLY automotive"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${isImageReady ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Background overlay */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Skeleton selama gambar Hero disiapkan */}
      {!hasError && (
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 transition-opacity duration-700 ${isImageReady ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          <div className="mx-auto h-3 w-48 animate-pulse rounded bg-[#E5E7EB]/20" />
        <div className="mx-auto mt-7 h-12 max-w-lg animate-pulse rounded bg-[#E5E7EB]/20 sm:h-16" />
        <div className="mx-auto mt-6 h-12 max-w-md animate-pulse rounded bg-[#E5E7EB]/10" />
          <div className="mx-auto mt-8 h-10 w-40 animate-pulse rounded-full bg-[#E5E7EB]/20" />
        </div>
      )}

      {/* Hero content */}
      {!hasError && (
        <div
          aria-hidden={!isImageReady}
        className={`relative z-10 w-full page-container text-center transition-opacity duration-700 ${isImageReady ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div className="mx-auto max-w-2xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            {eyebrow}
          </p>

          <h1 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
            {title}
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-[#E5E7EB]/80 md:text-base">
            {description}
          </p>

          {/* Hero CTA */}
          <div
            ref={ctaRef}
            onMouseLeave={() => {
              setIsContactHovered(false)
              movePill(exploreRef.current)
            }}
            className="relative mt-8 inline-flex flex-wrap justify-center gap-5 sm:gap-4"
          >
            {/* Shared pill yang bergerak mengikuti tombol aktif */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 z-0 h-full rounded-full bg-white shadow-[0_6px_2px_rgba(0,0,0,0.65)] transition-all duration-1000 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              style={{
                left: pillStyle.left,
                width: pillStyle.width,
                transitionDelay: '100ms',
              }}
            />

            <Link
              ref={exploreRef}
              to={buttonUrl}
              onMouseEnter={() => {
                setIsContactHovered(false)
                movePill(exploreRef.current)
              }}
              style={{
                transitionDelay: '100ms',
              }}
              className={`relative z-10 inline-flex items-center rounded-full py-2 px-3 text-[10px] font-bold uppercase tracking-[0.08em] sm:px-5 sm:text-[11px] sm:tracking-[0.16em] transition-colors duration-1000 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                isContactHovered ? 'text-white' : 'text-black'
              }`}
            >
              <span>{buttonText}</span>
            </Link>

            <a
              ref={contactRef}
              href="https://wa.me/6282129841597?text=Halo%2C%20saya%20tertarik%20untuk%20mengetahui%20lebih%20lanjut%20tentang%20layanan%20HOLYMOLY."
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => {
                setIsContactHovered(true)
                movePill(contactRef.current)
              }}
              style={{
                transitionDelay: '100ms',
              }}
              className={`relative z-10 inline-flex items-center rounded-full py-2 px-3 text-[10px] font-bold uppercase tracking-[0.08em] sm:px-5 sm:text-[11px] sm:tracking-[0.16em] transition-colors duration-1000 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                isContactHovered ? 'text-black' : 'text-white'
              }`}
            >
              <span>Contact Us</span>
            </a>
          </div>
        </div>
        </div>
      )}

      {hasError && (
        <div className="relative z-10 px-6 text-center">
          <p className="text-sm text-[#E5E7EB]/70">
            Konten sementara tidak dapat dimuat. Silakan coba lagi.
          </p>
        </div>
      )}

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
