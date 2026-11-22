
import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'
import { getSafeHttpUrl } from '../utils/url'

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

function Achievements() {
  const [achievements, setAchievements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [mediaCoverage, setMediaCoverage] = useState([])
  const [isMediaLoading, setIsMediaLoading] = useState(true)
  const [mediaError, setMediaError] = useState('')

  // Mengambil data penghargaan dari backend
  useEffect(() => {
    let isMounted = true

    async function loadAchievements() {
      try {
        const response = await apiRequest('/api/achievements')

        if (!response?.success || !Array.isArray(response?.data)) {
          throw new Error('Format respons API Achievements tidak valid.')
        }

        if (isMounted) {
          setAchievements(response.data)
        }
      } catch {
        if (isMounted) {
          setError('Gagal memuat data penghargaan. Silakan coba kembali.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    async function loadMediaCoverage() {
      try {
        const response = await apiRequest('/api/media-coverage')

        if (!response?.success || !Array.isArray(response?.data)) {
          throw new Error('Format respons API Media Coverage tidak valid.')
        }

        if (isMounted) {
          setMediaCoverage(response.data)
        }
      } catch {
        if (isMounted) {
          setMediaError('Gagal memuat Media Coverage. Silakan coba kembali.')
        }
      } finally {
        if (isMounted) {
          setIsMediaLoading(false)
        }
      }
    }

    loadAchievements()
    loadMediaCoverage()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#100C08] !pt-10 md:!pt-[104px] lg:!pt-28 pb-24 text-[#F2F2F2]">
      <div className="page-container">

        {/* PAGE INTRODUCTION */}
        <div>
          <p className="mb-3 sm:mb-4 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            OUR HIGHLIGHTS
          </p>

          <h1 className="mt-0 break-words text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:text-5xl md:text-6xl font-bold uppercase leading-tight text-[#E5E7EB]">
            Every Achievement<br />Has a Story.
          </h1>

          <p className="mt-3 sm:mt-4 lg:mt-5 max-w-xl text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 md:text-base md:leading-8">
            Every event, achievement, and new experience becomes part of our journey. Each moment represents the effort, preparation, and passion behind what we do. Take a look at the highlights that have made our journey worth sharing.
          </p>
        </div>

        {/* ACHIEVEMENTS CONTENT */}
        <section className="mt-8 sm:mt-10 md:mt-12">

          {isLoading && (
            <div aria-hidden="true" className="animate-pulse grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              {[1, 2].map((item) => (
                <div key={item} className="overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] p-4 min-[390px]:p-5 md:p-6">
                  <div className="grid grid-cols-2 gap-3 min-[390px]:gap-4 md:gap-5">
                    <div className="aspect-[4/3] rounded-lg bg-[#E5E7EB]/10" />
                    <div className="aspect-[4/3] rounded-lg bg-[#E5E7EB]/10" />
                  </div>
                  <div className="mt-6 h-3 w-2/3 rounded bg-[#E5E7EB]/20" />
                  <div className="mt-4 h-6 w-4/5 rounded bg-[#E5E7EB]/20" />
                  <div className="mt-5 h-3 w-full rounded bg-[#E5E7EB]/10" />
                  <div className="mt-3 h-3 w-3/4 rounded bg-[#E5E7EB]/10" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && error && (
            <p className="border border-red-500/20 bg-red-500/5 p-4 min-[390px]:p-5 sm:p-6 text-center text-xs min-[390px]:text-sm md:text-base text-red-400">
              {error}
            </p>
          )}

          {!isLoading && !error && achievements.length === 0 && (
            <div className="content-fade-in rounded-xl border border-white/10 bg-[#1b1b1b] px-4 py-10 min-[390px]:px-5 min-[390px]:py-12 sm:px-6 sm:py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
              <p className="text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                OUR HIGHLIGHTS
              </p>

              <h2 className="mt-3 sm:mt-4 text-base min-[390px]:text-lg md:text-xl font-bold uppercase text-[#E5E7EB]">
                No Achievements to Show Yet.
              </h2>

              <p className="mt-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-neutral-500 md:text-base md:leading-8">
                No achievements to show at the moment. There will be more moments to share along the way. Check back soon for updates.
              </p>
            </div>
          )}

          {!isLoading && !error && achievements.length > 0 && (
            <div className="content-fade-in grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              {achievements.map((achievement) => (
                <article
                  key={achievement.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
                >
                  {/* TROPHY AND WINNING CAR PHOTOS */}
                  <div className="mt-4 px-4 min-[390px]:mt-5 min-[390px]:px-5 md:mt-6 md:px-6">
                    <div className="grid grid-cols-2 gap-3 min-[390px]:gap-4 md:gap-5">
                      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-neutral-700 bg-[#101010]">
                        {achievement.trophy_image_path && (
                          <img
                            src={achievement.trophy_image_path}
                            alt={`Trophy ${achievement.title}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>

                      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-neutral-700 bg-[#101010]">
                        {achievement.vehicle_image_path && (
                          <img
                            src={achievement.vehicle_image_path}
                            alt={`Winning car ${achievement.title}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACHIEVEMENT INFORMATION */}
                  <div className="p-4 min-[390px]:p-5 md:p-6">
                    <p className="text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {achievement.event_name} / {achievement.achievement_year}
                    </p>

                    <h2 className="mt-2 text-base min-[390px]:text-lg font-bold uppercase leading-tight text-[#E5E7EB] md:text-xl">
                      {achievement.title}
                    </h2>

                    {achievement.description && (
                      <p className="mt-3 w-full max-w-full break-words whitespace-pre-line text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-[#E5E7EB]/80 md:text-base md:leading-8">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

        </section>

        {/* MEDIA COVERAGE CONTENT */}
        <section className="mt-10 sm:mt-12 md:mt-14 border-t border-white/10 pt-8 sm:pt-10 md:pt-12">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <p className="text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              FROM THE MEDIA
            </p>

            <h2 className="mt-3 sm:mt-4 break-words text-2xl min-[360px]:text-[26px] min-[390px]:text-[28px] sm:text-3xl md:text-4xl font-bold uppercase leading-tight text-[#E5E7EB]">
              Our Name Out There.
            </h2>

            <p className="mt-3 sm:mt-4 lg:mt-5 max-w-xl text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-neutral-400 md:text-base md:leading-8">
              See where HOLYMOLY and our automotive projects have been featured across the media.
            </p>
          </div>

          {isMediaLoading && (
            <div aria-hidden="true" className="animate-pulse grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              {[1, 2].map((item) => (
                <div key={item} className="overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] p-4 min-[390px]:p-5 md:p-6">
                  <div className="aspect-[16/9] rounded-lg bg-[#E5E7EB]/10" />
                  <div className="mt-6 h-3 w-1/3 rounded bg-[#E5E7EB]/20" />
                  <div className="mt-4 h-6 w-4/5 rounded bg-[#E5E7EB]/20" />
                  <div className="mt-6 h-8 w-28 rounded-full bg-[#E5E7EB]/10" />
                </div>
              ))}
            </div>
          )}

          {!isMediaLoading && mediaError && (
            <p className="border border-red-500/20 bg-red-500/5 p-4 min-[390px]:p-5 sm:p-6 text-center text-xs min-[390px]:text-sm md:text-base text-red-400">
              {mediaError}
            </p>
          )}

          {!isMediaLoading && !mediaError && mediaCoverage.length === 0 && (
            <div className="content-fade-in rounded-xl border border-white/10 bg-[#1b1b1b] px-4 py-10 min-[390px]:px-5 min-[390px]:py-12 sm:px-6 sm:py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
              <p className="text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                FROM THE MEDIA
              </p>

              <h3 className="mt-3 sm:mt-4 text-base min-[390px]:text-lg md:text-xl font-bold uppercase text-[#E5E7EB]">
                No Media Coverage to Show Yet.
              </h3>

              <p className="mt-3 text-xs min-[360px]:text-[13px] min-[390px]:text-sm leading-6 min-[390px]:leading-7 text-neutral-500 md:text-base md:leading-8">
                No media coverage to show at the moment. Check back soon for updates.
              </p>
            </div>
          )}

          {!isMediaLoading && !mediaError && mediaCoverage.length > 0 && (
            <div className="content-fade-in grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
              {mediaCoverage.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
                >
                  <div className="mx-4 mt-4 min-[390px]:mx-5 min-[390px]:mt-5 md:mx-6 md:mt-6 aspect-[16/9] overflow-hidden rounded-lg border border-neutral-700 bg-[#101010]">
                    <img
                      src={item.image_path}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4 min-[390px]:p-5 md:p-6">
                    <p className="text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                      {formatPublicationDate(item.publication_date)}
                    </p>

                    <h3 className="mt-3 sm:mt-4 text-base min-[390px]:text-lg md:text-xl font-bold uppercase leading-tight text-[#E5E7EB]">
                      {item.title}
                    </h3>

                    <a
                      href={getSafeHttpUrl(item.article_url) || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 sm:mt-6 inline-flex min-h-10 w-fit items-center justify-center rounded-full border border-white/30 bg-white/[0.02] px-4 py-2.5 min-[390px]:px-5 text-[9px] min-[390px]:text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      Read Article
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Achievements
