import { useState } from 'react'
import { apiRequest, setAdminToken } from '../services/api'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
        },
      })

      const token = response?.data?.token

      if (!token) {
        throw new Error('Token login tidak ditemukan.')
      }

      setAdminToken(token)
      setSuccessMessage('Login berhasil. Sesi administrator tersimpan.')
      setPassword('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
            HOLYMOLY Administration
          </p>

          <h1 className="text-4xl font-bold uppercase leading-tight text-white">
            Admin Login.
          </h1>

          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Sign in to manage your website content.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8"
        >
          <div className="mb-6">
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-400"
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
              className="w-full border border-neutral-700 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white"
              placeholder="admin@example.com"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-400"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-neutral-700 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white"
              placeholder="Enter your password"
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mb-5 border border-red-900 bg-red-950/30 p-3 text-sm text-red-400"
            >
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p
              role="status"
              className="mb-5 border border-green-900 bg-green-950/30 p-3 text-sm text-green-400"
            >
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white px-6 py-4 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-neutral-300 disabled:cursor-not-allowed disabled:bg-neutral-600"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-neutral-600">
          HOLYMOLY &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}

export default AdminLogin
