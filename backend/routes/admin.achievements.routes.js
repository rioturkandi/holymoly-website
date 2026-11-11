const express = require('express')
const db = require('../config/database')
const authenticateAdmin = require('../middleware/auth.middleware')
const fs = require('node:fs/promises')
const path = require('node:path')

const router = express.Router()

router.use(authenticateAdmin)

class ValidationError extends Error {}

function validateId(value) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function validateText(value, maxLength, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`${fieldName} wajib diisi.`)
  }

  const result = value.trim()

  if (result.length > maxLength) {
    throw new ValidationError(
      `${fieldName} maksimal ${maxLength} karakter.`
    )
  }

  return result
}

function validateDescription(value) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value !== 'string' || value.length > 500) {
    throw new ValidationError(
      'Description maksimal 500 karakter.'
    )
  }

  return value.trim() || null
}

function validateYear(value) {
  const year = Number(value)

  if (!Number.isInteger(year) || year < 1901 || year > 2155) {
    throw new ValidationError('Tahun pencapaian tidak valid.')
  }

  return year
}

function validateImagePath(value, fieldName) {
  const result = validateText(value, 500, fieldName)

  if (!/^\/uploads\/[0-9a-f-]{36}\.webp$/i.test(result)) {
    throw new ValidationError(`${fieldName} tidak valid.`)
  }

  return result
}

// Menghapus gambar hanya jika tidak digunakan oleh data lain
async function deleteUnusedImage(imagePath) {
  if (!imagePath) return

  const [rows] = await db.query(
    `SELECT
      (SELECT COUNT(*) FROM about_content WHERE image_path = ?) +
      (SELECT COUNT(*) FROM home_content WHERE image_path = ?) +
      (SELECT COUNT(*) FROM home_services WHERE image_path = ?) +
      (SELECT COUNT(*) FROM project_images WHERE image_path = ?) +
      (SELECT COUNT(*) FROM workshop_images WHERE image_path = ?) +
      (SELECT COUNT(*) FROM achievements WHERE trophy_image_path = ?) +
      (SELECT COUNT(*) FROM achievements WHERE vehicle_image_path = ?) +
      (SELECT COUNT(*) FROM media_coverage WHERE image_path = ?) +
      (SELECT COUNT(*) FROM media_coverage WHERE original_image_path = ?)
      AS usage_count`,
    [
      imagePath,
      imagePath,
      imagePath,
      imagePath,
      imagePath,
      imagePath,
      imagePath,
      imagePath,
      imagePath,
    ]
  )

  if (Number(rows[0].usage_count) > 0) return

  const uploadDirectory = path.resolve(__dirname, '../uploads')
  const filePath = path.resolve(
    uploadDirectory,
    path.basename(imagePath)
  )

  if (path.dirname(filePath) !== uploadDirectory) return

  try {
    await fs.unlink(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

// Mengambil seluruh data penghargaan untuk administrator
router.get('/', async (req, res) => {
  try {
    const [achievements] = await db.query(
      `SELECT *
       FROM achievements
       ORDER BY display_order ASC, achievement_year DESC, id DESC`
    )

    return res.status(200).json({
      success: true,
      data: achievements,
    })
  } catch (error) {
    console.error('Gagal mengambil Admin Achievements:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

// Menambahkan penghargaan baru
router.post('/', async (req, res) => {
  const connection = await db.getConnection()
  let transactionStarted = false

  try {
    const body = req.body

    const title = validateText(body?.title, 255, 'Achievement Name')
    const eventName = validateText(body?.event_name, 255, 'Event Name')
    const year = validateYear(body?.achievement_year)
    const description = validateDescription(body?.description)

    const trophyPath = validateImagePath(
      body?.trophy_image_path,
      'Trophy Photo'
    )

    const vehiclePath = validateImagePath(
      body?.vehicle_image_path,
      'Winning Car Photo'
    )

    if (trophyPath === vehiclePath) {
      throw new ValidationError(
        'Trophy Photo dan Winning Car Photo harus berbeda.'
      )
    }

    await connection.beginTransaction()
    transactionStarted = true

    const [result] = await connection.query(
      `INSERT INTO achievements
       (
         title,
         event_name,
         achievement_year,
         description,
         trophy_image_path,
         vehicle_image_path,
         is_active
       )
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        title,
        eventName,
        year,
        description,
        trophyPath,
        vehiclePath,
      ]
    )

    await connection.commit()
    transactionStarted = false

    return res.status(201).json({
      success: true,
      message: 'Penghargaan berhasil ditambahkan.',
      data: { id: result.insertId },
    })
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback().catch(() => {})
      transactionStarted = false
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    console.error('Gagal menambahkan penghargaan:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    connection.release()
  }
})

// Memperbarui data penghargaan
router.put('/:id', async (req, res) => {
  const connection = await db.getConnection()
  let transactionStarted = false

  try {
    const achievementId = validateId(req.params.id)

    if (!achievementId) {
      throw new ValidationError('ID penghargaan tidak valid.')
    }

    const body = req.body

    const title = validateText(body?.title, 255, 'Achievement Name')
    const eventName = validateText(body?.event_name, 255, 'Event Name')
    const year = validateYear(body?.achievement_year)
    const description = validateDescription(body?.description)

    const trophyPath = validateImagePath(
      body?.trophy_image_path,
      'Trophy Photo'
    )

    const vehiclePath = validateImagePath(
      body?.vehicle_image_path,
      'Winning Car Photo'
    )

    if (trophyPath === vehiclePath) {
      throw new ValidationError(
        'Trophy Photo dan Winning Car Photo harus berbeda.'
      )
    }

    await connection.beginTransaction()
    transactionStarted = true

    const [existingRows] = await connection.query(
      'SELECT * FROM achievements WHERE id = ? FOR UPDATE',
      [achievementId]
    )

    if (existingRows.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Penghargaan tidak ditemukan.',
      })
    }

    const existing = existingRows[0]

    await connection.query(
      `UPDATE achievements
       SET
         title = ?,
         event_name = ?,
         achievement_year = ?,
         description = ?,
         trophy_image_path = ?,
         vehicle_image_path = ?
       WHERE id = ?`,
      [
        title,
        eventName,
        year,
        description,
        trophyPath,
        vehiclePath,
        achievementId,
      ]
    )

    await connection.commit()
    transactionStarted = false

    const oldPaths = [
      existing.trophy_image_path,
      existing.vehicle_image_path,
    ]

    const newPaths = [trophyPath, vehiclePath]

    for (const imagePath of new Set(oldPaths)) {
      if (imagePath && !newPaths.includes(imagePath)) {
        try {
          await deleteUnusedImage(imagePath)
        } catch (cleanupError) {
          console.error('Gagal membersihkan gambar lama:', cleanupError.message)
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Penghargaan berhasil diperbarui.',
    })
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback().catch(() => {})
      transactionStarted = false
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    console.error('Gagal memperbarui penghargaan:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    connection.release()
  }
})

// Menghapus penghargaan
router.delete('/:id', async (req, res) => {
  try {
    const achievementId = validateId(req.params.id)

    if (!achievementId) {
      return res.status(400).json({
        success: false,
        message: 'ID penghargaan tidak valid.',
      })
    }

    const [rows] = await db.query(
      `SELECT trophy_image_path, vehicle_image_path
       FROM achievements
       WHERE id = ?`,
      [achievementId]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Penghargaan tidak ditemukan.',
      })
    }

    await db.query(
      'DELETE FROM achievements WHERE id = ?',
      [achievementId]
    )

    const imagePaths = new Set([
      rows[0].trophy_image_path,
      rows[0].vehicle_image_path,
    ])

    for (const imagePath of imagePaths) {
      if (!imagePath) continue

      try {
        await deleteUnusedImage(imagePath)
      } catch (cleanupError) {
        console.error('Gagal membersihkan gambar lama:', cleanupError.message)
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Penghargaan berhasil dihapus.',
    })
  } catch (error) {
    console.error('Gagal menghapus penghargaan:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

module.exports = router
