
const express = require('express')
const authenticateAdmin = require('../middleware/auth.middleware')
const {
  uploadImage,
  processImage,
} = require('../middleware/upload.middleware')

const router = express.Router()

// Endpoint untuk mengunggah satu gambar oleh administrator
router.post(
  '/image',
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
