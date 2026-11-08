const express = require('express')
const db = require('../config/database')

const router = express.Router()

// Mengambil seluruh konten halaman Home
router.get('/', async (req, res) => {
  try {
    // Mengambil konten Home yang aktif
    const [homeContent] = await db.query(
      `SELECT *
       FROM home_content
       WHERE is_active = TRUE
       ORDER BY id ASC`
    )

    // Mengambil daftar layanan yang aktif
    const [homeServices] = await db.query(
      `SELECT *
       FROM home_services
       WHERE is_active = TRUE
       ORDER BY display_order ASC, id ASC`
    )

    // Mengirimkan data kepada frontend
    res.status(200).json({
      success: true,
      data: {
        content: homeContent,
        services: homeServices,
      },
    })
  } catch (error) {
    console.error('Gagal mengambil konten Home:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

module.exports = router