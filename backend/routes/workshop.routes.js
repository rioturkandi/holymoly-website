
const express = require('express')
const db = require('../config/database')

const router = express.Router()

// Mengambil seluruh konten Workshop yang aktif
router.get('/', async (req, res) => {
  try {
    // Mengambil konten Workshop yang aktif
    const [workshopContent] = await db.query(
      `SELECT *
       FROM workshop_content
       WHERE is_active = TRUE
       ORDER BY id ASC`
    )

    // Mengambil foto dari konten Workshop yang aktif
    const [workshopImages] = await db.query(
      `SELECT
         workshop_images.id,
         workshop_images.workshop_content_id,
         workshop_images.image_path,
         workshop_images.alt_text,
         workshop_images.display_order
       FROM workshop_images
       INNER JOIN workshop_content
         ON workshop_images.workshop_content_id = workshop_content.id
       WHERE workshop_content.is_active = TRUE
       ORDER BY workshop_images.display_order ASC, workshop_images.id ASC`
    )

    // Menggabungkan konten Workshop dengan foto-fotonya
    const formattedWorkshop = workshopContent.map((workshop) => {
      const images = workshopImages.filter(
        (image) => image.workshop_content_id === workshop.id
      )

      return {
        ...workshop,
        images,
      }
    })

    // Mengirimkan data kepada frontend
    res.status(200).json({
      success: true,
      data: formattedWorkshop,
    })
  } catch (error) {
    console.error('Gagal mengambil data Workshop:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

module.exports = router
