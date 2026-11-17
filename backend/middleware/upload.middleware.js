
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs/promises')
const crypto = require('crypto')

// Lokasi penyimpanan gambar hasil pemrosesan
const uploadDirectory = path.join(__dirname, '../uploads')

// Format MIME yang boleh diterima pada tahap awal
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

// Konfigurasi Multer untuk menerima file di memori sementara
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB per gambar
    files: 1, // Maksimal satu gambar per request
    fields: 10,
    fieldNameSize: 100,
    fieldSize: 10 * 1024,
  },
  fileFilter: (req, file, callback) => {
    // Pemeriksaan MIME awal, bukan pemeriksaan keaslian file
    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error(
        'Format gambar harus JPEG, PNG, atau WebP.'
      )
      error.code = 'INVALID_IMAGE_FORMAT'
      return callback(error)
    }

    callback(null, true)
  },
})

// Middleware untuk menerima satu file dengan nama field "image"
function uploadImage(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'Ukuran gambar maksimal 5 MB.',
          })
        }

        return res.status(400).json({
          success: false,
          message: 'Upload gambar tidak valid.',
        })
      }

      if (error.code === 'INVALID_IMAGE_FORMAT') {
        return res.status(400).json({
          success: false,
          message: error.message,
        })
      }

      console.error('Upload image middleware error:', error.message)

      return res.status(500).json({
        success: false,
        message: 'Gagal menerima gambar.',
      })
    }

    next()
  })
}

// Middleware untuk memvalidasi dan memproses gambar
async function processImage(req, res, next) {
  let outputPath

  try {
    // Memastikan file benar-benar dikirim
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Gambar wajib diunggah.',
      })
    }

    // Membaca metadata berdasarkan isi file, bukan nama file
    const metadata = await sharp(req.file.buffer, {
      limitInputPixels: 20_000_000,
    }).metadata()

    // Memastikan format asli gambar sesuai daftar yang diizinkan
    if (!['jpeg', 'png', 'webp'].includes(metadata.format)) {
      return res.status(400).json({
        success: false,
        message: 'Isi file bukan gambar JPEG, PNG, atau WebP yang valid.',
      })
    }

    // Menolak gambar tanpa dimensi yang valid
    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width * metadata.height > 20_000_000
    ) {
      return res.status(400).json({
        success: false,
        message: 'Dimensi gambar tidak valid atau terlalu besar.',
      })
    }

    // Menolak gambar animasi
    if (metadata.pages && metadata.pages > 1) {
      return res.status(400).json({
        success: false,
        message: 'Gambar animasi belum didukung.',
      })
    }

    // Membuat folder uploads jika belum tersedia
    await fs.mkdir(uploadDirectory, { recursive: true })

    // Membuat nama file acak
    const filename = `${crypto.randomUUID()}.webp`

    // Menentukan lokasi penyimpanan hasil konversi
    outputPath = path.join(uploadDirectory, filename)

    // Mengonversi dan mendekode gambar menjadi WebP
    await sharp(req.file.buffer, {
      limitInputPixels: 20_000_000,
    })
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(outputPath)

    // Menyimpan informasi gambar untuk endpoint berikutnya
    req.uploadedImage = {
      filename,
      path: `/uploads/${filename}`,
    }

  } catch (error) {
    // Membersihkan file jika proses penyimpanan gagal
    if (outputPath) {
      try {
        await fs.unlink(outputPath)
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          console.error(
            'Pembersihan file upload gagal:',
            cleanupError.message
          )
        }
      }
    }

    // Membedakan kesalahan penyimpanan server dan gambar tidak valid
    const serverErrorCodes = [
      'EACCES',
      'ENOSPC',
      'EROFS',
      'EMFILE',
      'ENFILE',
      'EIO',
      'EBUSY',
    ]

    const isServerError = serverErrorCodes.includes(error.code)

    console.error('Pemrosesan gambar gagal:', error.message)

    return res.status(isServerError ? 500 : 400).json({
      success: false,
      message: isServerError
        ? 'Server gagal menyimpan gambar.'
        : 'Gambar tidak valid atau gagal diproses.',
    })
  }

  // Melanjutkan proses setelah pemrosesan gambar berhasil
  next()
}

module.exports = {
  uploadImage,
  processImage,
}
