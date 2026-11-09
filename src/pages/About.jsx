
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'
import WorkshopGallery from '../components/WorkshopGallery'

function About() {
  const [aboutContent, setAboutContent] = useState([])

  useEffect(() => {
    let isMounted = true

    async function loadAboutContent() {
      try {
        const response = await apiRequest('/api/about')

        if (isMounted && Array.isArray(response.data)) {
          setAboutContent(response.data)
        }
      } catch (error) {
        console.error('Gagal mengambil konten About:', error.message)
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
    <main className="bg-[#080808] text-[#F2F2F2]">

      {/* ABOUT INTRODUCTION */}
      <section className="page-top-spacing px-6 pb-16 md:pb-24">
        <div className="page-container">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            {introduction.eyebrow}
          </p>

          <h1 className="whitespace-pre-line text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            {introduction.title}
          </h1>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <p className="min-w-0 max-w-xl [overflow-wrap:anywhere] text-sm leading-8 text-neutral-400 md:text-base">
              {introduction.description}
            </p>
          </div>
        </div>
      </section>

      {/* OUR JOURNEY */}
      <section className="border-t border-[#262626] section-spacing px-6">
        <div className="page-container grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              {journey.eyebrow}
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
              {journey.title}
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="min-w-0 max-w-xl [overflow-wrap:anywhere] text-sm leading-8 text-neutral-400 md:text-base">
              {journey.description}
            </p>
          </div>
        </div>
      </section>

      {/* VISION & PHILOSOPHY */}
      <section className="bg-[#191919] section-spacing px-6">
        <div className="page-container">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
                {vision.eyebrow}
              </p>

              <h3 className="mb-4 text-2xl font-bold uppercase text-white">
                {vision.title}
              </h3>

              <p className="min-w-0 max-w-md [overflow-wrap:anywhere] text-sm leading-8 text-neutral-400">
                {vision.description}
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
                {mission.eyebrow}
              </p>

              <h3 className="mb-4 text-2xl font-bold uppercase text-white">
                {mission.title}
              </h3>

              <p className="min-w-0 max-w-md [overflow-wrap:anywhere] text-sm leading-8 text-neutral-400">
                {mission.description}
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
                {philosophy.eyebrow}
              </p>

              <h3 className="mb-4 text-2xl font-bold uppercase text-white">
                {philosophy.title}
              </h3>

              <p className="min-w-0 max-w-md [overflow-wrap:anywhere] text-sm leading-8 text-neutral-400">
                {philosophy.description}
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
