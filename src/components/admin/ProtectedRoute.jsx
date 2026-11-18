import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../services/api'

function ProtectedRoute({ children }) {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function verifySession() {
      try {
        await apiRequest('/api/auth/me', { auth: true })

        if (isMounted) {
          setIsAuthorized(true)
        }
      } catch (error) {
        if (error.status === 401) {
          return
        }

        if (error.status === 403) {
          navigate('/admin/login', { replace: true })
          return
        }

        if (isMounted) {
          setErrorMessage(error.message)
        }
      } finally {
        if (isMounted) {
          setIsChecking(false)
        }
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [navigate])

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#100C08] text-sm text-neutral-400">
        Verifying administrator session...
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#100C08] px-6 text-center text-sm text-red-400">
        {errorMessage}
      </main>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return children
}

export default ProtectedRoute