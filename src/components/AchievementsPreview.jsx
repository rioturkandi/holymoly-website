import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'

function AchievementsPreview() {
  const [latestAchievement, setLatestAchievement] = useState(null)
  const [latestMedia, setLatestMedia] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadLatestContent() {
      try {
        const [achievementResult, mediaResult] = await Promise.allSettled([
          apiRequest('/api/achievements'),
          apiRequest('/api/media-coverage'),
        ])

        if (!isMounted) return

        if (achievementResult.status === 'fulfilled') {
          const sortedAchievements = [
            ...(achievementResult.value.data || []),
          ].sort((a, b) => {
            const yearDifference =
              Number(b.achievement_year) - Number(a.achievement_year)

            return yearDifference || Number(b.id) - Number(a.id)
          })

          setLatestAchievement(sortedAchievements[0] || null)
        }

        if (mediaResult.status === 'fulfilled') {
          const sortedMedia = [
            ...(mediaResult.value.data || []),
          ].sort((a, b) =>
            String(b.publication_date).localeCompare(
              String(a.publication_date)
            )
          )

          setLatestMedia(sortedMedia[0] || null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLatestContent()

    return () => {
      isMounted = false
    }
  }, [])

  function formatPublicationDate(value) {
    const dateValue = String(value || '').slice(0, 10)
    const [year, month, day] = dateValue.split('-').map(Number)

    if (!year || !month || !day) return dateValue

    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, day))
  }

  return (
    <section className="bg-[#191919] section-spacing">
      <div className="page-container">
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              Recognition
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
              Beyond The
              <br />
              Build.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-8 text-[#E5E7EB]/80 md:text-base">
            A dedicated space for achievements, recognition, and stories
            featuring HOLYMOLY.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {/* LATEST AWARD */}
          <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
            <div className="border-b border-neutral-700 p-5 md:p-6">
              <p className="text-sm font-bold tracking-widest text-neutral-500">
                / 01
              </p>

              <h3 className="mt-3 text-2xl font-bold uppercase text-[#E5E7EB] md:text-3xl">
                Awards & Recognition
              </h3>
            </div>

            {isLoading ? (
              <p className="p-7 text-sm text-neutral-500">
                Loading latest achievement...
              </p>
            ) : latestAchievement ? (
              <>
                <div className="mt-4 px-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-[4/3] overflow-hidden rounded-lg border border-neutral-700 bg-[#101010]">
                      {latestAchievement.trophy_image_path && (
                        <img
                          src={latestAchievement.trophy_image_path}
                          alt={`${latestAchievement.title} trophy`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>

                    <div className="aspect-[4/3] overflow-hidden rounded-lg border border-neutral-700 bg-[#101010]">
                      {latestAchievement.vehicle_image_path && (
                        <img
                          src={latestAchievement.vehicle_image_path}
                          alt={`${latestAchievement.title} winning car`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {latestAchievement.event_name} / {latestAchievement.achievement_year}
                  </p>

                  <h4 className="mt-2 text-lg font-bold uppercase text-[#E5E7EB]">
                    {latestAchievement.title}
                  </h4>


                  {latestAchievement.description && (
                    <p className="mt-3 line-clamp-5 w-full max-w-full break-words whitespace-pre-line text-sm leading-relaxed text-[#E5E7EB]/80">
                      {latestAchievement.description}
                    </p>
                  )}

                  <div className="mt-auto pt-5">
                  <Link
                    to="/achievements"
                    className="inline-flex w-fit items-center justify-center self-start rounded-full border border-white/30 bg-white/[0.02] px-3 py-1 text-center text-[8px] font-bold uppercase leading-none tracking-[0.16em] text-white transition-colors duration-500 hover:border-white hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    Explore Achievement
                  </Link>
                  </div>
                </div>
              </>
            ) : (
              <p className="p-7 text-sm text-neutral-500">
                No achievements available yet.
              </p>
            )}
          </article>

          {/* LATEST MEDIA COVERAGE */}
          <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
            <div className="border-b border-neutral-700 p-5 md:p-6">
              <p className="text-sm font-bold tracking-widest text-neutral-500">
                / 02
              </p>

              <h3 className="mt-3 text-2xl font-bold uppercase text-[#E5E7EB] md:text-3xl">
                Media Coverage
              </h3>
            </div>

            {isLoading ? (
              <p className="p-7 text-sm text-neutral-500">
                Loading latest media coverage...
              </p>
            ) : latestMedia ? (
              <>
                <div className="mt-4 px-4">
                  <div className="aspect-[16/9] overflow-hidden rounded-lg border border-neutral-700 bg-[#101010]">
                    <img
                      src={latestMedia.image_path}
                      alt={latestMedia.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {formatPublicationDate(latestMedia.publication_date)}
                  </p>

                  <h4 className="mt-2 text-lg font-bold uppercase text-[#E5E7EB]">
                    {latestMedia.title}
                  </h4>

                  <div className="mt-auto pt-5">
                  <a
                    href={latestMedia.article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center justify-center self-start rounded-full border border-white/30 bg-white/[0.02] px-3 py-1 text-center text-[8px] font-bold uppercase leading-none tracking-[0.16em] text-white transition-colors duration-500 hover:border-white hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    Read Article
                  </a>
                  </div>
                </div>
              </>
            ) : (
              <p className="p-7 text-sm text-neutral-500">
                No media coverage available yet.
              </p>
            )}
          </article>
        </div>

      </div>
    </section>
  )
}

export default AchievementsPreview
