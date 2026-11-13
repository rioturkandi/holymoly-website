import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Achievements from './pages/Achievements'
import AdminLogin from './pages/AdminLogin'
import AdminOverview from './pages/admin/AdminOverview'
import AdminHome from './pages/admin/AdminHome'
import AdminAbout from './pages/admin/AdminAbout'
import AdminProjects from './pages/admin/AdminProjects'
import AdminAchievements from './pages/admin/AdminAchievements'
import AdminWorkshop from './pages/admin/AdminWorkshop'

function AdminPlaceholder({ title }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
        Content Management
      </p>
      <h1 className="mt-3 text-4xl font-bold uppercase leading-tight sm:text-5xl">
        {title}.
      </h1>
      <p className="mt-3 text-sm text-neutral-400">
        Halaman pengelolaan {title} sedang disiapkan.
      </p>
    </div>
  )
}

function AppContent() {
  const location = useLocation()
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

        if (matchesPath && matchesPath(location.pathname)) {
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
  }, [isAdminRoute, location.pathname])


  return (
    <div className={isAdminRoute ? undefined : 'public-site'}>
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}

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
