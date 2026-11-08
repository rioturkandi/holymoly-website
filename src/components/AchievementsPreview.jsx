
import { Link } from 'react-router-dom'

function AchievementsPreview() {
  const highlights = [
    {
      id: 1,
      number: '01',
      title: 'Awards & Recognition',
      description: 'Information about HOLYMOLY achievements will be updated here.',
    },
    {
      id: 2,
      number: '02',
      title: 'Media Coverage',
      description: 'Selected publications and media features will be displayed here.',
    },
  ]

  return (
    <section className="bg-[#191919] section-spacing">
      <div className="page-container">
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              Recognition
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
              Beyond The
              <br />
              Build.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-8 text-neutral-400 md:text-base">
            A dedicated space for achievements, recognition, and stories
            featuring HOLYMOLY.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {highlights.map((item) => (
            <div
              key={item.id}
              className="border border-neutral-700 p-7 transition-colors duration-300 hover:border-neutral-400 md:p-10"
            >
              <p className="mb-10 text-sm font-bold tracking-widest text-neutral-500 md:mb-12">
                / {item.number}
              </p>

              <h3 className="mb-4 text-2xl font-bold uppercase text-white md:text-3xl">
                {item.title}
              </h3>

              <p className="max-w-md text-sm leading-8 text-neutral-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-12">
          <Link
            to="/achievements"
            className="inline-block border border-neutral-600 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
          >
            Explore Recognition
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AchievementsPreview
