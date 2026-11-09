function AdminOverview() {
  const sections = [
    {
      title: 'Home',
      description: 'Manage hero content and services.',
    },
    {
      title: 'About',
      description: 'Manage company information.',
    },
    {
      title: 'Projects',
      description: 'Manage automotive project galleries.',
    },
    {
      title: 'Achievements',
      description: 'Manage awards and achievements.',
    },
    {
      title: 'Workshop',
      description: 'Manage workshop information and photos.',
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
          <div
            key={section.title}
            className="border border-white/10 bg-[#101010] p-6"
          >
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm text-neutral-400">
              {section.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminOverview
