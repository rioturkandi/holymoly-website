const express = require('express')
const db = require('../config/database')
const authenticateAdmin = require('../middleware/auth.middleware')
const {
  markImageAttached,
  deleteUnusedImage,
} = require('../services/image-lifecycle.service')

const router = express.Router()

class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Semua endpoint dalam file ini wajib melewati autentikasi admin
router.use(authenticateAdmin)

// Memeriksa apakah request body berupa object
function isValidBody(body) {
  return (
    body !== null &&
    typeof body === 'object' &&
    !Array.isArray(body)
  )
}

// Memvalidasi string yang boleh bernilai null
function validateNullableString(value, maxLength, fieldName) {
  if (value === undefined) {
    return null
  }

  if (value !== null && typeof value !== 'string') {
    throw new ValidationError(`${fieldName} harus berupa teks atau null.`)
  }

  if (value === null) {
    return null
  }

  const result = value.trim()

  if (result.length > maxLength) {
    throw new ValidationError(`${fieldName} maksimal ${maxLength} karakter.`)
  }

  return result || null
}

// Memvalidasi gambar yang berasal dari endpoint upload
function validateImagePath(value) {
  const imagePath = validateNullableString(
    value,
    500,
    'image_path'
  )

  if (
    imagePath !== null &&
    !/^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i.test(imagePath)
  ) {
    throw new ValidationError('image_path harus berasal dari endpoint upload.')
  }

  return imagePath
}

// Memvalidasi URL tombol agar hanya mengarah ke halaman internal
function validateButtonUrl(value) {
  const buttonUrl = validateNullableString(
    value,
    500,
    'button_url'
  )

  if (
    buttonUrl !== null &&
    !/^\/(?:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)?\/?$/.test(buttonUrl)
  ) {
    throw new ValidationError('button_url hanya boleh berupa path internal.')
  }

  return buttonUrl
}

// Memvalidasi status aktif
function validateActive(value) {
  if (
    typeof value !== 'boolean' &&
    value !== 0 &&
    value !== 1
  ) {
    throw new ValidationError('is_active harus berupa boolean.')
  }

  return value ? 1 : 0
}

// Memvalidasi urutan tampilan layanan
function validateDisplayOrder(value) {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new ValidationError('display_order harus berupa bilangan bulat minimal 0.')
  }

  return value
}

// Memastikan ID layanan valid
function validateId(value) {
  const id = Number(value)

  if (!Number.isSafeInteger(id) || id < 1) {
    return null
  }

  return id
}

// Mengambil konten Hero
router.get('/hero', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM home_content
       WHERE section_key = ?
       LIMIT 1`,
      ['hero']
    )

    res.status(200).json({
      success: true,
      data: rows[0] ?? null,
    })
  } catch (error) {
    console.error('Gagal mengambil konten Hero:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

// Membuat atau memperbarui konten Hero
router.put('/hero', async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    if (!isValidBody(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Data yang dikirim tidak valid.',
      })
    }

    const requiredFields = [
      'eyebrow',
      'title',
      'description',
      'button_text',
      'button_url',
      'image_path',
    ]

    const missingFields = requiredFields.filter(
      (field) => !Object.hasOwn(req.body, field)
    )

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field wajib dikirim: ${missingFields.join(', ')}.`,
      })
    }

    const eyebrow = validateNullableString(
      req.body.eyebrow,
      150,
      'eyebrow'
    )

    const title = validateNullableString(
      req.body.title,
      255,
      'title'
    )

    const description = validateNullableString(
      req.body.description,
      65535,
      'description'
    )

    const buttonText = validateNullableString(
      req.body.button_text,
      100,
      'button_text'
    )

    const buttonUrl = validateButtonUrl(req.body.button_url)
    const imagePath = validateImagePath(req.body.image_path)
    const originalImagePath = Object.hasOwn(
      req.body,
      'original_image_path'
    )
      ? validateImagePath(req.body.original_image_path)
      : imagePath

    connection = await db.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [oldHeroRows] = await connection.query(
      `SELECT image_path, original_image_path
       FROM home_content
       WHERE section_key = ?
       LIMIT 1
       FOR UPDATE`,
      ['hero']
    )

    const oldImagePaths = [
      ...new Set(
        [
          oldHeroRows[0]?.image_path,
          oldHeroRows[0]?.original_image_path,
        ].filter(Boolean)
      ),
    ]

    await connection.query(
      `INSERT INTO home_content (
        section_key,
        eyebrow,
        title,
        description,
        button_text,
        button_url,
        image_path,
        original_image_path,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      ON DUPLICATE KEY UPDATE
        eyebrow = ?,
        title = ?,
        description = ?,
        button_text = ?,
        button_url = ?,
        image_path = ?,
        original_image_path = ?,
        is_active = TRUE`,
      [
        'hero',
        eyebrow,
        title,
        description,
        buttonText,
        buttonUrl,
        imagePath,
        originalImagePath,
        eyebrow,
        title,
        description,
        buttonText,
        buttonUrl,
        imagePath,
        originalImagePath,
      ]
    )

    const [rows] = await connection.query(
      `SELECT *
       FROM home_content
       WHERE section_key = ?
       LIMIT 1`,
      ['hero']
    )

    await markImageAttached(connection, [imagePath, originalImagePath])

    await connection.commit()
    transactionStarted = false

    for (const oldImagePath of oldImagePaths) {
      try {
        await deleteUnusedImage(oldImagePath)
      } catch (cleanupError) {
        console.error(
          'Gagal membersihkan gambar Hero lama:',
          oldImagePath,
          cleanupError.message
        )
      }
    }

    res.status(200).json({
      success: true,
      message: 'Konten Hero berhasil disimpan.',
      data: rows[0],
    })
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error(
          'Gagal melakukan rollback konten Hero:',
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

    console.error('Gagal menyimpan konten Hero:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})


// Menghapus gambar Hero tanpa menghapus konten teks
router.delete('/hero/image', async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [rows] = await connection.query(
      `SELECT image_path, original_image_path
       FROM home_content
       WHERE section_key = ? LIMIT 1
       FOR UPDATE`,
      ['hero']
    )

    if (!rows.length) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Konten Hero tidak ditemukan.',
      })
    }

    const imagePaths = [
      rows[0].image_path,
      rows[0].original_image_path,
    ]

    await connection.query(
      `UPDATE home_content
       SET image_path = NULL,
           original_image_path = NULL
       WHERE section_key = ?`,
      ['hero']
    )

    await connection.commit()
    transactionStarted = false

    for (const imagePath of new Set(imagePaths)) {
      if (!imagePath) continue

      try {
        await deleteUnusedImage(imagePath)
      } catch (cleanupError) {
        console.error(
          'Gagal membersihkan gambar Hero:',
          imagePath,
          cleanupError.message
        )
      }
    }

    res.status(200).json({
      success: true,
      message: 'Gambar Hero berhasil dihapus.',
    })
  } catch (error) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error(
          'Gagal melakukan rollback penghapusan gambar Hero:',
          rollbackError.message
        )
      }
    }

    console.error('Gagal menghapus gambar Hero:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

// Menghapus seluruh konten Hero admin
router.delete('/hero', async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [rows] = await connection.query(
      `SELECT image_path, original_image_path
       FROM home_content
       WHERE section_key = ? LIMIT 1
       FOR UPDATE`,
      ['hero']
    )

    if (!rows.length) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Konten Hero tidak ditemukan.',
      })
    }

    const imagePaths = [
      rows[0].image_path,
      rows[0].original_image_path,
    ]

    await connection.query(
      'DELETE FROM home_content WHERE section_key = ?',
      ['hero']
    )

    await connection.commit()
    transactionStarted = false

    for (const imagePath of new Set(imagePaths)) {
      if (!imagePath) continue

      try {
        await deleteUnusedImage(imagePath)
      } catch (cleanupError) {
        console.error(
          'Gagal membersihkan gambar Hero:',
          imagePath,
          cleanupError.message
        )
      }
    }

    res.status(200).json({
      success: true,
      message: 'Seluruh konten Hero berhasil dihapus.',
    })
  } catch (error) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error(
          'Gagal melakukan rollback penghapusan konten Hero:',
          rollbackError.message
        )
      }
    }

    console.error('Gagal menghapus konten Hero:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) {
      connection.release()
    }
  }
})

// Mengambil seluruh layanan, termasuk yang tidak aktif
router.get('/services', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT *
       FROM home_services
       ORDER BY display_order ASC, id ASC`
    )

    res.status(200).json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Gagal mengambil layanan:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

// Menambahkan layanan baru
router.post('/services', async (req, res) => {
  let connection
  let transactionStarted = false

  try {
    if (!isValidBody(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Data yang dikirim tidak valid.',
      })
    }

    if (
      typeof req.body.title !== 'string' ||
      !req.body.title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'title wajib berupa teks dan tidak boleh kosong.',
      })
    }

    const title = validateNullableString(req.body.title, 255, 'title')
    const description = validateNullableString(
      req.body.description ?? null,
      65535,
      'description'
    )
    const imagePath = validateImagePath(req.body.image_path ?? null)
    const isActive = validateActive(req.body.is_active ?? true)
    const displayOrder = validateDisplayOrder(req.body.display_order ?? 0)

    connection = await db.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [result] = await connection.query(
      `INSERT INTO home_services (
        title, description, image_path, is_active, display_order
      ) VALUES (?, ?, ?, ?, ?)`,
      [title, description, imagePath, isActive, displayOrder]
    )

    const [rows] = await connection.query(
      'SELECT * FROM home_services WHERE id = ?',
      [result.insertId]
    )

    if (rows.length === 0) {
      throw new Error('Data layanan tidak ditemukan setelah INSERT.')
    }

    await markImageAttached(connection, [imagePath])

    await connection.commit()
    transactionStarted = false

    res.status(201).json({
      success: true,
      message: 'Layanan berhasil ditambahkan.',
      data: rows[0],
    })
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Gagal melakukan rollback transaksi:', rollbackError.message)
      }
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    console.error('Gagal menambahkan layanan:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) connection.release()
  }
})

// Memperbarui layanan berdasarkan ID
router.put('/services/:id', async (req, res) => {
  let connection
  let transactionStarted = false
  let oldImagePath
  let imagePath

  try {
    const id = validateId(req.params.id)

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID layanan tidak valid.',
      })
    }

    if (!isValidBody(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Data yang dikirim tidak valid.',
      })
    }

    const requiredFields = [
      'title',
      'description',
      'image_path',
      'is_active',
      'display_order',
    ]

    const missingFields = requiredFields.filter(
      (field) => !Object.hasOwn(req.body, field)
    )

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field wajib dikirim: ${missingFields.join(', ')}.`,
      })
    }

    const title = validateNullableString(req.body.title, 255, 'title')

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'title wajib diisi.',
      })
    }

    const description = validateNullableString(
      req.body.description,
      65535,
      'description'
    )
    imagePath = validateImagePath(req.body.image_path)
    const isActive = validateActive(req.body.is_active)
    const displayOrder = validateDisplayOrder(req.body.display_order)

    connection = await db.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [existing] = await connection.query(
      `SELECT id, image_path
       FROM home_services
       WHERE id = ?
       LIMIT 1
       FOR UPDATE`,
      [id]
    )

    if (existing.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Layanan tidak ditemukan.',
      })
    }

    oldImagePath = existing[0].image_path

    await connection.query(
      `UPDATE home_services
       SET title = ?,
           description = ?,
           image_path = ?,
           is_active = ?,
           display_order = ?
       WHERE id = ?`,
      [title, description, imagePath, isActive, displayOrder, id]
    )

    const [rows] = await connection.query(
      'SELECT * FROM home_services WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      throw new Error('Data layanan tidak ditemukan setelah UPDATE.')
    }

    await markImageAttached(connection, [imagePath])

    await connection.commit()
    transactionStarted = false

    if (oldImagePath && oldImagePath !== imagePath) {
      try {
        await deleteUnusedImage(oldImagePath)
      } catch (cleanupError) {
        console.error(
          'Gagal membersihkan gambar layanan lama:',
          oldImagePath,
          cleanupError.message
        )
      }
    }

    res.status(200).json({
      success: true,
      message: 'Layanan berhasil diperbarui.',
      data: rows[0],
    })
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Gagal melakukan rollback transaksi:', rollbackError.message)
      }
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    console.error('Gagal memperbarui layanan:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) connection.release()
  }
})

// Menghapus layanan secara permanen
router.delete('/services/:id', async (req, res) => {
  let connection
  let transactionStarted = false
  let oldImagePath

  try {
    const id = validateId(req.params.id)

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID layanan tidak valid.',
      })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [existing] = await connection.query(
      `SELECT id, image_path
       FROM home_services
       WHERE id = ?
       LIMIT 1
       FOR UPDATE`,
      [id]
    )

    if (existing.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        success: false,
        message: 'Layanan tidak ditemukan.',
      })
    }

    oldImagePath = existing[0].image_path

    await connection.query(
      'DELETE FROM home_services WHERE id = ?',
      [id]
    )

    await connection.commit()
    transactionStarted = false

    if (oldImagePath) {
      try {
        await deleteUnusedImage(oldImagePath)
      } catch (cleanupError) {
        console.error(
          'Gagal membersihkan gambar layanan:',
          oldImagePath,
          cleanupError.message
        )
      }
    }

    res.status(200).json({
      success: true,
      message: 'Layanan berhasil dihapus.',
    })
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Gagal melakukan rollback transaksi:', rollbackError.message)
      }
    }

    console.error('Gagal menghapus layanan:', error.message)

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  } finally {
    if (connection) connection.release()
  }
})

module.exports = router
