const express = require('express')
const db = require('../config/database')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const [aboutContent] = await db.query(
      `SELECT section_key, eyebrow, title, description
       FROM about_content
       ORDER BY id ASC`
    )

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
