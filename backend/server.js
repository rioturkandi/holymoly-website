
const path = require('path')
const dotenv = require('dotenv')

// Memuat konfigurasi environment sebelum modul aplikasi lainnya
dotenv.config({
  path: path.resolve(__dirname, '.env'),
})

// Memvalidasi environment sebelum modul database dan aplikasi dimuat.
require('./config/validate-env')

const express = require('express')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const db = require('./config/database')
const {
  handleEventStream,
  publishContentUpdate,
  closeAllEventStreams,
} = require('./services/event-stream')

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
const {
  cleanupPendingImages,
  reconcileAttachedImages,
} = require('./services/image-lifecycle.service')

const app = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 5000

// Menjalankan pemeliharaan gambar secara berkala.
const IMAGE_MAINTENANCE_INTERVAL_MS = 24 * 60 * 60 * 1000

let imageMaintenanceStartupTimer = null
let imageMaintenanceTimer = null
let imageMaintenancePromise = null

async function runImageMaintenance() {
  if (imageMaintenancePromise) {
    return imageMaintenancePromise
  }

  imageMaintenancePromise = (async () => {
    try {
      console.log('[IMAGE MAINTENANCE] Starting...')

      const pendingResults = await cleanupPendingImages()
      console.log('[IMAGE MAINTENANCE] Pending cleanup:', pendingResults)

      const reconcileResults = await reconcileAttachedImages()
      console.log('[IMAGE MAINTENANCE] Attached reconciliation:', reconcileResults)

      const totalFailed =
        pendingResults.failed + reconcileResults.failed

      console.log('[IMAGE MAINTENANCE] Summary:', {
        totalDeleted: pendingResults.deleted + reconcileResults.deleted,
        totalFailed,
      })

      if (totalFailed > 0) {
        console.error('[IMAGE MAINTENANCE] Some files could not be cleaned.')
      }
    } catch (error) {
      console.error('[IMAGE MAINTENANCE] Failed:', error.message)
    }
  })()

  try {
    await imageMaintenancePromise
  } finally {
    imageMaintenancePromise = null
  }
}

// Memasang HTTP security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        styleSrcAttr: ["'unsafe-inline'"],
        imgSrc: ["'self'", "blob:", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", "blob:"],
        frameSrc: ["https://www.google.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
      },
      reportOnly: false,
    },
    strictTransportSecurity: {
      maxAge: 15552000,
      includeSubDomains: false,
      preload: false,
    },
  })
)

// Membaca request dengan format JSON
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

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

// Menyajikan frontend React hanya pada environment production.
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.resolve(__dirname, 'dist')

  app.use(
    express.static(frontendDistPath, {
      dotfiles: 'deny',
      index: false,
    })
  )

  // Mengarahkan navigasi halaman frontend ke React Router.
  app.use((req, res, next) => {
    const isApiRequest =
      req.path === '/api' || req.path.startsWith('/api/')

    const isUploadRequest =
      req.path === '/uploads' || req.path.startsWith('/uploads/')

    if (
      req.method !== 'GET' ||
      isApiRequest ||
      isUploadRequest ||
      !req.accepts('html')
    ) {
      return next()
    }

    return res.sendFile(
      path.join(frontendDistPath, 'index.html')
    )
  })
}

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

// Menjalankan server dan menyimpan instance HTTP untuk graceful shutdown.
const server = app.listen(PORT, () => {
  console.log(`HOLYMOLY API berjalan di http://localhost:${PORT}`)

  imageMaintenanceStartupTimer = setTimeout(() => {
    runImageMaintenance()

    imageMaintenanceTimer = setInterval(
      runImageMaintenance,
      IMAGE_MAINTENANCE_INTERVAL_MS
    )

    imageMaintenanceTimer.unref()
  }, 60 * 1000)

  imageMaintenanceStartupTimer.unref()
})

// Mencegah proses shutdown dijalankan lebih dari satu kali.
let shutdownStarted = false

async function shutdown(signal) {
  if (shutdownStarted) {
    return
  }

  shutdownStarted = true
  console.log(`Menerima ${signal}. Memulai graceful shutdown...`)

  if (imageMaintenanceStartupTimer) {
    clearTimeout(imageMaintenanceStartupTimer)
  }

  if (imageMaintenanceTimer) {
    clearInterval(imageMaintenanceTimer)
  }

  // Memberi waktu maksimal 10 detik untuk menyelesaikan koneksi HTTP aktif.
  const forceCloseTimer = setTimeout(() => {
    console.error('Batas waktu shutdown tercapai. Menutup koneksi HTTP yang tersisa.')
    server.closeAllConnections()
  }, 10000)

  forceCloseTimer.unref()

  // Menghentikan penerimaan koneksi HTTP baru.
  const httpServerClosed = new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })

  // Menutup koneksi SSE agar tidak menghambat proses penghentian server.
  closeAllEventStreams()

  try {
    await httpServerClosed
    console.log('HTTP server berhasil dihentikan.')
  } catch (error) {
    console.error('Gagal menghentikan HTTP server:', error.message)
    process.exitCode = 1
  } finally {
    clearTimeout(forceCloseTimer)
  }

  // Menunggu maintenance aktif sebelum menutup koneksi database.
  if (imageMaintenancePromise) {
    await imageMaintenancePromise
  }

  // Menutup pool database setelah koneksi HTTP dan maintenance selesai.
  try {
    await db.end()
    console.log('Koneksi database berhasil ditutup.')
  } catch (error) {
    console.error('Gagal menutup koneksi database:', error.message)
    process.exitCode = 1
  }

  console.log('Graceful shutdown selesai.')
}

// SIGINT biasanya dikirim ketika pengguna menekan Ctrl+C.
// SIGTERM biasanya dikirim oleh sistem atau platform deployment.
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
