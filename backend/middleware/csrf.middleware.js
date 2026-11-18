// Perlindungan CSRF berbasis Fetch Metadata dan verifikasi Origin.
const developmentOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
]

const configuredOrigins = process.env.CSRF_TRUSTED_ORIGINS

// Production wajib menggunakan origin yang dikonfigurasi secara eksplisit.
const trustedOriginValues = configuredOrigins
  ? configuredOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
  : process.env.NODE_ENV === 'production'
    ? []
    : developmentOrigins

const trustedOrigins = new Set()

for (const origin of trustedOriginValues) {
  try {
    const parsedOrigin = new URL(origin)

    // Konfigurasi harus berupa origin saja, tanpa path atau kredensial.
    if (
      parsedOrigin.origin !== origin ||
      parsedOrigin.username ||
      parsedOrigin.password
    ) {
      throw new Error('Invalid origin format')
    }

    trustedOrigins.add(parsedOrigin.origin)
  } catch {
    throw new Error(
      `CSRF_TRUSTED_ORIGINS berisi origin tidak valid: ${origin}`
    )
  }
}

function rejectRequest(res) {
  return res.status(403).json({
    success: false,
    message: 'Request lintas origin tidak diizinkan.',
  })
}

function csrfProtection(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']

  if (safeMethods.includes(req.method)) {
    return next()
  }

  const fetchSite = req.get('sec-fetch-site')

  // Jika Fetch Metadata tersedia, hanya same-origin yang diterima.
  if (fetchSite !== undefined) {
    if (fetchSite !== 'same-origin') {
      return rejectRequest(res)
    }

    return next()
  }

  // Fallback untuk browser atau klien tanpa Fetch Metadata.
  const originHeader = req.get('origin')
  const refererHeader = req.get('referer')
  const sourceHeader = originHeader || refererHeader

  // Tanpa Origin maupun Referer, request mutasi ditolak.
  if (!sourceHeader || sourceHeader === 'null') {
    return rejectRequest(res)
  }

  try {
    const sourceOrigin = new URL(sourceHeader).origin

    if (!trustedOrigins.has(sourceOrigin)) {
      return rejectRequest(res)
    }
  } catch {
    return rejectRequest(res)
  }

  return next()
}

module.exports = csrfProtection
