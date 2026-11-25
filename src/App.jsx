import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { setUnauthorizedHandler } from './services/api'

import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

// Halaman dimuat hanya ketika rutenya dibuka.
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Achievements = lazy(() => import('./pages/Achievements'))

// Halaman administrator juga menggunakan lazy loading.
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const AdminHome = lazy(() => import('./pages/admin/AdminHome'))
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'))
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'))
const AdminAchievements = lazy(() => import('./pages/admin/AdminAchievements'))
const AdminWorkshop = lazy(() => import('./pages/admin/AdminWorkshop'))


function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPathRef = useRef(location.pathname)

  useEffect(() => {
    currentPathRef.current = location.pathname
  }, [location.pathname])

  // Mengarahkan admin ke login ketika sesi berakhir
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (window.location.pathname !== '/admin/login') {
        navigate('/admin/login', { replace: true })
      }
    })

    return () => setUnauthorizedHandler(null)
  }, [navigate])

  const isAdminRoute = location.pathname.startsWith('/admin')

  // Satu koneksi SSE untuk halaman website publik.
  useEffect(() => {
    if (isAdminRoute) return

    const eventSource = new EventSource('/api/events')

    const affectedPaths = {
      home: (path) => path === '/',
      about: (path) => path === '/about',
      projects: (path) =>
        path === '/' ||
        path === '/projects' ||
        path.startsWith('/projects/'),
      achievements: (path) =>
        path === '/' || path === '/achievements',
      'media-coverage': (path) =>
        path === '/' || path === '/achievements',
      workshop: (path) =>
        path === '/' || path === '/about',
    }

    function handleContentUpdate(event) {
      try {
        const { section } = JSON.parse(event.data)
        const matchesPath = affectedPaths[section]

        if (matchesPath && matchesPath(currentPathRef.current)) {
          window.location.reload()
        }
      } catch (error) {
        console.error('Event pembaruan konten tidak valid:', error)
      }
    }

    eventSource.addEventListener(
      'content-updated',
      handleContentUpdate
    )

    return () => {
      eventSource.removeEventListener(
        'content-updated',
        handleContentUpdate
      )
      eventSource.close()
    }
  }, [isAdminRoute])


  return (
    <div className={isAdminRoute ? undefined : 'public-site'}>
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}

      <Suspense
        fallback={
          <div
            className="min-h-screen flex items-center justify-center"
            role="status"
            aria-live="polite"
          >
            Loading...
          </div>
        }
      >
        <Routes>
        {/* Halaman publik */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/achievements" element={<Achievements />} />

        {/* Login administrator */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Semua halaman dashboard dilindungi autentikasi */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route
            path="home"
            element={<AdminHome />}
          />
          <Route
            path="about"
            element={<AdminAbout />}
          />
          <Route
            path="projects"
            element={<AdminProjects />}
          />
          <Route
            path="achievements"
            element={<AdminAchievements />}
          />
          <Route
            path="workshop"
            element={<AdminWorkshop />}
          />
        </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
