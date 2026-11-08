const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/database')
const authenticateAdmin = require('../middleware/auth.middleware')

const router = express.Router()

// Endpoint untuk login administrator
router.post('/login', async (req, res) => {
  try {
    // Memastikan JWT_SECRET tersedia
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET belum dikonfigurasi.')

      return res.status(500).json({
        success: false,
        message: 'Konfigurasi autentikasi server belum tersedia.',
      })
    }

    // Mengambil email dan password dari request body
    const { email, password } = req.body || {}

    // Memastikan email dan password memiliki format yang benar
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      email.trim().length > 191 ||
      password.length === 0 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email atau password memiliki format yang tidak valid.',
      })
    }

    // Menyamakan format email sebelum mencari akun
    const normalizedEmail = email.trim().toLowerCase()

    // Mencari akun administrator berdasarkan email
    const [admins] = await db.query(
      `SELECT id, email, password_hash, status
       FROM admin_users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail]
    )

    // Menolak login jika akun tidak ditemukan atau tidak aktif
    if (admins.length === 0 || admins[0].status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      })
    }

    const admin = admins[0]

    // Membandingkan password dengan hash yang tersimpan di database
    const passwordMatch = await bcrypt.compare(
      password,
      admin.password_hash
    )

    // Menolak login jika password tidak cocok
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      })
    }

    // Membuat token JWT untuk administrator
    const token = jwt.sign(
      {
        id: admin.id,
        role: 'admin',
      },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1h',
        issuer: 'holymoly-api',
        audience: 'holymoly-admin',
      }
    )

    // Mengirim token dan informasi administrator ke frontend
    res.set('Cache-Control', 'no-store')

    return res.status(200).json({
      success: true,
      message: 'Login administrator berhasil.',
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
        },
      },
    })
  } catch (error) {
    console.error('Login administrator gagal:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    })
  }
})

// Endpoint untuk memeriksa identitas administrator yang sedang login
router.get('/me', authenticateAdmin, (req, res) => {
  res.set('Cache-Control', 'no-store')

  res.status(200).json({
    success: true,
    data: {
      admin: req.admin,
    },
  })
})

module.exports = router