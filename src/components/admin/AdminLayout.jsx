import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearAdminToken } from '../../services/api'

const navigation = [
  { label: 'Overview', path: '/admin', end: true },
  { label: 'Home', path: '/admin/home' },
  { label: 'About', path: '/admin/about' },
  { label: 'Projects', path: '/admin/projects' },
  { label: 'Achievements', path: '/admin/achievements' },
  { label: 'Workshop', path: '/admin/workshop' },
]

function AdminLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    clearAdminToken()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white md:flex">
      <aside className="w-full border-b border-white/10 bg-[#101010] md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-xl font-bold tracking-[0.2em]">HOLYMOLY.</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-neutral-500">
            Admin Panel
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-4 md:flex-col">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded px-4 py-3 text-sm transition ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4 md:mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded border border-red-500/40 px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
