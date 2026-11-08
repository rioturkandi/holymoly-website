
import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Projects', path: '/projects' },
    { label: 'Achievements', path: '/achievements' },
  ]

  return (
    <footer className="border-t border-neutral-800 bg-[#080808] py-12 md:py-14">
      <div className="page-container">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:gap-16">

          {/* Brand Information */}
          <div>
            <Link
              to="/"
              className="text-3xl font-black tracking-tight text-white"
            >
              HOLYMOLY<span className="text-neutral-500">.</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-8 text-neutral-500">
              Automotive culture. Built with character.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
              Explore
            </p>

            <nav className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="w-fit text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-neutral-800 pt-6 text-xs leading-6 text-neutral-500 sm:flex-row md:mt-16">
          <p>© {currentYear} HOLYMOLY. All rights reserved.</p>
          <p>Designed with purpose. Built with character.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
