function Services({ content, services = [] }) {
  // Mengambil konten pengantar Services dari database
  const eyebrow = content?.eyebrow || 'What We Do'

  const title = content?.title || 'Our Services.'

  const description =
    content?.description ||
    'Explore automotive customization and services offered by HOLYMOLY.'

  return (
    <section
      id="services"
      className="bg-[#191919] section-spacing"
    >
      <div className="page-container">
        {/* Services heading */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
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
        <div className="mt-12 border-t border-white/10 md:mt-16">
          {services.length > 0 ? (
            services.map((service, index) => (
              <article
                key={service.id}
                className="flex items-center justify-between gap-4 border-b border-white/10 py-6 md:py-8"
              >
                <div className="flex items-center gap-5">
                  {service.image_path && (
                    <img
                      src={service.image_path}
                      alt={service.title}
                      loading="lazy"
                      className="h-20 w-20 shrink-0 object-cover md:h-24 md:w-24"
                    />
                  )}

                  <div>
                    <h3 className="text-xl font-bold uppercase text-white md:text-3xl">
                      {service.title}
                    </h3>

                    {service.description && (
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-400">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>

                <span className="shrink-0 text-xs text-neutral-500">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </article>
            ))
          ) : (
            <div className="flex items-center justify-between gap-4 border-b border-white/10 py-6 md:py-8">
              <h3 className="text-xl font-bold uppercase text-white md:text-3xl">
                Service Information
              </h3>

              <span className="text-xs text-neutral-500">
                01
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Services
