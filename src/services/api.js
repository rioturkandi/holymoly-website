const TOKEN_KEY = 'holymoly_admin_token'

// Mengambil token admin dari sessionStorage
export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

// Menyimpan token setelah admin berhasil login
export function setAdminToken(token) {
  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('Token admin tidak valid.')
  }

  sessionStorage.setItem(TOKEN_KEY, token)
}

// Menghapus token ketika admin logout
export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

// Fungsi utama untuk mengirim request ke backend
export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = false,
  } = options

  // Memastikan request menggunakan endpoint API
  if (typeof path !== 'string' || !path.startsWith('/api/')) {
    throw new Error('Path API tidak valid.')
  }

  const requestHeaders = new Headers(headers)

  // Menambahkan Content-Type untuk request JSON
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  // Menambahkan Bearer Token jika endpoint membutuhkan autentikasi
  if (auth) {
    const token = getAdminToken()

    if (!token) {
      throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.')
    }

    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  // Mengubah object JavaScript menjadi JSON
  // FormData tidak perlu diubah karena browser mengaturnya otomatis
  const requestBody =
    body === undefined
      ? undefined
      : body instanceof FormData
        ? body
        : JSON.stringify(body)

  // Mengirim request ke backend melalui proxy Vite
  const response = await fetch(path, {
    method,
    headers: requestHeaders,
    body: requestBody,
  })

  // Membaca respons berdasarkan Content-Type
  const contentType = response.headers.get('content-type') || ''

  let data = null

  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  // Menangani respons HTTP yang gagal
  if (!response.ok) {
    const message =
      data?.message ||
      `Request gagal dengan status ${response.status}.`

    const error = new Error(message)
    error.status = response.status
    error.data = data

    throw error
  }

  return data
}
