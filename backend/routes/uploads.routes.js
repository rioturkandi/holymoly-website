const express = require('express')
const { rateLimit } = require('express-rate-limit')
const fs = require('fs/promises')
const path = require('path')
const db = require('../config/database')
const authenticateAdmin = require('../middleware/auth.middleware')
const {
  uploadImage,
  processImage,
} = require('../middleware/upload.middleware')

const router = express.Router()

// Lokasi penyimpanan gambar hasil pemrosesan
const uploadDirectory = path.join(__dirname, '../uploads')

// Membatasi frekuensi upload gambar administrator
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan upload. Silakan coba lagi nanti.',
  },
})

// Endpoint untuk mengunggah satu gambar oleh administrator
router.post(
  '/image',
  uploadLimiter,
  authenticateAdmin,
  uploadImage,
  processImage,
  async (req, res) => {
    res.set('Cache-Control', 'no-store')

    const { filename, path: imagePath } = req.uploadedImage

    try {
      // Mencatat gambar baru sebagai pending selama masa grace period
      await db.query(
        `INSERT INTO image_uploads (
          image_path,
          uploaded_by,
          status,
          pending_since
        ) VALUES (?, ?, 'pending', NOW())`,
        [imagePath, req.admin.id]
      )

      // Mengirim path hanya setelah tracking berhasil
      return res.status(201).json({
        success: true,
        message: 'Gambar berhasil diunggah dan diproses.',
        data: {
          filename,
          path: imagePath,
        },
      })
    } catch (error) {
      console.error('Pencatatan upload gambar gagal:', error.message)

      // Memastikan apakah INSERT mungkin sudah berhasil di database
      let imageRecordExists = null

      try {
        const [records] = await db.query(
          `SELECT id
           FROM image_uploads
           WHERE image_path = ?
           LIMIT 1`,
          [imagePath]
        )

        imageRecordExists = records.length > 0
      } catch (verificationError) {
        console.error(
          'Verifikasi record upload gagal:',
          verificationError.message
        )
      }

      // Hanya membersihkan file jika database memastikan record tidak ada
      if (imageRecordExists === false) {
        try {
          const safeFilename = path.basename(filename)

          if (safeFilename === filename) {
            await fs.unlink(path.join(uploadDirectory, safeFilename))
          } else {
            console.error(
              'Pembersihan file upload dilewati: nama file tidak valid.'
            )
          }
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') {
            console.error(
              'Pembersihan file upload gagal:',
              cleanupError.message
            )
          }
        }
      } else if (imageRecordExists === null) {
        // File dipertahankan agar tidak menghapus gambar yang mungkin sudah tercatat
        console.error(
          'File upload dipertahankan untuk rekonsiliasi:',
          imagePath
        )
      }

      return res.status(500).json({
        success: false,
        message: 'Server gagal mencatat upload gambar.',
      })
    }
  }
)

module.exports = router
