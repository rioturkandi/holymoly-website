// Memastikan URL artikel hanya menggunakan protokol HTTP atau HTTPS.
export function getSafeHttpUrl(value) {
  if (typeof value !== 'string') return null

  const trimmedValue = value.trim()

  if (!trimmedValue) return null

  try {
    const parsedUrl = new URL(trimmedValue)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null
    }

    return parsedUrl.href
  } catch {
    return null
  }
}
