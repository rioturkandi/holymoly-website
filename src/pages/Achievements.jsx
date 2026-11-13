
import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'

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
      } catch (error) {
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
      } catch (error) {
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
    <main className="min-h-screen bg-[#100C08] pb-24 pt-0 text-[#F2F2F2] page-top-spacing lg:pt-28">
      <div className="page-container">

        {/* PAGE INTRODUCTION */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
            Recognition
          </p>

          <h1 className="mt-5 text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
            Achievements.
          </h1>

          <p className="mt-8 max-w-xl text-sm leading-8 text-[#E5E7EB]/80 md:text-base">
            Penghargaan, pencapaian, dan publikasi HOLYMOLY.
          </p>
        </div>

        {/* ACHIEVEMENTS CONTENT */}
        <section className="mt-10">

          {isLoading && (
            <div aria-hidden="true" className="animate-pulse grid gap-8 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div key={item} className="overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] p-4">
                  <div className="grid grid-cols-2 gap-3">
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
            <p className="border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-400">
              {error}
            </p>
          )}

          {!isLoading && !error && achievements.length === 0 && (
            <div className="content-fade-in rounded-xl border border-white/10 bg-[#1b1b1b] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                Recognition
              </p>

              <h2 className="mt-4 text-xl font-bold uppercase text-[#E5E7EB]">
                No Achievements Yet.
              </h2>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Informasi penghargaan HOLYMOLY akan ditampilkan di sini.
              </p>
            </div>
          )}

          {!isLoading && !error && achievements.length > 0 && (
            <div className="content-fade-in grid gap-8 md:grid-cols-2">
              {achievements.map((achievement) => (
                <article
                  key={achievement.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
                >
                  {/* TROPHY AND WINNING CAR PHOTOS */}
                  <div className="mt-4 px-4">
                    <div className="grid grid-cols-2 gap-3">
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
                  <div className="p-5 md:p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {achievement.event_name} / {achievement.achievement_year}
                    </p>

                    <h2 className="mt-2 text-lg font-bold uppercase leading-tight text-[#E5E7EB] md:text-xl">
                      {achievement.title}
                    </h2>

                    {achievement.description && (
                      <p className="mt-3 w-full max-w-full break-words whitespace-pre-line text-sm leading-relaxed text-[#E5E7EB]/80">
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
        <section className="mt-12 border-t border-white/10 pt-10">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Press & Publications
            </p>

            <h2 className="mt-4 text-2xl font-bold uppercase leading-tight text-[#E5E7EB] sm:text-3xl">
              Media Coverage.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400">
              Artikel dan publikasi media yang mengangkat HOLYMOLY.
            </p>
          </div>

          {isMediaLoading && (
            <div aria-hidden="true" className="animate-pulse grid gap-8 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div key={item} className="overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] p-4">
                  <div className="aspect-[16/9] rounded-lg bg-[#E5E7EB]/10" />
                  <div className="mt-6 h-3 w-1/3 rounded bg-[#E5E7EB]/20" />
                  <div className="mt-4 h-6 w-4/5 rounded bg-[#E5E7EB]/20" />
                  <div className="mt-6 h-8 w-28 rounded-full bg-[#E5E7EB]/10" />
                </div>
              ))}
            </div>
          )}

          {!isMediaLoading && mediaError && (
            <p className="border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-400">
              {mediaError}
            </p>
          )}

          {!isMediaLoading && !mediaError && mediaCoverage.length === 0 && (
            <div className="content-fade-in rounded-xl border border-white/10 bg-[#1b1b1b] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                Press & Publications
              </p>

              <h3 className="mt-4 text-xl font-bold uppercase text-[#E5E7EB]">
                No Media Coverage Yet.
              </h3>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Artikel dan liputan media HOLYMOLY akan ditampilkan di sini.
              </p>
            </div>
          )}

          {!isMediaLoading && !mediaError && mediaCoverage.length > 0 && (
            <div className="content-fade-in grid gap-8 md:grid-cols-2">
              {mediaCoverage.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.35)]"
                >
                  <div className="mx-4 mt-4 aspect-[16/9] overflow-hidden rounded-lg border border-neutral-700 bg-[#101010]">
                    <img
                      src={item.image_path}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5 md:p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                      {formatPublicationDate(item.publication_date)}
                    </p>

                    <h3 className="mt-4 text-xl font-bold uppercase leading-tight text-[#E5E7EB]">
                      {item.title}
                    </h3>

                    <a
                      href={item.article_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex w-fit items-center justify-center rounded-full border border-white/30 bg-white/[0.02] px-3 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-500 ease-out hover:border-white hover:bg-white/[0.06] hover:shadow-[0_0_22px_rgba(255,255,255,0.10)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
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
