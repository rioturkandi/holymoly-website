
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
    eyebrow: 'Get To Know Us',
    title: 'More Than\\nJust Cars.',
    description: 'An introduction to HOLYMOLY, its identity, and the automotive culture behind the brand. This space will tell the story of who we are and what drives us.',
  })

  const journey = getContent('journey', {
    eyebrow: 'The Story',
    title: 'Our Journey.',
    description: 'Every brand has a story. This section will introduce the beginning of HOLYMOLY, its development, and the milestones that have shaped its journey.',
  })

  const vision = getContent('vision', {
    eyebrow: '01 / Vision',
    title: 'Our Vision',
    description: 'The long-term direction and aspirations of HOLYMOLY will be presented here.',
  })

  const mission = getContent('mission', {
    eyebrow: '02 / Mission',
    title: 'Our Mission',
    description: 'The mission that guides HOLYMOLY in delivering its work and building its automotive culture will be presented here.',
  })

  const philosophy = getContent('philosophy', {
    eyebrow: '03 / Philosophy',
    title: 'Our Philosophy',
    description: 'The values, principles, and approach that define the character of HOLYMOLY will be presented here.',
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
          <section className="border-t border-[#262626] section-spacing">
            <div className="page-container grid gap-10 md:grid-cols-2">
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
              Konten About sementara tidak dapat dimuat.
            </p>
          </div>
        </section>
      ) : (
        <div className="content-fade-in">
      {/* ABOUT INTRODUCTION */}
      <section className="page-top-spacing lg:pt-28 pb-12 md:pb-12">
        <div className="page-container">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            {introduction.eyebrow}
          </p>

          <h1 className="whitespace-pre-line text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
            {introduction.title}
          </h1>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <p className="min-w-0 max-w-xl [overflow-wrap:anywhere] text-sm leading-8 text-[#E5E7EB]/80 md:text-base">
              {introduction.description}
            </p>
          </div>
        </div>
      </section>

      {/* OUR JOURNEY */}
      <section className="border-t border-[#262626] section-spacing">
        <div className="page-container grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              {journey.eyebrow}
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
              {journey.title}
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="min-w-0 max-w-xl [overflow-wrap:anywhere] text-sm leading-8 text-[#E5E7EB]/80 md:text-base">
              {journey.description}
            </p>
          </div>
        </div>
      </section>

      {/* VISION & PHILOSOPHY */}
      <section className="bg-[#191919] section-spacing">
        <div className="page-container">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#E5E7EB]/70">
                {vision.eyebrow}
              </p>

              <h3 className="mb-4 text-2xl font-bold uppercase text-[#E5E7EB]">
                {vision.title}
              </h3>

              <p className="min-w-0 max-w-md [overflow-wrap:anywhere] text-sm leading-8 text-[#E5E7EB]/80">
                {vision.description}
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#E5E7EB]/70">
                {mission.eyebrow}
              </p>

              <h3 className="mb-4 text-2xl font-bold uppercase text-[#E5E7EB]">
                {mission.title}
              </h3>

              <p className="min-w-0 max-w-md [overflow-wrap:anywhere] text-sm leading-8 text-[#E5E7EB]/80">
                {mission.description}
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#E5E7EB]/70">
                {philosophy.eyebrow}
              </p>

              <h3 className="mb-4 text-2xl font-bold uppercase text-[#E5E7EB]">
                {philosophy.title}
              </h3>

              <p className="min-w-0 max-w-md [overflow-wrap:anywhere] text-sm leading-8 text-[#E5E7EB]/80">
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
