const express = require('express')
const db = require('../config/database')

const router = express.Router()

// Mengambil seluruh konten halaman About
router.get('/', async (req, res) => {
  try {
    // Mengambil konten About yang aktif
    const [aboutContent] = await db.query(
      `SELECT *
       FROM about_content
       WHERE is_active = TRUE
       ORDER BY id ASC`
    )

    // Mengirimkan data kepada frontend
    res.status(200).json({
      success: true,
      data: aboutContent,
    })
  } catch (error) {
    console.error('Gagal mengambil konten About:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

module.exports = router