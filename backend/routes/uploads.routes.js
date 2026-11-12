
const express = require('express')
const { rateLimit } = require('express-rate-limit')
const authenticateAdmin = require('../middleware/auth.middleware')
const {
  uploadImage,
  processImage,
} = require('../middleware/upload.middleware')

const router = express.Router()

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
  (req, res) => {
    res.set('Cache-Control', 'no-store')

    return res.status(201).json({
      success: true,
      message: 'Gambar berhasil diunggah dan diproses.',
      data: {
        filename: req.uploadedImage.filename,
        path: req.uploadedImage.path,
      },
    })
  }
)

module.exports = router
