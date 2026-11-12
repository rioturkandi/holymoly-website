const mysql = require('mysql2/promise')

// Membuat pool koneksi database
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),

  dateStrings: true,

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
})

// Mengekspor koneksi agar dapat digunakan file lain
module.exports = db