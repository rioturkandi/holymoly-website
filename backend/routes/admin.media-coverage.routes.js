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

function validateImagePath(value) {
  const imagePath = validateText(value, 500, 'Foto')

  if (!/^\/uploads\/[0-9a-f-]{36}\.webp$/i.test(imagePath)) {
    throw new ValidationError('Path foto tidak valid.')
  }

  return imagePath
}

function validatePublicationDate(value) {
  const date = validateText(value, 10, 'Tanggal Publikasi')

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Format tanggal publikasi harus YYYY-MM-DD.')
  }

  const year = Number(date.slice(0, 4))
  const parsedDate = new Date(`${date}T00:00:00.000Z`)

  if (
    year < 1000 ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw new ValidationError('Tanggal publikasi tidak valid.')
  }

  return date
}

function validateArticleUrl(value) {
  const articleUrl = validateText(value, 2048, 'Tautan Artikel')

  try {
    const parsedUrl = new URL(articleUrl)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol')
    }
  } catch {
    throw new ValidationError(
      'Tautan Artikel harus berupa URL HTTP atau HTTPS yang valid.'
    )
  }

  return articleUrl
}

function validateImagePosition(value, fieldName) {
  if (value === undefined || value === null) return 50

  const position = Number(value)

  if (
    !Number.isInteger(position) ||
    position < 0 ||
    position > 100
  ) {
    throw new ValidationError(
      `${fieldName} harus berupa angka bulat antara 0 sampai 100.`
    )
  }

  return position
}

// Menghapus foto hanya jika tidak digunakan oleh data lain
async function deleteUnusedImage(imagePath) {
  if (!imagePath) return

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

// Mengambil seluruh data Media Coverage untuk administrator
router.get('/', async (req, res) => {
  try {
    const [mediaCoverage] = await db.query(
      `SELECT *
       FROM media_coverage
       ORDER BY publication_date DESC, id DESC`
    )

    return res.status(200).json({
      success: true,
      data: mediaCoverage,
    })
  } catch (error) {
    console.error('Gagal mengambil Admin Media Coverage:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

// Menambahkan Media Coverage baru
router.post('/', async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    const body = req.body

    const title = validateText(body?.title, 255, 'Judul Artikel')
    const imagePath = validateImagePath(body?.image_path)
    const originalImagePath = body?.original_image_path
      ? validateImagePath(body.original_image_path)
      : imagePath
    const publicationDate = validatePublicationDate(
      body?.publication_date
    )
    const articleUrl = validateArticleUrl(body?.article_url)
    const imagePositionX = validateImagePosition(
      body?.image_position_x,
      'Posisi horizontal foto'
    )
    const imagePositionY = validateImagePosition(
      body?.image_position_y,
      'Posisi vertikal foto'
    )

    connection = await db.getConnection()

    await connection.beginTransaction()
    transactionStarted = true

    const [result] = await connection.query(
      `INSERT INTO media_coverage
       (title, image_path, original_image_path,
        image_position_x, image_position_y, publication_date, article_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        imagePath,
        originalImagePath,
        imagePositionX,
        imagePositionY,
        publicationDate,
        articleUrl,
      ]
    )

    await connection.commit()
    transactionStarted = false

    return res.status(201).json({
      success: true,
      message: 'Media Coverage berhasil ditambahkan.',
      data: { id: result.insertId },
    })
  } catch (error) {
    if (transactionStarted && connection) {
      await connection.rollback().catch(() => {})
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    console.error('Gagal menambahkan Media Coverage:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) connection.release()
  }
})

// Memperbarui Media Coverage
router.put('/:id', async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    const mediaId = validateId(req.params.id)

    if (!mediaId) {
      throw new ValidationError('ID Media Coverage tidak valid.')
    }

    const body = req.body

    const title = validateText(body?.title, 255, 'Judul Artikel')
    const imagePath = validateImagePath(body?.image_path)
    const requestedOriginalImagePath = body?.original_image_path
      ? validateImagePath(body.original_image_path)
      : null
    const publicationDate = validatePublicationDate(
      body?.publication_date
    )
    const articleUrl = validateArticleUrl(body?.article_url)
    const imagePositionX = validateImagePosition(
      body?.image_position_x,
      'Posisi horizontal foto'
    )
    const imagePositionY = validateImagePosition(
      body?.image_position_y,
      'Posisi vertikal foto'
    )

    connection = await db.getConnection()

    await connection.beginTransaction()
    transactionStarted = true

    const [existingRows] = await connection.query(
      'SELECT * FROM media_coverage WHERE id = ? FOR UPDATE',
      [mediaId]
    )

    if (existingRows.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Media Coverage tidak ditemukan.',
      })
    }

    const existing = existingRows[0]
    const originalImagePath =
      requestedOriginalImagePath ||
      existing.original_image_path ||
      existing.image_path

    await connection.query(
      `UPDATE media_coverage
       SET title = ?, image_path = ?, original_image_path = ?,
           image_position_x = ?, image_position_y = ?,
           publication_date = ?, article_url = ?
       WHERE id = ?`,
      [
        title,
        imagePath,
        originalImagePath,
        imagePositionX,
        imagePositionY,
        publicationDate,
        articleUrl,
        mediaId,
      ]
    )

    await connection.commit()
    transactionStarted = false

    const oldImagePaths = new Set([
      existing.image_path,
      existing.original_image_path,
    ])

    for (const oldPath of oldImagePaths) {
      if (!oldPath) continue

      try {
        await deleteUnusedImage(oldPath)
      } catch (cleanupError) {
        console.error(
          'Gagal membersihkan foto lama:',
          cleanupError.message
        )
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Media Coverage berhasil diperbarui.',
    })
  } catch (error) {
    if (transactionStarted && connection) {
      await connection.rollback().catch(() => {})
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    console.error('Gagal memperbarui Media Coverage:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) connection.release()
  }
})

// Menghapus Media Coverage
router.delete('/:id', async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    const mediaId = validateId(req.params.id)

    if (!mediaId) {
      return res.status(400).json({
        success: false,
        message: 'ID Media Coverage tidak valid.',
      })
    }

    connection = await db.getConnection()

    await connection.beginTransaction()
    transactionStarted = true

    const [rows] = await connection.query(
      `SELECT image_path, original_image_path
       FROM media_coverage WHERE id = ? FOR UPDATE`,
      [mediaId]
    )

    if (rows.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Media Coverage tidak ditemukan.',
      })
    }

    await connection.query(
      'DELETE FROM media_coverage WHERE id = ?',
      [mediaId]
    )

    await connection.commit()
    transactionStarted = false

    const imagePaths = new Set([
      rows[0].image_path,
      rows[0].original_image_path,
    ])

    for (const imagePath of imagePaths) {
      if (!imagePath) continue

      try {
        await deleteUnusedImage(imagePath)
      } catch (cleanupError) {
        console.error(
          'Gagal membersihkan foto Media Coverage:',
          cleanupError.message
        )
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Media Coverage berhasil dihapus.',
    })
  } catch (error) {
    if (transactionStarted && connection) {
      await connection.rollback().catch(() => {})
    }

    console.error('Gagal menghapus Media Coverage:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
