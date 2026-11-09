const express = require('express')
const db = require('../config/database')
const authenticateAdmin = require('../middleware/auth.middleware')

const router = express.Router()

const allowedSections = [
  'introduction',
  'journey',
  'vision',
  'mission',
  'philosophy',
]

router.use(authenticateAdmin)

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT section_key, eyebrow, title, description
       FROM about_content
       ORDER BY id ASC`
    )

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

router.put('/:sectionKey', async (req, res) => {
  try {
    const { sectionKey } = req.params

    if (!allowedSections.includes(sectionKey)) {
      return res.status(400).json({
        success: false,
        message: 'Bagian About tidak valid.',
      })
    }

    const fields = ['eyebrow', 'title', 'description']

    if (
      !req.body ||
      fields.some((field) => typeof req.body[field] !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Eyebrow, title, dan description harus berupa teks.',
      })
    }

    const values = fields.map((field) => {
      const value = req.body[field].trim()
      return value || null
    })

    if (values[0]?.length > 150 || values[1]?.length > 255 || values[2]?.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Batas panjang teks terlampaui.',
      })
    }

    await db.query(
      `INSERT INTO about_content
        (section_key, eyebrow, title, description)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        eyebrow = VALUES(eyebrow),
        title = VALUES(title),
        description = VALUES(description)`,
      [sectionKey, ...values]
    )

    res.json({
      success: true,
      message: 'Konten About berhasil disimpan.',
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

router.delete('/:sectionKey', async (req, res) => {
  try {
    const { sectionKey } = req.params

    if (!allowedSections.includes(sectionKey)) {
      return res.status(400).json({
        success: false,
        message: 'Bagian About tidak valid.',
      })
    }

    await db.query(
      'DELETE FROM about_content WHERE section_key = ?',
      [sectionKey]
    )

    res.json({
      success: true,
      message: 'Konten berhasil dihapus. Tampilan default akan digunakan.',
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

module.exports = router
