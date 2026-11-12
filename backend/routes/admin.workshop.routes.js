const express = require('express')
const db = require('../config/database')
const authenticateAdmin = require('../middleware/auth.middleware')
const fs = require('node:fs/promises')
const path = require('node:path')

const router = express.Router()
const SECTION_KEY = 'main'

router.use(authenticateAdmin)

class ValidationError extends Error {}

function validateImages(images) {
  if (!Array.isArray(images) || images.length !== 3) {
    throw new ValidationError('Workshop wajib memiliki tepat 3 foto.')
  }

  return images.map((image) => {
    if (
      typeof image !== 'string' ||
      !/^\/uploads\/[0-9a-f-]{36}\.webp$/i.test(image)
    ) {
      throw new ValidationError('Path foto Workshop tidak valid.')
    }

    return image
  })
}

async function deleteUnusedImage(imagePath) {
  const [rows] = await db.query(
    `SELECT
      (SELECT COUNT(*) FROM home_content WHERE image_path = ?) +
      (SELECT COUNT(*) FROM home_content WHERE original_image_path = ?) +
      (SELECT COUNT(*) FROM home_services WHERE image_path = ?) +
      (SELECT COUNT(*) FROM project_images WHERE image_path = ?) +
      (SELECT COUNT(*) FROM workshop_images WHERE image_path = ?) +
      (SELECT COUNT(*) FROM achievements WHERE trophy_image_path = ?) +
      (SELECT COUNT(*) FROM achievements WHERE vehicle_image_path = ?) +
      (SELECT COUNT(*) FROM media_coverage WHERE image_path = ?) +
      (SELECT COUNT(*) FROM media_coverage WHERE original_image_path = ?)
      AS usage_count`,
    Array(9).fill(imagePath)
  )

  if (Number(rows[0].usage_count) === 0) {
    const filename = path.basename(imagePath)
    const filePath = path.join(__dirname, '..', 'uploads', filename)

    try {
      await fs.unlink(filePath)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
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

  try {
    const images = validateImages(req.body.images)

    connection = await db.getConnection()
    await connection.beginTransaction()

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

    for (let index = 0; index < images.length; index += 1) {
      await connection.query(
        `INSERT INTO workshop_images
          (workshop_content_id, image_path, alt_text, display_order)
         VALUES (?, ?, NULL, ?)`,
        [contentId, images[index], index + 1]
      )
    }

    await connection.commit()

    const newImages = new Set(images)

    for (const row of oldRows) {
      if (!newImages.has(row.image_path)) {
        await deleteUnusedImage(row.image_path)
      }
    }

    res.json({
      success: true,
      message: 'Tiga foto Workshop berhasil disimpan.',
      data: images,
    })
  } catch (error) {
    if (connection) await connection.rollback()

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
