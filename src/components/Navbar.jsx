import logo from '../assets/images/holymoly-logo.png'
import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Projects', to: '/projects' },
    { label: 'Achievements', to: '/achievements' },
  ]

  return (
    <>
      <header className="fixed left-1/2 top-5 z-50 hidden w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 min-[1024px]:block">
      <nav className="relative flex items-center justify-between rounded-full border border-white/10 bg-[#E5E7EB]/45 px-5 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition-all duration-500 ease-out lg:px-6">
        <Link
          to="/"
          aria-label="HOLYMOLY Home"
          className="flex shrink-0 items-center transition-opacity duration-300 hover:opacity-75"
        >
          <img
            src={logo}
            alt="HOLYMOLY"
            className="h-8 w-auto max-w-[120px] object-contain"
          />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
            className={({ isActive }) =>
                `relative isolate inline-flex h-[32px] items-center rounded-full px-[16px] font-medium uppercase leading-none transition-colors duration-300 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-[#45494B]/20 before:opacity-0 before:blur-lg before:transition-opacity before:duration-300 hover:before:opacity-100 ${
                  isActive
                    ? 'bg-[#11212D] text-[#E5E7EB] shadow-[0_4px_8px_rgba(17,33,45,0.45)]'
                    : 'text-[#100C08]'
                }`
              }
              style={{ fontSize: '12px', letterSpacing: '0.08em', fontFamily: 'Inter Navbar', fontWeight: 600 }}
            >
              {link.label}
            </NavLink>
          ))}
        </div>


        <Link
          to="/admin/login"
          aria-label="Admin Login"
          title="Admin Login"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#100C08] transition-all duration-300 hover:scale-110 hover:bg-[#11212D] hover:text-[#E5E7EB] hover:shadow-[0_4px_12px_rgba(17,33,45,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#11212D] focus-visible:ring-offset-2 lg:flex"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
          </svg>
        </Link>
      </nav>

    </header>

      {/* Mobile Admin Login */}
      <Link
        to="/admin/login"
        aria-label="Admin Login"
        title="Admin Login"
        className="fixed right-3 top-5 z-50 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#AEB5BA] bg-[#C8CDD1] text-[#17212A] shadow-[0_2px_5px_rgba(0,0,0,0.18)] transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-in-out min-[375px]:right-4 min-[375px]:top-6 min-[375px]:h-7 min-[375px]:w-7 min-[425px]:h-[30px] min-[425px]:w-[30px] hover:!bg-[#11212D] hover:!text-white hover:!border-[#11212D] hover:scale-110 hover:-translate-y-0.5 hover:shadow-[0_5px_12px_rgba(0,0,0,0.30)] active:!bg-[#263746] active:scale-95 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8CDD1] min-[1024px]:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 min-[375px]:h-4 min-[375px]:w-4 min-[425px]:h-[18px] min-[425px]:w-[18px]"
          aria-hidden="true"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
        </svg>
      </Link>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-around rounded-full border border-white/10 bg-[#E5E7EB]/45 px-2 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-500 ease-in-out min-[1024px]:hidden"
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
              className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-full py-0.5 transition-all duration-300 ease-out ${
                isActive
                  ? 'bg-[#11212D] text-[#E5E7EB] shadow-[0_4px_8px_rgba(17,33,45,0.45)]'
                  : 'bg-transparent text-[#100C08]'
              }`
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4.5 w-4.5 transition-colors duration-300 ease-out min-[320px]:max-[639px]:h-5.5 min-[320px]:max-[639px]:w-5.5"
              aria-hidden="true"
            >
              {link.label === 'Home' && <path d="M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9.5 20v-7h5v7" />}
              {link.label === 'About' && <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>}
              {link.label === 'Projects' && <><path d="M5 11 7 6h10l2 5 2 2v6H3v-6l2-2Z" /><path d="M7 11h10M5 14h2m10 0h2M9 19v1m6-1v1" /></>}
              {link.label === 'Achievements' && <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />}
            </svg>
            <span
              className="text-[8px] min-[390px]:text-[9px] font-semibold uppercase tracking-[0.12em] transition-all duration-500 ease-in-out min-[320px]:max-[639px]:hidden"
              style={{ fontFamily: 'Inter Navbar', fontWeight: 600 }}
            >
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default Navbar
