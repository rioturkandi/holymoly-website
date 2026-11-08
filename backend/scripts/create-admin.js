
const bcrypt = require('bcryptjs')
const db = require('../config/database')
const readline = require('readline')
const { stdin, stdout } = require('process')

// Membuat interface untuk menerima input dari terminal
const terminal = readline.createInterface({
  input: stdin,
  output: stdout,
})

// Meminta email administrator
terminal.question('Masukkan email admin: ', (emailInput) => {
  const email = emailInput.trim().toLowerCase()

  // Meminta password administrator
  terminal.question('Masukkan password admin: ', async (passwordInput) => {
    const password = passwordInput

    try {
      // Memeriksa format email dan password
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        password.length < 12 ||
        Buffer.byteLength(password, 'utf8') > 72
      ) {
        throw new Error(
          'Email tidak valid atau password tidak memenuhi ketentuan.'
        )
      }

      // Memastikan belum ada akun administrator
      const [admins] = await db.query(
        'SELECT id FROM admin_users LIMIT 1'
      )

      if (admins.length > 0) {
        throw new Error(
          'Akun administrator sudah tersedia. Pembuatan admin baru ditolak.'
        )
      }

      // Mengubah password menjadi hash
      const passwordHash = await bcrypt.hash(password, 12)

      // Menyimpan akun administrator ke database
      await db.query(
        `INSERT INTO admin_users (email, password_hash, status)
         VALUES (?, ?, 'active')`,
        [email, passwordHash]
      )

      console.log('\nAkun administrator berhasil dibuat.')
      console.log('Email:', email)
    } catch (error) {
      console.error('\nGagal membuat akun administrator:')
      console.error(error.message)
    } finally {
      // Menutup interface terminal dan koneksi database
      terminal.close()
      await db.end()
    }
  })
})
