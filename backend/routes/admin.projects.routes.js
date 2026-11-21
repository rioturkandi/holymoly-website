const express = require('express')
const db = require('../config/database')
const authenticateAdmin = require('../middleware/auth.middleware')
const {
  markImageAttached,
  deleteUnusedImage,
} = require('../services/image-lifecycle.service')

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

  if (!/^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i.test(result)) {
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
  let connection
  let transactionStarted = false

  try {
    connection = await db.getConnection()
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
    transactionStarted = true

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

    await markImageAttached(connection, [coverPath, ...detailPaths])

    await connection.commit()
    transactionStarted = false

    return res.status(201).json({
      success: true,
      message: 'Proyek berhasil ditambahkan.',
      data: { id: projectId },
    })
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error(
          'Gagal melakukan rollback proyek:',
          rollbackError.message
        )
      }
    }

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
    if (connection) connection.release()
  }
})

// Memperbarui proyek beserta cover dan detail photos
router.put('/:id', async (req, res) => {
  let connection
  let transactionStarted = false
  let oldImagePaths = []

  try {
    const projectId = validateId(req.params.id)

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'ID proyek tidak valid.',
      })
    }

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

    const newImagePaths = [coverPath, ...detailPaths]

    if (new Set(newImagePaths).size !== newImagePaths.length) {
      throw new ValidationError('Foto proyek tidak boleh duplikat.')
    }

    connection = await db.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    // Mengunci project agar tidak diubah bersamaan oleh transaksi lain.
    const [projects] = await connection.query(
      'SELECT id FROM projects WHERE id = ? FOR UPDATE',
      [projectId]
    )

    if (projects.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan.',
      })
    }

    // Mencatat foto lama sebelum susunan foto diperbarui.
    const [oldImages] = await connection.query(
      'SELECT image_path FROM project_images WHERE project_id = ? FOR UPDATE',
      [projectId]
    )

    oldImagePaths = [
      ...new Set(oldImages.map((image) => image.image_path)),
    ]

    // Memperbarui informasi utama project.
    await connection.query(
      `UPDATE projects
       SET vehicle_name = ?, description = ?
       WHERE id = ?`,
      [title, description, projectId]
    )

    // Mengganti susunan foto di dalam transaksi yang sama.
    await connection.query(
      'DELETE FROM project_images WHERE project_id = ?',
      [projectId]
    )

    // Menyimpan cover beserta posisi crop.
    await connection.query(
      `INSERT INTO project_images
       (project_id, image_path, image_type, display_order, position_x, position_y)
       VALUES (?, ?, 'cover', 0, ?, ?)`,
      [projectId, coverPath, coverPositionX, coverPositionY]
    )

    // Menyimpan kembali seluruh foto detail sesuai urutannya.
    for (const [index, imagePath] of detailPaths.entries()) {
      await connection.query(
        `INSERT INTO project_images
         (project_id, image_path, image_type, display_order)
         VALUES (?, ?, 'detail', ?)`,
        [projectId, imagePath, index]
      )
    }

    // Menandai seluruh foto yang digunakan project sebagai attached.
    await markImageAttached(connection, newImagePaths)

    await connection.commit()
    transactionStarted = false

    // Memisahkan foto yang masih digunakan dari foto yang sudah diganti.
    const retainedPaths = new Set(newImagePaths)
    const obsoletePaths = oldImagePaths.filter(
      (imagePath) => !retainedPaths.has(imagePath)
    )

    // Penghapusan file dilakukan setelah transaksi berhasil.
    for (const imagePath of obsoletePaths) {
      try {
        await deleteUnusedImage(imagePath)
      } catch (cleanupError) {
        console.error(
          'Gagal membersihkan foto lama proyek:',
          imagePath,
          cleanupError.message
        )
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Proyek berhasil diperbarui.',
      data: { id: projectId },
    })
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error(
          'Gagal melakukan rollback pembaruan proyek:',
          rollbackError.message
        )
      }
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    console.error('Gagal memperbarui proyek:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) connection.release()
  }
})

// Menghapus proyek tanpa menghapus foto yang masih digunakan
router.delete('/:id', async (req, res) => {
  let connection
  let transactionStarted = false
  let imagePaths

  try {
    const projectId = validateId(req.params.id)

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'ID proyek tidak valid.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [projects] = await connection.query(
      'SELECT id FROM projects WHERE id = ? FOR UPDATE',
      [projectId]
    )

    if (projects.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan.',
      })
    }

    const [images] = await connection.query(
      'SELECT image_path FROM project_images WHERE project_id = ?',
      [projectId]
    )

    imagePaths = [...new Set(images.map((image) => image.image_path))]

    await connection.query(
      'DELETE FROM projects WHERE id = ?',
      [projectId]
    )

    await connection.commit()
    transactionStarted = false

    for (const imagePath of imagePaths) {
      try {
        await deleteUnusedImage(imagePath)
      } catch (cleanupError) {
        console.error(
          'Gagal membersihkan foto proyek:',
          imagePath,
          cleanupError.message
        )
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Proyek berhasil dihapus.',
    })
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error(
          'Gagal melakukan rollback penghapusan proyek:',
          rollbackError.message
        )
      }
    }

    console.error('Gagal menghapus proyek:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
