const express = require('express')
const db = require('../config/database')
const authenticateAdmin = require('../middleware/auth.middleware')
const {
  markImageAttached,
  deleteUnusedImage,
} = require('../services/image-lifecycle.service')

const router = express.Router()
const SECTION_KEY = 'main'

router.use(authenticateAdmin)

class ValidationError extends Error {}

function validateImages(images) {
  if (!Array.isArray(images)) {
    throw new ValidationError('Data foto Workshop tidak valid.')
  }

  if (images.length === 0) {
    return []
  }

  if (images.length !== 3) {
    throw new ValidationError('Workshop harus memiliki 0 atau tepat 3 foto.')
  }

  const validatedImages = images.map((image) => {
    if (
      typeof image !== 'string' ||
      !/^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i.test(image)
    ) {
      throw new ValidationError('Path foto Workshop tidak valid.')
    }

    return image
  })

  if (new Set(validatedImages).size !== 3) {
    throw new ValidationError('Ketiga foto Workshop harus berbeda.')
  }

  return validatedImages
}

// Mengambil tiga foto untuk halaman Admin Workshop
router.get('/images', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT wi.id, wi.image_path, wi.display_order
       FROM workshop_images wi
       INNER JOIN workshop_content wc
         ON wc.id = wi.workshop_content_id
       WHERE wc.section_key = ? AND wc.is_active = TRUE
       ORDER BY wi.display_order ASC, wi.id ASC`,
      [SECTION_KEY]
    )

    res.json({
      success: true,
      data: rows.map((row) => row.image_path),
    })
  } catch (error) {
    console.error('Gagal mengambil foto Workshop:', error.message)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil foto Workshop.',
    })
  }
})

// Menyimpan tepat tiga foto Workshop
router.put('/images', async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    const images = validateImages(req.body.images)

    connection = await db.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    await connection.query(
      `INSERT INTO workshop_content
        (section_key, is_active)
       VALUES (?, TRUE)
       ON DUPLICATE KEY UPDATE is_active = TRUE`,
      [SECTION_KEY]
    )

    const [contentRows] = await connection.query(
      `SELECT id FROM workshop_content
       WHERE section_key = ?
       FOR UPDATE`,
      [SECTION_KEY]
    )

    const contentId = contentRows[0].id

    const [oldRows] = await connection.query(
      `SELECT image_path FROM workshop_images
       WHERE workshop_content_id = ?`,
      [contentId]
    )

    await connection.query(
      'DELETE FROM workshop_images WHERE workshop_content_id = ?',
      [contentId]
    )

    if (images.length === 3) {
      for (let index = 0; index < images.length; index += 1) {
        await connection.query(
          `INSERT INTO workshop_images
            (workshop_content_id, image_path, alt_text, display_order)
           VALUES (?, ?, NULL, ?)`,
          [contentId, images[index], index + 1]
        )
      }

      await connection.query(
        'UPDATE workshop_content SET is_active = TRUE WHERE id = ?',
        [contentId]
      )

      await markImageAttached(connection, images)
    } else {
      await connection.query(
        'UPDATE workshop_content SET is_active = FALSE WHERE id = ?',
        [contentId]
      )
    }

    await connection.commit()
    transactionStarted = false

    const newImages = new Set(images)

    for (const row of oldRows) {
      if (!newImages.has(row.image_path)) {
        try {
          await deleteUnusedImage(row.image_path)
        } catch (cleanupError) {
          console.error(
            'Gagal membersihkan foto Workshop lama:',
            row.image_path,
            cleanupError.message
          )
        }
      }
    }

    res.json({
      success: true,
      message:
        images.length === 0
          ? 'Semua foto Workshop berhasil dihapus.'
          : 'Tiga foto Workshop berhasil disimpan.',
      data: images,
    })
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error(
          'Gagal melakukan rollback foto Workshop:',
          rollbackError.message
        )
      }
    }

    const isValidationError = error instanceof ValidationError

    console.error('Gagal menyimpan foto Workshop:', error.message)

    res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: isValidationError
        ? error.message
        : 'Gagal menyimpan foto Workshop.',
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
