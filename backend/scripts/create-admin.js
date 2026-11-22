const path = require('path')
const dotenv = require('dotenv')

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

const bcrypt = require('bcryptjs')
const db = require('../config/database')
const readline = require('readline')
const { stdin, stdout } = require('process')

const LOCK_NAME = 'holymoly_initial_admin_bootstrap'

function askHidden(prompt) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || !stdout.isTTY) {
      reject(new Error('Script harus dijalankan melalui terminal interaktif.'))
      return
    }

    let password = ''
    const wasRaw = stdin.isRaw

    function cleanup() {
      stdin.removeListener('data', onData)
      stdin.setRawMode(wasRaw)
      stdin.pause()
    }

    function onData(key) {
      if (key === '\u0003' || key === '\u0004') {
        cleanup()
        stdout.write('\n')
        reject(new Error('Input password dibatalkan.'))
        return
      }

      if (key === '\r' || key === '\n') {
        cleanup()
        stdout.write('\n')
        resolve(password)
        return
      }

      if (key === '\u007f' || key === '\b') {
        password = Array.from(password).slice(0, -1).join('')
        return
      }

      if (!key.startsWith('\u001b') && key >= ' ') {
        password += key
      }
    }

    stdout.write(prompt)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    stdin.on('data', onData)
  })
}

async function main() {
  let connection
  let lockAcquired = false
  let terminal

  try {
    terminal = readline.createInterface({
      input: stdin,
      output: stdout,
    })

    const emailInput = await new Promise((resolve) => {
      terminal.question('Masukkan email admin: ', resolve)
    })

    terminal.close()
    terminal = null

    const email = emailInput.trim().toLowerCase()
    const password = await askHidden('Masukkan password admin: ')

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      Buffer.byteLength(email, 'utf8') > 191 ||
      password.length < 12 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      throw new Error(
        'Email tidak valid atau password tidak memenuhi ketentuan.'
      )
    }

    connection = await db.getConnection()

    const [lockResult] = await connection.query(
      'SELECT GET_LOCK(?, 10) AS acquired',
      [LOCK_NAME]
    )

    if (Number(lockResult[0].acquired) !== 1) {
      throw new Error(
        'Tidak dapat memperoleh lock bootstrap admin. Coba lagi.'
      )
    }

    lockAcquired = true

    const [admins] = await connection.query(
      'SELECT id FROM admin_users LIMIT 1'
    )

    if (admins.length > 0) {
      throw new Error(
        'Akun administrator sudah tersedia. Pembuatan admin pertama ditolak.'
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await connection.execute(
      `INSERT INTO admin_users (email, password_hash, status)
       VALUES (?, ?, 'active')`,
      [email, passwordHash]
    )

    console.log('\nAkun administrator berhasil dibuat.')
    console.log('Email:', email)
  } catch (error) {
    console.error('\nGagal membuat akun administrator:')
    console.error(error.message)
    process.exitCode = 1
  } finally {
    if (terminal) {
      terminal.close()
    }

    if (connection) {
      if (lockAcquired) {
        try {
          await connection.query(
            'SELECT RELEASE_LOCK(?)',
            [LOCK_NAME]
          )
        } catch (error) {
          console.error('Peringatan: gagal melepas bootstrap lock.')
          process.exitCode = 1
        }
      }

      connection.release()
    }

    try {
      await db.end()
    } catch (error) {
      console.error('Gagal menutup koneksi database.')
      process.exitCode = 1
    }
  }
}

main().catch((error) => {
  console.error('Kesalahan bootstrap admin:', error.message)
  process.exitCode = 1
})
