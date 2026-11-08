const express = require('express')
const db = require('./config/database')
const homeRoutes = require('./routes/home.routes')
const aboutRoutes = require('./routes/about.routes')
const projectsRoutes = require('./routes/projects.routes')
const achievementsRoutes = require('./routes/achievements.routes')
const workshopRoutes = require('./routes/workshop.routes')
const authRoutes = require('./routes/auth.routes')

const app = express()
const PORT = process.env.PORT || 5000

// Membaca request dengan format JSON
app.use(express.json())

// Menggunakan router untuk halaman Home
app.use('/api/home', homeRoutes)

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