import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Projects', to: '/projects' },
    { label: 'Achievements', to: '/achievements' },
  ]

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2">
      <nav className="flex items-center justify-between rounded-full border border-white/10 bg-neutral-950/70 px-6 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition-all duration-500 ease-out lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="text-xl font-black tracking-[0.08em] text-white transition-opacity duration-300 hover:opacity-75 sm:text-2xl"
        >
          HOLYMOLY<span className="text-neutral-500">.</span>
        </Link>

        <div className="hidden items-center gap-9 lg:flex lg:gap-12">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `relative isolate rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-white/20 before:opacity-0 before:blur-lg before:transition-opacity before:duration-300 hover:before:opacity-100 ${
                  isActive
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMenuOpen}
          aria-controls="tablet-navigation"
          className="hidden h-10 w-10 flex-col items-center justify-center gap-1.5 md:flex lg:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-white transition-transform ${
              isMenuOpen ? 'translate-y-2 rotate-45' : ''
            }`}
          />

          <span
            className={`h-0.5 w-6 bg-white transition-opacity ${
              isMenuOpen ? 'opacity-0' : ''
            }`}
          />

          <span
            className={`h-0.5 w-6 bg-white transition-transform ${
              isMenuOpen ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      {isMenuOpen && (
        <div
          id="tablet-navigation"
          className="mt-3 hidden rounded-2xl border border-white/10 bg-neutral-950/90 px-6 py-6 shadow-[0_16px_45px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:block lg:hidden"
        >
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `relative isolate rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-300 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-white/15 before:opacity-0 before:blur-lg before:transition-opacity before:duration-300 hover:before:opacity-100 ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-around rounded-full border border-white/10 bg-neutral-950/90 px-2 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-500 ease-in-out md:hidden"
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl py-1 transition-all duration-500 ease-in-out ${
                isActive ? 'text-white' : 'text-neutral-500 hover:text-white'
              }`
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 transition-all duration-500 ease-in-out"
              aria-hidden="true"
            >
              {link.label === 'Home' && <path d="M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9.5 20v-7h5v7" />}
              {link.label === 'About' && <path d="M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />}
              {link.label === 'Projects' && <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />}
              {link.label === 'Achievements' && <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />}
            </svg>
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] transition-all duration-500 ease-in-out">
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default Navbar
