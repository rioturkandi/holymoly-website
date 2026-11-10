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
    throw new ValidationError(`${fieldName} maksimal ${maxLength} karakter.`)
  }

  return result
}

function validateImagePath(value, fieldName) {
  const result = validateText(value, 500, fieldName)

  if (!/^\/uploads\/[0-9a-f-]{36}\.webp$/i.test(result)) {
    throw new ValidationError(`${fieldName} tidak valid.`)
  }

  return result
}

function validatePosition(value, fieldName) {
  if (value === undefined || value === null) return 50

  const position = Number(value)

  if (!Number.isFinite(position) || position < 0 || position > 100) {
    throw new ValidationError(`${fieldName} harus berada di antara 0 dan 100.`)
  }

  return position
}

// Menghapus file hanya jika sudah tidak digunakan tabel mana pun
async function deleteUnusedImage(imagePath) {
  if (!imagePath) return

  const [rows] = await db.query(
    `SELECT
      (SELECT COUNT(*) FROM about_content WHERE image_path = ?) +
      (SELECT COUNT(*) FROM home_content WHERE image_path = ?) +
      (SELECT COUNT(*) FROM home_services WHERE image_path = ?) +
      (SELECT COUNT(*) FROM project_images WHERE image_path = ?) +
      (SELECT COUNT(*) FROM workshop_images WHERE image_path = ?)
      AS usage_count`,
    [imagePath, imagePath, imagePath, imagePath, imagePath]
  )

  if (Number(rows[0].usage_count) > 0) return

  const uploadDirectory = path.resolve(__dirname, '../uploads')
  const filePath = path.resolve(uploadDirectory, path.basename(imagePath))

  if (path.dirname(filePath) !== uploadDirectory) return

  try {
    await fs.unlink(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

// Mengambil seluruh proyek beserta cover dan detail photos
router.get('/', async (req, res) => {
  try {
    const [projects] = await db.query(
      `SELECT *
       FROM projects
       ORDER BY display_order ASC, id DESC`
    )

    const [images] = await db.query(
      `SELECT id, project_id, image_path, image_type, alt_text, display_order,
              position_x, position_y
       FROM project_images
       ORDER BY display_order ASC, id ASC`
    )

    const data = projects.map((project) => {
      const projectImages = images.filter(
        (image) => image.project_id === project.id
      )

      return {
        ...project,
        cover: projectImages.find(
          (image) => image.image_type === 'cover'
        ) || null,
        gallery: projectImages.filter(
          (image) => image.image_type === 'detail'
        ),
      }
    })

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('Gagal mengambil Admin Projects:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

// Menambahkan proyek baru
router.post('/', async (req, res) => {
  const connection = await db.getConnection()

  try {
    const body = req.body

    const title = validateText(body?.vehicle_name, 255, 'Title')
    const description = validateText(body?.description, 500, 'Description')
    const coverPath = validateImagePath(body?.cover_image_path, 'Cover Photo')
    const coverPositionX = validatePosition(
      body?.cover_position_x,
      'Posisi horizontal cover'
    )
    const coverPositionY = validatePosition(
      body?.cover_position_y,
      'Posisi vertikal cover'
    )

    if (
      !Array.isArray(body?.detail_image_paths) ||
      body.detail_image_paths.length < 3 ||
      body.detail_image_paths.length > 8
    ) {
      throw new ValidationError('Detail Photos harus berjumlah 3 sampai 8.')
    }

    const detailPaths = body.detail_image_paths.map((imagePath, index) =>
      validateImagePath(imagePath, `Detail Photo ${index + 1}`)
    )

    if (new Set([coverPath, ...detailPaths]).size !== 1 + detailPaths.length) {
      throw new ValidationError('Foto proyek tidak boleh duplikat.')
    }

    await connection.beginTransaction()

    const [projectResult] = await connection.query(
      `INSERT INTO projects (vehicle_name, description)
       VALUES (?, ?)`,
      [title, description]
    )

    const projectId = projectResult.insertId

    await connection.query(
      `INSERT INTO project_images
       (project_id, image_path, image_type, display_order, position_x, position_y)
       VALUES (?, ?, 'cover', 0, ?, ?)`,
      [projectId, coverPath, coverPositionX, coverPositionY]
    )

    for (const [index, imagePath] of detailPaths.entries()) {
      await connection.query(
        `INSERT INTO project_images
         (project_id, image_path, image_type, display_order)
         VALUES (?, ?, 'detail', ?)`,
        [projectId, imagePath, index]
      )
    }

    await connection.commit()

    return res.status(201).json({
      success: true,
      message: 'Proyek berhasil ditambahkan.',
      data: { id: projectId },
    })
  } catch (error) {
    await connection.rollback()

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    console.error('Gagal menambahkan proyek:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    connection.release()
  }
})

// Menghapus proyek tanpa menghapus foto yang masih digunakan
router.delete('/:id', async (req, res) => {
  try {
    const projectId = validateId(req.params.id)

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'ID proyek tidak valid.',
      })
    }

    const [projects] = await db.query(
      'SELECT id FROM projects WHERE id = ?',
      [projectId]
    )

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan.',
      })
    }

    const [images] = await db.query(
      'SELECT image_path FROM project_images WHERE project_id = ?',
      [projectId]
    )

    await db.query('DELETE FROM projects WHERE id = ?', [projectId])

    const imagePaths = [...new Set(images.map((image) => image.image_path))]

    for (const imagePath of imagePaths) {
      await deleteUnusedImage(imagePath)
    }

    return res.status(200).json({
      success: true,
      message: 'Proyek berhasil dihapus.',
    })
  } catch (error) {
    console.error('Gagal menghapus proyek:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

module.exports = router
