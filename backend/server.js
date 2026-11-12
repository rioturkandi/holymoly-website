const path = require('path')
const dotenv = require('dotenv')

// Memuat konfigurasi environment sebelum modul aplikasi lainnya
dotenv.config({
  path: path.resolve(__dirname, '.env'),
})

const express = require('express')
const helmet = require('helmet')
const db = require('./config/database')
const { handleEventStream, publishContentUpdate } = require('./services/event-stream')

const homeRoutes = require('./routes/home.routes')
const adminHomeRoutes = require('./routes/admin.home.routes')
const adminAboutRoutes = require('./routes/admin.about.routes')
const adminProjectsRoutes = require('./routes/admin.projects.routes')
const adminAchievementsRoutes = require('./routes/admin.achievements.routes')
const adminMediaCoverageRoutes = require('./routes/admin.media-coverage.routes')
const adminWorkshopRoutes = require('./routes/admin.workshop.routes')
const aboutRoutes = require('./routes/about.routes')
const projectsRoutes = require('./routes/projects.routes')
const achievementsRoutes = require('./routes/achievements.routes')
const mediaCoverageRoutes = require('./routes/media-coverage.routes')
const workshopRoutes = require('./routes/workshop.routes')
const authRoutes = require('./routes/auth.routes')
const uploadsRoutes = require('./routes/uploads.routes')

const app = express()
const PORT = process.env.PORT || 5000

// Memasang HTTP security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    strictTransportSecurity: false,
  })
)

// Membaca request dengan format JSON
app.use(express.json({ limit: '100kb' }))

// Menyajikan gambar hasil upload yang sudah diproses
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    dotfiles: 'deny',
    index: false,
    fallthrough: false,
    maxAge: '7d',
    immutable: true,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    },
  })
)


// Endpoint SSE untuk pembaruan konten website publik.
app.get('/api/events', handleEventStream)

// Mengirim event hanya setelah operasi mutasi Admin berhasil.
app.use('/api/admin', (req, res, next) => {
  const allowedMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

  if (!allowedMethods.includes(req.method)) {
    return next()
  }

  const section = req.path.split('/').filter(Boolean)[0]
  const allowedSections = new Set([
    'home',
    'about',
    'projects',
    'achievements',
    'media-coverage',
    'workshop',
  ])

  if (!allowedSections.has(section)) {
    return next()
  }

  const originalJson = res.json

  res.json = function (body) {
    if (
      this.statusCode >= 200 &&
      this.statusCode < 300 &&
      body?.success !== false
    ) {
      publishContentUpdate(section)
    }

    return originalJson.call(this, body)
  }

  next()
})

// Menggunakan router untuk halaman Home
app.use('/api/home', homeRoutes)

// Menggunakan router untuk pengelolaan konten Home oleh administrator
app.use('/api/admin/home', adminHomeRoutes)

// Menggunakan router untuk pengelolaan konten About oleh administrator
app.use('/api/admin/about', adminAboutRoutes)
app.use('/api/admin/projects', adminProjectsRoutes)
app.use('/api/admin/achievements', adminAchievementsRoutes)
app.use('/api/admin/media-coverage', adminMediaCoverageRoutes)
app.use('/api/admin/workshop', adminWorkshopRoutes)

// Menggunakan router untuk halaman About
app.use('/api/about', aboutRoutes)

// Menggunakan router untuk halaman Projects
app.use('/api/projects', projectsRoutes)

// Menggunakan router untuk halaman Achievements
app.use('/api/achievements', achievementsRoutes)
app.use('/api/media-coverage', mediaCoverageRoutes)

// Menggunakan router untuk halaman Workshop
app.use('/api/workshop', workshopRoutes)

// Menggunakan router untuk autentikasi administrator
app.use('/api/auth', authRoutes)

// Menggunakan router untuk upload gambar administrator
app.use('/api/uploads', uploadsRoutes)

// Endpoint untuk memeriksa kondisi server dan database
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1')

    res.status(200).json({
      success: true,
      message: 'HOLYMOLY API dan database berjalan dengan baik.',
    })
  } catch (error) {
    console.error('Database health check gagal:', error.message)

    res.status(500).json({
      success: false,
      message: 'Database tidak dapat diakses.',
    })
  }
})

// Menangani endpoint yang tidak ditemukan
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan.',
  })
})

// Menangani error yang belum ditangani oleh route
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  const statusCode =
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500
      ? error.status
      : 500

  console.error('Kesalahan API:', {
    method: req.method,
    path: req.path,
    status: statusCode,
    message: error.message,
  })

  let message = 'Terjadi kesalahan pada server.'

  if (statusCode === 404) {
    message = 'Resource tidak ditemukan.'
  } else if (statusCode === 413) {
    message = 'Ukuran permintaan terlalu besar.'
  } else if (statusCode < 500) {
    message = 'Permintaan tidak valid.'
  }

  return res.status(statusCode).json({
    success: false,
    message,
  })
})

// Menjalankan server
app.listen(PORT, () => {
  console.log(`HOLYMOLY API berjalan di http://localhost:${PORT}`)
})
