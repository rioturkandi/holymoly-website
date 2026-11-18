// Handler untuk mengarahkan admin ketika sesi berakhir
let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
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
    credentials: 'same-origin',
  })

  // Membaca respons sebagai teks terlebih dahulu
  const contentType = response.headers.get('content-type') || ''
  const responseText = await response.text()
  const isJson = contentType.includes('application/json')

  let data = responseText
  let hasInvalidJson = false

  // Mem-parsing JSON tanpa menghentikan penanganan status HTTP
  if (isJson) {
    if (!responseText) {
      data = null
    } else {
      try {
        data = JSON.parse(responseText)
      } catch {
        hasInvalidJson = true
      }
    }
  }

  // Menangani respons HTTP yang gagal
  if (!response.ok) {
    // Memberi tahu aplikasi jika sesi admin sudah tidak valid
    if (auth && response.status === 401) {
      unauthorizedHandler?.()
    }

    const message =
      (data && typeof data === 'object' && data.message) ||
      `Request gagal dengan status ${response.status}.`

    const error = new Error(message)
    error.status = response.status
    error.data = data

    throw error
  }

  // JSON yang rusak pada respons sukses tetap dianggap sebagai error
  if (hasInvalidJson) {
    const error = new Error('Respons server bukan JSON yang valid.')
    error.data = data
    throw error
  }

  return data
}
