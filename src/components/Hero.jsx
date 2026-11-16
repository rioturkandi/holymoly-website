
import heroImage from '../assets/images/hero-logo2.jpeg'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function HeroBackground({ src, onReady }) {
  const [imageSrc, setImageSrc] = useState(null)
  const [isImageReady, setIsImageReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let frameId

    const loadImage = (imageUrl) => {
      const image = new Image()

      image.onload = () => {
        if (!cancelled) {
          setImageSrc(imageUrl)

          frameId = requestAnimationFrame(() => {
            if (!cancelled) {
              setIsImageReady(true)
              onReady()
            }
          })
        }
      }

      image.onerror = () => {
        if (imageUrl !== heroImage) {
          loadImage(heroImage)
        } else if (!cancelled) {
          setIsImageReady(true)
          onReady()
        }
      }

      image.src = imageUrl
    }

    loadImage(src)

    return () => {
      cancelled = true
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [src, onReady])

  if (!imageSrc) return null

  return (
    <img
      src={imageSrc}
      alt="HOLYMOLY automotive"
      className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
        isImageReady ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}

function Hero({ content, isLoading = false, hasError = false }) {
  const [isContactHovered, setIsContactHovered] = useState(false)
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const [readyBackground, setReadyBackground] = useState(null)

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

  const backgroundKey = `${backgroundImage}:${isLoading}:${hasError}`
  const isImageReady = readyBackground === backgroundKey

  const handleBackgroundReady = useCallback(() => {
    setReadyBackground(backgroundKey)
  }, [backgroundKey])



  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#100C08] pb-20 pt-8 md:pt-[120px]"
    >
      {/* Hero image */}
      {!isLoading && !hasError && (
        <HeroBackground
          key={backgroundKey}
          src={backgroundImage}
          onReady={handleBackgroundReady}
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
        <div className="hero-copy mx-auto max-w-2xl">
          <p className="mb-4 px-1 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] font-bold uppercase leading-relaxed tracking-[0.18em] text-[#E5E7EB]/70 sm:mb-5 sm:text-xs sm:tracking-[0.3em]">
            {eyebrow}
          </p>

          <h1 className="text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] font-bold uppercase leading-[1.12] tracking-tight text-[#E5E7EB] sm:text-5xl md:text-6xl">
            {title}
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-[12px] min-[360px]:text-[13px] min-[390px]:text-[14px] leading-6 text-[#E5E7EB]/80 sm:mt-6 sm:text-sm sm:leading-7 md:text-base">
            {description}
          </p>

          {/* Hero CTA */}
          <div
            ref={ctaRef}
            onMouseLeave={() => {
              setIsContactHovered(false)
              movePill(exploreRef.current)
            }}
            className="hero-cta relative mt-7 inline-flex flex-wrap justify-center gap-2.5 sm:mt-8 sm:gap-4"
          >
            {/* Shared pill yang bergerak mengikuti tombol aktif */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 z-0 hidden h-full rounded-full bg-white sm:block shadow-[0_6px_2px_rgba(0,0,0,0.65)] transition-all duration-1000 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
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
              className={`relative z-10 inline-flex items-center rounded-full border border-transparent bg-white px-2 py-1 text-[7px] font-bold uppercase tracking-[0.04em] sm:bg-transparent sm:px-5 sm:text-[11px] sm:tracking-[0.16em] transition-colors duration-1000 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                isContactHovered ? 'text-white' : 'text-black'
              }`}
            >
              <span className="text-[7px] leading-none sm:text-[11px]">{buttonText}</span>
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
              className={`relative z-10 inline-flex items-center rounded-full border border-[#E5E7EB]/60 bg-[#100C08]/40 px-2 py-1 text-[7px] font-bold uppercase tracking-[0.04em] sm:border-transparent sm:bg-transparent sm:px-5 sm:text-[11px] sm:tracking-[0.16em] transition-colors duration-1000 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                isContactHovered ? 'text-black' : 'text-white'
              }`}
            >
              <span className="text-[7px] leading-none sm:text-[11px]">Contact Us</span>
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
