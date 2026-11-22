
import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'
import WorkshopGallery from '../components/WorkshopGallery'

function About() {
  const [aboutContent, setAboutContent] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadAboutContent() {
      try {
        const response = await apiRequest('/api/about')

        if (!response?.success || !Array.isArray(response?.data)) {
          throw new Error('Format respons API About tidak valid.')
        }

        if (isMounted) {
          setAboutContent(response.data)
        }
      } catch (error) {
        console.error('Gagal mengambil konten About:', error.message)

        if (isMounted) {
          setHasError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAboutContent()

    return () => {
      isMounted = false
    }
  }, [])

  function getContent(sectionKey, defaults) {
    const saved = aboutContent.find(
      (item) => item.section_key === sectionKey
    )

    return {
      eyebrow: saved?.eyebrow?.trim() || defaults.eyebrow,
      title: saved?.title?.trim() || defaults.title,
      description: saved?.description?.trim() || defaults.description,
    }
  }

  const introduction = getContent('introduction', {
    eyebrow: 'ABOUT US',
    title: 'This Is HOLYMOLY.',
    description: "We are driven by a passion for cars, creativity, and the art of customization. At HOLYMOLY, every project is a chance to bring fresh ideas to life and create something worth remembering. It's about exploring possibilities, enjoying the process, and putting our passion into every detail.",
  })

  const journey = getContent('journey', {
    eyebrow: 'OUR JOURNEY',
    title: 'The Story Behind HOLYMOLY.',
    description: 'Every journey has a beginning, and every experience helps shape what comes next. This section shares the story behind HOLYMOLY, from its beginnings to the experiences along the way. Get to know the moments and ideas that have helped shape the brand.',
  })

  const vision = getContent('vision', {
    eyebrow: 'OUR VISION',
    title: 'Our Vision.',
    description: 'We want to be part of an automotive community that brings people together through a shared passion for cars. We believe creativity and the exchange of ideas can inspire new possibilities. Our goal is to keep growing while contributing something meaningful to the automotive scene.',
  })

  const mission = getContent('mission', {
    eyebrow: 'OUR MISSION',
    title: 'Our Mission.',
    description: 'We aim to bring creative ideas to life through thoughtful customization and careful work. Every project deserves attention, from the first concept to the finishing details. We want every result to reflect the ideas and vision behind it.',
  })

  const philosophy = getContent('philosophy', {
    eyebrow: 'OUR PHILOSOPHY',
    title: 'Our Philosophy.',
    description: "We believe every car has its own character and every owner has a different vision. That's why we value good ideas, thoughtful details, and a creative approach to every project. For us, the process matters just as much as the final result.",
  })

  return (
    <main className="bg-[#100C08] pb-12 text-[#F2F2F2] md:pb-8">

      {isLoading ? (
        <div aria-hidden="true" className="animate-pulse">
          {/* INTRODUCTION SKELETON */}
          <section className="page-top-spacing lg:pt-28 pb-12 md:pb-12">
            <div className="page-container">
              <div className="h-3 w-28 rounded bg-[#E5E7EB]/20" />
              <div className="mt-6 h-12 max-w-sm rounded bg-[#E5E7EB]/20" />
              <div className="mt-10 h-4 max-w-xl rounded bg-[#E5E7EB]/10" />
            </div>
          </section>

          {/* JOURNEY SKELETON */}
          <section className="border-t border-[#262626] py-10 min-[390px]:py-12 sm:py-14 md:py-16">
            <div className="page-container grid gap-3 md:grid-cols-2 md:gap-12">
              <div>
                <div className="h-3 w-28 rounded bg-[#E5E7EB]/20" />
                <div className="mt-5 h-12 max-w-sm rounded bg-[#E5E7EB]/20" />
              </div>
              <div className="flex flex-col justify-end">
                <div className="h-4 max-w-xl rounded bg-[#E5E7EB]/10" />
                <div className="mt-3 h-4 max-w-md rounded bg-[#E5E7EB]/10" />
              </div>
            </div>
          </section>

          {/* VISION, MISSION & PHILOSOPHY SKELETON */}
          <section className="bg-[#191919] section-spacing">
            <div className="page-container grid gap-10 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item}>
                  <div className="h-3 w-24 rounded bg-[#E5E7EB]/20" />
                  <div className="mt-5 h-7 max-w-xs rounded bg-[#E5E7EB]/20" />
                  <div className="mt-5 h-4 max-w-md rounded bg-[#E5E7EB]/10" />
                  <div className="mt-3 h-4 max-w-sm rounded bg-[#E5E7EB]/10" />
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : hasError ? (
        <section className="page-top-spacing lg:pt-28 pb-12 md:pb-12">
          <div className="page-container">
            <p className="text-sm text-[#E5E7EB]/70">
              About content is temporarily unavailable.
            </p>
          </div>
        </section>
      ) : (
        <div className="content-fade-in">
      {/* ABOUT INTRODUCTION */}
      <section className="page-top-spacing !pt-10 md:!pt-[104px] lg:!pt-28 pb-10 min-[390px]:pb-12 sm:pb-14 md:pb-16">
        <div className="page-container">
          <p className="mb-4 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            {introduction.eyebrow}
          </p>

          <h1 className="whitespace-pre-line text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:text-5xl md:text-6xl font-bold uppercase leading-tight text-[#E5E7EB]">
            {introduction.title}
          </h1>

          <div className="mt-3 sm:mt-4 lg:mt-5">
            <p className="min-w-0 w-full max-w-3xl [overflow-wrap:anywhere] text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 sm:text-base sm:leading-8 text-[#E5E7EB]/80">
              {introduction.description}
            </p>
          </div>
        </div>
      </section>

      {/* OUR JOURNEY */}
      <section className="border-t border-[#262626] py-10 min-[390px]:py-12 sm:py-14 md:py-16">
        <div className="page-container grid gap-3 md:grid-cols-2 md:gap-12">
          <div>
            <p className="mb-4 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              {journey.eyebrow}
            </p>

            <h2 className="text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:text-5xl md:text-6xl font-bold uppercase leading-tight text-[#E5E7EB]">
              {journey.title}
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="min-w-0 w-full max-w-none [overflow-wrap:anywhere] text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:leading-8 md:text-base">
              {journey.description}
            </p>
          </div>
        </div>
      </section>

      {/* VISION & PHILOSOPHY */}
      <section className="bg-[#191919] py-10 min-[390px]:py-12 sm:py-14 md:py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-3 md:gap-8 lg:gap-10">
            <div>
              <p className="mb-3 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:mb-4 sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
                {vision.eyebrow}
              </p>

              <h3 className="mb-3 text-2xl font-bold uppercase text-[#E5E7EB]">
                {vision.title}
              </h3>

              <p className="min-w-0 max-w-md [overflow-wrap:anywhere] text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:leading-8">
                {vision.description}
              </p>
            </div>

            <div>
              <p className="mb-3 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:mb-4 sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
                {mission.eyebrow}
              </p>

              <h3 className="mb-3 text-2xl font-bold uppercase text-[#E5E7EB]">
                {mission.title}
              </h3>

              <p className="min-w-0 max-w-md [overflow-wrap:anywhere] text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:leading-8">
                {mission.description}
              </p>
            </div>

            <div>
              <p className="mb-3 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:mb-4 sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
                {philosophy.eyebrow}
              </p>

              <h3 className="mb-3 text-2xl font-bold uppercase text-[#E5E7EB]">
                {philosophy.title}
              </h3>

              <p className="min-w-0 max-w-md [overflow-wrap:anywhere] text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:leading-8">
                {philosophy.description}
              </p>
            </div>
          </div>
        </div>
      </section>

        </div>
      )}

      {/* WORKSHOP GALLERY */}
      <WorkshopGallery />

    </main>
  )
}

export default About
