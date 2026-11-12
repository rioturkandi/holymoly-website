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
    <div className="admin-shell min-h-screen bg-[#080808] text-white md:flex">
      <aside className="w-full border-b border-white/10 bg-[#101010] md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <div>
            <p className="text-xl font-bold tracking-[0.2em]">HOLYMOLY.</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-neutral-500">
              Admin Panel
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-fit rounded border border-red-500/40 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10 md:hidden"
          >
            Logout
          </button>
        </div>

        <nav className="flex w-full items-center justify-between gap-0 px-2 py-2 md:flex-col md:items-stretch md:justify-start md:gap-1">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `w-fit shrink-0 rounded px-0.5 py-2 text-center text-[clamp(6px,1.8vw,8px)] leading-none whitespace-nowrap md:px-4 transition-colors duration-200 ease-in-out md:w-full md:px-4 md:py-3 md:text-left md:text-sm ${
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

        <div className="hidden border-t border-white/10 p-4 md:mt-6 md:block">
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full rounded border border-red-500/40 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
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
