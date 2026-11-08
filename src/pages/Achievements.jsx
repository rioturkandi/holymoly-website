
function Achievements() {
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
        <section className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="border border-white/10 p-6">
            <div className="flex aspect-[4/3] items-center justify-center bg-[#191919]">
              <span className="text-xs uppercase tracking-widest text-neutral-500">
                Trophy Image
              </span>
            </div>

            <h2 className="mt-5 text-xl font-bold uppercase text-white">
              Award Information
            </h2>

            <p className="mt-3 text-sm leading-7 text-neutral-500">
              Placeholder — menunggu data penghargaan terverifikasi.
            </p>
          </div>

          <div className="border border-white/10 p-6">
            <div className="flex aspect-[4/3] items-center justify-center bg-[#191919]">
              <span className="text-xs uppercase tracking-widest text-neutral-500">
                Media Coverage
              </span>
            </div>

            <h2 className="mt-5 text-xl font-bold uppercase text-white">
              Media Coverage
            </h2>

            <p className="mt-3 text-sm leading-7 text-neutral-500">
              Informasi publikasi akan ditempatkan di sini.
            </p>
          </div>
        </section>

      </div>
    </main>
  )
}

export default Achievements
