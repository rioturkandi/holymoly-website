const express = require('express')
const db = require('../config/database')

const router = express.Router()

// Mengambil seluruh data Media Coverage untuk halaman publik
router.get('/', async (req, res) => {
  try {
    const [mediaCoverage] = await db.query(
      `SELECT id, title, image_path, image_position_x, image_position_y,
              publication_date, article_url
       FROM media_coverage
       ORDER BY publication_date DESC, id DESC`
    )

    res.status(200).json({
      success: true,
      data: mediaCoverage,
    })
  } catch (error) {
    console.error('Gagal mengambil data Media Coverage:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

module.exports = router
