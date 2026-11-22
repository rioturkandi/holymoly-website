import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'
import { getSafeHttpUrl } from '../utils/url'

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
    <section className="bg-[#191919] py-10 min-[390px]:py-12 sm:py-14 md:py-16">
      <div className="page-container">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:mb-10 md:mb-12 md:flex-row md:items-end md:gap-12">
          <div>
            <p className="mb-3 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:mb-4 sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              OUR HIGHLIGHTS
            </p>

            <h2 className="text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
              Every Achievement
              <br />
              Has a Story.
            </h2>
          </div>

          <p className="max-w-sm text-[12px] min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 sm:leading-8 md:text-base">
            Every event, achievement, and new experience becomes part of our journey. Behind each moment are the effort, preparation, and passion that keep us moving forward. Explore the highlights and milestones worth remembering.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
          {/* LATEST AWARD */}
          <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
            <div className="border-b border-neutral-700 p-3 min-[360px]:p-4 sm:p-5 md:p-6">
              <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-bold tracking-widest text-neutral-500">
                / 01
              </p>

              <h3 className="mt-2 sm:mt-3 text-[16px] min-[360px]:text-[17px] min-[390px]:text-lg sm:text-xl md:text-2xl font-bold uppercase text-[#E5E7EB]">
                Awards & Recognition
              </h3>
            </div>

            {isLoading ? (
              <p className="p-4 sm:p-5 md:p-6 text-xs sm:text-sm text-neutral-500">
                Loading latest achievement...
              </p>
            ) : latestAchievement ? (
              <>
                <div className="mt-3 px-3 min-[390px]:px-4 sm:mt-4">
                  <div className="grid grid-cols-2 gap-2 min-[390px]:gap-3">
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

                <div className="flex flex-1 flex-col p-4 sm:p-5 md:p-6">
                  <p className="text-[9px] min-[360px]:text-[10px] min-[390px]:text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {latestAchievement.event_name} / {latestAchievement.achievement_year}
                  </p>

                  <h4 className="mt-2 text-[14px] min-[360px]:text-[15px] min-[390px]:text-base sm:text-lg md:text-xl font-bold uppercase text-[#E5E7EB]">
                    {latestAchievement.title}
                  </h4>


                  {latestAchievement.description && (
                    <p className="mt-2 min-[390px]:mt-3 line-clamp-5 w-full max-w-full break-words whitespace-pre-line text-xs min-[390px]:text-[13px] sm:text-sm leading-relaxed text-[#E5E7EB]/80">
                      {latestAchievement.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4 sm:pt-5">
                  <Link
                    to="/achievements"
                    className="inline-flex w-fit items-center justify-center self-start rounded-full border border-white/30 bg-white/[0.02] px-3.5 py-1.5 min-[360px]:px-4 min-[390px]:px-5 text-center text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-[11px] font-bold uppercase leading-none tracking-[0.16em] text-white transition-colors duration-500 hover:border-white hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    Explore Achievements
                  </Link>
                  </div>
                </div>
              </>
            ) : (
              <p className="p-4 sm:p-5 md:p-6 text-xs sm:text-sm text-neutral-500">
                No achievements to show at the moment. Check back soon for updates.
              </p>
            )}
          </article>

          {/* LATEST MEDIA COVERAGE */}
          <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
            <div className="border-b border-neutral-700 p-3 min-[360px]:p-4 sm:p-5 md:p-6">
              <p className="text-[10px] min-[360px]:text-[11px] sm:text-xs font-bold tracking-widest text-neutral-500">
                / 02
              </p>

              <h3 className="mt-2 sm:mt-3 text-[16px] min-[360px]:text-[17px] min-[390px]:text-lg sm:text-xl md:text-2xl font-bold uppercase text-[#E5E7EB]">
                Media Coverage
              </h3>
            </div>

            {isLoading ? (
              <p className="p-4 sm:p-5 md:p-6 text-xs sm:text-sm text-neutral-500">
                Loading latest media coverage...
              </p>
            ) : latestMedia ? (
              <>
                <div className="mt-3 px-3 min-[390px]:px-4 sm:mt-4">
                  <div className="aspect-[16/9] overflow-hidden rounded-lg border border-neutral-700 bg-[#101010]">
                    <img
                      src={latestMedia.image_path}
                      alt={latestMedia.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5 md:p-6">
                  <p className="text-[9px] min-[360px]:text-[10px] min-[390px]:text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {formatPublicationDate(latestMedia.publication_date)}
                  </p>

                  <h4 className="mt-2 text-[14px] min-[360px]:text-[15px] min-[390px]:text-base sm:text-lg md:text-xl font-bold uppercase text-[#E5E7EB]">
                    {latestMedia.title}
                  </h4>

                  <div className="mt-auto pt-4 sm:pt-5">
                  <a
                    href={getSafeHttpUrl(latestMedia.article_url) || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center justify-center self-start rounded-full border border-white/30 bg-white/[0.02] px-3.5 py-1.5 min-[360px]:px-4 min-[390px]:px-5 text-center text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-[11px] font-bold uppercase leading-none tracking-[0.16em] text-white transition-colors duration-500 hover:border-white hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    Read Article
                  </a>
                  </div>
                </div>
              </>
            ) : (
              <p className="p-4 sm:p-5 md:p-6 text-xs sm:text-sm text-neutral-500">
                No media coverage to show at the moment. Check back soon for updates.
              </p>
            )}
          </article>
        </div>

      </div>
    </section>
  )
}

export default AchievementsPreview
