const db = require('./config/database')

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 AS result')

    console.log('Database berhasil terhubung!')
    console.log('Hasil pengujian:', rows[0].result)
  } catch (error) {
    console.error('Database gagal terhubung!')
    console.error('Pesan error:', error.message)
  } finally {
    await db.end()
  }
}

testConnection()