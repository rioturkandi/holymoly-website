
function Services() {
  return (
    <section
      id="services"
      className="bg-[#191919] section-spacing"
    >
      <div className="page-container">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              What We Do
            </p>

            <h2 className="text-4xl font-bold uppercase leading-tight sm:text-5xl md:text-6xl">
              Our Services.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-8 text-neutral-400 md:text-base">
            Explore automotive customization and services
            offered by HOLYMOLY.
          </p>
        </div>

        <div className="mt-12 border-t border-white/10 md:mt-16">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 py-6 md:py-8">
            <h3 className="text-xl font-bold uppercase text-white md:text-3xl">
              Service Information
            </h3>

            <span className="text-xs text-neutral-500">01</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Services
