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
      <header className="fixed left-1/2 top-5 z-50 hidden w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 md:block">
      <nav className="flex items-center justify-between rounded-full border border-white/10 bg-[#E5E7EB]/45 px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition-all duration-500 ease-out lg:px-6">
        <Link
          to="/"
          onClick={closeMenu}
          className="text-lg font-black tracking-[0.08em] text-[#100C08] transition-opacity duration-300 hover:opacity-75 sm:text-xl"
        >
          HOLYMOLY<span className="text-[#45494B]">.</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
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

        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMenuOpen}
          aria-controls="tablet-navigation"
          className="hidden h-9 w-9 flex-col items-center justify-center gap-1.5 md:flex lg:hidden"
        >
          <span
            className={`h-0.5 w-5 bg-[#100C08] transition-transform ${
              isMenuOpen ? 'translate-y-2 rotate-45' : ''
            }`}
          />

          <span
            className={`h-0.5 w-5 bg-[#100C08] transition-opacity ${
              isMenuOpen ? 'opacity-0' : ''
            }`}
          />

          <span
            className={`h-0.5 w-5 bg-[#100C08] transition-transform ${
              isMenuOpen ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      {isMenuOpen && (
        <div
          id="tablet-navigation"
          className="mt-3 hidden rounded-2xl border border-white/10 bg-[#E5E7EB]/45 px-6 py-6 shadow-[0_16px_45px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:block lg:hidden"
        >
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `relative isolate rounded-full px-4 py-2.5 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-300 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-[#45494B]/15 before:opacity-0 before:blur-lg before:transition-opacity before:duration-300 hover:before:opacity-100 ${
                    isActive
                      ? 'text-white'
                      : 'text-[#100C08]'
                  }`
                }
                style={{ fontFamily: 'Inter Navbar', fontWeight: 600 }}
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
        className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-around rounded-full border border-white/10 bg-[#E5E7EB]/45 px-2 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-500 ease-in-out md:hidden"
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            onClick={closeMenu}
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
              className="h-3.5 w-3.5 transition-all duration-500 ease-in-out min-[320px]:max-[639px]:h-5.5 min-[320px]:max-[639px]:w-5.5"
              aria-hidden="true"
            >
              {link.label === 'Home' && <path d="M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9.5 20v-7h5v7" />}
              {link.label === 'About' && <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>}
              {link.label === 'Projects' && <><path d="M5 11 7 6h10l2 5 2 2v6H3v-6l2-2Z" /><path d="M7 11h10M5 14h2m10 0h2M9 19v1m6-1v1" /></>}
              {link.label === 'Achievements' && <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />}
            </svg>
            <span
              className="text-[8px] min-[390px]:text-[9px] font-medium uppercase tracking-[0.12em] transition-all duration-500 ease-in-out min-[320px]:max-[639px]:hidden"
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
