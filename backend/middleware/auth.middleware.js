const jwt = require('jsonwebtoken')
const db = require('../config/database')

// Middleware untuk memeriksa autentikasi administrator
async function authenticateAdmin(req, res, next) {
  // Memastikan JWT_SECRET tersedia
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET belum dikonfigurasi.')

    return res.status(500).json({
      success: false,
      message: 'Konfigurasi autentikasi server belum tersedia.',
    })
  }

  try {
    // Mengambil token dari Authorization Header
    const authorization = req.headers.authorization

    // Memastikan header menggunakan format Bearer
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi tidak ditemukan.',
      })
    }

    // Mengambil bagian token setelah kata Bearer
    const token = authorization.split(' ')[1]

    // Memastikan token tersedia
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi tidak valid.',
      })
    }

    // Memverifikasi token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'holymoly-api',
      audience: 'holymoly-admin',
    })

    // Memastikan token memang diterbitkan untuk administrator
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses hanya tersedia untuk administrator.',
      })
    }

    // Memeriksa apakah akun administrator masih aktif
    const [admins] = await db.query(
      `SELECT id, email, status
       FROM admin_users
       WHERE id = ?
       LIMIT 1`,
      [decoded.id]
    )

    // Menolak token jika akun tidak ditemukan atau tidak aktif
    if (admins.length === 0 || admins[0].status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Akun administrator tidak aktif atau tidak ditemukan.',
      })
    }

    // Menyimpan identitas admin agar dapat digunakan endpoint berikutnya
    req.admin = {
      id: admins[0].id,
      email: admins[0].email,
    }

    // Melanjutkan request ke endpoint berikutnya
    next()
  } catch (error) {
    // Menangani token kedaluwarsa atau tidak valid
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah kedaluwarsa.',
      })
    }

    // Menangani kesalahan server atau database
    console.error('Autentikasi admin gagal:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
}

module.exports = authenticateAdmin
