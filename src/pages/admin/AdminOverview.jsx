import { Link } from 'react-router-dom'

function AdminOverview() {
  const sections = [
    {
      title: 'Home',
      description: 'Manage hero content and services.',
      path: '/admin/home',
    },
    {
      title: 'About',
      description: 'Manage company information.',
      path: '/admin/about',
    },
    {
      title: 'Projects',
      description: 'Manage automotive project galleries.',
      path: '/admin/projects',
    },
    {
      title: 'Achievements',
      description: 'Manage awards and achievements.',
      path: '/admin/achievements',
    },
    {
      title: 'Workshop',
      description: 'Manage workshop information and photos.',
      path: '/admin/workshop',
    },
  ]

  return (
    <div className="min-w-0">
      <header>
        <p className="text-[8px] uppercase tracking-[0.25em] text-neutral-500 min-[360px]:text-[9px] min-[390px]:text-[10px] sm:text-xs sm:tracking-[0.3em]">
          Administration
        </p>

        <h1 className="mt-2 text-[28px] font-bold uppercase leading-tight text-[#E5E7EB] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:mt-3 sm:text-5xl md:text-6xl">
          Overview.
        </h1>

        <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-neutral-400 min-[360px]:text-[13px] min-[390px]:text-sm sm:mt-3">
          Manage your HOLYMOLY website content from one place.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-3 min-[390px]:mt-10 min-[390px]:gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.title}
            to={section.path}
            className="admin-card block min-w-0 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-[390px]:p-5 sm:p-6"
          >
            <h2 className="text-base font-semibold leading-snug text-[#E5E7EB] min-[360px]:text-[17px] min-[390px]:text-lg sm:text-xl">
              {section.title}
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-neutral-400 min-[360px]:text-[13px] min-[390px]:text-sm sm:mt-3 sm:text-base">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdminOverview
