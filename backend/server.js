const express = require('express')
const path = require('path')
const db = require('./config/database')

const homeRoutes = require('./routes/home.routes')
const adminHomeRoutes = require('./routes/admin.home.routes')
const aboutRoutes = require('./routes/about.routes')
const projectsRoutes = require('./routes/projects.routes')
const achievementsRoutes = require('./routes/achievements.routes')
const workshopRoutes = require('./routes/workshop.routes')
const authRoutes = require('./routes/auth.routes')
const uploadsRoutes = require('./routes/uploads.routes')

const app = express()
const PORT = process.env.PORT || 5000

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

// Menggunakan router untuk halaman Home
app.use('/api/home', homeRoutes)

// Menggunakan router untuk pengelolaan konten Home oleh administrator
app.use('/api/admin/home', adminHomeRoutes)

// Menggunakan router untuk halaman About
app.use('/api/about', aboutRoutes)

// Menggunakan router untuk halaman Projects
app.use('/api/projects', projectsRoutes)

// Menggunakan router untuk halaman Achievements
app.use('/api/achievements', achievementsRoutes)

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

// Menjalankan server
app.listen(PORT, () => {
  console.log(`HOLYMOLY API berjalan di http://localhost:${PORT}`)
})
