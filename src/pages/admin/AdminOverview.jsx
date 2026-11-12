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
    <div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Administration
        </p>
        <h1 className="mt-3 text-4xl font-bold uppercase leading-tight sm:text-5xl">
          Overview.
        </h1>
        <p className="mt-3 text-sm text-neutral-400">
          Manage your HOLYMOLY website content from one place.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.title}
            to={section.path}
            className="admin-card block p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm text-neutral-400">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdminOverview
