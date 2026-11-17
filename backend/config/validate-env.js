const requiredVariables = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
]

// Memastikan semua konfigurasi wajib tersedia dan tidak kosong.
const missingVariables = requiredVariables.filter((name) => {
  const value = process.env[name]
  return typeof value !== 'string' || value.trim().length === 0
})

if (missingVariables.length > 0) {
  throw new Error(
    `Konfigurasi environment belum lengkap: ${missingVariables.join(', ')}`
  )
}

// Memastikan JWT secret memiliki panjang minimum 32 byte.
if (Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
  throw new Error('JWT_SECRET harus memiliki panjang minimal 32 byte.')
}

// Memvalidasi port dan menormalkan nilainya.
function validatePort(name, defaultValue) {
  const rawValue = process.env[name]

  const port =
    rawValue === undefined || rawValue.trim() === ''
      ? defaultValue
      : Number(rawValue)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} harus berupa integer antara 1 dan 65535.`)
  }

  process.env[name] = String(port)
}

validatePort('DB_PORT', 3306)
validatePort('PORT', 5000)
