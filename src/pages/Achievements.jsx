
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

        if (isMounted) {
          setAchievements(response.data || [])
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

        if (isMounted) {
          setMediaCoverage(response.data || [])
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
    <main className="min-h-screen bg-[#080808] pb-24 pt-0 text-[#F2F2F2] page-top-spacing">
      <div className="page-container">

        {/* PAGE INTRODUCTION */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            Recognition
          </p>

          <h1 className="mt-5 text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
            Achievements.
          </h1>

          <p className="mt-8 max-w-xl text-sm leading-8 text-neutral-400 md:text-base">
            Penghargaan, pencapaian, dan publikasi HOLYMOLY.
          </p>
        </div>

        {/* ACHIEVEMENTS CONTENT */}
        <section className="mt-16">

          {isLoading && (
            <p className="py-12 text-center text-sm text-neutral-500">
              Memuat data penghargaan...
            </p>
          )}

          {!isLoading && error && (
            <p className="border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-400">
              {error}
            </p>
          )}

          {!isLoading && !error && achievements.length === 0 && (
            <div className="border border-white/10 px-6 py-16 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                Recognition
              </p>

              <h2 className="mt-4 text-xl font-bold uppercase text-white">
                No Achievements Yet.
              </h2>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Informasi penghargaan HOLYMOLY akan ditampilkan di sini.
              </p>
            </div>
          )}

          {!isLoading && !error && achievements.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2">
              {achievements.map((achievement) => (
                <article
                  key={achievement.id}
                  className="overflow-hidden border border-white/10 bg-[#101010]"
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

                    <h2 className="mt-2 text-lg font-bold uppercase leading-tight text-white md:text-xl">
                      {achievement.title}
                    </h2>

                    {achievement.description && (
                      <p className="mt-3 w-full max-w-full break-words whitespace-pre-line text-sm leading-relaxed text-neutral-400">
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
        <section className="mt-20 border-t border-white/10 pt-16">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Press & Publications
            </p>

            <h2 className="mt-4 text-2xl font-bold uppercase leading-tight text-white sm:text-3xl">
              Media Coverage.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400">
              Artikel dan publikasi media yang mengangkat HOLYMOLY.
            </p>
          </div>

          {isMediaLoading && (
            <p className="py-12 text-center text-sm text-neutral-500">
              Memuat Media Coverage...
            </p>
          )}

          {!isMediaLoading && mediaError && (
            <p className="border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-400">
              {mediaError}
            </p>
          )}

          {!isMediaLoading && !mediaError && mediaCoverage.length === 0 && (
            <div className="border border-white/10 px-6 py-16 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                Press & Publications
              </p>

              <h3 className="mt-4 text-xl font-bold uppercase text-white">
                No Media Coverage Yet.
              </h3>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Artikel dan liputan media HOLYMOLY akan ditampilkan di sini.
              </p>
            </div>
          )}

          {!isMediaLoading && !mediaError && mediaCoverage.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2">
              {mediaCoverage.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden border border-white/10 bg-[#101010]"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-[#191919]">
                    <img
                      src={item.image_path}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-6 md:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                      {formatPublicationDate(item.publication_date)}
                    </p>

                    <h3 className="mt-4 text-xl font-bold uppercase leading-tight text-white">
                      {item.title}
                    </h3>

                    <a
                      href={item.article_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center border-b border-neutral-500/50 pb-1 text-xs font-bold uppercase tracking-wider text-neutral-300 transition hover:border-neutral-300 hover:text-white"
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
