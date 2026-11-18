import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setErrorMessage('')

    const normalizedEmail = email.trim()
    const emailPattern = /^[^\s@]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/

    if (!emailPattern.test(normalizedEmail)) {
      setErrorMessage('Masukkan alamat email dengan format dan domain yang valid, contohnya nama@gmail.com.')
      return
    }

    setIsLoading(true)

    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: normalizedEmail,
          password,
        },
      })
      setPassword('')
      navigate('/admin', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#100C08] bg-[radial-gradient(ellipse_at_top,rgba(69,73,75,0.2),transparent_58%)] px-4 py-10 min-[390px]:px-5 min-[390px]:py-12 sm:px-6 sm:py-16">
      <div className="w-full min-w-0 max-w-md">
        <div className="mb-7 text-center min-[390px]:mb-8 sm:mb-10">
          <p className="mb-3 text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-500 min-[360px]:text-[9px] min-[390px]:mb-4 min-[390px]:text-[10px] sm:text-xs sm:tracking-[0.3em]">
            HOLYMOLY Administration
          </p>

          <h1 className="text-[28px] font-bold uppercase leading-tight text-[#E5E7EB] min-[360px]:text-[30px] min-[390px]:text-[34px] sm:text-5xl md:text-6xl">
            Admin Login.
          </h1>

          <p className="mt-3 text-xs leading-relaxed text-neutral-400 min-[360px]:text-[13px] min-[390px]:mt-4 min-[390px]:text-sm sm:text-base sm:leading-7">
            Sign in to manage your website content.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-w-0 rounded-2xl border border-[#45494B]/70 bg-[#17130F] p-4 shadow-[0_24px_50px_rgba(0,0,0,0.45),0_8px_0_rgba(69,73,75,0.22),inset_0_1px_0_rgba(229,231,235,0.09)] min-[390px]:p-5 sm:p-8"
        >
          <div className="mb-5 min-[390px]:mb-6">
            <label
              htmlFor="email"
              className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-neutral-400 min-[360px]:text-[11px] min-[390px]:text-xs min-[390px]:tracking-widest"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              maxLength={191}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 w-full min-w-0 rounded-lg border border-[#45494B] bg-[#100C08] px-3 py-3 text-xs text-white placeholder-shown:bg-[#100C08] not-placeholder-shown:bg-white not-placeholder-shown:text-[#100C08] shadow-[inset_0_3px_8px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(229,231,235,0.04)] outline-none transition-all duration-200 focus:border-[#E5E7EB] focus:shadow-[inset_0_3px_8px_rgba(0,0,0,0.45),0_0_0_2px_rgba(229,231,235,0.12)] min-[360px]:text-[13px] min-[390px]:px-4 min-[390px]:text-sm"
              placeholder="admin@example.com"
            />
          </div>

          <div className="mb-5 min-[390px]:mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-neutral-400 min-[360px]:text-[11px] min-[390px]:text-xs min-[390px]:tracking-widest"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-11 w-full min-w-0 rounded-lg border border-[#45494B] bg-[#100C08] px-3 py-3 pr-14 text-xs text-white placeholder-shown:bg-[#100C08] not-placeholder-shown:bg-white not-placeholder-shown:text-[#100C08] shadow-[inset_0_3px_8px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(229,231,235,0.04)] outline-none transition-all duration-200 focus:border-[#E5E7EB] focus:shadow-[inset_0_3px_8px_rgba(0,0,0,0.45),0_0_0_2px_rgba(229,231,235,0.12)] min-[360px]:text-[13px] min-[390px]:px-4 min-[390px]:text-sm"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex min-h-11 min-w-11 items-center justify-center rounded-r-lg text-neutral-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#E5E7EB]"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.3" />
                    <path d="M6.2 6.2C3.9 7.6 2.8 9.5 2.5 12c1 2.5 4.5 7 9.5 7 1.2 0 2.3-.3 3.3-.7" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mb-5 break-words rounded-lg border border-red-900 bg-red-950/30 p-3 text-xs leading-relaxed text-red-400 min-[390px]:text-sm"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="min-h-11 w-full rounded-lg bg-[#E5E7EB] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#100C08] shadow-[0_5px_0_#45494B,0_9px_18px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.8)] transform-gpu transition-all duration-200 ease-out disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:shadow-none min-[360px]:text-xs min-[390px]:px-6 min-[390px]:text-[13px] sm:text-sm sm:tracking-widest  active:translate-y-1 active:scale-[0.99] admin-login-submit"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-neutral-600 min-[360px]:text-[11px] min-[390px]:mt-8 min-[390px]:text-xs">
          HOLYMOLY &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}

export default AdminLogin
