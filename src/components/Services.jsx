function Services({ content, services = [], isLoading = false, hasError = false }) {
  const eyebrow = content?.eyebrow || 'WHAT WE DO'
  const title = content?.title || 'Our Services.'
  const description =
    content?.description ||
    'Every car has its own potential, and sometimes it takes the right changes to bring it out. From simple upgrades to more detailed custom work, we explore different ways to improve the look and feel of a vehicle. Discover the services and possibilities behind HOLYMOLY.'

  return (
    <section
      id="services"
      className="section-spacing overflow-hidden bg-[#191919]"
    >
      <div className="page-container">
        {isLoading ? (
          <div aria-hidden="true" className="animate-pulse">
            <div className="h-3 w-28 rounded bg-[#E5E7EB]/20" />
            <div className="mt-5 h-12 max-w-sm rounded bg-[#E5E7EB]/20" />
            <div className="mt-5 h-4 max-w-md rounded bg-[#E5E7EB]/10" />
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-6 border-b border-white/[0.08] py-8">
                <div className="h-20 w-20 shrink-0 rounded-sm bg-[#E5E7EB]/10 md:h-28 md:w-36" />
                <div className="flex-1">
                  <div className="h-5 max-w-xs rounded bg-[#E5E7EB]/20" />
                  <div className="mt-3 h-3 max-w-md rounded bg-[#E5E7EB]/10" />
                </div>
              </div>
            ))}
          </div>
        ) : hasError ? (
          <p className="text-sm text-[#E5E7EB]/70">
            Service content is temporarily unavailable. Please try again.
          </p>
        ) : (
          <>
        {/* Services heading */}
        <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-10 md:flex-row md:items-end md:gap-12 md:pb-12">
          <div>
            <p className="mb-4 text-[8px] min-[360px]:text-[9px] min-[390px]:text-[10px] font-bold uppercase tracking-[0.3em] text-[#E5E7EB]/70">
              {eyebrow}
            </p>

            <h2 className="text-[28px] min-[360px]:text-[30px] min-[390px]:text-[34px] font-bold uppercase leading-tight sm:text-5xl md:text-6xl text-[#E5E7EB]">
              {title}
            </h2>
          </div>

          <p className="max-w-md text-[12px] min-[360px]:text-[13px] min-[390px]:text-[14px] leading-8 text-[#E5E7EB]/80 md:text-base">
            {description}
          </p>
        </div>

        {/* Services list */}
        <div className="mt-3 md:mt-5">
          {services.length > 0 ? (
            services.map((service, index) => (
              <article
                key={service.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-white/[0.08] py-5 sm:gap-6 sm:py-7 md:gap-8"
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
                  <h3 className="break-words text-[14px] min-[360px]:text-[15px] min-[390px]:text-[16px] font-bold uppercase leading-snug text-[#E5E7EB] sm:text-xl md:text-2xl">
                    {service.title}
                  </h3>

                  {service.description && (
                    <p className="mt-2 max-w-2xl break-words text-[11px] min-[360px]:text-[12px] min-[390px]:text-[13px] leading-6 text-[#E5E7EB]/80 sm:text-sm sm:leading-7">
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
              <h3 className="text-xl font-bold uppercase text-[#E5E7EB] md:text-2xl">
                Service Information
              </h3>
            </div>
          )}
        </div>
          </>
          )}
      </div>
    </section>
  )
}

export default Services
