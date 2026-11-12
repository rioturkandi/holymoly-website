function Services({ content, services = [] }) {
  const eyebrow = content?.eyebrow || 'What We Do'
  const title = content?.title || 'Our Services.'
  const description =
    content?.description ||
    'Explore automotive customization and services offered by HOLYMOLY.'

  return (
    <section
      id="services"
      className="section-spacing overflow-hidden bg-[#191919]"
    >
      <div className="page-container">
        {/* Services heading */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:gap-12 md:pb-12">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              {eyebrow}
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
              {title}
            </h2>
          </div>

          <p className="max-w-md text-sm leading-8 text-neutral-400 md:text-base">
            {description}
          </p>
        </div>

        {/* Services list */}
        <div className="mt-5">
          {services.length > 0 ? (
            services.map((service, index) => (
              <article
                key={service.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-white/[0.08] py-6 sm:gap-6 sm:py-8 md:gap-8"
              >
                {service.image_path ? (
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-[#242424] sm:h-24 sm:w-28 md:h-28 md:w-36">
                    <img
                      src={service.image_path}
                      alt={service.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-[#292929] to-[#171717] sm:h-24 sm:w-28 md:h-28 md:w-36">
                    <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-600">
                      HOLYMOLY
                    </span>
                  </div>
                )}

                <div className="min-w-0 py-1">
                  <h3 className="break-words text-lg font-bold uppercase leading-snug text-white sm:text-xl md:text-2xl">
                    {service.title}
                  </h3>

                  {service.description && (
                    <p className="mt-2 max-w-2xl break-words text-xs leading-6 text-neutral-400 sm:text-sm sm:leading-7">
                      {service.description}
                    </p>
                  )}
                </div>

                <span className="self-start pt-1 text-[10px] font-semibold tracking-[0.15em] text-neutral-500 sm:text-xs">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </article>
            ))
          ) : (
            <div className="border-b border-white/[0.08] py-8">
              <h3 className="text-xl font-bold uppercase text-white md:text-2xl">
                Service Information
              </h3>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Services
