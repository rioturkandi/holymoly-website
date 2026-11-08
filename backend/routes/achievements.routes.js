
const express = require('express')
const db = require('../config/database')

const router = express.Router()

// Mengambil seluruh data achievements yang aktif
router.get('/', async (req, res) => {
  try {
    // Mengambil data achievements dari database
    const [achievements] = await db.query(
      `SELECT *
       FROM achievements
       WHERE is_active = TRUE
       ORDER BY display_order ASC, achievement_year DESC, id DESC`
    )

    // Mengirimkan data kepada frontend
    res.status(200).json({
      success: true,
      data: achievements,
    })
  } catch (error) {
    console.error('Gagal mengambil data Achievements:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

module.exports = router
